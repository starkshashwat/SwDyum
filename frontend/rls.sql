-- Comprehensive RLS Policies for Swadyum E-commerce MVP

-- 1. Enable RLS on all relevant public tables (safe operation if already enabled)
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "banners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shipments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Disable RLS on tables that might not exist or are causing issues right now
-- (If any table doesn't exist, we wrap in DO block to avoid breaking the script)

DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ALTER TABLE "' || t || '" ENABLE ROW LEVEL SECURITY;';
    
    -- Drop existing 'admin_all' to recreate
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "admin_all" ON "' || t || '";';
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Create Admin Policy for ALL tables
    -- This allows any logged-in Admin/Manager to do full CRUD on every table.
    EXECUTE 'CREATE POLICY "admin_all" ON "' || t || '" 
      FOR ALL 
      TO authenticated
      USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN (''Super Admin''::user_role, ''Manager''::user_role)
      )
      WITH CHECK (
        (SELECT role FROM profiles WHERE id = auth.uid()) IN (''Super Admin''::user_role, ''Manager''::user_role)
      );';
  END LOOP;
END $$;

-- 2. Create Public Read Policies for Storefront
-- We use DO blocks to safely create them even if they exist.

DO $$
BEGIN
    DROP POLICY IF EXISTS "public_read_products" ON "products";
    CREATE POLICY "public_read_products" ON "products" FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "public_read_variants" ON "product_variants";
    CREATE POLICY "public_read_variants" ON "product_variants" FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "public_read_images" ON "product_images";
    CREATE POLICY "public_read_images" ON "product_images" FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "public_read_categories" ON "categories";
    CREATE POLICY "public_read_categories" ON "categories" FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "public_read_banners" ON "banners";
    CREATE POLICY "public_read_banners" ON "banners" FOR SELECT USING (true);

    DROP POLICY IF EXISTS "public_read_coupons" ON "coupons";
    CREATE POLICY "public_read_coupons" ON "coupons" FOR SELECT USING (true);

    DROP POLICY IF EXISTS "public_read_reviews" ON "reviews";
    CREATE POLICY "public_read_reviews" ON "reviews" FOR SELECT USING (true);
    
EXCEPTION WHEN OTHERS THEN 
    -- Ignore errors if tables don't exist yet
END $$;

-- Add policies for customer specific reads (Customers can read their own orders and profile)
DO $$
BEGIN
    DROP POLICY IF EXISTS "customer_read_orders" ON "orders";
    CREATE POLICY "customer_read_orders" ON "orders" FOR SELECT TO authenticated USING (customer_id = auth.uid());
    
    DROP POLICY IF EXISTS "customer_read_order_items" ON "order_items";
    CREATE POLICY "customer_read_order_items" ON "order_items" FOR SELECT TO authenticated USING (
      order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    );
    
    DROP POLICY IF EXISTS "customer_read_profile" ON "profiles";
    CREATE POLICY "customer_read_profile" ON "profiles" FOR SELECT TO authenticated USING (id = auth.uid());

    DROP POLICY IF EXISTS "customer_update_profile" ON "profiles";
    CREATE POLICY "customer_update_profile" ON "profiles" FOR UPDATE TO authenticated USING (id = auth.uid());
EXCEPTION WHEN OTHERS THEN 
END $$;

-- Allow public to insert orders? No, only authenticated users (or anon with policy)
-- For MVP, we'll allow anon and authenticated to insert orders so guests can checkout.
DO $$
BEGIN
    DROP POLICY IF EXISTS "public_insert_orders" ON "orders";
    CREATE POLICY "public_insert_orders" ON "orders" FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "public_insert_order_items" ON "order_items";
    CREATE POLICY "public_insert_order_items" ON "order_items" FOR INSERT WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN 
END $$;
