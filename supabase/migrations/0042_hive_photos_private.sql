-- Make hive-photos bucket private so photos require authentication
UPDATE storage.buckets
SET public = false
WHERE id = 'hive-photos';

-- Drop any existing open SELECT policy
DROP POLICY IF EXISTS "hive-photos: eier kan lese" ON storage.objects;
DROP POLICY IF EXISTS "hive-photos: public read" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view hive photos" ON storage.objects;

-- Only the owner can read their own hive photos
CREATE POLICY "hive-photos: eier kan lese"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'hive-photos'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );
