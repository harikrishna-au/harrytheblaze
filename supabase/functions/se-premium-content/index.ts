// Serves everything that is behind the SE paywall, after checking on the server
// that the caller really owns it. Nothing paid ships in the website bundle.
//
// POST { action }:
//   status  -> { access }
//   mock    -> { sections }          the full mock, buyers only
//   guide   -> { url }               a 5-minute signed link to the PDF, buyers only
//   resend  -> { result }            emails the PDF again (throttled)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyClerkToken } from "../_shared/clerk.ts";
import { hasSeAccess, resendPurchaseEmail, SE_GUIDE_BUCKET, SE_GUIDE_FILE } from "../_shared/se-premium.ts";
import { MOCK_SECTIONS } from "../_shared/se-mock-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const userId = token ? await verifyClerkToken(token) : null;
    if (!userId) return json({ error: "Please sign in." }, 401);

    const { action } = await req.json().catch(() => ({ action: "status" }));
    const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const access = await hasSeAccess(db, userId);

    if (action === "status") return json({ access });
    if (!access) return json({ error: "The SE pack is not unlocked on this account." }, 403);

    if (action === "mock") return json({ sections: MOCK_SECTIONS });

    if (action === "guide") {
      const { data, error } = await db.storage.from(SE_GUIDE_BUCKET).createSignedUrl(SE_GUIDE_FILE, 300, { download: SE_GUIDE_FILE });
      if (error || !data?.signedUrl) return json({ error: "The guide is not available yet. Please contact support." }, 404);
      return json({ url: data.signedUrl });
    }

    if (action === "resend") {
      const result = await resendPurchaseEmail(db, userId);
      return json({ result }, result === "throttled" ? 429 : 200);
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Request failed" }, 400);
  }
});
