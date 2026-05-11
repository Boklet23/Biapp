-- Recreate weekly-hive-alerts cron job with x-alerts-secret header.
-- Secret is hardcoded here because ALTER DATABASE requires superuser (not available via MCP).
-- WEEKLY_ALERTS_SECRET must also be set in Supabase Dashboard →
--   Functions → weekly-hive-alerts → Secrets → WEEKLY_ALERTS_SECRET

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
                 'x-alerts-secret', '6d6a5787d3b8afd928056df7246e25e430dccifcb2c795163a281f6265321342e'
               ),
    body    := '{}'::jsonb
  );
  $$
);
