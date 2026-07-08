-- =====================================================================
-- Swadyum OMS — Complete Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =====================================================================

-- =====================================================================
-- 1. NEW TABLES
-- =====================================================================

-- 1a. Addresses — Multiple saved addresses per customer
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home', -- 'Home', 'Work', 'Other'
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    house_number TEXT,
    street TEXT,
    landmark TEXT,
    area TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1b. Payments — Payment records linked to orders
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    payment_method TEXT DEFAULT 'Online / Razorpay',
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Refunded', 'Failed'
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1c. Invoices — Admin-only invoice records
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE,
    invoice_date TIMESTAMPTZ DEFAULT NOW(),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    billing_address JSONB,
    shipping_address JSONB,
    product_details JSONB, -- Array of {name, sku, variant, qty, price, discount, final_price}
    subtotal NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    shipping_charges NUMERIC DEFAULT 0,
    grand_total NUMERIC DEFAULT 0,
    gst_number TEXT, -- Future ready
    status TEXT DEFAULT 'Generated', -- 'Generated', 'Sent', 'Paid', 'Cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1d. Order Timeline — Audit log of every status change
CREATE TABLE IF NOT EXISTS public.order_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    event TEXT NOT NULL, -- 'Order Created', 'Payment Received', 'Inventory Reduced', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'
    note TEXT,
    created_by TEXT, -- 'system', 'admin', customer email etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1e. Coupon Usage — Per-customer coupon usage tracking
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount NUMERIC NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 2. ALTER EXISTING TABLES — Add missing columns
-- =====================================================================

-- 2a. Orders — Add new columns for richer data
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_details JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS weight NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS package_size TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 2b. Order Items — Add enrichment columns
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS final_price NUMERIC;

-- =====================================================================
-- 3. INDEXES for performance
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON public.orders(coupon_code);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON public.payments(razorpay_payment_id);

CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON public.addresses(customer_id);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON public.order_timeline(order_id);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON public.coupon_usage(order_id);

-- =====================================================================
-- 4. AUTO-GENERATE INVOICE NUMBER (trigger)
-- =====================================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.invoices
    WHERE invoice_number LIKE 'INV-%';
    
    NEW.invoice_number := 'INV-' || LPAD(next_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON public.invoices;
CREATE TRIGGER trigger_generate_invoice_number
BEFORE INSERT ON public.invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_invoice_number();

-- =====================================================================
-- 5. AUTO-CREATE TIMELINE ENTRY on order insert
-- =====================================================================

CREATE OR REPLACE FUNCTION auto_create_order_timeline()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.order_timeline (order_id, event, note, created_by)
    VALUES (NEW.id, 'Order Created', 'Order placed by customer', 'system');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_timeline ON public.orders;
CREATE TRIGGER trigger_auto_create_timeline
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION auto_create_order_timeline();

-- =====================================================================
-- 6. RLS POLICIES for new tables
-- =====================================================================

-- Addresses
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.addresses;
CREATE POLICY "Admins can view all addresses" ON public.addresses
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.email())
    );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);

-- Invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE email = auth.email())
    );
-- Service role (edge functions) bypasses RLS, so webhook can create invoices

-- Order Timeline
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view order timeline" ON public.order_timeline;
CREATE POLICY "Anyone can view order timeline" ON public.order_timeline FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert order timeline" ON public.order_timeline;
CREATE POLICY "Anyone can insert order timeline" ON public.order_timeline FOR INSERT WITH CHECK (true);

-- Coupon Usage
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view coupon usage" ON public.coupon_usage;
CREATE POLICY "Anyone can view coupon usage" ON public.coupon_usage FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert coupon usage" ON public.coupon_usage;
CREATE POLICY "Anyone can insert coupon usage" ON public.coupon_usage FOR INSERT WITH CHECK (true);

-- Also ensure orders, order_items have permissive policies for the admin panel
-- (These were set up in fix_orders_rls.sql but let's make sure)
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can update order items" ON public.order_items;
CREATE POLICY "Anyone can update order items" ON public.order_items FOR UPDATE USING (true);

-- =====================================================================
-- 7. Ensure admin_users table exists (from fix_orders_rls.sql)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'super_admin'
);

-- Insert default admin if not exists
INSERT INTO public.admin_users (email, role)
VALUES ('stark@gmail.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read for admin_users" ON public.admin_users;
CREATE POLICY "Allow read for admin_users" ON public.admin_users FOR SELECT USING (true);

-- =====================================================================
-- 8. Fix the FK on orders -> profiles (from fix_foreign_key.sql)
-- =====================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE public.orders
    ADD CONSTRAINT orders_customer_id_fkey
    FOREIGN KEY (customer_id)
    REFERENCES public.profiles(id)
    ON DELETE SET NULL;

-- =====================================================================
-- 9. Reload PostgREST schema cache
-- =====================================================================

NOTIFY pgrst, 'reload schema';
