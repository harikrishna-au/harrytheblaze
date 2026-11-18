import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import PaymentPopup from "@/components/PaymentPopup";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { track } from "@/lib/analytics";
import { LIST_PRICE, PROMO_ACTIVE, PROMO_PRICE, REGULAR_PRICE } from "@/lib/promo";
import { FREE_COUNT, TOTAL_PROBLEMS } from "@/pages/coding-questions/data";

const SESSION_KEY = "hb_nudge_shown";
const COUNT_KEY = "hb_nudge_count";
const MAX_SHOWS = 3; // never nag: at most three times per browser, once per visit

/**
 * A small, non-blocking card shown right after a signed-in free user finishes any game or round.
 * Until now the premium offer only appeared when someone hit a locked level, so about 40% of the people
 * who tried practice never saw it. This puts it where they have just seen their own result.
 */
export default function PremiumNudge() {
  const { isSignedIn } = useAuth();
  const { isPremium, loading } = usePremiumStatus();
  const [visible, setVisible] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const timer = useRef<number | null>(null);
  const eligible = useRef(false);
  eligible.current = !!isSignedIn && !loading && !isPremium;

  useEffect(() => {
    const onRecorded = (e: Event) => {
      if (!eligible.current) return;
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        if (Number(localStorage.getItem(COUNT_KEY) ?? "0") >= MAX_SHOWS) return;
      } catch { return; }
      if (timer.current) return;
      const activity = String((e as CustomEvent).detail?.activityId ?? "").slice(0, 40);
      // Let the player look at their result first.
      timer.current = window.setTimeout(() => {
        timer.current = null;
        if (!eligible.current) return;
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
          localStorage.setItem(COUNT_KEY, String(Number(localStorage.getItem(COUNT_KEY) ?? "0") + 1));
        } catch { /* ignore */ }
        setVisible(true);
        track("premium_nudge_view", { activity });
      }, 2500);
    };
    window.addEventListener("hb:activity-recorded", onRecorded);
    return () => {
      window.removeEventListener("hb:activity-recorded", onRecorded);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const price = PROMO_ACTIVE ? PROMO_PRICE : REGULAR_PRICE;

  return (
    <>
      {visible && !isPremium && (
        <aside
          role="complementary"
          aria-label="Premium"
          className="fixed inset-x-3 bottom-3 z-[90] border-t-[6px] border-[var(--color-accent)] bg-[var(--color-paper-3)] p-5 text-[var(--color-ink)] shadow-[var(--shadow-sheet)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem]"
        >
          <button
            onClick={() => { setVisible(false); track("premium_nudge_dismiss"); }}
            aria-label="Dismiss"
            className="absolute right-3 top-3 border border-[var(--color-ink)] p-1 hover:bg-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="pr-8 font-display text-3xl font-normal uppercase leading-[0.98] tracking-[0.005em]">Want the levels that decide it?</p>
          <p className="mt-3 text-[15px] leading-snug">
            The free levels teach you the rules. Premium unlocks levels 3 to 6, the full communication rounds, all {TOTAL_PROBLEMS} coding
            questions (not just {FREE_COUNT}) and the AI mock interview.
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl leading-none">₹{price}</span>
            {price < LIST_PRICE && <span className="text-sm line-through opacity-60">₹{LIST_PRICE}</span>}
            <span className="text-sm text-[var(--color-muted)]">one time, no renewal</span>
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { track("premium_nudge_click"); setVisible(false); setShowPayment(true); }}
              className="flex-1 bg-[var(--color-ink)] px-4 py-3 text-[15px] font-semibold !text-[var(--color-paper)] shadow-[3px_3px_0_var(--color-accent)] transition-[transform,box-shadow] duration-[120ms] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
            >
              See what's included
            </button>
            <button
              onClick={() => { setVisible(false); track("premium_nudge_dismiss"); }}
              className="px-3 py-3 text-[15px] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-ink)]"
            >
              Not now
            </button>
          </div>
        </aside>
      )}
      <PaymentPopup isOpen={showPayment} onClose={() => setShowPayment(false)} />
    </>
  );
}
