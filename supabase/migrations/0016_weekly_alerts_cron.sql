-- Enable pg_cron and pg_net for scheduled Edge Function invocation
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

-- Schedule weekly-hive-alerts every Monday at 07:00 UTC
-- verify_jwt=false on the function so no auth header needed
SELECT cron.schedule(
  'weekly-hive-alerts',
  '0 7 * * 1',
  $$
  SELECT extensions.http_post(
    'https://zujvhbnuqocquthbujmp.supabase.co/functions/v1/weekly-hive-alerts',
    '{}',
    'application/json'
  );
  $$
);
