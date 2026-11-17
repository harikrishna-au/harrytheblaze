// Infosys System Engineer pack ("se-premium"): one-time purchase.
//
// Everything that touches money or access lives here so the three entry points
// (create order, verify payment, Razorpay webhook) share one idempotent path:
//
//   fulfilSePurchase()  ->  mark paid  ->  sync Clerk  ->  email the PDF once
//
// No remote imports on purpose: the Supabase client is passed in, so this file
// can be unit-tested without Deno or the network.

import { button, detailRows, emailShell, esc } from "./email.ts";

export const SE_PRODUCT = "se_premium";
export const SE_GUIDE_BUCKET = "se-premium";
export const SE_GUIDE_FILE = "Harry-The-Blaze_Infosys-SE-Playbook.pdf";
const SITE = "https://www.harrytheblaze.site";

/** Server-side price in INR. The browser never decides what it pays. */
export function sePrice(): number {
  const n = Number(Deno.env.get("SE_PREMIUM_PRICE") ?? "99");
  return Number.isInteger(n) && n > 0 ? n : 99;
}

// deno-lint-ignore no-explicit-any
type Db = any;

export interface Purchase {
  order_id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_id: string | null;
  email: string | null;
  email_sent_at: string | null;
}

/** Paid SE pack, or an existing Premium account that has not expired (lifetime has no expiry). */
export async function hasSeAccess(db: Db, userId: string): Promise<boolean> {
  const { data: bought } = await db
    .from("se_purchases")
    .select("order_id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();
  if (bought) return true;
  const { data: profile } = await db
    .from("profiles")
    .select("is_premium, premium_expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile?.is_premium) return false;
  // Lifetime Premium has no expiry. A lapsed subscription must not unlock the pack.
  return !profile.premium_expires_at || new Date(profile.premium_expires_at).getTime() > Date.now();
}

// ───────────────────────── email ─────────────────────────

export function purchaseEmailHtml(name: string | null): string {
  const first = (name ?? "").trim().split(/\s+/)[0];
  const hello = first ? `Hi ${esc(first)},` : "Hi,";
  return emailShell({
    preheader: "Thank you. Your Infosys SE Playbook PDF is attached, plus two mock exams to try.",
    kicker: "Infosys SE",
    heading: "Thank you. It's yours.",
    intro:
      `${hello}<br><br>Thank you for trusting us with your Infosys System Engineer prep. Your <b>SE Playbook</b> is attached to this email as a PDF. ` +
      `Keep it somewhere you can find it, and start with the P1 cards. All the very best for the test. We are rooting for you.`,
    body: detailRows([
      ["Attached", "The SE Playbook (PDF)"],
      ["Inside", "30 formula cards, 86 solved questions, 24 interview answers"],
      ["Two mock exams", "Mock A and Mock B, timed half-mocks inside the PDF"],
      ["Online mock", "A full 54-question mock with real section timers, on the site"],
    ]),
    footnote:
      `You can open the mock any time after you sign in. Give the mock exams a shot once you have worked through the formulas, ` +
      `and use the error log at the back of the PDF to track what you miss.` +
      `<div style="margin-top:16px">${button(`${SITE}/infosys-se/mock`, "Open the online mock")}</div>` +
      `<div style="margin-top:16px;color:#6b625a;font-size:12px">Independent practice material. Not affiliated with or endorsed by Infosys.</div>`,
  });
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export async function loadGuidePdf(db: Db): Promise<Uint8Array> {
  const { data, error } = await db.storage.from(SE_GUIDE_BUCKET).download(SE_GUIDE_FILE);
  if (error || !data) throw new Error(`SE guide PDF missing from storage bucket "${SE_GUIDE_BUCKET}"`);
  return new Uint8Array(await data.arrayBuffer());
}

export async function sendPurchaseEmail(db: Db, to: string, name: string | null): Promise<void> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) throw new Error("RESEND_API_KEY is not set");
  const pdf = await loadGuidePdf(db);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev",
      to: [to],
      reply_to: "support@harrytheblaze.site",
      subject: "Your Infosys SE Playbook is here. Thank you!",
      html: purchaseEmailHtml(name),
      attachments: [{ filename: SE_GUIDE_FILE, content: toBase64(pdf) }],
    }),
  });
  if (!res.ok) throw new Error(`Resend failed (${res.status}): ${await res.text()}`);
}

// ───────────────────────── Clerk ─────────────────────────

