-- Limit bookings.status to the known lifecycle values (see
-- supabase/functions/_shared/booking-status.ts). 'pending' is kept because it
-- is the column's original default and older rows may still carry it.
--
-- Added NOT VALID so existing rows never block the migration; it is validated
-- straight away only when every existing row already passes.

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (
    status IN (
      'pending',
      'payment_pending',
      'payment_expired',
      'payment_failed',
      'paid',
      'confirmed',
      'completed',
      'no_show',
      'cancelled',
      'declined',
      'refunded'
    )
  ) NOT VALID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.bookings
    WHERE status IS NOT NULL
      AND status NOT IN (
        'pending', 'payment_pending', 'payment_expired', 'payment_failed', 'paid',
        'confirmed', 'completed', 'no_show', 'cancelled', 'declined', 'refunded'
      )
  ) THEN
    ALTER TABLE public.bookings VALIDATE CONSTRAINT bookings_status_check;
  END IF;
END $$;
