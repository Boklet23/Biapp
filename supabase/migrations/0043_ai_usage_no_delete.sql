-- Prevent users from deleting their own ai_analysis_usage rows
-- Without this policy a user could bypass monthly rate-limits by deleting usage records
CREATE POLICY "ai_usage: no delete"
  ON ai_analysis_usage
  FOR DELETE
  USING (false);
