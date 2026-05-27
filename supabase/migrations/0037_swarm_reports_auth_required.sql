-- Krev autentisering for å lese svermrapporter (GPS + kontaktinfo).
-- Den åpne "alle kan lese"-policyen er et GDPR-brudd siden tabellen
-- inneholder lokasjonsdata og kontaktinformasjon.
-- Appen krever innlogging uansett, så svermkartet i samfunn-fanen fungerer fortsatt.

DROP POLICY IF EXISTS "swarm_reports: alle kan lese" ON swarm_reports;

CREATE POLICY "swarm_reports: innloggede kan lese"
  ON swarm_reports FOR SELECT TO authenticated
  USING (
    status = 'open'
    OR (SELECT auth.uid()) = user_id
  );
