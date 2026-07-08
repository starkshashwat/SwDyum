-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'manager',
    created_at timestamptz DEFAULT now()
);

-- 2. Insert the admin users based on feedback
INSERT INTO public.admin_users (email, role) VALUES 
('stark@gmail.com', 'super_admin'),
('manager@gmail.com', 'manager'),
('warehouse@gmail.com', 'warehouse')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- 3. Relax SELECT and UPDATE policy for orders so frontend works
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;

-- Let everyone read their orders by ID (needed for Thank You page since guests have no auth.uid())
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);

-- Let frontend update the order to 'Paid'
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

-- Let Admins have full access to all orders
CREATE POLICY "Admins have full access to orders" ON public.orders
FOR ALL
USING (auth.email() IN (SELECT email FROM public.admin_users));

-- 4. Do the same for order_items
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can update order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;

CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can update order items" ON public.order_items FOR UPDATE USING (true);

CREATE POLICY "Admins have full access to order items" ON public.order_items
FOR ALL
USING (auth.email() IN (SELECT email FROM public.admin_users));

-- 5. Force update RLS enforcement
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
