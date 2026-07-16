-- ============================================================
-- 004_auth_roles.sql
-- Phase 1 — Normalized Schema Migration
-- Source plan: plans/mango-pickle-fullstack-plan.md §4.2, §5.4, §6.2
--
-- Tables / objects created in this file:
--   - profiles (auth-linked user profile)
--   - admin_roles (RBAC role catalog)
--   - admin_user_roles (join: profile <-> role)
--   - addresses
--   - subscriptions
--   - invoices
--   - inventory_logs
--   - blogs
--   - newsletter_subscribers
--   - seo_metadata
--   - whatsapp_messages
--   - whatsapp_otps
--   - account_deletion_requests
--   - is_admin() SECURITY DEFINER helper function
--
-- Notes:
--   - All statements are idempotent (IF NOT EXISTS / CREATE OR REPLACE).
--   - RLS is NOT enabled here; see 005_rls_policies.sql.
--   - Indexes are NOT created here; see 006_indexes_triggers.sql.
--   - The plan (§5.4) proposes granular roles: Admin, Editor,
--     Order Manager, Customer Support. These are modeled as rows in
--     admin_roles with a many-to-many join via admin_user_roles,
--     while profiles.role keeps the coarse Customer/Admin/Editor
--     flag for backward compatibility with existing is_admin() usage.
-- ============================================================

BEGIN;

