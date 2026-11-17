-- Infosys System Engineer pack ("se-premium"): one row per Razorpay order.
-- Only the edge functions (service role) touch this table: RLS is on with no
-- policies, so the browser can never read or change it.
create table if not exists public.se_purchases (
  order_id      text primary key,
  user_id       text not null,
  amount        integer not null,
  status        text not null default 'created' check (status in ('created', 'paid')),
  payment_id    text,
  email         text,
  email_sent_at timestamptz,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);
create index if not exists se_purchases_user_status_idx on public.se_purchases (user_id, status);
alter table public.se_purchases enable row level security;

-- Private bucket for the PDF that is emailed to buyers. No storage policies:
-- only the service role can read it.
insert into storage.buckets (id, name, public)
values ('se-premium', 'se-premium', false)
on conflict (id) do nothing;
