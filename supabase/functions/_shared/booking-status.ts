// Connect booking lifecycle: the one place that says which status changes an
// admin may make by hand.
//
//   payment_pending ──(verify / webhook)──► paid ──► confirmed ──► completed
//         │                                  ▲                    no_show
//         ├─(hold timeout)─► payment_expired ┤ (late-payment.ts)
//         └─(order error)──► payment_failed ─┘
//   paid / confirmed ──► cancelled | declined   (can be reopened)
//   any captured booking ──(refund action)──► refunded   (terminal)
//
// The payment statuses (payment_pending, payment_expired, payment_failed) and
// the move into "paid" belong to the payment functions, which check Razorpay
// first. "refunded" is only set by the refund action, after Razorpay accepts
// the refund. Neither can be set through a manual admin update.

export const BOOKING_STATUSES = [
  "payment_pending",
  "payment_expired",
  "payment_failed",
  "paid",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
  "declined",
  "refunded",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

/** Statuses that hold the expert's slot. */
export const SLOT_HOLDING: readonly string[] = ["payment_pending", "paid", "confirmed"];

/** Manual moves the admin panel may make, keyed by the current status. */
const ADMIN_TRANSITIONS: Record<string, readonly string[]> = {
  paid: ["confirmed", "completed", "no_show", "cancelled", "declined"],
  confirmed: ["paid", "completed", "no_show", "cancelled", "declined"],
  completed: ["confirmed", "no_show"],
  no_show: ["confirmed", "completed"],
  cancelled: ["paid", "confirmed"],
  declined: ["paid", "confirmed"],
  // payment_pending, payment_expired, payment_failed and refunded: no manual moves.
};

/** Returns an error message when the admin may not move `from` to `to`, else null. */
export function adminTransitionError(from: string, to: string): string | null {
  if (from === to) return null;
  if (to === "refunded") return "Use “Issue Razorpay refund” to refund a booking";
  if (ADMIN_TRANSITIONS[from]?.includes(to)) return null;
  const label = (s: string) => s.replaceAll("_", " ");
  if (!ADMIN_TRANSITIONS[from]) {
    return `A ${label(from)} booking can't be changed by hand`;
  }
  return `Can't move a booking from ${label(from)} to ${label(to)}`;
}

/** The statuses an admin can pick for a booking that is currently `from` (including `from` itself). */
export function adminStatusOptions(from: string): string[] {
  return [from, ...(ADMIN_TRANSITIONS[from] ?? [])];
}

/** Statuses from which meeting details can be sent (which marks it confirmed). */
export const CAN_SEND_MEETING_DETAILS: readonly string[] = ["paid", "confirmed"];
