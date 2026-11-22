-- profiles is readable by everyone (policy "Enable read access for all users", added in
-- 20251222_fix_clerk_compatibility so the browser could check Premium without Supabase auth).
-- That also exposed email, stripe_customer_id and subscription_id for every user to anyone
-- holding the public anon key.
--
-- Keep the rows readable, but only the columns the website and the API need for the
-- Premium check. Edge functions use the service role and are not affected.
-- Callers must name columns: `select=*` from the anon key now fails, `select=is_premium` works.

revoke select on public.profiles from anon, authenticated;
grant select (user_id, is_premium, premium_expires_at, plan_type) on public.profiles to anon, authenticated;
