-- Oppretter storage bucket for inspeksjonsbilder og tilhørende RLS-policies.
-- Inspection_media-tabellen eksisterer allerede fra 0001_initial_schema.sql.
-- Bucket-path: {userId}/{inspectionId}/{timestamp}.{ext}

INSERT INTO storage.buckets (id, name, public)
VALUES ('inspection-media', 'inspection-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "inspection_media_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspection-media');

CREATE POLICY "inspection_media_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspection-media'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "inspection_media_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inspection-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
