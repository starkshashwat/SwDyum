-- Data Migration Script
-- Run this in your Supabase SQL Editor to seed the database

-- 1. Categories
INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Traditional Pickles', 'traditional-pickles', 'Authentic handmade pickles')
ON CONFLICT (slug) DO NOTHING;

-- 2. Products
INSERT INTO public.products (id, category_id, name, slug, description, short_description, is_active, is_bestseller, base_price)
VALUES 
  ('b841a981-f06e-40db-b731-dc29a4d9dd9e', '11111111-1111-1111-1111-111111111111', 'Mango Pickle (Aam Ka Achar)', 'mango-pickle', 'Our signature mango pickle is made from raw sun-dried green mangoes, marinated in cold-pressed mustard oil and a blend of aromatic Bihari spices. It brings back the true taste of nostalgia and tradition.', 'Authentic sun-dried mango pickle handmade in cold-pressed mustard oil.', true, true, 299)
ON CONFLICT (slug) DO NOTHING;

-- 3. Product Variants
INSERT INTO public.product_variants (product_id, weight_label, price, stock_quantity)
VALUES
  ('b841a981-f06e-40db-b731-dc29a4d9dd9e', '250g', 299, 50),
  ('b841a981-f06e-40db-b731-dc29a4d9dd9e', '500g', 599, 50),
  ('b841a981-f06e-40db-b731-dc29a4d9dd9e', '1kg', 899, 50)
ON CONFLICT DO NOTHING;

-- 4. Product Images
INSERT INTO public.product_images (product_id, url, is_primary, display_order)
VALUES
  ('b841a981-f06e-40db-b731-dc29a4d9dd9e', '/prod_mango.webp', true, 0)
ON CONFLICT DO NOTHING;
