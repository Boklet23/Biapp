-- RLS-policyer for hive-photos bucket.
-- Bucket ble opprettet manuelt i Supabase Dashboard.
-- Path-struktur: {userId}/{timestamp}.{ext}

INSERT INTO storage.buckets (id, name, public)
VALUES ('hive-photos', 'hive-photos', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "hive_photos_select"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'hive-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "hive_photos_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'hive-photos'
      AND auth.role() = 'authenticated'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "hive_photos_delete"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'hive-photos'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
