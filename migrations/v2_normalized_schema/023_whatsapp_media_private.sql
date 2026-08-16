-- 023: restore whatsapp_media privacy. 012 flipped the bucket to public
-- with a public-read policy, exposing customer support media (photos
-- customers send over WhatsApp) to anyone. The admin inbox already uses
-- signed URLs.
BEGIN;
UPDATE storage.buckets SET public = false WHERE id = 'whatsapp_media';
DROP POLICY IF EXISTS "whatsapp_media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to whatsapp_media bucket" ON storage.objects;
COMMIT;
