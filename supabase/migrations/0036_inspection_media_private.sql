-- Gjør inspection-media-bucket privat.
-- Inspection-foto er personlige data og skal ikke være offentlig tilgjengelige.
-- Etter denne migrasjonen returnerer fetchInspectionMedia() signed URLs (1t TTL).

-- Gjør bucket privat
UPDATE storage.buckets
SET public = false
WHERE id = 'inspection-media';

-- Erstatt åpen SELECT-policy med auth + eiersjekk
DROP POLICY IF EXISTS "inspection_media_select" ON storage.objects;

CREATE POLICY "inspection_media_select_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'inspection-media'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Migrer eksisterende storage_path-verdier fra full public URL til relativ sti.
-- Gammel verdi: https://<project>.supabase.co/storage/v1/object/public/inspection-media/userId/inspId/ts.jpg
-- Ny verdi:     userId/inspId/ts.jpg
UPDATE inspection_media
SET storage_path = regexp_replace(
  storage_path,
  '^https?://[^/]+/storage/v1/object/public/inspection-media/',
  ''
)
WHERE storage_path LIKE 'https://%';
