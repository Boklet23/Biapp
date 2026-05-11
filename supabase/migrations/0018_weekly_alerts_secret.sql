-- Recreate weekly-hive-alerts cron job with x-alerts-secret header.
--
-- Before applying: set the secret in both places:
--   1. Supabase Dashboard → Edge Functions → weekly-hive-alerts → Secrets → WEEKLY_ALERTS_SECRET
--   2. ALTER DATABASE postgres SET app.weekly_alerts_secret = '<same-value>';
--
-- The pg_cron job reads from the DB setting so the secret never appears in migration SQL.

select cron.unschedule('weekly-hive-alerts');

select cron.schedule(
  'weekly-hive-alerts',
  '0 7 * * 1', -- every Monday at 07:00 UTC
  $$
  select net.http_post(
    url     := current_setting('app.supabase_url', true) || '/functions/v1/weekly-hive-alerts',
    headers := jsonb_build_object(
                 'Content-Type',      'application/json',
                 'Authorization',     'Bearer ' || current_setting('app.supabase_service_role_key', true),
                 'x-alerts-secret',   current_setting('app.weekly_alerts_secret', true)
               ),
    body    := '{}'::jsonb
  );
  $$
);
