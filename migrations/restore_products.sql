-- ============================================================
-- Restore Products — 3 pickles (mango, garlic, mixed)
-- Idempotent: safe to re-run. Run in Supabase Dashboard → SQL Editor.
-- ============================================================

-- 1. Ensure the pure_ingredients column exists (used by src/data/products.js)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pure_ingredients JSONB DEFAULT '[]'::jsonb;

-- 2. Ensure the pdp_config column exists (read by getProductBySlug)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pdp_config JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure the category exists (fixed UUID so re-runs are stable)
INSERT INTO categories (id, name, slug, description, created_at, updated_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Traditional Pickles',
  'traditional-pickles',
  'Authentic handmade pickles',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Insert / restore the 3 products (idempotent by slug)
INSERT INTO products (
  name, slug, description, short_description,
  is_active, is_bestseller, base_price, category_id, pure_ingredients
)
VALUES
  (
    'Mango Pickle (Aam Ka Achar)',
    'mango-pickle',
    'Our signature mango pickle is made from raw sun-dried green mangoes, marinated in cold-pressed mustard oil and a blend of aromatic Bihari spices. It brings back the true taste of nostalgia and tradition.',
    'Authentic sun-dried mango pickle handmade in cold-pressed mustard oil.',
    true, true, 299,
    '11111111-1111-1111-1111-111111111111',
    '[{"name":"Raw Mango","benefit":"Rich in Vitamin C and aids digestion","img":"/ing_mango.webp"},{"name":"Mustard Oil","benefit":"Cold-pressed for authentic aroma","img":"/ing_mustard.webp"}]'::jsonb
  ),
  (
    'Garlic Pickle (Lahsun Ka Achar)',
    'garlic-pickle',
    'A fiery and aromatic garlic pickle crafted with hand-peeled garlic cloves and premium spices. Perfect to spice up any meal and packed with natural immunity-boosting benefits.',
    'Fiery and aromatic hand-peeled garlic pickle.',
    true, false, 349,
    '11111111-1111-1111-1111-111111111111',
    '[{"name":"Fresh Garlic","benefit":"Boosts immunity","img":"/ing_garlic.webp"}]'::jsonb
  ),
  (
    'Mixed Pickle (Panchratna)',
    'mixed-pickle',
    'A vibrant medley of carrots, green chilies, mangoes, lemon, and ginger. Our mixed pickle offers a burst of flavors in every bite—tangy, spicy, and perfectly balanced.',
    'A vibrant medley of fresh vegetables and traditional spices.',
    true, true, 329,
    '11111111-1111-1111-1111-111111111111',
    '[{"name":"Mixed Veggies","benefit":"Rich in vitamins","img":"/ing_mixed.webp"}]'::jsonb
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  is_active = true,
  is_bestseller = EXCLUDED.is_bestseller,
  base_price = EXCLUDED.base_price,
  category_id = EXCLUDED.category_id,
  pure_ingredients = EXCLUDED.pure_ingredients,
  updated_at = NOW();

-- 5. Variants — insert if the (product_id, weight_label) pair is missing
-- Mango Pickle
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '250g', 299, 399, 50 FROM products WHERE slug = 'mango-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '500g', 549, 749, 30 FROM products WHERE slug = 'mango-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '1kg', 999, 1399, 20 FROM products WHERE slug = 'mango-pickle'
ON CONFLICT DO NOTHING;

-- Garlic Pickle
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '250g', 349, 449, 40 FROM products WHERE slug = 'garlic-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '500g', 649, 849, 25 FROM products WHERE slug = 'garlic-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '1kg', 1199, 1599, 15 FROM products WHERE slug = 'garlic-pickle'
ON CONFLICT DO NOTHING;

-- Mixed Pickle
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '250g', 329, 429, 60 FROM products WHERE slug = 'mixed-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '500g', 599, 799, 45 FROM products WHERE slug = 'mixed-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '1kg', 1099, 1499, 30 FROM products WHERE slug = 'mixed-pickle'
ON CONFLICT DO NOTHING;

-- 6. Primary images — insert if missing for this product
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_mango.webp', true, 1 FROM products WHERE slug = 'mango-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_garlic.webp', true, 1 FROM products WHERE slug = 'garlic-pickle'
ON CONFLICT DO NOTHING;
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_mixed.webp', true, 1 FROM products WHERE slug = 'mixed-pickle'
ON CONFLICT DO NOTHING;

-- 7. Verify
SELECT slug, is_active, base_price FROM products WHERE slug IN ('mango-pickle','garlic-pickle','mixed-pickle') ORDER BY slug;
