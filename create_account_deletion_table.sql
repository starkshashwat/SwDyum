-- Create the account_deletion_requests table
CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    reason TEXT,
    status TEXT DEFAULT 'Pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own deletion requests
DROP POLICY IF EXISTS "Users can insert their own deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Users can insert their own deletion requests" 
ON public.account_deletion_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own deletion requests
DROP POLICY IF EXISTS "Users can view their own deletion requests" ON public.account_deletion_requests;
CREATE POLICY "Users can view their own deletion requests" 
ON public.account_deletion_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Create Admin Policy for the table
DROP POLICY IF EXISTS "admin_all_account_deletion_requests" ON public.account_deletion_requests;
CREATE POLICY "admin_all_account_deletion_requests" ON public.account_deletion_requests 
FOR ALL 
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Super Admin'::user_role, 'Manager'::user_role)
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('Super Admin'::user_role, 'Manager'::user_role)
);
