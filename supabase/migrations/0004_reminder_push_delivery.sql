-- KeepDearly — Phase 4B: scheduled reminder push delivery.
--
-- Adds the smallest safe delivery path for EXISTING scheduled reminders:
-- a `notified_at` timestamp on `public.reminders` that the scheduler claims
-- atomically so a due reminder is delivered at most once.
--
-- What this migration does NOT do:
-- - no RLS change, no new tables, no notification system
-- - no change to reminder creation/edit/completion/cancellation behaviour
-- - no Phase 4C daily proactive notification
alter table public.reminders
  add column if not exists notified_at timestamptz;

comment on column public.reminders.notified_at is
  'When the due-reminder scheduler delivered this reminder as Web Push. NULL means not yet delivered. Claimed atomically so repeats never resend.';

-- Index the exact scheduler predicate: pending, due, and not yet delivered.
create index if not exists reminders_due_delivery_idx
  on public.reminders (remind_at)
  where status = 'pending' and notified_at is null;

-- Atomically claim one due reminder for delivery.
--
-- The scheduler calls this once per due row. It sets `notified_at = now()`
-- only when the row is still pending, still due, and still unclaimed, and
-- returns the claimed row. Concurrent schedulers racing on the same row get
-- at most one TRUE; everyone else gets FALSE and must not send.
--
-- Returns: claimed=true with the reminder row on success,
--          claimed=false with nulls when another run already claimed it,
--          the reminder was completed/cancelled/rescheduled, or it is not due.
create or replace function public.claim_due_reminder(p_reminder_id uuid)
returns table (claimed boolean, id uuid, user_id uuid, memory_id uuid, remind_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  return query
    update public.reminders as r
    set
      notified_at = v_now,
      updated_at = v_now
    where r.id = p_reminder_id
      and r.status = 'pending'
      and r.remind_at <= v_now
      and r.notified_at is null
    returning true, r.id, r.user_id, r.memory_id, r.remind_at;
end;
$$;

-- A rescheduled reminder is a new pending nudge: clear any earlier delivery
-- claim so the new moment can be delivered exactly once. Completion and
-- cancellation never clear the claim; they only take the row out of play.
create or replace function public.reset_reminder_delivery_on_reschedule()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.remind_at is distinct from old.remind_at and new.status = 'pending' then
    new.notified_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists reminders_reset_delivery_on_reschedule on public.reminders;
create trigger reminders_reset_delivery_on_reschedule
  before update on public.reminders
  for each row execute function public.reset_reminder_delivery_on_reschedule();
