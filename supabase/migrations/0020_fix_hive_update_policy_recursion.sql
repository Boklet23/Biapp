-- Migration 0020: Fix infinite recursion in hive UPDATE policy
-- The WITH CHECK in 0014 had a subquery SELECT COUNT(*) FROM hives inside a policy
-- ON hives, causing PostgreSQL to evaluate the policy recursively.
-- Fix: wrap the count in a SECURITY DEFINER function that bypasses RLS.

CREATE OR REPLACE FUNCTION count_active_hives_for_user(p_user_id uuid)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM hives WHERE user_id = p_user_id AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION count_active_hives_for_user(uuid) TO authenticated;

DROP POLICY IF EXISTS "hives: oppdater egne" ON hives;

CREATE POLICY "hives: oppdater egne"
ON hives FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) != 'starter'
    OR is_active = false
    OR count_active_hives_for_user(auth.uid()) <= 3
  )
);
