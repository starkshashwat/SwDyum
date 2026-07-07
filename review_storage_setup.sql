-- Run this script in your Supabase SQL Editor to set up the review-media storage bucket

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-media', 'review-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anonymous users to upload files to the bucket
DROP POLICY IF EXISTS "Public Uploads to Review Media" ON storage.objects;
CREATE POLICY "Public Uploads to Review Media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-media');

-- 3. Allow anonymous users to view files in the bucket
DROP POLICY IF EXISTS "Public Read Review Media" ON storage.objects;
CREATE POLICY "Public Read Review Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-media');
