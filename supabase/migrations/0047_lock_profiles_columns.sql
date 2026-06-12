-- profiles-UPDATE-policyen manglet WITH CHECK og kolonnebegrensning: enhver innlogget
-- bruker kunne sette egen subscription_tier='lag' + tier_locked=true via direkte API-kall
-- og dermed omgå hele betalingsmodellen permanent.
-- Klienter kan nå kun oppdatere uskyldige felter. subscription_tier, tier_locked,
-- trial_expires_at og team_id eies av RevenueCat-webhooken / admin (service_role).

REVOKE UPDATE ON profiles FROM authenticated, anon;
GRANT UPDATE (display_name, experience_level, push_token, municipality_id)
  ON profiles TO authenticated;

-- Gjenskap UPDATE-policyen med WITH CHECK (manglet i 0039)
DROP POLICY IF EXISTS "profiles: oppdater egne" ON profiles;
CREATE POLICY "profiles: oppdater egne" ON profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
