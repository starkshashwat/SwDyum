-- 1. Drop the incorrect foreign key constraint that points to auth.users
ALTER TABLE public.orders 
  DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- 2. Add the correct foreign key constraint that points to public.profiles
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- 3. (Optional but recommended) Link any broken past orders back to their customers using the shipping email
UPDATE public.orders o
SET customer_id = p.id
FROM public.profiles p
WHERE o.customer_id IS NULL
AND o.shipping_details->>'email' = p.email;

-- 4. Reload the schema cache for PostgREST so the Admin Panel API works immediately
NOTIFY pgrst, 'reload schema';
