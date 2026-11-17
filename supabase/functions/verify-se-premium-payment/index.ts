// Called by the browser right after Razorpay checkout succeeds. Verifies the
// signature, marks the order paid and emails the PDF. The Razorpay webhook runs
// the same idempotent step, so a closed tab never loses a paid order.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyClerkToken } from "../_shared/clerk.ts";
import { fulfilSePurchase } from "../_shared/se-premium.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function hmacSha256(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const userId = token ? await verifyClerkToken(token) : null;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { order_id, payment_id, signature } = await req.json();
    if (!order_id || !payment_id || !signature) throw new Error("Missing required fields");

    const secret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!secret) throw new Error("Server misconfiguration: secret missing");
    if ((await hmacSha256(`${order_id}|${payment_id}`, secret)) !== signature) {
      return json({ error: "Invalid payment signature" }, 400);
    }

    const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const result = await fulfilSePurchase(db, { orderId: order_id, paymentId: payment_id, expectedUserId: userId });
    return json({ success: true, emailed: result.emailed });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Verification failed";
    return json({ error: msg }, msg === "Unknown order" ? 404 : msg.includes("does not belong") ? 403 : 400);
  }
});
