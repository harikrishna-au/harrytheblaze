import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { trackMetaInitiateCheckout, trackMetaPurchase } from "@/lib/meta-pixel";
import { SE_PRICE, seCall, seFunctionUrl } from "@/lib/sePremium";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** One-time purchase of the Infosys SE pack through the se-premium edge functions. */
export function useSePurchase(onUnlocked: () => void | Promise<void>) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const buy = async (): Promise<boolean> => {
    if (!user) {
      toast.error("Please sign in to proceed");
      return false;
    }
    if (!(await loadRazorpayScript())) {
      toast.error("Razorpay failed to load. Are you online?");
      return false;
    }
    try {
      setIsLoading(true);
      const token = await getToken().catch(() => null);
      const res = await fetch(seFunctionUrl("create-se-premium-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: "{}",
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Failed to create order");

      track("se_payment_started", { amount: SE_PRICE });
      trackMetaInitiateCheckout({ value: SE_PRICE, contentName: "Infosys SE Playbook" });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: String(order.amount),
        currency: order.currency,
        name: "Harry The Blaze",
        description: "Infosys SE Playbook",
        order_id: order.id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // The buyer has already been charged, so never give up quietly: retry the
          // verification, then poll for the webhook, which unlocks the account on its own.
          const verifyOnce = async () => {
            const clerkToken = await getToken({ skipCache: true });
            const r = await fetch(seFunctionUrl("verify-se-premium-payment"), {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${clerkToken}` },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            return r.ok;
          };
          let verified = false;
          for (let attempt = 0; attempt < 4 && !verified; attempt++) {
            try { verified = await verifyOnce(); } catch (e) { console.error("Verification error", e); }
            if (!verified) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          }
          if (!verified) {
            toast.loading("Confirming your payment…", { id: "se-confirm" });
            for (let i = 0; i < 10 && !verified; i++) {
              await new Promise((r) => setTimeout(r, 2000));
              try { verified = (await seCall<{ access?: boolean }>("status", getToken)).data.access === true; } catch { /* keep polling */ }
            }
            toast.dismiss("se-confirm");
          }
          track(verified ? "se_payment_success" : "se_payment_delayed", { amount: SE_PRICE });
          if (verified) {
            trackMetaPurchase({ value: SE_PRICE, contentName: "Infosys SE Playbook", contentIds: ["se-premium"], eventID: response.razorpay_payment_id });
            toast.success("Payment verified. Your SE Playbook is on its way to your email.", { duration: 9000 });
            await onUnlocked();
          } else {
            toast.error(`Payment received but activation is delayed. Your payment ID is ${response.razorpay_payment_id}. Contact support and we'll unlock it right away.`, { duration: 15000 });
          }
        },
        prefill: { name: user.fullName || "", email: user.primaryEmailAddress?.emailAddress || "" },
        theme: { color: "#F25C1F" },
      };
      // deno-lint-ignore no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (resp: { error?: { code?: string; description?: string } }) => {
        track("se_payment_failed", { amount: SE_PRICE, reason: String(resp.error?.code ?? "unknown").slice(0, 40) });
        toast.error(`Payment failed: ${resp.error?.description}`);
      });
      rzp.open();
      return true;
    } catch (e) {
      console.error("SE payment error", e);
      toast.error(e instanceof Error ? e.message : "Failed to start payment");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { buy, isLoading };
}
