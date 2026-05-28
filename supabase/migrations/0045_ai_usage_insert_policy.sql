-- Add INSERT policy for ai_analysis_usage so authenticated users (and the
-- analyze-varroa edge function acting on their behalf) can register usage rows.
-- Without this the rate-limit check has no data to enforce against.
CREATE POLICY "users insert own usage"
  ON ai_analysis_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);
