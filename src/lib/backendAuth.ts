// The FastAPI backend (VITE_BACKEND_URL) requires the Clerk session token on every call.
// Clerk's React SDK exposes the loaded instance on window.Clerk, which lets plain modules
// (like CommunicationService) get a fresh token without threading hooks through them.

type ClerkWindow = { Clerk?: { session?: { getToken: () => Promise<string | null> } | null } };

export async function backendAuthHeaders(): Promise<Record<string, string>> {
    try {
        const token = await (window as unknown as ClerkWindow).Clerk?.session?.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
}

/** fetch() against the backend with the Clerk token added. */
export async function backendFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const headers = { ...(init.headers as Record<string, string> | undefined), ...(await backendAuthHeaders()) };
    return fetch(url, { ...init, headers });
}

/** A student-facing message for a failed backend response. */
export async function backendErrorMessage(response: Response, fallback: string): Promise<string> {
    if (response.status === 401) return "Your session expired. Please sign in again.";
    const body = await response.json().catch(() => null) as { detail?: unknown } | null;
    if (typeof body?.detail === "string" && response.status < 500) return body.detail;
    if (response.status === 429) return "You have reached the limit for now. Try again later.";
    return fallback;
}
