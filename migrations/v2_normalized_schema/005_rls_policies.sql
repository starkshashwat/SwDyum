-- ============================================================
-- 005_rls_policies.sql
-- Phase 1 — Normalized Schema Migration
-- Source plan: plans/mango-pickle-fullstack-plan.md §4.2, §4.3, §6.2
--
-- This file enables Row Level Security and defines policies for
-- EVERY table created by migrations 001-004. Policy patterns:
--
--   Catalog tables (public read, admin write):
--     - SELECT for anon, authenticated WHERE is_active = TRUE
--     - ALL for authenticated WHERE is_admin() WITH CHECK is_admin()
--
--   User-owned tables (orders, reviews, addresses, subscriptions):
--     - SELECT/UPDATE for authenticated WHERE customer_id = auth.uid()
--     - ALL for authenticated WHERE is_admin()
--
--   Admin-only tables (inventory_logs, whatsapp_messages, etc.):
--     - ALL for authenticated WHERE is_admin()
--
--   Public-insert tables (newsletter_subscribers, product_reviews):
--     - INSERT for anon/authenticated (with appropriate checks)
--
-- Notes:
--   - Policies use CREATE POLICY (idempotent re-runs require
--     DROP POLICY IF EXISTS first to avoid duplicate-name errors).
--   - is_admin() is defined in 004_auth_roles.sql.
--   - RLS is enabled with ALTER TABLE ... ENABLE ROW LEVEL SECURITY.
-- ============================================================

BEGIN;

-- ============================================================
-- Helper: drop existing policies before recreating (idempotency)
-- We use DO blocks with DROP POLICY IF EXISTS per table.
-- ============================================================

-- ---------- categories ----------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS categories_public_read ON public.categories;
DROP POLICY IF EXISTS categories_admin_all ON public.categories;
CREATE POLICY categories_public_read ON public.categories
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY categories_admin_all ON public.categories
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- category_pairings ----------
ALTER TABLE public.category_pairings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS category_pairings_public_read ON public.category_pairings;
DROP POLICY IF EXISTS category_pairings_admin_all ON public.category_pairings;
CREATE POLICY category_pairings_public_read ON public.category_pairings
    FOR SELECT TO anon, authenticated
    USING (TRUE);
CREATE POLICY category_pairings_admin_all ON public.category_pairings
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- products ----------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_public_read ON public.products;
DROP POLICY IF EXISTS products_admin_all ON public.products;
CREATE POLICY products_public_read ON public.products
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY products_admin_all ON public.products
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_variants ----------
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_variants_public_read ON public.product_variants;
DROP POLICY IF EXISTS product_variants_admin_all ON public.product_variants;
CREATE POLICY product_variants_public_read ON public.product_variants
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY product_variants_admin_all ON public.product_variants
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_images ----------
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_images_public_read ON public.product_images;
DROP POLICY IF EXISTS product_images_admin_all ON public.product_images;
CREATE POLICY product_images_public_read ON public.product_images
    FOR SELECT TO anon, authenticated
    USING (TRUE);
CREATE POLICY product_images_admin_all ON public.product_images
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_ingredients ----------
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_ingredients_public_read ON public.product_ingredients;
DROP POLICY IF EXISTS product_ingredients_admin_all ON public.product_ingredients;
CREATE POLICY product_ingredients_public_read ON public.product_ingredients
    FOR SELECT TO anon, authenticated
    USING (TRUE);
