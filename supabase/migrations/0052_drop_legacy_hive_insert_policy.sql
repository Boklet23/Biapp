-- Den eldre INSERT-policyen fra 0013 sjekker rå subscription_tier != 'starter',
-- og avviser dermed trial-brukere (tier = 'starter' med trial_expires_at i
-- framtiden) på kube #4 — selv om enforce_starter_hive_limit-triggeren (0046)
-- korrekt slipper dem gjennom. Triggeren er nå eneste håndhever av kubegrensen;
-- 0013-policyen er redundant og for streng. Erstatt med en ren eierskaps-sjekk.

DROP POLICY IF EXISTS "hives: opprett egne" ON hives;

CREATE POLICY "hives: opprett egne"
ON hives FOR INSERT
WITH CHECK (auth.uid() = user_id);
