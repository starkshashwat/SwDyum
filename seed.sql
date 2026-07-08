-- Data Migration Script
-- Run this in your Supabase SQL Editor to seed the database

-- 1. Categories
INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Pickle', 'pickle', 'Traditional sun-dried Bihari pickles.'),
  ('22222222-2222-2222-2222-222222222222', 'Murabba', 'murabba', 'Sweet and healthy fruit preserves.'),
  ('33333333-3333-3333-3333-333333333333', 'Snacks', 'snacks', 'Crispy traditional Bihari snacks.'),
  ('44444444-4444-4444-4444-444444444444', 'Heritage Gift Box', 'heritage-gift-box', 'Beautifully curated gift boxes.')
ON CONFLICT (slug) DO NOTHING;

-- 2. Products
INSERT INTO public.products (id, category_id, name, slug, description, short_description, is_active, is_bestseller, base_price)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Classic Mango Pickle', 'mango-pickle', 'Traditional sun-dried Bihari mango pickle made with raw green mangoes, mustard oil, and authentic spices.', 'Traditional sun-dried Bihari mango pickle.', true, true, 299),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Spicy Garlic Pickle', 'garlic-pickle', 'Pungent, spicy, and deeply flavorful garlic cloves marinated in rich spices.', 'Pungent, spicy, and deeply flavorful garlic.', true, true, 299),
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Tangy Amla Pickle', 'amla-pickle', 'Nutritious Indian gooseberry (Amla) pickle, packed with Vitamin C.', 'Nutritious Indian gooseberry (Amla) pickle.', true, false, 299),
  ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Authentic Kathal (Jackfruit) Pickle', 'kathal-pickle', 'A seasonal delicacy! Tender jackfruit pieces pickled in mustard oil and traditional spices.', 'A seasonal delicacy! Tender jackfruit pieces.', true, false, 299),
  ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Oal (Elephant Foot Yam) Pickle', 'oal-pickle', 'A rare and traditional Bihari specialty.', 'A rare and traditional Bihari specialty.', true, true, 299),
  
  ('a0000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Sweet Amla Murabba', 'amla-murabba', 'Whole Amlas slow-cooked in sugar syrup infused with cardamom.', 'Whole Amlas slow-cooked in sugar syrup.', true, true, 299),
  ('a0000000-0000-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Mango Murabba (Gurma)', 'mango-murabba', 'Sweet and sour raw mangoes preserved in a spiced jaggery and sugar syrup.', 'Sweet and sour raw mangoes preserved in syrup.', true, false, 299),
  
  ('a0000000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333', 'Bihari Tisauri', 'tisauri-snack', 'Sun-dried lentil dumplings mixed with flax seeds and spices.', 'Sun-dried lentil dumplings mixed with flax seeds.', true, false, 299),
  ('a0000000-0000-0000-0000-000000000009', '33333333-3333-3333-3333-333333333333', 'Traditional Chaurauri', 'chaurauri-snack', 'Crispy rice flour crackers, a beloved traditional snack in Bihar.', 'Crispy rice flour crackers.', true, true, 299),
  
  ('a0000000-0000-0000-0000-000000000010', '44444444-4444-4444-4444-444444444444', 'The Heritage Assortment Box', 'heritage-assortment-box', 'A beautifully curated rigid collection box containing four 250g jars of our most loved traditional Bihari pickles and murabbas. Perfect for gifting.', 'Curated gift box with 4 jars.', true, true, 1196)
ON CONFLICT (slug) DO NOTHING;

-- 3. Product Variants (Standard Pricing for products 1-9)
INSERT INTO public.product_variants (product_id, weight_label, price, stock_quantity)
SELECT id, '250g', 299, 50 FROM public.products WHERE slug != 'heritage-assortment-box' ON CONFLICT DO NOTHING;

INSERT INTO public.product_variants (product_id, weight_label, price, stock_quantity)
SELECT id, '500g', 599, 50 FROM public.products WHERE slug != 'heritage-assortment-box' ON CONFLICT DO NOTHING;

INSERT INTO public.product_variants (product_id, weight_label, price, stock_quantity)
SELECT id, '1kg', 899, 50 FROM public.products WHERE slug != 'heritage-assortment-box' ON CONFLICT DO NOTHING;

-- Special variant for Gift Box
INSERT INTO public.product_variants (product_id, weight_label, price, stock_quantity)
SELECT id, 'Set of 4 (250g each)', 1196, 100 FROM public.products WHERE slug = 'heritage-assortment-box' ON CONFLICT DO NOTHING;

-- 4. Product Images
INSERT INTO public.product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_mango.webp', true, 0 FROM public.products WHERE slug IN ('mango-pickle', 'kathal-pickle', 'mango-murabba');

INSERT INTO public.product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_garlic.webp', true, 0 FROM public.products WHERE slug = 'garlic-pickle';

INSERT INTO public.product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_lemon.webp', true, 0 FROM public.products WHERE slug IN ('amla-pickle', 'amla-murabba');

INSERT INTO public.product_images (product_id, url, is_primary, display_order)
SELECT id, '/prod_chili.webp', true, 0 FROM public.products WHERE slug = 'oal-pickle';

INSERT INTO public.product_images (product_id, url, is_primary, display_order)
SELECT id, '/cat_spices.webp', true, 0 FROM public.products WHERE slug IN ('tisauri-snack', 'chaurauri-snack');

INSERT INTO public.product_images (product_id, url, is_primary, display_order)
SELECT id, '/deal_scatter.webp', true, 0 FROM public.products WHERE slug = 'heritage-assortment-box';
