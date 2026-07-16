-- ============================================================
-- 003_commerce.sql
-- Phase 1 — Normalized Schema Migration
-- Source plan: plans/mango-pickle-fullstack-plan.md §4.2
--
-- Tables created in this file:
--   - orders            (canonical unified shape)
--   - order_items
--   - payments
--   - coupons
--   - coupon_usage
--   - product_reviews   (canonical name — see decision block below)
--
-- ============================================================
-- CANONICAL DECISION: ORDERS TABLE SHAPE
-- ============================================================
-- The plan (§2.2.1) identifies THREE conflicting `orders` shapes:
--   Shape A (complete_schema.sql / CartDrawer.jsx):
--       customer_id, total, customer_email, customer_phone,
--       shipping_address (JSONB)
--   Shape B (create_orders_tables.sql): different column names/types
--   Shape C (fastrr-order-webhook/index.ts:117-124):
--       user_id, total_amount, status, payment_method,
--       shipping_address (string), contact_email, contact_phone
--
-- DECISION: Adopt Shape A as the canonical shape, extended with the
-- tracking columns from migrations/add_checkout_tracking_columns.sql
-- and the payment fields needed by the Razorpay edge function. This
-- matches the LIVE frontend (CartDrawer.jsx:212-223) which is the
-- primary order-creation path, minimizing frontend churn.
--
-- Mapping for migrating Shape C rows (fastrr webhook) into canonical:
--     user_id        -> customer_id
--     total_amount   -> total
--     contact_email  -> customer_email
--     contact_phone  -> customer_phone
--     shipping_address (string) -> shipping_address (JSONB via cast)
-- Data migration itself is deferred to a later phase; this file only
-- defines the canonical DDL.
--
-- ============================================================
-- CANONICAL DECISION: REVIEWS TABLE NAMING
-- ============================================================
-- The plan (§2.2.2) identifies a naming mismatch:
--   - Schema files (supabase_schema.sql, complete_schema.sql): `reviews`
--   - Frontend (src/data/reviews.js:72-79): inserts into `product_reviews`
--   - Admin (admin/src/pages/ReviewsList.jsx:16-34): fetches `product_reviews`
--
-- DECISION: Use `product_reviews` as the canonical table name. Rationale:
--   1. Both the LIVE frontend and the admin panel already target
--      `product_reviews` — adopting it requires zero client code changes.
--   2. The name is more descriptive and avoids collision with generic
--      "reviews" that may later be needed for site/store reviews.
-- A compatibility VIEW named `reviews` is created below so any legacy
-- tooling still referencing `reviews` continues to read approved rows.
-- ============================================================

BEGIN;

