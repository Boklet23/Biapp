-- Add AI varroa analysis fields to inspections
ALTER TABLE inspections
  ADD COLUMN IF NOT EXISTS varroa_ai_count         integer,
  ADD COLUMN IF NOT EXISTS varroa_ai_severity       text CHECK (varroa_ai_severity IN ('none', 'low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS varroa_ai_recommendation text;

-- Track AI analysis usage per user per month (rate limiting)
CREATE TABLE IF NOT EXISTS ai_analysis_usage (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type text        NOT NULL DEFAULT 'varroa',
  used_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month
  ON ai_analysis_usage (user_id, used_at);

ALTER TABLE ai_analysis_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own usage"
  ON ai_analysis_usage FOR SELECT
  USING (auth.uid() = user_id);
