-- Swadyum Mock Orders Seed Data
-- Execute this after seed.sql to populate fake orders for UI testing

-- 1. Ensure columns exist on orders table in case schema was not fully updated
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cod_fee NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS shipping_details JSONB,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS weight_label TEXT,
  ADD COLUMN IF NOT EXISTS subscription_type TEXT;

-- 2. Insert Orders (using NULL for customer_id to represent Guest checkouts, avoiding auth.users constraint errors)
-- Added "items" and "shipping" with empty JSON to bypass legacy NOT NULL constraints on your live database
INSERT INTO public.orders (
  id, customer_id, date, subtotal, shipping_fee, cod_fee, discount_amount, total, status, payment_method, payment_id, shipping_details, created_at, items, shipping
)
VALUES 
  (
    'SWD-1001', 
    NULL, 
    NOW() - INTERVAL '2 days', 
    598, 50, 0, 0, 648, 
    'Processing', 'UPI', 'pay_Razor123', 
    '{"fullName": "Rahul Sharma", "addressLine1": "A-12, Vihar Phase 1", "city": "Delhi", "state": "Delhi", "zip": "110001", "phone": "+919876543210"}',
    NOW() - INTERVAL '2 days',
    '[]'::jsonb,
    0
  ),
  (
    'SWD-1002', 
    NULL, 
    NOW() - INTERVAL '1 days', 
    899, 0, 50, 0, 949, 
    'Pending', 'COD', null, 
    '{"fullName": "Priya Singh", "addressLine1": "402, Royal Residency", "city": "Mumbai", "state": "Maharashtra", "zip": "400053", "phone": "+919876543211"}',
    NOW() - INTERVAL '1 days',
    '[]'::jsonb,
    0
  ),
  (
    'SWD-1003', 
    NULL, 
    NOW() - INTERVAL '5 days', 
    299, 50, 0, 50, 299, 
    'Delivered', 'Card', 'pay_CardXYZ', 
    '{"fullName": "Rahul Sharma", "addressLine1": "A-12, Vihar Phase 1", "city": "Delhi", "state": "Delhi", "zip": "110001", "phone": "+919876543210"}',
    NOW() - INTERVAL '5 days',
    '[]'::jsonb,
    0
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Order Items (Linking randomly to a known product variant, for example, the first available variant)
DO $$
DECLARE
    v_mango_id UUID;
    v_garlic_id UUID;
BEGIN
    SELECT id INTO v_mango_id FROM public.product_variants WHERE weight_label = '250g' LIMIT 1;
    SELECT id INTO v_garlic_id FROM public.product_variants WHERE weight_label = '500g' LIMIT 1;

    INSERT INTO public.order_items (order_id, variant_id, product_name, weight_label, quantity, unit_price, total_price)
    VALUES 
      ('SWD-1001', v_mango_id, 'Signature Mango Pickle', '250g', 2, 299, 598),
      ('SWD-1002', v_mango_id, 'Signature Mango Pickle', '250g', 1, 299, 299),
      ('SWD-1002', v_garlic_id, 'Mountain Garlic Pickle', '500g', 1, 600, 600),
      ('SWD-1003', v_mango_id, 'Signature Mango Pickle', '250g', 1, 299, 299);
END $$;
