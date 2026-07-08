-- Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id text PRIMARY KEY,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    subtotal numeric NOT NULL DEFAULT 0,
    shipping_fee numeric NOT NULL DEFAULT 0,
    cod_fee numeric NOT NULL DEFAULT 0,
    discount_amount numeric NOT NULL DEFAULT 0,
    total numeric NOT NULL DEFAULT 0,
    shipping_details jsonb,
    payment_method text,
    payment_id text,
    status text NOT NULL DEFAULT 'Pending',
    tracking_id text,
    courier_name text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own orders or guest orders (no auth required for guest checkout)
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

-- Create the order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
    product_name text NOT NULL,
    weight_label text,
    subscription_type text,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL DEFAULT 0,
    total_price numeric NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND orders.customer_id = auth.uid()
    )
);
