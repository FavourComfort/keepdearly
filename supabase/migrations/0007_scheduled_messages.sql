-- KeepDearly — Phase 6A: Plus scheduled messages (data foundation only).
--
-- Run this AFTER 0006_daily_nudge_claim.sql in the Supabase SQL editor.
-- 0001-0006 are left untouched.
--
-- This migration is the data foundation for one Plus feature: a user prepares a
-- message for someone in advance, and KeepDearly sends it by email at the right
-- time without the user having to open the app.
--
-- The shape is deliberately the smallest one that can be delivered safely:
-- saved person -> prepared message -> scheduled time -> delivery status.
--
-- What this migration does NOT do:
-- - no payment table, webhook, or activation logic. `profiles.plus_active` is
--   only a flag that a later, trusted server path will set.
-- - no email provider code, no HTTP route, no cron, no delivery job.
-- - no UI, and no change to any existing page, route, or server function.
-- - no threads, templates, attachments, recurring messages, AI fields, or
--   WhatsApp/SMS columns. A v1 message goes to one person once.
-- - no recipient accounts. A recipient such as "Sarah" is just an email on a
--   person row and does NOT need a KeepDearly account.
-- - no change to reminder delivery, the daily nudge, push notifications, or
--   authentication.
--
-- Timezone: `send_at` is a timestamptz, which is an absolute instant and so
-- carries no ambiguity. No timezone column is added — storing one would imply
-- infrastructure this feature does not need.
alter table public.people
  add column if not exists email text;

comment on column public.people.email is
  'This person''s email address, used to send them a scheduled message (Plus). Nullable: many people have no address. Not unique — two people may share one, and a person may have none. Recipients do not need a KeepDearly account.';

-- ---------------------------------------------------------------------------
-- scheduled_messages
-- ---------------------------------------------------------------------------
create table if not exists public.scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- NOT NULL, and on delete cascade: a scheduled message is always addressed to
  -- a saved person, and if that person is deleted the message is meaningless.
  person_id uuid not null references public.people (id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  send_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  -- Failure detail only, and deliberately free text so the delivery job can
  -- record whatever the provider said without a schema change per reason.
  last_error text,
  -- Counts delivery attempts. Combined with the claim in Step 5 this is what
  -- makes a repeat send visible rather than silent.
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.scheduled_messages is
  'A message a Plus user has prepared for a saved person, to be sent by email at send_at. Delivery bookkeeping only — no provider ids, receipts, or threads.';
comment on column public.scheduled_messages.status is
  'pending = waiting; sending = claimed by a delivery run right now; sent = handed to the email provider successfully; failed = attempted and failed (see last_error); cancelled = withdrawn by the user.';
comment on column public.scheduled_messages.send_at is
  'When the message should go out, as an absolute instant. The delivery job selects pending rows where send_at <= now().';
comment on column public.scheduled_messages.attempts is
  'How many times delivery has been attempted. A row stuck in sending with attempts > 0 is a visible interrupted send, not a silent one.';

-- Index the exact delivery predicate: still pending and already due.
create index if not exists scheduled_messages_due_idx
  on public.scheduled_messages (send_at)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- updated_at — reuses the exact function created by Phase 1
-- ---------------------------------------------------------------------------
drop trigger if exists scheduled_messages_set_updated_at on public.scheduled_messages;
create trigger scheduled_messages_set_updated_at
  before update on public.scheduled_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Cross-user reference protection
-- ---------------------------------------------------------------------------
-- RLS alone does NOT stop this:
--
--   insert into scheduled_messages (user_id, person_id, body, send_at)
--   values (auth.uid(), <somebody else's person uuid>, 'hi', now());
--
-- The row is owned by me, so every ownership policy is satisfied, yet I would
-- have addressed my message to — and had KeepDearly email — another user's
-- person. That is worse here than for a memory: this table holds a recipient
-- email and a private message, so the hole would leak them.
--
-- This trigger closes it in the database, so the guarantee holds no matter
-- which client writes the row (browser, a future server route, or a
-- service-role call that forgets to check ownership). It is the same pattern,
-- and deliberately the same function body, as enforce_memory_person_owner()
-- from 0002.
create or replace function public.enforce_scheduled_message_person_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.people p
    where p.id = new.person_id and p.user_id = new.user_id
  ) then
    raise exception 'person_id must belong to the same user as the scheduled message'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists scheduled_messages_person_belongs_to_owner on public.scheduled_messages;
create trigger scheduled_messages_person_belongs_to_owner
  before insert or update on public.scheduled_messages
  for each row execute function public.enforce_scheduled_message_person_owner();


-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
-- Only the `authenticated` role gets table privileges. The `anon` role gets
-- nothing at all, so a signed-out client cannot read a scheduled message even
-- by mistake. The grants say *which* operations are possible; the RLS policies
-- below still decide *whose rows* they may touch.
--
-- Note there is no grant to service_role here on purpose: the delivery job will
-- use the service_role key, which bypasses RLS and already holds full access.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.scheduled_messages to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.scheduled_messages enable row level security;

drop policy if exists 'Users can read their own scheduled messages' on public.scheduled_messages;
create policy 'Users can read their own scheduled messages'
  on public.scheduled_messages for select
  using (auth.uid() = user_id);

drop policy if exists 'Users can add their own scheduled messages' on public.scheduled_messages;
create policy 'Users can add their own scheduled messages'
  on public.scheduled_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists 'Users can update their own scheduled messages' on public.scheduled_messages;
create policy 'Users can update their own scheduled messages'
  on public.scheduled_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists 'Users can delete their own scheduled messages' on public.scheduled_messages;
create policy 'Users can delete their own scheduled messages'
  on public.scheduled_messages for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- profiles.plus_active — the minimal Plus entitlement flag
-- ---------------------------------------------------------------------------
-- Just a boolean. No payment table, no provider, no webhook: a later trusted
-- server path will set this once a purchase is confirmed, and nothing in the
-- client is allowed to set it.
alter table public.profiles
  add column if not exists plus_active boolean not null default false;

comment on column public.profiles.plus_active is
  'Whether this account has an active Plus entitlement. Set only by a trusted server path after a confirmed purchase — never by the client.';

-- A user can still read the flag (so the app can show Plus UI), but cannot
-- write it. 0001 granted table-level UPDATE on profiles, and the existing
-- "Users can update their own profile" policy is scoped by row, not by column —
-- so without this, any signed-in user could run
--   supabase.from('profiles').update({ plus_active: true })
-- and grant themselves Plus for free. Column-level grants are the smallest
-- declarative fix, and the app only ever SELECTs from profiles today
-- (src/lib/auth.tsx), so nothing legitimate is lost.
revoke update on table public.profiles from authenticated;
grant update (full_name, avatar_url) on table public.profiles to authenticated;