CREATE POLICY product_ingredients_admin_all ON public.product_ingredients
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_trust_badges ----------
ALTER TABLE public.product_trust_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_trust_badges_public_read ON public.product_trust_badges;
DROP POLICY IF EXISTS product_trust_badges_admin_all ON public.product_trust_badges;
CREATE POLICY product_trust_badges_public_read ON public.product_trust_badges
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY product_trust_badges_admin_all ON public.product_trust_badges
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_faqs ----------
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_faqs_public_read ON public.product_faqs;
DROP POLICY IF EXISTS product_faqs_admin_all ON public.product_faqs;
CREATE POLICY product_faqs_public_read ON public.product_faqs
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY product_faqs_admin_all ON public.product_faqs
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_process_steps ----------
ALTER TABLE public.product_process_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_process_steps_public_read ON public.product_process_steps;
DROP POLICY IF EXISTS product_process_steps_admin_all ON public.product_process_steps;
CREATE POLICY product_process_steps_public_read ON public.product_process_steps
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY product_process_steps_admin_all ON public.product_process_steps
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- combos ----------
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS combos_public_read ON public.combos;
DROP POLICY IF EXISTS combos_admin_all ON public.combos;
CREATE POLICY combos_public_read ON public.combos
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY combos_admin_all ON public.combos
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- combo_items ----------
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS combo_items_public_read ON public.combo_items;
DROP POLICY IF EXISTS combo_items_admin_all ON public.combo_items;
CREATE POLICY combo_items_public_read ON public.combo_items
    FOR SELECT TO anon, authenticated
    USING (TRUE);
CREATE POLICY combo_items_admin_all ON public.combo_items
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- deals ----------
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deals_public_read ON public.deals;
DROP POLICY IF EXISTS deals_admin_all ON public.deals;
CREATE POLICY deals_public_read ON public.deals
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE AND now() BETWEEN start_time AND end_time);
CREATE POLICY deals_admin_all ON public.deals
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- announcements ----------
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS announcements_public_read ON public.announcements;
DROP POLICY IF EXISTS announcements_admin_all ON public.announcements;
CREATE POLICY announcements_public_read ON public.announcements
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE
           AND (start_date IS NULL OR now() >= start_date)
           AND (end_date IS NULL OR now() <= end_date));
CREATE POLICY announcements_admin_all ON public.announcements
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- offers ----------
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS offers_public_read ON public.offers;
DROP POLICY IF EXISTS offers_admin_all ON public.offers;
CREATE POLICY offers_public_read ON public.offers
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY offers_admin_all ON public.offers
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- orders ----------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orders_customer_read ON public.orders;
DROP POLICY IF EXISTS orders_admin_all ON public.orders;
CREATE POLICY orders_customer_read ON public.orders
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());
CREATE POLICY orders_admin_all ON public.orders
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- order_items ----------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_items_customer_read ON public.order_items;
DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;
CREATE POLICY order_items_customer_read ON public.order_items
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_items.order_id
          AND o.customer_id = auth.uid()
    ));
CREATE POLICY order_items_admin_all ON public.order_items
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- payments ----------
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payments_customer_read ON public.payments;
DROP POLICY IF EXISTS payments_admin_all ON public.payments;
CREATE POLICY payments_customer_read ON public.payments
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = payments.order_id
          AND o.customer_id = auth.uid()
    ));
CREATE POLICY payments_admin_all ON public.payments
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- coupons ----------
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coupons_public_read ON public.coupons;
DROP POLICY IF EXISTS coupons_admin_all ON public.coupons;
CREATE POLICY coupons_public_read ON public.coupons
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE
           AND (expiry_date IS NULL OR expiry_date > now())
           AND (max_uses IS NULL OR used_count < max_uses));
CREATE POLICY coupons_admin_all ON public.coupons
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- coupon_usage ----------
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS coupon_usage_customer_read ON public.coupon_usage;
DROP POLICY IF EXISTS coupon_usage_admin_all ON public.coupon_usage;
CREATE POLICY coupon_usage_customer_read ON public.coupon_usage
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());
CREATE POLICY coupon_usage_admin_all ON public.coupon_usage
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- product_reviews ----------
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_reviews_public_read ON public.product_reviews;
DROP POLICY IF EXISTS product_reviews_customer_insert ON public.product_reviews;
DROP POLICY IF EXISTS product_reviews_customer_update ON public.product_reviews;
DROP POLICY IF EXISTS product_reviews_admin_all ON public.product_reviews;
CREATE POLICY product_reviews_public_read ON public.product_reviews
    FOR SELECT TO anon, authenticated
    USING (is_approved = TRUE);
