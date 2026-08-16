-- 012_inbox_features.sql
BEGIN;

-- 1. Fix Realtime Sync for Inbox
-- Add the whatsapp_messages table to the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
  END IF;
END $$;

-- 2. Create Storage Bucket for WhatsApp Media
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp_media', 'whatsapp_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Set up Storage Policies for whatsapp_media
-- Allow public to read the files
DROP POLICY IF EXISTS "Public can view whatsapp_media" ON storage.objects;
CREATE POLICY "Public can view whatsapp_media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'whatsapp_media');

-- Allow authenticated users with admin privileges to upload files
DROP POLICY IF EXISTS "Admins can upload whatsapp_media" ON storage.objects;
CREATE POLICY "Admins can upload whatsapp_media" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'whatsapp_media' 
  AND auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role::text IN ('Admin', 'Super Admin', 'Manager'))
  )
);

-- Allow authenticated users with admin privileges to update/delete files
DROP POLICY IF EXISTS "Admins can manage whatsapp_media" ON storage.objects;
CREATE POLICY "Admins can manage whatsapp_media" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'whatsapp_media' 
  AND auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role::text IN ('Admin', 'Super Admin', 'Manager'))
  )
);

DROP POLICY IF EXISTS "Admins can delete whatsapp_media" ON storage.objects;
CREATE POLICY "Admins can delete whatsapp_media" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'whatsapp_media' 
  AND auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role::text IN ('Admin', 'Super Admin', 'Manager'))
  )
);

COMMIT;
