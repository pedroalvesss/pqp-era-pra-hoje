-- Rode no SQL Editor do Supabase depois do primeiro deploy.
-- Troque <APP_URL> pela URL da Vercel e <CRON_SECRET> pelo mesmo valor da env CRON_SECRET.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'pqp-push-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := '<APP_URL>/api/cron/push',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);
