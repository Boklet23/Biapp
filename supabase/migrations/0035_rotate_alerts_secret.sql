-- Rotér weekly-hive-alerts secret.
-- Den eksponerte secreten i 0018 er nå ugyldig etter at WEEKLY_ALERTS_SECRET
-- i Edge Function-miljøet er satt til ny verdi (via Supabase Dashboard / MCP).
--
-- Secret-verdien lagres i app_config-tabellen (ikke i git).
-- Sett ny verdi etter at migrasjonen er kjørt:
--   INSERT INTO app_config (key, value) VALUES ('weekly_alerts_secret', '<ny secret>');

CREATE TABLE IF NOT EXISTS app_config (
  key   text PRIMARY KEY,
  value text NOT NULL
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Blokkerer authenticated/anon — service_role omgår RLS og har alltid tilgang
CREATE POLICY "app_config: ingen direkte tilgang"
  ON app_config
  USING (false);

-- Omplanlegg pg_cron-jobben til å lese secret fra app_config
DO $$ BEGIN
  PERFORM cron.unschedule('weekly-hive-alerts');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'weekly-hive-alerts',
  '0 7 * * 1',
  $$
  SELECT net.http_post(
    url     := 'https://zujvhbnuqocquthbujmp.supabase.co/functions/v1/weekly-hive-alerts',
    headers := jsonb_build_object(
                 'Content-Type',    'application/json',
                 'apikey',          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1anZoYm51cW9jcXV0aGJ1am1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDcwNzMsImV4cCI6MjA5MDE4MzA3M30.D9FFw71P6rELFjjyZHVfC4yIDCE7odLQjPbKJUBeQjg',
                 'x-alerts-secret', (SELECT value FROM app_config WHERE key = 'weekly_alerts_secret')
               ),
    body    := '{}'::jsonb
  );
  $$
);
