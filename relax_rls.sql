-- ════════════════════════════════════════════════════════════════════════════
-- SECURE RLS POLICIES FOR coupons
-- Replaces the previous "Enable all access for all users" policy (V7) which
-- allowed any anonymous user to create 100%-off coupons, modify discount
-- values, or delete coupons.
-- ════════════════════════════════════════════════════════════════════════════

-- Drop the dangerous open policy.
DROP POLICY IF EXISTS "Enable all access for all users" ON public.coupons;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable read all for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Allow public read access to active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;

-- Public may only read ACTIVE coupons (needed for checkout validation).
CREATE POLICY "Public can read active coupons" ON public.coupons
  FOR SELECT
  USING (is_active = true);

-- Admins (verified via public.is_admin()) have full access to all coupons.
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
