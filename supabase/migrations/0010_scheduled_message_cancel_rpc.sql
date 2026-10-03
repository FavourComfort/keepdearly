-- KeepDearly — Phase 6C security: stop authenticated clients forging delivery state.
--
-- Run this AFTER 0009_fix_claim_return_shape.sql. It does not edit 0007, 0008 or
-- 0009.
--
-- Why this exists
-- ---------------
-- 0007 granted `select, insert, update, delete` on public.scheduled_messages to
-- `authenticated`, with an RLS policy scoped by ROW:
--
--     using (auth.uid() = user_id) with check (auth.uid() = user_id)
--
-- Row scope says *whose* rows you may touch, never *which columns*. So any
-- signed-in user could point PostgREST straight at their own row and write:
--
--     supabase.from('scheduled_messages')
--       .update({ status: 'sent', sent_at: ..., last_error: null })
--       .eq('id', <their own message>)
--
-- That forges delivery state — it makes a message that was never handed to the
-- email provider look delivered, or marks one failed/sending to move it out of
-- the delivery path. The TypeScript `Update` type is a compile-time hint only
-- and is trivially bypassed from the browser console, so the boundary has to
-- live in the database.
--
-- The fix
-- -------
-- The client has exactly ONE legitimate UPDATE: cancelling a pending message
-- (Phase 6B). There is no pending-message editing in the product today — the
-- client only ever SELECTs, INSERTs, and cancels. So rather than narrowing the
-- grant column by column, the whole table-level UPDATE is revoked and the one
-- legitimate transition moves into a SECURITY DEFINER function that becomes the
-- only path to `cancelled` for any authenticated client.
--
-- This is the same shape as the `plus_active` fix already applied to profiles
-- in 0007 (revoke table UPDATE, grant back only what is needed) — except here
-- even `status` is withheld, because granting UPDATE(status) would still let a
-- user write status='sent'.
--
-- Delivery fields now writable by `authenticated`: none.
-- `status`, `sent_at`, `last_error`, `attempts`, `claimed_at` are reachable
-- ONLY through SECURITY DEFINER functions running as the owner:
--   * cancel_scheduled_message (below)  -> pending => cancelled
--   * claim_scheduled_message (0008/9)  -> pending => sending
-- and afterwards ONLY by the service_role delivery path.
--
-- service_role is unaffected: 0007 deliberately granted it nothing at the table
-- level, because the service key bypasses RLS and retains full access.

-- ---------------------------------------------------------------------------
-- 1. Remove the blanket UPDATE grant
-- ---------------------------------------------------------------------------
-- Revoking table-level UPDATE also removes any previously granted column-level
-- UPDATE, so this is a clean starting point rather than an accumulation.
revoke update on table public.scheduled_messages from authenticated;

-- The RLS update policy is now unreachable for authenticated clients, because no
-- privilege allows them to issue an UPDATE at all. It is dropped anyway so the
-- policy set never implies that direct updating is supported — if UPDATE is ever
-- re-granted later, a forgotten policy here would silently reopen the hole.
--
-- The SELECT, INSERT and DELETE policies from 0007 are untouched: reading your
-- own messages and creating your own messages remain exactly as they were.
drop policy if exists 'Users can update their own scheduled messages' on public.scheduled_messages;

-- ---------------------------------------------------------------------------
-- 2. cancel_scheduled_message(uuid)
-- ---------------------------------------------------------------------------
-- The single legitimate state change a client may perform, and the only
-- transition reachable by a signed-in user.
--
-- SECURITY DEFINER runs this as the table owner, so it bypasses RLS. That is
-- intentional and safe only because the function enforces ownership itself,
-- below, by comparing against auth.uid() — the caller's real JWT subject, which
-- RLS would otherwise have enforced.
--
-- `set search_path = ''` plus fully qualified names means no object in the body
-- can be shadowed or redirected by anything the caller controls.
create or replace function public.cancel_scheduled_message(p_message_id uuid)
returns table (
  id uuid,
  person_id uuid,
  status text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_message_id is null then
    raise exception 'cancel_scheduled_message: p_message_id is required'
      using errcode = '22004';
  end if;

  -- auth.uid() is compared inside the statement rather than trusted from an
  -- argument, so the caller cannot cancel a message belonging to anyone else.
  --
  -- `m.user_id = auth.uid()` is the ownership check. It is deliberately NOT
  -- `m.id = p_message_id` alone.
  --
  -- `m.status = 'pending'` restricts the transition to withdrawing a message
-- that has not gone out. A message already claimed ('sending'), delivered
  -- ('sent'), failed or cancelled matches zero rows and is left untouched.
  --
  -- Only status and updated_at are written. sent_at, last_error, attempts and
  -- claimed_at are never referenced here, so this function cannot forge them
  -- even for the user's own rows.
  update public.scheduled_messages as m
  set status = 'cancelled',
      updated_at = now()
  where m.id = p_message_id
    and m.user_id = auth.uid()
    and m.status = 'pending'
  returning m.id, m.person_id, m.status
  into id, person_id, status;

  -- Zero rows means "nothing to cancel": not this user's message, or it has
  -- already been claimed or delivered. The client is not told which, so this
  -- function is not an oracle for probing other users' message ids.
  if not found then
    raise exception 'cancel_scheduled_message: no cancellable message'
      using errcode = 'P0002';
  end if;

  return next;
end;
$$;

comment on function public.cancel_scheduled_message(uuid) is
  'Cancel one of the calling user''s own pending scheduled messages. SECURITY DEFINER: ownership is enforced here with auth.uid() rather than by RLS, so this is the only path an authenticated client has to change a scheduled_messages row.';

-- ---------------------------------------------------------------------------
-- 3. Execute privileges
-- ---------------------------------------------------------------------------
-- Default-deny first: revoke from PUBLIC so no role inherits the ability to
-- call it, then grant explicitly to `authenticated` only. `anon` is revoked
-- separately and by name, because a signed-out client must not be able to invoke
-- this — and while auth.uid() would be null for it, relying on that alone would
-- be leaning on a null check instead of a real privilege boundary.
revoke all on function public.cancel_scheduled_message(uuid) from public;
revoke all on function public.cancel_scheduled_message(uuid) from anon;
grant execute on function public.cancel_scheduled_message(uuid) to authenticated;

-- NOTE for the delivery path: service_role is intentionally NOT granted this.
-- Nothing server-side cancels messages. claim_scheduled_message and the
-- markSent/markFailed updates in src/lib/scheduled-message-delivery.server.ts
-- do not need it, and leaving it ungranted keeps the cancellation surface as
-- small as it can be.