-- ============================================================
-- ORDERS (canonical shape — unifies 3 inconsistent shapes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total               NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    subtotal            NUMERIC(10,2) CHECK (subtotal IS NULL OR subtotal >= 0),
    discount            NUMERIC(10,2) DEFAULT 0 CHECK (discount >= 0),
    shipping_cost       NUMERIC(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
    tax                 NUMERIC(10,2) DEFAULT 0 CHECK (tax >= 0),
    status              TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Paid','Processing','Shipped','Delivered','Cancelled','Failed','Refunded')),
    payment_method      TEXT,
    payment_status      TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Paid','Failed','Refunded')),
    shipping_address    JSONB,
    customer_email      TEXT,
    customer_phone      TEXT,
    tracking_number     TEXT,
    tracking_history    JSONB DEFAULT '[]'::jsonb,
    shiprocket_order_id TEXT,
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.orders IS 'Canonical orders table. Unifies the 3 conflicting shapes documented in plan §2.2.1. See decision block at top of this file.';
COMMENT ON COLUMN public.orders.customer_id IS 'FK to profiles.id. NULL allowed for guest orders. Was user_id in fastrr webhook shape.';
COMMENT ON COLUMN public.orders.total IS 'Grand total of the order (subtotal - discount + shipping_cost + tax). Was total_amount in fastrr webhook shape.';
COMMENT ON COLUMN public.orders.shipping_address IS 'JSONB shipping address. Expected shape: {"name","phone","address_line1","address_line2","city","state","zip"}. Was a string in fastrr webhook shape — migrate via cast.';
COMMENT ON COLUMN public.orders.tracking_history IS 'JSONB array of tracking events. Expected shape: [{"status","timestamp","note"}]. Added by migrations/add_checkout_tracking_columns.sql in legacy schema.';
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay order id returned by createRazorpayOrder() (razorpay/index.ts:27-56).';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'Razorpay payment id captured on signature verification.';

-- ============================================================
-- ORDER_ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name    TEXT NOT NULL,
    weight_label    TEXT,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    total_price     NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Line items for an order. Shape matches CartDrawer.jsx:231-236: {product_id, variant_id, product_name, weight_label, quantity, price, total_price}.';
COMMENT ON COLUMN public.order_items.product_name IS 'Snapshot of product name at order time. product_id/variant_id may be NULL after product deletion (ON DELETE SET NULL) but the snapshot is preserved.';

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature  TEXT,
    amount              NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    currency            TEXT NOT NULL DEFAULT 'INR',
    status              TEXT NOT NULL CHECK (status IN ('created','authorized','captured','failed','refunded')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Razorpay payment records. Mirrors the Razorpay lifecycle (razorpay/index.ts).';
COMMENT ON COLUMN public.payments.status IS 'Razorpay payment status. Constrained to created/authorized/captured/failed/refunded.';

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            TEXT NOT NULL UNIQUE,
    description     TEXT,
    discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed')),
    discount_value  NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_value NUMERIC(10,2) DEFAULT 0 CHECK (min_order_value >= 0),
    max_uses        INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
    used_count      INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    expiry_date     TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupons IS 'Discount coupons. Validated by src/components/cart/hooks/useCouponValidation.js:8-86 which returns {code, discount_type, discount_value}.';
COMMENT ON COLUMN public.coupons.discount_type IS 'percentage = discount_value% off; fixed = flat discount_value off.';
COMMENT ON COLUMN public.coupons.max_uses IS 'NULL = unlimited uses.';

-- ============================================================
-- COUPON_USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupon_usage (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id   UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id    UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    used_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.coupon_usage IS 'Tracks each coupon redemption. Used to enforce max_uses and per-user limits.';

-- ============================================================
-- PRODUCT_REVIEWS (canonical name — see decision block at top)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    media_urls  TEXT[] DEFAULT '{}',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_reviews IS 'Product reviews. Canonical name chosen over `reviews` to match the LIVE frontend (src/data/reviews.js:72-79) and admin (ReviewsList.jsx:16-34). See decision block at top of this file.';
COMMENT ON COLUMN public.product_reviews.rating IS 'Star rating 1-5 inclusive.';
COMMENT ON COLUMN public.product_reviews.media_urls IS 'Array of Supabase Storage URLs for review media (images). Uploaded via uploadMedia() in reviews.js:29-53.';
COMMENT ON COLUMN public.product_reviews.is_approved IS 'FALSE by default. Admin moderates via ReviewsList.jsx. Public RLS only exposes approved rows.';
COMMENT ON COLUMN public.product_reviews.is_featured IS 'Admin-curated flag for showcasing select reviews on category/home pages.';

-- ============================================================
-- Compatibility VIEW: reviews -> product_reviews
-- (read-only alias for legacy tooling still referencing `reviews`)
-- ============================================================
CREATE OR REPLACE VIEW public.reviews AS
    SELECT
        id,
        product_id,
        customer_id,
        name,
        rating,
        comment,
        media_urls,
        is_approved,
        is_featured,
        created_at,
        updated_at
    FROM public.product_reviews;

COMMENT ON VIEW public.reviews IS 'Backwards-compatibility read-only view aliasing the canonical product_reviews table. Legacy schema files named the table `reviews`; this view lets old tooling keep reading. Do NOT insert into this view — insert into product_reviews instead.';

COMMIT;
