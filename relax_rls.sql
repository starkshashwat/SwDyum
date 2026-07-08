DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable read all for authenticated users" ON public.coupons;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.coupons;

CREATE POLICY "Enable all access for all users"
ON public.coupons
FOR ALL
USING (true)
WITH CHECK (true);
