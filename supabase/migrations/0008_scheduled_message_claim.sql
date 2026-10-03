-- KeepDearly — Phase 6C: scheduled-message claim for delivery.
--
-- Adds the one function the email delivery job needs: an atomic
-- pending -> sending claim for a single due scheduled message.
--
-- Run this AFTER 0007_scheduled_messages.sql in the Supabase SQL editor.
-- 0001-0007 are left untouched.
--
-- Why this exists at all: the delivery pass must never do
-- "SELECT pending -> send -> update". Two scheduler runs (or a retry after a
-- timeout) would both see the same row and both send the same email. This
-- single conditional UPDATE is what makes at most one of them win.
--
-- What this migration does NOT do:
-- - no email provider code, no HTTP route, no cron, no UI.
-- - no recovery of stuck 'sending' rows. Deliberate: see the note below.
-- - no change to reminder delivery, the daily nudge, push, or authentication.
--
-- `sending` is a visible, deliberate state. If the server dies after claiming
-- but before recording the outcome, the row stays `sending` forever rather than
-- silently returning to `pending` — a reset would risk sending a second copy of
-- an email the provider had already accepted. Phase 6E owns any recovery.
alter table public.scheduled_messages
  add column if not exists claimed_at timestamptz;

comment on column public.scheduled_messages.claimed_at is
  'When a delivery run atomically claimed this row (pending -> sending). NULL until then. A row stuck in sending with a claimed_at is an interrupted send, never silently retried.';

-- Atomically claim one due scheduled message for delivery.
--
-- Returns exactly one row when THIS call made the claim, and no rows when it did
-- not — so the caller can only ever send a message it genuinely owns.
--
-- The recipient address is read from the related `people` row rather than being
-- stored on the message, so there is exactly one place an address lives.
create or replace function public.claim_scheduled_message(p_message_id uuid)
returns table (
  id uuid,
  recipient_email text,
  body text,
  person_name text,
  attempts integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claimed integer := 0;
begin
  if p_message_id is null then
    raise exception 'claim_scheduled_message: p_message_id is required'
      using errcode = '22004';
  end if;

  -- `status = 'pending'` is what makes this safe: a cancelled, already-sent or
  -- in-flight message can never be claimed, and the row-level lock means a
  -- concurrent caller blocks here and then matches zero rows.
  update public.scheduled_messages as m
  set status = 'sending',
      attempts = m.attempts + 1,
      claimed_at = now(),
      updated_at = now()
  from public.people as p
  where m.id = p_message_id
    and m.person_id = p.id
    and m.status = 'pending'
    and m.send_at <= now()
  returning m.id, p.email, m.body, p.name, m.attempts
  into id, recipient_email, body, person_name, attempts;

  get diagnostics v_claimed = row_count;

  -- Zero rows means somebody else got there first, or it was never due, or it
  -- was no longer pending. The caller treats all three the same way: do not send.
  return v_claimed = 1;
end;
$$;

-- Narrow, exactly as 0006: service_role only, because only the trusted
-- delivery job may call this. `set search_path = ''` plus the schema-qualified
-- names above mean nothing in the body can be redirected by a shadowing object.
revoke all on function public.claim_scheduled_message(uuid) from public;
revoke all on function public.claim_scheduled_message(uuid) from anon;
revoke all on function public.claim_scheduled_message(uuid) from authenticated;
grant execute on function public.claim_scheduled_message(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- A due-message index the delivery pass actually reads
-- ---------------------------------------------------------------------------
-- The partial index in 0007 covers pending + due. This one is for the operator
-- looking at stuck rows, which is the one recovery question Phase 6E inherits.
create index if not exists scheduled_messages_sending_idx
  on public.scheduled_messages (claimed_at)
  where status = 'sending';
