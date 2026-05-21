-- Manglende indekser for høyfrekvente spørringer.
-- treatments: brukt i rapport og statistikk med datofiltrering
-- ai_analysis_usage: sjekket ved hver AI-analyse for månedlig kvote

CREATE INDEX IF NOT EXISTS idx_treatments_user_date
  ON treatments(user_id, treated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month
  ON ai_analysis_usage(user_id, used_at DESC);