async function clerkUser(userId: string): Promise<{ email: string | null; name: string | null }> {
  const secret = Deno.env.get("CLERK_SECRET_KEY");
  if (!secret) return { email: null, name: null };
  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) return { email: null, name: null };
  const u = await res.json();
  const entries = u.email_addresses ?? [];
  const primary = entries.find((e: { id?: string }) => e.id === u.primary_email_address_id)?.email_address
    ?? entries[0]?.email_address ?? null;
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || null;
  return { email: primary ? String(primary).trim().toLowerCase() : null, name };
}

async function syncClerk(userId: string): Promise<void> {
  const secret = Deno.env.get("CLERK_SECRET_KEY");
  if (!secret) return;
  // PATCH /metadata merges, so existing keys such as isPremium are left alone.
  const res = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}/metadata`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ public_metadata: { sePremium: true } }),
  });
  if (!res.ok) console.error(`[se-premium] Clerk sync failed (${res.status})`);
}

// ───────────────────────── fulfilment ─────────────────────────

export interface FulfilResult {
  paid: boolean;
  /** true once the PDF email has gone out (now or earlier) */
  emailed: boolean;
}

/**
 * Safe to call any number of times, from the browser verify step and from the
 * webhook at the same time: the paid flag is an upsert and the email is claimed
 * with a conditional update, so the buyer gets exactly one PDF email.
 *
 * `expectedUserId` is the verified Clerk user when called from the browser; the
 * webhook passes null because the order row itself identifies the buyer.
 * `paidAmountPaise` (webhook) must match what we charged.
 */
export async function fulfilSePurchase(
  db: Db,
  args: { orderId: string; paymentId: string; expectedUserId?: string | null; paidAmountPaise?: number | null },
): Promise<FulfilResult> {
  const { data: row, error } = await db
    .from("se_purchases")
    .select("order_id, user_id, amount, status, payment_id, email, email_sent_at")
    .eq("order_id", args.orderId)
    .maybeSingle();
  if (error) throw error;
  const purchase = row as Purchase | null;
  if (!purchase) throw new Error("Unknown order");
  if (args.expectedUserId && purchase.user_id !== args.expectedUserId) throw new Error("Order does not belong to this user");
  if (args.paidAmountPaise != null && args.paidAmountPaise !== purchase.amount * 100) {
    throw new Error(`SE payment amount mismatch for order ${args.orderId}`);
  }

  if (purchase.status !== "paid") {
    const { error: upErr } = await db
      .from("se_purchases")
      .update({ status: "paid", payment_id: args.paymentId, paid_at: new Date().toISOString() })
      .eq("order_id", args.orderId);
    if (upErr) throw upErr;
  }

  await syncClerk(purchase.user_id).catch((e) => console.error("[se-premium] Clerk sync error", e));

  if (purchase.email_sent_at) return { paid: true, emailed: true };

  // Claim the email slot first so two concurrent callers cannot both send it.
  const { data: claimed } = await db
    .from("se_purchases")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("order_id", args.orderId)
    .is("email_sent_at", null)
    .select("order_id")
    .maybeSingle();
  if (!claimed) return { paid: true, emailed: true }; // someone else is sending it

  try {
    let to = purchase.email;
    let name: string | null = null;
    const who = await clerkUser(purchase.user_id);
    if (who.email) { to = who.email; name = who.name; }
    if (!to) throw new Error("No email address on file for the buyer");
    await sendPurchaseEmail(db, to, name);
    if (to !== purchase.email) await db.from("se_purchases").update({ email: to }).eq("order_id", args.orderId);
    return { paid: true, emailed: true };
  } catch (e) {
    // Release the claim so a retry (webhook, resend button) can try again.
    await db.from("se_purchases").update({ email_sent_at: null }).eq("order_id", args.orderId);
    console.error("[se-premium] purchase email failed", e);
    return { paid: true, emailed: false };
  }
}

/** "Email it to me again" button. Throttled so it cannot be used to spam an inbox. */
export async function resendPurchaseEmail(db: Db, userId: string): Promise<"sent" | "throttled" | "no_purchase"> {
  const { data: row } = await db
    .from("se_purchases")
    .select("order_id, email, email_sent_at")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) return "no_purchase";
  if (row.email_sent_at && Date.now() - new Date(row.email_sent_at).getTime() < 60_000) return "throttled";
  const who = await clerkUser(userId);
  const to = who.email ?? row.email;
  if (!to) throw new Error("No email address on file");
  await sendPurchaseEmail(db, to, who.name);
  await db.from("se_purchases").update({ email_sent_at: new Date().toISOString(), email: to }).eq("order_id", row.order_id);
  return "sent";
}
