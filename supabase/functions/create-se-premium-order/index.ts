// Creates the Razorpay order for the Infosys SE pack. The price is decided here,
// never by the browser, and the buyer is the verified Clerk user.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Razorpay from "npm:razorpay@2.9.2";
import { verifyClerkToken } from "../_shared/clerk.ts";
import { hasSeAccess, SE_PRODUCT, sePrice } from "../_shared/se-premium.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const userId = token ? await verifyClerkToken(token) : null;
    if (!userId) return json({ error: "Please sign in again to continue." }, 401);

    const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    if (await hasSeAccess(db, userId)) return json({ error: "You already have access to the SE pack." }, 409);

    const amount = sePrice();
    const razorpay = new Razorpay({
      key_id: Deno.env.get("RAZORPAY_KEY_ID"),
      key_secret: Deno.env.get("RAZORPAY_KEY_SECRET"),
    });
    // notes.type routes the webhook to the SE fulfilment path. No user_id in the
    // notes on purpose: the existing webhook would read it as a Premium purchase.
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `se_${Date.now()}_${userId.slice(-6)}`,
      notes: { type: SE_PRODUCT },
    });

    const { error } = await db.from("se_purchases").insert({
      order_id: order.id,
      user_id: userId,
      amount,
      status: "created",
    });
    if (error) {
      console.error("[create-se-premium-order] could not record purchase", order.id, error);
      throw new Error("Could not start payment. Please try again.");
    }
    return json(order);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Failed to create order" }, 400);
  }
});
