-- Migration 0014: Strengthen starter-tier cap to block reactivation bypass via UPDATE
-- 0013 only covered INSERT; a soft-deleted hive could be reactivated (is_active=false→true)
-- via direct API UPDATE, bypassing the 3-hive cap entirely.

DROP POLICY IF EXISTS "hives: oppdater egne" ON hives;

CREATE POLICY "hives: oppdater egne"
ON hives FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) != 'starter'
    OR is_active = false
    OR (SELECT COUNT(*) FROM hives WHERE user_id = auth.uid() AND is_active = true) <= 3
  )
);
