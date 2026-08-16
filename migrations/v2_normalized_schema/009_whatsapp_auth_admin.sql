-- 009_whatsapp_auth_admin.sql
BEGIN;

-- 1. Profiles Table Updates
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_wa_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- 2. WhatsApp Messages Updates
ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS media_path TEXT;
ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.whatsapp_messages ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Notification Settings Table
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    template_name VARCHAR(255),
    template_language VARCHAR(50),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed basic events
INSERT INTO public.notification_settings (event_type, is_enabled) VALUES
    ('order_placed', false),
    ('order_shipped', false),
    ('order_delivered', false)
ON CONFLICT (event_type) DO NOTHING;

-- 4. Storage Bucket for WhatsApp Media (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'whatsapp_media', 
    'whatsapp_media', 
    false, 
    10485760, -- 10MB limit
    '{"image/jpeg","image/png","image/webp","application/pdf"}'
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any to avoid errors on re-run
DROP POLICY IF EXISTS "Admins can insert WhatsApp media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view WhatsApp media" ON storage.objects;

-- Allow Admins to insert media
CREATE POLICY "Admins can insert WhatsApp media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'whatsapp_media' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
    )
);

-- Allow Admins to select media
CREATE POLICY "Admins can view WhatsApp media"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'whatsapp_media' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role::text IN ('Admin', 'Super Admin', 'Manager')
    )
);

COMMIT;
