-- Swadyum Mock Reviews Seed Data
-- Execute this after seed.sql to populate fake reviews for UI testing

-- 1. Note: We are using NULL for customer_id to represent guest/anonymous reviews, avoiding auth.users constraint errors.

-- 2. Insert mock reviews linked to existing products and profiles
DO $$
DECLARE
    v_mango_id UUID;
    v_garlic_id UUID;
BEGIN
    -- Get the product IDs for Mango Pickle and Garlic Pickle
    SELECT id INTO v_mango_id FROM public.products WHERE slug = 'signature-mango-pickle' LIMIT 1;
    SELECT id INTO v_garlic_id FROM public.products WHERE slug = 'mountain-garlic-pickle' LIMIT 1;

    -- Insert mock reviews
    IF v_mango_id IS NOT NULL AND v_garlic_id IS NOT NULL THEN
      INSERT INTO public.reviews (
        product_id, customer_id, rating, review_text, is_approved, is_featured, created_at
      )
      VALUES 
        (
          v_mango_id, 
          NULL, 
          5, 
          'Absolutely loved it! It tastes exactly like the pickles my grandmother used to make. The spices are perfectly balanced. Will definitely be ordering the 1kg jar next time.', 
          false, -- Pending approval
          false, 
          NOW() - INTERVAL '1 days'
        ),
        (
          v_garlic_id, 
          NULL, 
          4, 
          'Very good garlic pickle. The mustard oil flavor is authentic and strong. Took one star off because shipping was slightly delayed, but the product itself is top notch.', 
          true, -- Approved
          false, 
          NOW() - INTERVAL '3 days'
        ),
        (
          v_mango_id, 
          NULL, 
          5, 
          'Best mango pickle I have ever had! Swadyum never disappoints.', 
          true, -- Approved
          true, -- Featured!
          NOW() - INTERVAL '10 days'
        ),
        (
          v_garlic_id, 
          NULL, 
          1, 
          'This is a spam message trying to sell crypto currency. Click here to buy bitcoin!', 
          false, -- Pending approval (needs to be rejected/deleted)
          false, 
          NOW() - INTERVAL '2 hours'
        );
    END IF;
END $$;
