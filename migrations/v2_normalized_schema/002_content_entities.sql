-- ============================================================
-- 002_content_entities.sql
-- Phase 1 — Normalized Schema Migration
-- Source plan: plans/mango-pickle-fullstack-plan.md §4.2
--
-- Tables created in this file:
--   - product_trust_badges (with emoji column)
--   - product_faqs
--   - product_process_steps
--   - combos
--   - combo_items
--   - deals
--   - announcements
--   - offers
--
-- Notes:
--   - All statements are idempotent (IF NOT EXISTS).
--   - RLS is NOT enabled here; see 005_rls_policies.sql.
--   - Indexes are NOT created here; see 006_indexes_triggers.sql.
--   - product_trust_badges / product_faqs / product_process_steps
--     are per-product normalized tables that complement the
--     products.pdp_config JSONB blob (§1.1). They allow admin
--     CRUD via structured rows while the JSONB remains the
--     rendering source of truth for the frontend.
-- ============================================================

BEGIN;

-- ============================================================
-- PRODUCT_TRUST_BADGES (new — replaces hardcoded emoji badges)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_trust_badges (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    emoji       TEXT NOT NULL,
    label       TEXT NOT NULL,
    description TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_trust_badges IS 'Per-product trust badges (e.g. "🌿 100% Natural"). Replaces hardcoded emoji+text badge pairs across PDP and home components.';
COMMENT ON COLUMN public.product_trust_badges.emoji IS 'Single emoji character or short emoji sequence rendered next to the label (e.g. "🌿", "🚫", "✅"). Admin editor should use an emoji picker (plan §5.3.2).';
COMMENT ON COLUMN public.product_trust_badges.sort_order IS 'Lower values render first in the badge row.';

-- ============================================================
-- PRODUCT_FAQS (normalized from pdp_config.faq)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_faqs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_faqs IS 'Per-product FAQ entries. Mirrors the pdp_config.faq JSONB array (src/data/pdpContentMap.js:49-57) for structured admin CRUD.';
COMMENT ON COLUMN public.product_faqs.answer IS 'Plain text or sanitized HTML answer. Must be sanitized with DOMPurify before rendering (plan §6.3).';

-- ============================================================
-- PRODUCT_PROCESS_STEPS (new — replaces hardcoded PdpProcessTimeline.jsx:4-35)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_process_steps (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    icon        TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.product_process_steps IS 'Per-product process timeline steps. Replaces hardcoded 5-step array in PdpProcessTimeline.jsx:4-35.';
COMMENT ON COLUMN public.product_process_steps.icon IS 'Emoji or image URL for the step icon. Admin editor should use an emoji picker or image upload (plan §5.2.4).';
COMMENT ON COLUMN public.product_process_steps.step_number IS '1-based ordering of the step in the timeline.';

-- ============================================================
-- COMBOS (new — replaces hardcoded ComboOfferSection.jsx:5-27)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.combos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    mrp         NUMERIC(10,2) CHECK (mrp >= price),
    image_url   TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.combos IS 'Combo offers (bundles). Replaces hardcoded combos array in ComboOfferSection.jsx:5-27. Frontend will fetch via supabase.from("combos").select("*, combo_items(*, products(*))").';
COMMENT ON COLUMN public.combos.mrp IS 'Maximum Retail Price for the combo. Must be >= price. NULL allowed when no discount.';

-- ============================================================
-- COMBO_ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.combo_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id        UUID NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.combo_items IS 'Line items belonging to a combo. variant_id is optional (NULL = default variant).';

-- ============================================================
-- DEALS (new — replaces hardcoded DealSection.jsx:4-98)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id  UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    deal_price  NUMERIC(10,2) NOT NULL CHECK (deal_price >= 0),
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

COMMENT ON TABLE public.deals IS 'Time-limited deals with countdown timer. Replaces hardcoded DealSection.jsx:4-98. Frontend filters by is_active = TRUE AND now() BETWEEN start_time AND end_time.';
COMMENT ON COLUMN public.deals.deal_price IS 'Promotional price for the deal period.';

-- ============================================================
-- ANNOUNCEMENTS (new — replaces mock AnnouncementsList.jsx)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL CHECK (type IN ('Shipping','Offer','Update','Maintenance')),
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Scheduled','Expired','Inactive')),
    start_date  TIMESTAMPTZ,
    end_date    TIMESTAMPTZ,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.announcements IS 'Site-wide announcements. Replaces 100% mock AnnouncementsList.jsx:5-20. Frontend reads WHERE is_active = TRUE AND now() BETWEEN start_date AND end_date.';
COMMENT ON COLUMN public.announcements.type IS 'Announcement category. Constrained to Shipping/Offer/Update/Maintenance per plan §4.2.';

-- ============================================================
-- OFFERS (new — replaces mock OffersList.jsx)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.offers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    banner_url  TEXT,
    product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.offers IS 'Promotional offers. Replaces 100% mock OffersList.jsx:6-25. Either product_id or category_id may be set to scope the offer.';

COMMIT;
