-- Create the whatsapp_otps table to temporarily store OTPs
CREATE TABLE IF NOT EXISTS public.whatsapp_otps (
    phone TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add whatsapp_opt_in column to profiles to track promotional permissions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT true;

-- Enable Row Level Security on the new table
ALTER TABLE public.whatsapp_otps ENABLE ROW LEVEL SECURITY;

-- Allow edge functions (service role) to insert/select/delete from this table
CREATE POLICY "Enable service role access for whatsapp_otps" 
ON public.whatsapp_otps FOR ALL
USING (true)
WITH CHECK (true);
