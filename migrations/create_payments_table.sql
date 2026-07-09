-- ════════════════════════════════════════════════════════════════════════════
-- Migration: Create the payments table (idempotent)
-- Purpose: Persist every Razorpay payment attempt (captured, authorized, failed)
--          so the admin can see the full payment history per order and the
--          webhook handlers can record failed attempts.
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.payments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            text REFERENCES public.orders(id) ON DELETE CASCADE,
    razorpay_payment_id text,
    razorpay_order_id   text,
    payment_method      text,                       -- 'Online / Razorpay', 'UPI', 'Card', etc.
    amount              numeric NOT NULL DEFAULT 0, -- in rupees (not paise)
    currency            text DEFAULT 'INR',
    status              text NOT NULL DEFAULT 'Pending', -- 'Paid', 'Authorized', 'Failed', 'Pending'
    failure_reason      text,
    payment_date        timestamptz,
    created_at          timestamptz DEFAULT now()
);

-- Enable RLS (admin reads via service role in edge functions; frontend reads
-- are governed by the same policy as orders — a user may view payments for
-- their own orders).
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Index for the common lookup: find payments for an order, newest first.
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments (order_id, created_at DESC);

-- Index for idempotency checks in the webhook handler.
CREATE INDEX IF NOT EXISTS payments_razorpay_payment_id_idx ON public.payments (razorpay_payment_id);
