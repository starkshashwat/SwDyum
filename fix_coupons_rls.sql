-- Allow authenticated admin users to create new coupons
CREATE POLICY "Enable insert for authenticated users"
ON public.coupons
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated admin users to update existing coupons (e.g. disable them)
CREATE POLICY "Enable update for authenticated users"
ON public.coupons
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated admin users to view all coupons (including disabled ones)
CREATE POLICY "Enable read all for authenticated users"
ON public.coupons
FOR SELECT
TO authenticated
USING (true);
