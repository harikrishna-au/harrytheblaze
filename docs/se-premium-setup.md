# Infosys SE pack ("se-premium"): setup

One-time purchase (₹99, struck from ₹299). After paying, the buyer is emailed the
**SE Playbook PDF** with a thank-you and a note about the mock exams. The pack also opens
the online mock at `/infosys-se/mock`. Nothing is free: the mock questions and the PDF
live on the server and are only handed to buyers.

## How it fits together

| Piece | What it does |
| --- | --- |
| `create-se-premium-order` | Verifies the Clerk session, creates the Razorpay order at the **server** price, records it in `se_purchases`. |
| `verify-se-premium-payment` | Checks the Razorpay signature, marks the order paid, emails the PDF. Called by the browser after checkout. |
| `razorpay-webhook` (patched) | Same fulfilment if the buyer closes the tab before verify runs. SE orders are caught **before** the lifetime-Premium fallback. |
| `se-premium-content` | `status`, `mock`, `guide` (5-minute signed link) and `resend`, all behind a purchase check. |
| `_shared/se-premium.ts` | One idempotent `fulfilSePurchase()` used by both paths: exactly one email, safe to retry. |
| `_shared/se-mock-data.ts` | The 54 mock questions. **Server only.** Never import it from `src/`. |

Access = a paid `se_purchases` row, **or** an existing lifetime Premium account (they already paid more).

## Deploy checklist

1. **Migration** (creates `se_purchases` and the private `se-premium` bucket):
   `supabase db push`
2. **Upload the PDF** to the private bucket, with exactly this file name:
   `se-premium/Harry-The-Blaze_Infosys-SE-Playbook.pdf`
   (Dashboard, Storage, `se-premium`, Upload. Or `supabase storage cp <file> ss:///se-premium/Harry-The-Blaze_Infosys-SE-Playbook.pdf --experimental`.)
   If the PDF is missing, buyers are still marked paid and unlocked; the email is retried by the webhook and by "Email it to me again" once you upload it.
3. **Secrets** (the first five already exist for the other payment functions):
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `FROM_EMAIL`.
   Optional: `SE_PREMIUM_PRICE` (INR, default 99).
   **`FROM_EMAIL` must be on a domain verified in Resend.** The default `onboarding@resend.dev` can only deliver to the Resend account owner, so real buyers would get nothing.
4. **Deploy**:
   `supabase functions deploy create-se-premium-order verify-se-premium-payment se-premium-content razorpay-webhook`
5. **Razorpay**: no new webhook. The existing one already sends `payment.captured` to `razorpay-webhook`.
6. **Test in Razorpay test mode** with a test card: pay, confirm the email arrives with the PDF attached, confirm `/infosys-se/mock` opens, then pay again from another account and close the tab right after paying to confirm the webhook path also emails.

## Changing things

- **Price**: change `SE_PREMIUM_PRICE` (server) **and** `SE_PRICE` in `src/lib/sePremium.ts` (what the page shows).
- **Mock questions**: edit `PRODUCT/guides/mock/author.py`, run it (it re-checks the maths), copy `se-mock-data.ts` to `supabase/functions/_shared/` and redeploy `se-premium-content`.
- **New PDF version**: upload over the same file name in the bucket.
