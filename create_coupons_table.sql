-- Create the coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    code text PRIMARY KEY,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric NOT NULL CHECK (discount_value > 0),
    min_order_value numeric DEFAULT 0,
    max_discount numeric,
    valid_until timestamptz,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active coupons
CREATE POLICY "Allow public read access to active coupons"
    ON public.coupons
    FOR SELECT
    USING (is_active = true);

-- Add coupon_code column to orders table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='orders' AND column_name='coupon_code') THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code text REFERENCES public.coupons(code) ON DELETE SET NULL;
    END IF;
END $$;
