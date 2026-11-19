// Sales figures for the Infosys SE pack, shown on /admin → Payments.
// Pure function so it can be tested without a database.

export interface SePurchaseRow {
  amount: number;            // INR
  paid_at: string | null;
  email_sent_at: string | null;
}

export interface SeSales {
  /** paid orders, all time */
  count: number;
  /** INR collected, all time */
  revenue: number;
  /** paid since midnight today, India time */
  today: number;
  /** paid in the last 7 days */
  last7: number;
  /** paid orders whose PDF email has not gone out: needs attention */
  emailPending: number;
  lastPaidAt: string | null;
}

const IST_OFFSET_MS = 5.5 * 3_600_000;

/** Midnight at the start of today in India, as a UTC timestamp (ms). */
export function istDayStart(now: number): number {
  const shifted = now + IST_OFFSET_MS;
  return shifted - (shifted % 86_400_000) - IST_OFFSET_MS;
}

export function tallySeSales(rows: SePurchaseRow[], now = Date.now()): SeSales {
  const dayStart = istDayStart(now);
  const weekStart = now - 7 * 86_400_000;
  let revenue = 0, today = 0, last7 = 0, emailPending = 0, count = 0;
  let last: number | null = null;
  for (const r of rows) {
    count++;
    revenue += Number(r.amount) || 0;
    if (!r.email_sent_at) emailPending++;
    const t = r.paid_at ? new Date(r.paid_at).getTime() : NaN;
    if (Number.isNaN(t)) continue;
    if (t >= dayStart) today++;
    if (t >= weekStart) last7++;
    if (last === null || t > last) last = t;
  }
  return { count, revenue, today, last7, emailPending, lastPaidAt: last === null ? null : new Date(last).toISOString() };
}
