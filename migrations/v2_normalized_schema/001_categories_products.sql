-- ============================================================
-- 001_categories_products.sql
-- Phase 1 — Normalized Schema Migration
-- Source plan: plans/mango-pickle-fullstack-plan.md §4.2
--
-- Tables created in this file:
--   - categories
--   - category_pairings
--   - products
--   - product_variants
--   - product_images
--   - product_ingredients
--
-- Notes:
--   - All statements are idempotent (IF NOT EXISTS) so the file
--     can be safely re-run.
--   - RLS is NOT enabled here; see 005_rls_policies.sql.
--   - Indexes are NOT created here; see 006_indexes_triggers.sql.
--   - product_ingredients is a normalized table derived from the
--     `pdp_config.ingredients_table` JSONB sub-field documented in
--     the plan (§1.1). It allows structured querying of ingredient
--     percentages per product.
-- ============================================================

BEGIN;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    description TEXT,
    banner_url  TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Product categories. Replaces hardcoded category data in CategoryPage.jsx.';
COMMENT ON COLUMN public.categories.sort_order IS 'Lower values appear first in storefront navigation.';

-- ============================================================
-- CATEGORY_PAIRINGS (new — replaces hardcoded CategoryPage.jsx:25-34)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.category_pairings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    icon        TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.category_pairings IS 'Food pairings per category (e.g. "Pairs well with Dal"). Replaces hardcoded pairingsData in CategoryPage.jsx:25-34.';
COMMENT ON COLUMN public.category_pairings.icon IS 'Emoji or icon identifier (e.g. "🍛"). Used by frontend pairing chips.';

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    pdp_config  JSONB DEFAULT '{}'::jsonb,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Catalog products. Joined to product_variants, product_images, categories by frontend src/data/products.js.';
COMMENT ON COLUMN public.products.pdp_config IS 'Flexible JSONB blob driving PDP rendering. Expected shape (see src/data/pdpContentMap.js): {"hero_ingredients_v2":[{"name","image","description"}],"ingredients_table":[{"ingredient","percentage"}],"pure_ingredients":["string"],"taste_profile":{"metrics":[{"label","value","max"}],"pairings":[{"label","icon"}]},"faq":[{"question","answer"}],"tabs":{"key":"content"}}';

-- ============================================================
-- PRODUCT_VARIANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    weight_label    TEXT NOT NULL,
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    mrp             NUMERIC(10,2) CHECK (mrp >= price),
    stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    sku             TEXT UNIQUE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, weight_label)
);

COMMENT ON TABLE public.product_variants IS 'Sellable variants of a product (e.g. 200g, 500g). Dedup key for cart is slug + weight_label + subscription (App.jsx:195-204).';
COMMENT ON COLUMN public.product_variants.mrp IS 'Maximum Retail Price. Must be >= price (selling price). NULL allowed when no discount.';
COMMENT ON COLUMN public.product_variants.sku IS 'Stock keeping unit. Fallback format SWD-{slug5}-{weight} per shiprocket-sync/index.ts:45-58.';

-- ============================================================
-- PRODUCT_IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_images (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url           TEXT NOT NULL,
    alt_text      TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_images IS 'Product gallery images. Sorted by display_order in src/data/products.js:58-71.';
COMMENT ON COLUMN public.product_images.display_order IS 'Lower values render first in the PDP gallery carousel.';

-- ============================================================
-- PRODUCT_INGREDIENTS (normalized from pdp_config.ingredients_table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_ingredients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    ingredient  TEXT NOT NULL,
    percentage  NUMERIC(5,2) CHECK (percentage >= 0 AND percentage <= 100),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_ingredients IS 'Normalized ingredient list per product. Mirrors the pdp_config.ingredients_table JSONB array for structured querying. The JSONB copy in products.pdp_config remains the rendering source of truth for the frontend.';
COMMENT ON COLUMN public.product_ingredients.percentage IS 'Percentage by weight of the ingredient in the product (0-100). NULL allowed when percentage is not applicable.';

COMMIT;
