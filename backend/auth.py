"""
Auth, Premium and rate-limit guards for the FastAPI backend.

Every route that spends money (OpenAI, Polly) or touches a user's data must depend on
`require_user` or `require_premium`. The frontend sends the Clerk session token as
`Authorization: Bearer <token>`; we verify it here the same way the Supabase edge
functions do (supabase/functions/_shared/clerk.ts).

No secret is required. Tokens are verified against Clerk's public key set for this
instance and must carry our issuer.

Environment (all optional):
  CLERK_ISSUER                default https://clerk.harrytheblaze.site
  CLERK_JWKS_URL              default <issuer>/.well-known/jwks.json
  CLERK_AUTHORIZED_PARTIES    comma-separated origins; when set, `azp` must be one of them
  SUPABASE_URL                Premium is read from profiles.is_premium / premium_expires_at,
  SUPABASE_SERVICE_ROLE_KEY   with the service role key if set, otherwise the public
  SUPABASE_ANON_KEY           anon key (the same key the website uses).
  CLERK_SECRET_KEY            if set, Clerk publicMetadata.isPremium is also accepted.

Fails closed: if the key set or the Premium lookup is unavailable, requests are refused.
"""

import os
import time
import threading
from collections import defaultdict, deque
from datetime import datetime, timezone
from typing import Optional

import jwt  # PyJWT
import requests
from fastapi import Depends, HTTPException, Request

CLERK_API = "https://api.clerk.com/v1"
DEFAULT_ISSUER = "https://clerk.harrytheblaze.site"
JWKS_TTL_S = 60 * 60
HTTP_TIMEOUT_S = 5

_jwks_lock = threading.Lock()
_jwks_cache: dict = {"keys": {}, "fetched_at": 0.0}


def _issuer() -> str:
    return os.environ.get("CLERK_ISSUER", DEFAULT_ISSUER).strip().rstrip("/")


def _jwks_url() -> str:
    return os.environ.get("CLERK_JWKS_URL", "").strip() or f"{_issuer()}/.well-known/jwks.json"


def _load_jwks(force: bool = False) -> dict:
    with _jwks_lock:
        fresh = time.time() - _jwks_cache["fetched_at"] < JWKS_TTL_S
        if _jwks_cache["keys"] and fresh and not force:
            return _jwks_cache["keys"]
        resp = requests.get(_jwks_url(), timeout=HTTP_TIMEOUT_S)
        resp.raise_for_status()
        keys = {k["kid"]: k for k in resp.json().get("keys", []) if k.get("kid")}
        _jwks_cache.update(keys=keys, fetched_at=time.time())
        return keys


def _authorized_parties() -> set:
    raw = os.environ.get("CLERK_AUTHORIZED_PARTIES", "")
    return {p.strip().rstrip("/") for p in raw.split(",") if p.strip()}


def verify_clerk_token(token: str) -> Optional[str]:
    """Returns the Clerk user id for a valid session token, else None."""
    if not token or token.count(".") != 2:
        return None
    try:
        kid = jwt.get_unverified_header(token).get("kid")
        keys = _load_jwks()
        if kid not in keys:
            keys = _load_jwks(force=True)  # key rotation
        jwk = keys.get(kid)
        if not jwk:
            return None
        signing_key = jwt.PyJWK(jwk).key
        claims = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256", "RS384", "RS512", "ES256", "ES384"],
            issuer=_issuer(),
            options={"require": ["exp", "sub", "iss"], "verify_aud": False},
            leeway=10,
        )
    except HTTPException:
        raise
    except Exception as e:  # bad signature, expired, malformed, JWKS fetch failure
        print(f"Auth: token rejected ({type(e).__name__})")
        return None

    parties = _authorized_parties()
    if parties and claims.get("azp") and claims["azp"].rstrip("/") not in parties:
        print("Auth: token rejected (azp not allowed)")
        return None
    return claims.get("sub")


# ---------------------------------------------------------------------------
# Rate limiting
#
# Per-process sliding window, like supabase/functions/_shared/guard.ts. It is best-effort
# (each Lambda container / ECS task keeps its own window) but it stops one account or one
# IP from looping the API. The expensive interview start also has a durable daily cap that
# is checked against DynamoDB (see routers/interview.py).
# ---------------------------------------------------------------------------

_hits: dict = defaultdict(deque)
_hits_lock = threading.Lock()


