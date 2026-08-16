-- 020_security_hardening.sql
-- Phase 1 security lockdown (defense in depth):
--   Layer 1 (primary):    restrictive RLS — customers read-only on commerce
--                         tables, writes service-role/admin only.
--   Layer 2 (secondary):  column-level grants + trigger guards so a future
--                         policy regression still cannot expose role
--                         escalation or internal cost data.
--
-- Targets the LIVE schema (verified by probe): profiles, orders, order_items,
-- payments, invoices, product_variants, and the 008 shipping tables all exist.
-- Idempotent and guarded — safe to re-run.

BEGIN;

-- =====================================================================
-- 1. profiles — role / verification flags can never be self-set
-- =====================================================================

-- 1a. Column-level grants (secondary layer): customers may only update
-- profile fields they legitimately own. role, phone_verified,
-- email_verified, whatsapp_wa_id are NOT granted.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
        EXECUTE 'REVOKE UPDATE ON public.profiles FROM authenticated';
        EXECUTE 'GRANT UPDATE (name, phone, address, city, state, zip, whatsapp_opt_in, avatar_url) ON public.profiles TO authenticated';
    END IF;
END $$;

-- 1b. Trigger guard (primary enforcement): blocks role/verification-flag
-- changes unless the actor is an admin or the service role (service role
-- carries no auth.uid()).
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.phone_verified IS DISTINCT FROM OLD.phone_verified
       OR NEW.email_verified IS DISTINCT FROM OLD.email_verified
       OR NEW.whatsapp_wa_id IS DISTINCT FROM OLD.whatsapp_wa_id THEN
        IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'profiles.role/verification flags can only be changed by an administrator';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 1c. RLS: profiles were anonymously readable on live (PII leak).
-- Replace every existing policy with self-read / self-update / admin-all.
DO $$
DECLARE pol RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
        EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
            EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
        END LOOP;
        EXECUTE 'CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid())';
        EXECUTE 'CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid())';
        EXECUTE 'CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- =====================================================================
-- 2. orders — customers are read-only; creation and status transitions
--    are service-role only (edge function / backend). Admin full access.
-- =====================================================================
DO $$
DECLARE pol RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='orders') THEN
        EXECUTE 'ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY';

        -- Drop every INSERT/UPDATE/DELETE policy (e.g. "Users can update
        -- their own orders" — that policy let customers mark orders Paid).
        FOR pol IN SELECT policyname FROM pg_policies
                   WHERE schemaname='public' AND tablename='orders' AND cmd IN ('INSERT','UPDATE','DELETE','ALL') LOOP
            EXECUTE format('DROP POLICY %I ON public.orders', pol.policyname);
        END LOOP;

        -- Owner read (idempotent)
        DROP POLICY IF EXISTS orders_customer_read ON public.orders;
        EXECUTE 'CREATE POLICY orders_customer_read ON public.orders FOR SELECT TO authenticated USING (customer_id = auth.uid())';

        -- Admin full access
        DROP POLICY IF EXISTS orders_admin_all ON public.orders;
        EXECUTE 'CREATE POLICY orders_admin_all ON public.orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- =====================================================================
-- 3. order_items — same model as orders (owner read, admin all,
--    writes service-role only).
-- =====================================================================
DO $$
DECLARE pol RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='order_items') THEN
        EXECUTE 'ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY';

        FOR pol IN SELECT policyname FROM pg_policies
                   WHERE schemaname='public' AND tablename='order_items' AND cmd IN ('INSERT','UPDATE','DELETE','ALL') LOOP
            EXECUTE format('DROP POLICY %I ON public.order_items', pol.policyname);
        END LOOP;

        DROP POLICY IF EXISTS order_items_customer_read ON public.order_items;
        EXECUTE 'CREATE POLICY order_items_customer_read ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.customer_id = auth.uid()))';

        DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;
        EXECUTE 'CREATE POLICY order_items_admin_all ON public.order_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- =====================================================================
-- 4. payments — was anonymously readable AND insertable on live.
--    Read: owner + admin. All writes: service-role only.
--    Unique partial index gives the webhook an idempotency guarantee.
-- =====================================================================
DO $$
DECLARE pol RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='payments') THEN
        EXECUTE 'ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY';

        FOR pol IN SELECT policyname FROM pg_policies
                   WHERE schemaname='public' AND tablename='payments'
                   AND cmd IN ('INSERT','UPDATE','DELETE','ALL') LOOP
            EXECUTE format('DROP POLICY %I ON public.payments', pol.policyname);
        END LOOP;

        DROP POLICY IF EXISTS payments_customer_read ON public.payments;
        EXECUTE 'CREATE POLICY payments_customer_read ON public.payments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payments.order_id AND o.customer_id = auth.uid()))';

        DROP POLICY IF EXISTS payments_admin_read ON public.payments;
        EXECUTE 'CREATE POLICY payments_admin_read ON public.payments FOR SELECT TO authenticated USING (public.is_admin())';
    END IF;

    -- Idempotency arbiter for the Razorpay webhook (partial: NULL/'' exempt)
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS payments_razorpay_payment_id_uniq
             ON public.payments (razorpay_payment_id)
             WHERE razorpay_payment_id IS NOT NULL AND razorpay_payment_id <> ''''';
END $$;

-- =====================================================================
-- 5. invoices — owner read + admin; writes service-role only.
-- =====================================================================
DO $$
DECLARE pol RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invoices') THEN
        EXECUTE 'ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY';

        FOR pol IN SELECT policyname FROM pg_policies
                   WHERE schemaname='public' AND tablename='invoices' AND cmd IN ('INSERT','UPDATE','DELETE','ALL') LOOP
            EXECUTE format('DROP POLICY %I ON public.invoices', pol.policyname);
        END LOOP;

        DROP POLICY IF EXISTS invoices_customer_read ON public.invoices;
        EXECUTE 'CREATE POLICY invoices_customer_read ON public.invoices FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = invoices.order_id AND o.customer_id = auth.uid()))';

        DROP POLICY IF EXISTS invoices_admin_all ON public.invoices;
        EXECUTE 'CREATE POLICY invoices_admin_all ON public.invoices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- =====================================================================
-- 6. Shipping tables — had NO RLS on live (credentials were anon-
--    readable whenever configured). Admin read-only; every write path
--    is the Express backend's service-role client.
-- =====================================================================
DO $$
DECLARE t TEXT; pol RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY['shipping_credentials','shipments','shipment_events','webhook_events','warehouses','package_dimension_presets','shipping_action_logs'] LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
                EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
            END LOOP;
            EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_admin())', t || '_admin_read', t);
        END IF;
    END LOOP;
END $$;

-- =====================================================================
-- 7. product_variants — cost_price / batch_number must not be readable
--    by anonymous users. (authenticated keeps full access until the
--    remaining direct-Supabase admin pages migrate to the backend API.)
-- =====================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='product_variants') THEN
        EXECUTE 'REVOKE SELECT ON public.product_variants FROM anon';
        EXECUTE 'GRANT SELECT (id, product_id, weight_label, sku, price, mrp, stock_quantity, reserved_quantity, low_stock_threshold, manufacturing_date, expiry_date, created_at) ON public.product_variants TO anon';
    END IF;
END $$;

-- =====================================================================
-- 8. Atomic coupon increment (used by the razorpay edge function;
--    callable by service role only).
-- =====================================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.coupons
    SET times_used = COALESCE(times_used, 0) + 1
    WHERE code = upper(p_code);
END;
$$;

-- Default EXECUTE is granted to PUBLIC, which every role (incl. anon and
-- authenticated) inherits — revoke there and re-grant to service_role only.
REVOKE ALL ON FUNCTION public.increment_coupon_usage(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_coupon_usage(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(TEXT) TO service_role;

COMMIT;
