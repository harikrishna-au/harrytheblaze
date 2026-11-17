// Infosys System Engineer pack: client helpers.
// What the pack costs is decided on the server (SE_PREMIUM_PRICE, default 99);
// these two numbers are only what the page shows, so keep them in step.

export const SE_PRICE = 99;
export const SE_LIST_PRICE = 299;

const FN = (name: string) => `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`;

type TokenFn = (opts?: { skipCache?: boolean }) => Promise<string | null>;

/** Calls the se-premium-content function with the signed-in user's Clerk token. */
export async function seCall<T = Record<string, unknown>>(
  action: "status" | "mock" | "guide" | "resend",
  getToken: TokenFn,
): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const token = await getToken().catch(() => null);
  const res = await fetch(FN("se-premium-content"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ action }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export const seFunctionUrl = FN;

// ── Sign-in handoff ───────────────────────────────────────────────────────────
// A visitor who is not signed in taps "Unlock", signs up, and must come back to the
// page they were on with the checkout open. This is kept apart from the older
// `auto_open_payment` flag, which opens the lifetime-Premium popup on the dashboard.
const RETURN_KEY = "se_unlock_return";

export function rememberSeUnlock(path: string): void {
  try { localStorage.setItem(RETURN_KEY, path); } catch { /* storage blocked: they just land on the dashboard */ }
}

/** Where the login screen should send the user, if they came from the SE pages. */
export function seReturnPath(): string | null {
  try {
    const v = localStorage.getItem(RETURN_KEY);
    return v && v.startsWith("/infosys-se") ? v : null;
  } catch { return null; }
}

/** True once, on the page the user asked to unlock from. */
export function takeSeUnlock(path: string): boolean {
  try {
    if (localStorage.getItem(RETURN_KEY) !== path) return false;
    localStorage.removeItem(RETURN_KEY);
    return true;
  } catch { return false; }
}
