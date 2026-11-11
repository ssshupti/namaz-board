-- Runs the notify function every minute. Run in Supabase → SQL Editor AFTER deploying the function.
-- Replace YOUR-PROJECT-REF and YOUR-CRON-SECRET first (the same secret you set on the function).
select cron.unschedule('namaz-notify') where exists (select 1 from cron.job where jobname = 'namaz-notify');
select cron.schedule(
  'namaz-notify',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('content-type', 'application/json', 'x-cron-secret', 'YOUR-CRON-SECRET'),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- Optional: clear pg_net's response log once a day so it doesn't grow.
select cron.unschedule('namaz-net-cleanup') where exists (select 1 from cron.job where jobname = 'namaz-net-cleanup');
select cron.schedule('namaz-net-cleanup', '17 3 * * *', $$ delete from net._http_response where created < now() - interval '1 day' $$);
