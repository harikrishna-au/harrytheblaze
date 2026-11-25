import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useSePurchase } from "@/hooks/useSePurchase";
import { SE_LIST_PRICE, SE_PRICE } from "@/lib/sePremium";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the payment is verified, so the page can refresh access. */
  onUnlocked: () => void | Promise<void>;
}

/** Checkout sheet for the Infosys SE pack, in the site theme. */
export default function SePaymentPopup({ isOpen, onClose, onUnlocked }: Props) {
  const { buy, isLoading } = useSePurchase(onUnlocked);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pay = async () => {
    if (await buy()) onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="se-pay-title" className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-md space-y-6 overflow-y-auto bg-[var(--color-paper-3)] p-6 text-[var(--color-ink)] shadow-[var(--shadow-sheet)] sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 border border-[var(--color-ink)] p-1.5 transition-colors hover:bg-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-2 pr-10">
          <h2 id="se-pay-title" className="font-display text-4xl font-normal uppercase leading-[0.98] tracking-[0.005em] sm:text-5xl [text-wrap:balance]">
            Unlock the SE Playbook
          </h2>
          <p className="text-[15px] text-[var(--color-muted)]">One payment. No subscription, no renewal.</p>
        </div>

        <div className="bg-[var(--color-accent)] p-5 shadow-[var(--shadow-offset)] rounded-[20px]">
          <div className="flex items-baseline gap-4">
            <p className="font-display text-[clamp(3.5rem,14vw,5rem)] font-normal leading-none">₹{SE_PRICE}</p>
            <p className="text-xl line-through opacity-70">₹{SE_LIST_PRICE}</p>
          </div>
          <p className="mt-2 text-sm font-semibold">₹{SE_LIST_PRICE - SE_PRICE} off</p>
        </div>

        <ul className="divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)] text-[15px]">
          {[
            "The SE Playbook PDF, emailed to you the moment you pay",
            "30 formula cards and 86 solved questions, ranked by priority",
            "Two timed half-mocks in the PDF, plus a full 54-question online mock",
            "24 SE interview answers and an essay kit",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 py-3">
              <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={pay}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center bg-[var(--color-ink)] px-6 py-4 text-base font-semibold !text-[var(--color-paper)] transition-[transform,box-shadow] duration-[120ms] ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)] rounded-full"
        >
          {isLoading ? "Processing..." : `Pay ₹${SE_PRICE} and get the PDF`}
        </button>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Secure payment powered by Razorpay. Your PDF is sent to the email on your account.
        </p>
      </div>
    </div>
  );
}
