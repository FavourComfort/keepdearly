-- KeepDearly — Phase 4B: schedule the due-reminder delivery pass.
--
-- Calls the app's POST /api/reminders/due endpoint once per minute through
-- pg_cron + pg_net, with the CRON_SECRET bearer token. Any external cron
-- service can call the same endpoint the same way — this migration just
-- reuses the scheduler the Supabase project already provides.
--
-- Secret handling (the point of this design):
--   * Neither the delivery URL nor the bearer token is ever written into
--     cron.job. The stored job command is only:
--       select public.keepdearly_run_reminder_delivery();
--   * That wrapper reads both values from Vault at EXECUTION time on every
--     fire, so the secret lives only in Vault (and in the app server's own
--     environment, where the endpoint validates it).
--
-- One-time operator setup (values are never committed; prefer the Dashboard's
-- Vault UI, which keeps secrets out of statement logs — see the Vault docs):
--
--   1. Enable the extensions (this file also tries, idempotently):
--        pg_cron, pg_net, supabase_vault (Vault is on by default).
--
--   2. Store both secrets under these exact names:
--        name keepdearly_delivery_url  = https://<your-app-domain>/api/reminders/due
--        name keepdearly_cron_secret   = the same CRON_SECRET the app server reads
--      SQL equivalent (statement logging caveat applies):
--        select vault.create_secret('https://<your-app-domain>/api/reminders/due',
--                                   'keepdearly_delivery_url');
--        select vault.create_secret('<CRON_SECRET>', 'keepdearly_cron_secret');
--
--   3. Run this file, or re-run just:
--        select public.keepdearly_schedule_reminder_delivery();
--      It returns {"scheduled": true, "jobid": ...} or a reason nothing was
--      scheduled. Re-running replaces the existing job (never duplicates it).
--      It also unschedules any previously stored version of the job.
--
--   4. Manual smoke test of the scheduled path (posts one request now):
--        select public.keepdearly_run_reminder_delivery();
--      Responses (success or error status) land in net._http_response.

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Execution-time wrapper: the ONLY thing the cron job ever runs. Reads the
-- delivery URL and the bearer token from Vault on every fire and issues the
-- authenticated POST. pg_cron runs jobs as the role that scheduled them
-- (postgres via the SQL editor); security definer with a locked search_path
-- keeps the Vault and net references working the same way for every caller.
create or replace function public.keepdearly_run_reminder_delivery()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_secret text;
  v_request_id bigint;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets
    where name = 'keepdearly_delivery_url'
    limit 1;

  select decrypted_secret into v_secret
    from vault.decrypted_secrets
    where name = 'keepdearly_cron_secret'
    limit 1;

  if v_url is null or v_secret is null then
    raise exception
      'keepdearly_run_reminder_delivery: missing Vault secret(s) keepdearly_delivery_url / keepdearly_cron_secret (names only; values never logged)'
      using errcode = '55000';
  end if;

  select request_id into v_request_id
    from net.http_post(
      url := v_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_secret
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 5000
    );

  return v_request_id;
end;
$$;

-- The wrapper reads decrypted Vault secrets: keep execution away from the
-- public API roles so no API caller can trigger outbound authenticated
-- requests. The owner (postgres — the SQL editor and the pg_cron job owner)
-- keeps access.
revoke execute on function public.keepdearly_run_reminder_delivery()
  from public, anon, authenticated;
grant execute on function public.keepdearly_run_reminder_delivery()
  to postgres;

-- Builds (or rebuilds) the every-minute schedule. Checks that both Vault
-- secrets exist and refuses to schedule while either is missing, so a
-- half-configured deployment never fires unauthenticated requests at the
-- endpoint. The values are only checked here — the command stored in
-- cron.job contains no URL and no secret, just the wrapper call.
create or replace function public.keepdearly_schedule_reminder_delivery()
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_url text;
  v_secret text;
  v_jobid bigint;
begin
  select decrypted_secret into v_url
    from vault.decrypted_secrets
    where name = 'keepdearly_delivery_url'
    limit 1;

  select decrypted_secret into v_secret
    from vault.decrypted_secrets
    where name = 'keepdearly_cron_secret'
    limit 1;

  if v_url is null or v_secret is null then
    return jsonb_build_object(
      'scheduled', false,
      'reason', 'Missing Vault secret(s); see migration 0005 for setup.',
      'has_url', v_url is not null,
      'has_secret', v_secret is not null
    );
  end if;

  -- Replace any previous job of ours (including older versions whose command
  -- embedded the secret). Older pg_cron builds raise instead of returning
  -- false for an unknown name, hence the guarded block.
  begin
    perform cron.unschedule('keepdearly-reminder-delivery');
  exception when others then
    null;
  end;

  -- Secret-free command: the wrapper resolves URL + bearer token from Vault
  -- at every execution, so nothing sensitive is ever written to cron.job.
  v_jobid := cron.schedule(
    'keepdearly-reminder-delivery',
    '* * * * *',
    'select public.keepdearly_run_reminder_delivery();'
  );

  return jsonb_build_object('scheduled', true, 'jobid', v_jobid);
end;
$$;

-- The function reads decrypted Vault secrets: keep execution away from the
-- public API roles. The owner (postgres, i.e. the SQL editor) keeps access.
revoke execute on function public.keepdearly_schedule_reminder_delivery()
  from public, anon, authenticated;
grant execute on function public.keepdearly_schedule_reminder_delivery()
  to postgres;

-- Schedule now when everything is in place; a JSON notice otherwise.
select public.keepdearly_schedule_reminder_delivery();
