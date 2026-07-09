-- Create category if missing
INSERT INTO categories (id, name, slug, description, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Traditional Pickles', 'traditional-pickles', 'Authentic handmade pickles', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Clean up any existing dummy data to avoid duplicates (optional, based on slug)
DELETE FROM products WHERE slug IN ('mango-pickle', 'garlic-pickle', 'mixed-pickle');

-- Insert Mango Pickle
WITH p1 AS (
  INSERT INTO products (name, slug, description, short_description, is_active, is_bestseller, base_price, category_id, pure_ingredients)
  VALUES (
    'Mango Pickle (Aam Ka Achar)', 
    'mango-pickle', 
    'Our signature mango pickle is made from raw sun-dried green mangoes, marinated in cold-pressed mustard oil and a blend of aromatic Bihari spices. It brings back the true taste of nostalgia and tradition.',
    'Authentic sun-dried mango pickle handmade in cold-pressed mustard oil.',
    true, 
    true,
    299, 
    '11111111-1111-1111-1111-111111111111',
    '[
      {"name": "Raw Mango", "benefit": "Rich in Vitamin C and aids digestion", "img": "/ing_mango.webp"},
      {"name": "Mustard Oil", "benefit": "Cold-pressed for authentic aroma", "img": "/ing_mustard.webp"}
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '250g', 299, 399, 50 FROM p1
UNION ALL
SELECT id, '500g', 549, 749, 30 FROM p1
UNION ALL
SELECT id, '1kg', 999, 1399, 20 FROM p1;

WITH p1 AS (SELECT id FROM products WHERE slug = 'mango-pickle')
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_mango.webp', true, 1 FROM p1;


-- Insert Garlic Pickle
WITH p2 AS (
  INSERT INTO products (name, slug, description, short_description, is_active, is_bestseller, base_price, category_id, pure_ingredients)
  VALUES (
    'Garlic Pickle (Lahsun Ka Achar)', 
    'garlic-pickle', 
    'A fiery and aromatic garlic pickle crafted with hand-peeled garlic cloves and premium spices. Perfect to spice up any meal and packed with natural immunity-boosting benefits.',
    'Fiery and aromatic hand-peeled garlic pickle.',
    true, 
    false,
    349, 
    '11111111-1111-1111-1111-111111111111',
    '[
      {"name": "Fresh Garlic", "benefit": "Boosts immunity", "img": "/ing_garlic.webp"}
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '250g', 349, 449, 40 FROM p2
UNION ALL
SELECT id, '500g', 649, 849, 25 FROM p2
UNION ALL
SELECT id, '1kg', 1199, 1599, 15 FROM p2;

WITH p2 AS (SELECT id FROM products WHERE slug = 'garlic-pickle')
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_garlic.webp', true, 1 FROM p2;


-- Insert Mixed Pickle
WITH p3 AS (
  INSERT INTO products (name, slug, description, short_description, is_active, is_bestseller, base_price, category_id, pure_ingredients)
  VALUES (
    'Mixed Pickle (Panchratna)', 
    'mixed-pickle', 
    'A vibrant medley of carrots, green chilies, mangoes, lemon, and ginger. Our mixed pickle offers a burst of flavors in every bite—tangy, spicy, and perfectly balanced.',
    'A vibrant medley of fresh vegetables and traditional spices.',
    true, 
    true,
    329, 
    '11111111-1111-1111-1111-111111111111',
    '[
      {"name": "Mixed Veggies", "benefit": "Rich in vitamins", "img": "/ing_mixed.webp"}
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO product_variants (product_id, weight_label, price, mrp, stock_quantity)
SELECT id, '250g', 329, 429, 60 FROM p3
UNION ALL
SELECT id, '500g', 599, 799, 45 FROM p3
UNION ALL
SELECT id, '1kg', 1099, 1499, 30 FROM p3;

WITH p3 AS (SELECT id FROM products WHERE slug = 'mixed-pickle')
INSERT INTO product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_mixed.webp', true, 1 FROM p3;
