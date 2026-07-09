-- ════════════════════════════════════════════════════════════════════════════
-- SECURE RLS POLICIES FOR coupons (admin-gated writes)
-- This file is kept for compatibility; the canonical policies live in
-- relax_rls.sql. Run only one of them.
-- ════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable read all for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;

-- Public may only read ACTIVE coupons.
CREATE POLICY "Public can read active coupons" ON public.coupons
  FOR SELECT
  USING (is_active = true);

-- Admins have full access to all coupons (create, update, delete, read all).
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
