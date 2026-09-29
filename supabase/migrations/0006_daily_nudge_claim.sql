-- KeepDearly — Phase 4C: daily proactive memory nudge.
--
-- Adds the durable once-per-day claim that the daily-nudge scheduler uses so a
-- single user is nudged at most once per UTC day, even when nothing is due.
--
-- The nudge has no underlying domain object: unlike Phase 4B, there is no
-- `reminders` row to hang a `notified_at` column on, because the daily nudge is
-- user-driven rather than reminder-driven. This table is that bookkeeping, and
-- it is the whole reason it exists.
--
-- What this migration does NOT do:
-- - no change to reminder creation/edit/completion/cancellation behaviour
-- - no change to scheduled reminder push delivery (migration 0004 is untouched)
-- - no change to `push_subscriptions`, the service worker, or any client code
-- - no notification sending; this is the claim only
-- - no timezone columns or timezone infrastructure: `claimed_for` is a plain
--   `date` in UTC, so "once a day" means "once per UTC day"
create table if not exists public.daily_nudges (
  user_id uuid primary key references auth.users (id) on delete cascade,
  claimed_for date not null,
  claimed_at timestamptz not null default now()
);

comment on table public.daily_nudges is
  'One row per user holding the current Phase 4C daily proactive nudge claim. Delivery bookkeeping only; it stores no notification text and no memory content.';
comment on column public.daily_nudges.claimed_for is
  'The UTC date this claim covers. The scheduler passes the current UTC day, so a user can only be claimed once per UTC day.';
comment on column public.daily_nudges.claimed_at is
  'When the current claim was made. Bookkeeping for operators; the once-per-day rule is enforced by claimed_for, not by this timestamp.';

-- `user_id` is already the primary key, so this lookup needs no extra index:
-- `claim_daily_nudge` addresses exactly one user by primary key.

-- Atomically claim the daily nudge for one user on one day.
--
-- The scheduler calls this once per subscribed user per run. It returns TRUE
-- only when this call is the one that made the claim for `p_day`; it returns
-- FALSE when the user has already claimed that same day. Concurrent calls for
-- the same user/day get at most one TRUE.
--
-- There is no DELETE-then-INSERT and no SELECT-then-INSERT: the whole decision
-- is a single `insert ... on conflict do update ... where`, which Postgres
-- executes atomically. The conditional `do update` is what makes the same-day
-- re-claim a no-op — the conflict target is the `user_id` primary key, and the
-- `where` refuses to overwrite a row that already covers `p_day`. A rejected
-- update affects zero rows, which is what surfaces as FALSE below.
--
-- A later day still wins: claiming 2026-01-02 over an existing 2026-01-01 row
-- takes the `do update` branch and moves `claimed_for` forward, so one row per
-- user is sufficient and no cleanup job is ever needed.
--
-- `claimed_for` is a date, so a scheduler running in two timezones still
-- agrees on the same day boundary.
create or replace function public.claim_daily_nudge(p_user_id uuid, p_day date)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claimed integer := 0;
begin
  -- A NULL user or day is a caller bug, not a claim. Refuse it loudly rather
  -- than writing a row that would silently block every future nudge.
  if p_user_id is null or p_day is null then
    raise exception 'claim_daily_nudge: p_user_id and p_day are required'
      using errcode = '22004';
  end if;

  insert into public.daily_nudges (user_id, claimed_for, claimed_at)
  values (p_user_id, p_day, now())
  on conflict (user_id) do update
    set claimed_for = excluded.claimed_for,
        claimed_at = now()
    where public.daily_nudges.claimed_for is distinct from excluded.claimed_for;

  get diagnostics v_claimed = row_count;

  -- row_count is 1 when this call inserted or advanced the claim, and 0 when
  -- the `where` above declined the update because the day was already claimed.
  return v_claimed = 1;
end;
$$;

-- Grants — service_role only.
--
-- This table is server-side delivery bookkeeping. The Phase 4C scheduler reads
-- and writes it exclusively through the service_role client, so no client role
-- needs access at any level. RLS below is enabled with no policies, so even a
-- role that somehow held a grant would read and write nothing; service_role
-- bypasses RLS and is the single intended caller.
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.daily_nudges to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Enabled with deliberately NO policies. That is the whole point: this is
-- bookkeeping no browser should ever read or write. No select/insert/update
-- policies are created, and no anon or authenticated grants exist above, so
-- client-supplied traffic cannot touch these rows. The service_role delivery
-- process is unaffected because it bypasses RLS.
alter table public.daily_nudges enable row level security;

-- The function is security definer (it must write as the owner, since the
-- calling role is deliberately granted no direct table access). Keep its
-- execution just as narrow as the table: revoke the default PUBLIC execute and
-- hand it only to service_role. Every name inside the body is schema-qualified
-- so the empty search_path above cannot be exploited to redirect the write.
revoke all on function public.claim_daily_nudge(uuid, date) from public;
revoke all on function public.claim_daily_nudge(uuid, date) from anon;
revoke all on function public.claim_daily_nudge(uuid, date) from authenticated;
grant execute on function public.claim_daily_nudge(uuid, date) to service_role;
