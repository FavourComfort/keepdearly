-- KeepDearly — Phase 6C correction: fix claim_scheduled_message() return shape.
--
-- Run this AFTER 0008_scheduled_message_claim.sql. It only replaces the function
-- body; 0008 is left exactly as it was applied.
--
-- Why this exists
-- ---------------
-- 0008 declared `RETURNS TABLE (id, recipient_email, body, person_name,
-- attempts)` — five OUT parameters — but ended the function with
-- `return v_claimed = 1;`, which returns a BOOLEAN.
--
-- For a `RETURNS TABLE` function PL/pgSQL requires the RETURN expression to
-- match the composite row type, so every call raised:
--
--     ERROR: returned record type does not match expected record type
--
-- `CREATE FUNCTION` still succeeds (the body is only fully checked when it
-- runs), which is why 0008 applied cleanly and the fault went unnoticed. In
-- practice the effect was that NO message could ever be claimed: the delivery
-- pass counted every row as `claim_failed`.
--
-- The fix matches what the caller already expects. The delivery pass treats
-- "one row returned" as won and "no row returned" as lost, so the function
-- simply returns the claimed row and nothing otherwise:
--
--     claimed  -> exactly one row
--     not won  -> zero rows
--
-- The claim itself — a single conditional UPDATE, so at most one concurrent
-- caller wins — is unchanged from 0008 and is still correct.
--
-- Security is unchanged and deliberately repeated: SECURITY DEFINER, an empty
-- search_path, schema-qualified names, and execution granted to service_role
-- only. The empty search_path means nothing in the body can be redirected by a
-- shadowing object, and every name below is fully qualified.

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
begin
  if p_message_id is null then
    raise exception 'claim_scheduled_message: p_message_id is required'
      using errcode = '22004';
  end if;

  -- `status = 'pending'` plus `send_at <= now()` is what makes this safe: a
  -- cancelled, already-sent, in-flight, or not-yet-due message can never be
  -- claimed, and the row-level lock means a concurrent caller blocks here and
  -- then matches zero rows.
  --
  -- The recipient address is read from the related `people` row, so there is
  -- exactly one place an address lives.
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

  -- FOUND is set by the UPDATE: true when the row above was actually claimed.
  -- Emitting the row only in that case is what gives the caller "one row = I
  -- won it, no row = do not send", and makes a second claim of the same message
  -- return nothing at all.
  if found then
    return next;
  end if;

  return;
end;
$$;

-- Narrow, exactly as 0006 and 0008: service_role only, because only the trusted
-- delivery job may call this. No authenticated or anon client can invoke it.
revoke all on function public.claim_scheduled_message(uuid) from public;
revoke all on function public.claim_scheduled_message(uuid) from anon;
revoke all on function public.claim_scheduled_message(uuid) from authenticated;
grant execute on function public.claim_scheduled_message(uuid) to service_role;