def rate_limited(key: str, max_hits: int, window_s: int = 3600) -> bool:
    now = time.time()
    with _hits_lock:
        q = _hits[key]
        while q and now - q[0] >= window_s:
            q.popleft()
        if len(q) >= max_hits:
            return True
        q.append(now)
        if len(_hits) > 20000:  # keep memory bounded
            for k in [k for k, v in _hits.items() if not v or now - v[-1] >= window_s]:
                del _hits[k]
        return False


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _bearer(request: Request) -> str:
    header = request.headers.get("authorization", "")
    return header[7:].strip() if header.lower().startswith("bearer ") else ""


def require_user(request: Request) -> str:
    """Dependency: a signed-in Clerk user. Returns the user id."""
    ip = client_ip(request)
    # Cap every caller by IP first, so unauthenticated floods are cheap to reject.
    if rate_limited(f"ip:{ip}", int(os.environ.get("RATE_LIMIT_IP_PER_HOUR", "1500"))):
        raise HTTPException(status_code=429, detail="Too many requests. Try again later.")
    user_id = verify_clerk_token(_bearer(request))
    if not user_id:
        raise HTTPException(status_code=401, detail="Please sign in again to use this feature.")
    return user_id


def limit(scope: str, max_per_hour: int):
    """Dependency factory: per-user hourly limit for one feature."""
    def _dep(user_id: str = Depends(require_user)) -> str:
        if rate_limited(f"{scope}:{user_id}", max_per_hour):
            raise HTTPException(
                status_code=429,
                detail="You have reached the hourly limit for this feature. Try again later.",
            )
        return user_id
    return _dep


# ---------------------------------------------------------------------------
# Premium
#
# Mirrors src/hooks/usePremiumStatus.ts: Premium if Clerk publicMetadata.isPremium is true,
# or if profiles.is_premium is true and premium_expires_at is empty or in the future.
# ---------------------------------------------------------------------------

_premium_cache: dict = {}
_premium_lock = threading.Lock()


def _premium_from_supabase(user_id: str) -> Optional[bool]:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_ANON_KEY", "")
    if not url or not key:
        return None
    resp = requests.get(
        f"{url}/rest/v1/profiles",
        params={"user_id": f"eq.{user_id}", "select": "is_premium,premium_expires_at"},
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
        timeout=HTTP_TIMEOUT_S,
    )
    resp.raise_for_status()
    rows = resp.json()
    if not rows or not rows[0].get("is_premium"):
        return False
    expires = rows[0].get("premium_expires_at")
    if not expires:
        return True
    try:
        return datetime.fromisoformat(expires.replace("Z", "+00:00")) > datetime.now(timezone.utc)
    except ValueError:
        return False


def _premium_from_clerk(user_id: str) -> Optional[bool]:
    secret = os.environ.get("CLERK_SECRET_KEY", "").strip()
    if not secret:
        return None
    resp = requests.get(
        f"{CLERK_API}/users/{user_id}",
        headers={"Authorization": f"Bearer {secret}"},
        timeout=HTTP_TIMEOUT_S,
    )
    resp.raise_for_status()
    return bool((resp.json().get("public_metadata") or {}).get("isPremium"))


def is_premium(user_id: str) -> bool:
    now = time.time()
    with _premium_lock:
        cached = _premium_cache.get(user_id)
        if cached and cached[1] > now:
            return cached[0]
    try:
        from_db = _premium_from_supabase(user_id)
        from_clerk = None if from_db else _premium_from_clerk(user_id)
    except Exception as e:
        print(f"Premium check failed for {user_id}: {type(e).__name__}")
        # Fail closed, but don't cache the failure.
        raise HTTPException(status_code=503, detail="Could not confirm your Premium access. Try again.")
    if from_db is None and from_clerk is None:
        print("AUTH CONFIG ERROR: no Premium source configured (SUPABASE_URL + key, or CLERK_SECRET_KEY).")
        raise HTTPException(status_code=503, detail="Could not confirm your Premium access. Try again.")
    result = bool(from_db or from_clerk)
    ttl = 300 if result else 60  # a fresh purchase shows up within a minute
    with _premium_lock:
        _premium_cache[user_id] = (result, now + ttl)
    return result


def premium_limit(scope: str, max_per_hour: int):
    """Dependency factory: signed-in Premium user with a per-user hourly limit."""
    user_dep = limit(scope, max_per_hour)

    def _dep(user_id: str = Depends(user_dep)) -> str:
        if not is_premium(user_id):
            raise HTTPException(status_code=403, detail="This feature is part of Premium.")
        return user_id
    return _dep
