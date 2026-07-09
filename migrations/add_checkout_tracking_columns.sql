-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Add checkout-tracking columns to the orders table
-- Purpose: Support automated pending-checkout detection so that orders where a
--          user opened Razorpay checkout but never completed payment can be
--          automatically marked as 'failed' after a 30-minute window.
-- ═════════════════════════════════════════════════════════════════════════════

-- checkout_expires_at : when the pending checkout window lapses (created_at + 30m)
-- failed_at           : timestamp the order was marked failed
-- failure_reason      : human-readable reason for the failure / abandonment
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS checkout_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_reason text;

-- Backfill: any existing pending order that has a razorpay_order_id (i.e. a
-- checkout was initiated) gets a 30-minute expiry computed from its created_at.
UPDATE public.orders
SET checkout_expires_at = created_at + interval '30 minutes'
WHERE payment_status = 'Pending'
  AND razorpay_order_id IS NOT NULL
  AND checkout_expires_at IS NULL;

-- Index to make the cron sweep query fast: it filters by payment_status +
-- razorpay_order_id + checkout_expires_at.
CREATE INDEX IF NOT EXISTS orders_pending_checkout_idx
  ON public.orders (checkout_expires_at)
  WHERE payment_status = 'Pending' AND razorpay_order_id IS NOT NULL;
