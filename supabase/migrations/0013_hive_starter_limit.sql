-- Enforce max 3 active hives for starter-tier users at the database level.
-- This prevents bypassing the client-side paywall via direct API calls.

DROP POLICY IF EXISTS "hives: opprett egne" ON hives;

CREATE POLICY "hives: opprett egne"
ON hives FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) != 'starter'
    OR (
      SELECT COUNT(*)
      FROM hives
      WHERE user_id = auth.uid() AND is_active = true
    ) < 3
  )
);
