-- Fix feed_likes DELETE policy: FOR ALL with USING (auth.uid() is not null)
-- lets any authenticated user delete any like. Replace with explicit policies.
DROP POLICY IF EXISTS "feed_likes_all" ON feed_likes;

CREATE POLICY "feed_likes_select"
  ON feed_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "feed_likes_insert"
  ON feed_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feed_likes_delete"
  ON feed_likes FOR DELETE
  USING (auth.uid() = user_id);
