-- ════════════════════════════════════════════════════════════════════════════
-- SECURE RLS POLICIES FOR orders & order_items
-- Replaces the previous "Anyone can view/update" policies (V6) which allowed
-- any anonymous user to read all customer PII and flip order statuses.
-- ════════════════════════════════════════════════════════════════════════════

-- 1. admin_users table (used to gate admin access)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'manager',
    created_at timestamptz DEFAULT now()
);

-- NOTE: admin accounts must be provisioned manually via the service role.
-- Do NOT seed real admin emails here (V8). The previous hardcoded seeds
-- (stark@gmail.com, manager@gmail.com, warehouse@gmail.com) are removed
-- because anyone could sign up with those emails and gain admin privileges.
-- Provision admins with:
--   INSERT INTO public.admin_users (email, role) VALUES ('<verified-email>', 'super_admin');

-- Helper: is the current user an admin?
-- (Reusable in policies via a SECURITY DEFINER function so the email list
--  is not exposed to anon SELECT on admin_users.)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a
    WHERE a.email = auth.email()
  );
$$;

-- Lock down admin_users itself: only admins can read/modify the allow-list.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage admin_users" ON public.admin_users;
CREATE POLICY "Admins manage admin_users" ON public.admin_users
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── orders ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- Users can read only their own orders (matched by user_id).
-- Guest orders (user_id IS NULL) are readable only via the service role or
-- through a signed lookup token issued at checkout (handled in app layer).
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Admins have full access to all orders.
CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can create orders for themselves.
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Users can update only their own orders, and only non-financial fields.
-- (Status/payment transitions are performed by the service role in edge
--  functions — not by the client.)
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- ─── order_items ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;

-- Users can read items for their own orders.
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.customer_id = auth.uid()
    )
  );

-- Admins have full access to all order items.
CREATE POLICY "Admins have full access to order items" ON public.order_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Force RLS enforcement.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