CREATE POLICY product_reviews_customer_insert ON public.product_reviews
    FOR INSERT TO authenticated
    WITH CHECK (customer_id = auth.uid());
CREATE POLICY product_reviews_customer_update ON public.product_reviews
    FOR UPDATE TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());
CREATE POLICY product_reviews_admin_all ON public.product_reviews
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- profiles ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
CREATE POLICY profiles_self_update ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
CREATE POLICY profiles_admin_all ON public.profiles
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- admin_roles ----------
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_roles_admin_all ON public.admin_roles;
CREATE POLICY admin_roles_admin_all ON public.admin_roles
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- admin_user_roles ----------
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_user_roles_self_read ON public.admin_user_roles;
DROP POLICY IF EXISTS admin_user_roles_admin_all ON public.admin_user_roles;
CREATE POLICY admin_user_roles_self_read ON public.admin_user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
CREATE POLICY admin_user_roles_admin_all ON public.admin_user_roles
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- addresses ----------
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS addresses_owner_all ON public.addresses;
DROP POLICY IF EXISTS addresses_admin_all ON public.addresses;
CREATE POLICY addresses_owner_all ON public.addresses
    FOR ALL TO authenticated
    USING (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());
CREATE POLICY addresses_admin_all ON public.addresses
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- subscriptions ----------
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS subscriptions_customer_read ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_admin_all ON public.subscriptions;
CREATE POLICY subscriptions_customer_read ON public.subscriptions
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());
CREATE POLICY subscriptions_admin_all ON public.subscriptions
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- invoices ----------
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_customer_read ON public.invoices;
DROP POLICY IF EXISTS invoices_admin_all ON public.invoices;
CREATE POLICY invoices_customer_read ON public.invoices
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());
CREATE POLICY invoices_admin_all ON public.invoices
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- inventory_logs ----------
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inventory_logs_admin_all ON public.inventory_logs;
CREATE POLICY inventory_logs_admin_all ON public.inventory_logs
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- blogs ----------
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS blogs_public_read ON public.blogs;
DROP POLICY IF EXISTS blogs_admin_all ON public.blogs;
CREATE POLICY blogs_public_read ON public.blogs
    FOR SELECT TO anon, authenticated
    USING (status = 'Published');
CREATE POLICY blogs_admin_all ON public.blogs
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- newsletter_subscribers ----------
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS newsletter_public_insert ON public.newsletter_subscribers;
DROP POLICY IF EXISTS newsletter_admin_all ON public.newsletter_subscribers;
CREATE POLICY newsletter_public_insert ON public.newsletter_subscribers
    FOR INSERT TO anon, authenticated
    WITH CHECK (TRUE);
CREATE POLICY newsletter_admin_all ON public.newsletter_subscribers
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- seo_metadata ----------
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seo_public_read ON public.seo_metadata;
DROP POLICY IF EXISTS seo_admin_all ON public.seo_metadata;
CREATE POLICY seo_public_read ON public.seo_metadata
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);
CREATE POLICY seo_admin_all ON public.seo_metadata
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- whatsapp_messages ----------
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS whatsapp_messages_admin_all ON public.whatsapp_messages;
CREATE POLICY whatsapp_messages_admin_all ON public.whatsapp_messages
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- whatsapp_otps ----------
ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS whatsapp_otps_service_all ON public.whatsapp_otps;
-- Service role bypasses RLS by default; no public/authenticated policy.
-- Explicitly deny anon/authenticated direct access.
CREATE POLICY whatsapp_otps_service_all ON public.whatsapp_otps
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

-- ---------- account_deletion_requests ----------
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS account_deletion_self_insert ON public.account_deletion_requests;
DROP POLICY IF EXISTS account_deletion_admin_all ON public.account_deletion_requests;
CREATE POLICY account_deletion_self_insert ON public.account_deletion_requests
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
CREATE POLICY account_deletion_admin_all ON public.account_deletion_requests
    FOR ALL TO authenticated
    USING (is_admin()) WITH CHECK (is_admin());

COMMIT;
