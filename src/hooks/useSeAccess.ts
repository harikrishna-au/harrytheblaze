import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { seCall } from "@/lib/sePremium";

/**
 * Does this signed-in user own the Infosys SE pack?
 * The answer comes from the server (paid purchase, or an existing lifetime Premium
 * account). It only decides which buttons to show: the paid content itself is
 * served by the edge function, which checks again.
 */
export function useSeAccess() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [state, setState] = useState({ access: false, loading: true });

  const refresh = useCallback(async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setState({ access: false, loading: false });
      return;
    }
    try {
      const r = await seCall<{ access?: boolean }>("status", getToken);
      setState({ access: r.ok && !!r.data.access, loading: false });
    } catch {
      setState({ access: false, loading: false });
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => { void refresh(); }, [refresh]);

  return { ...state, refresh };
}