-- ============================================================
-- PROFILES (auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT,
    email           TEXT UNIQUE,
    phone           TEXT UNIQUE,
    role            TEXT NOT NULL DEFAULT 'Customer' CHECK (role IN ('Customer','Admin','Editor')),
    admin_role      TEXT CHECK (admin_role IN ('Admin','Editor','Order Manager','Customer Support')),
    whatsapp_opt_in BOOLEAN DEFAULT FALSE,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    zip             TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile, one row per auth.users entry. Auto-created on signup by fix_auth_trigger.sql trigger.';
COMMENT ON COLUMN public.profiles.role IS 'Coarse role flag for backward compatibility with is_admin(). Constrained to Customer/Admin/Editor.';
COMMENT ON COLUMN public.profiles.admin_role IS 'Granular admin role per plan §5.4. NULL for non-admin users. Constrained to Admin/Editor/Order Manager/Customer Support.';

-- ============================================================
-- ADMIN_ROLES (RBAC role catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE CHECK (name IN ('Admin','Editor','Order Manager','Customer Support')),
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_roles IS 'Catalog of granular admin roles per plan §5.4. Seeded with Admin, Editor, Order Manager, Customer Support.';

-- ============================================================
-- ADMIN_USER_ROLES (join: profile <-> role)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE public.admin_user_roles IS 'Many-to-many assignment of granular admin roles to users. Supports RBAC policies in 005_rls_policies.sql.';

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label         TEXT,
    name          TEXT NOT NULL,
    phone         TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city          TEXT NOT NULL,
    state         TEXT NOT NULL,
    zip           TEXT NOT NULL,
    is_default    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.addresses IS 'Saved shipping addresses per customer. Managed by AddressManager.jsx and saved on checkout (CartDrawer.jsx:244-249).';
COMMENT ON COLUMN public.addresses.is_default IS 'TRUE for the customer default address. Application logic should enforce a single default per customer.';

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_item_id       UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
    plan_type           TEXT NOT NULL,
    next_delivery_date  DATE,
    status              TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Paused','Cancelled')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'Recurring delivery subscriptions. Admin managed via SubscriptionsList.jsx:16-35.';
COMMENT ON COLUMN public.subscriptions.plan_type IS 'Subscription plan label (e.g. "Monthly", "Fortnightly"). Matches the subscription field on cart items (App.jsx:187-210).';

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  TEXT NOT NULL UNIQUE,
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name   TEXT,
    customer_email  TEXT,
    customer_phone  TEXT,
    billing_address JSONB,
    shipping_address JSONB,
    product_details JSONB DEFAULT '[]'::jsonb,
    subtotal        NUMERIC(10,2),
    discount        NUMERIC(10,2) DEFAULT 0,
    shipping        NUMERIC(10,2) DEFAULT 0,
    tax             NUMERIC(10,2) DEFAULT 0,
    grand_total     NUMERIC(10,2),
    invoice_date    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Generated invoices. PDF rendered in admin InvoicesList.jsx via jsPDF + autoTable.';
COMMENT ON COLUMN public.invoices.product_details IS 'JSONB snapshot of order line items at invoice time. Expected shape: [{"product_name","weight_label","quantity","price","total_price"}].';
COMMENT ON COLUMN public.invoices.billing_address IS 'JSONB billing address. Same shape as orders.shipping_address.';

-- ============================================================
-- INVENTORY_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id      UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    change_type     TEXT NOT NULL CHECK (change_type IN ('restock','order','adjustment','return')),
    quantity_change INTEGER NOT NULL,
    previous_stock  INTEGER,
    new_stock       INTEGER,
    note            TEXT,
    created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.inventory_logs IS 'Audit log of stock changes per variant. Admin managed via InventoryList.jsx.';
COMMENT ON COLUMN public.inventory_logs.change_type IS 'restock = positive replenishment; order = decrement on sale; adjustment = manual correction; return = positive on return.';

-- ============================================================
-- BLOGS (recipes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blogs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    excerpt             TEXT,
    content             TEXT,
    author_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status              TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Published','Archived')),
    featured_image_url TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.blogs IS 'Blog/recipe posts. Admin RecipesList.jsx:13-31 fetches from this table; an editor modal is planned (plan §5.2.5).';
COMMENT ON COLUMN public.blogs.content IS 'Rich text / HTML body. Must be sanitized with DOMPurify before rendering (plan §6.3).';

-- ============================================================
-- NEWSLETTER_SUBSCRIBERS (new — Footer.jsx:8-13 has no backend)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter email subscribers. Replaces the no-backend handleSubscribe() in Footer.jsx:8-13.';

-- ============================================================
-- SEO_METADATA (new — replaces mock SEOCenter.jsx)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seo_metadata (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type       TEXT NOT NULL CHECK (page_type IN ('home','category','product','blog','static')),
    page_id         UUID,
    meta_title      TEXT,
    meta_description TEXT,
    og_title        TEXT,
    og_description  TEXT,
    og_image_url    TEXT,
    canonical_url   TEXT,
    keywords        TEXT[],
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.seo_metadata IS 'Per-page SEO metadata. Replaces mock SEOCenter.jsx:4-99. page_id references the relevant entity (category/product/blog id) depending on page_type.';
COMMENT ON COLUMN public.seo_metadata.page_type IS 'home = site home; category = category page (page_id = categories.id); product = PDP (page_id = products.id); blog = blog post (page_id = blogs.id); static = arbitrary static page (page_id NULL).';

-- ============================================================
-- WHATSAPP_MESSAGES (existing — keep)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone        TEXT NOT NULL,
    name         TEXT,
    message      TEXT,
    direction    TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
    message_type TEXT,
    raw_payload  JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.whatsapp_messages IS 'WhatsApp message log (inbound + outbound). Used by admin Inbox.jsx with Realtime.';
COMMENT ON COLUMN public.whatsapp_messages.direction IS 'inbound = received from customer; outbound = sent by system/admin.';
COMMENT ON COLUMN public.whatsapp_messages.raw_payload IS 'Full Meta webhook payload (JSONB) for debugging.';

-- ============================================================
-- WHATSAPP_OTPS (existing — keep)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone        TEXT NOT NULL,
    otp_hash     TEXT NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    attempts     INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.whatsapp_otps IS 'WhatsApp OTP records for passwordless auth. Managed by whatsapp-auth edge function. Service-role only access.';
COMMENT ON COLUMN public.whatsapp_otps.locked_until IS 'When set, OTP verification is locked until this timestamp (5 failed attempts -> 15min lockout per whatsapp-auth/index.ts).';

-- ============================================================
-- ACCOUNT_DELETION_REQUESTS (existing — keep)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email        TEXT,
    phone        TEXT,
    reason       TEXT,
    status       TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Processed','Rejected')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.account_deletion_requests IS 'Account deletion requests submitted via delete-account edge function. Admin processes via AccountDeletionList.jsx (anonymizes profiles).';

-- ============================================================
-- is_admin() SECURITY DEFINER helper
-- (used by RLS policies in 005_rls_policies.sql)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('Admin','Editor')
    );
$$;

COMMENT ON FUNCTION public.is_admin IS 'Returns TRUE if the current auth.uid() has an admin/editor role. SECURITY DEFINER so it can be used in RLS policies. Kept for backward compatibility with existing fix_*_rls.sql policies.';

COMMIT;
