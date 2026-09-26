-- KeepDearly — Phase 2: people, memories, reminders.
--
-- Run this AFTER 0001_create_profiles.sql, in the Supabase SQL editor or via
-- `supabase db push`. 0001 is left untouched.
--
-- Scope on purpose: a person is just a name, a memory is a sentence that may or
-- may not belong to a person, and a reminder records WHEN the user wants a
-- memory handed back. There are deliberately no tables for likes, dislikes,
-- gifts, birthdays or preferences — KeepDearly is a memory app, not a CRM.
--
-- Nothing here delivers notifications. `reminders.remind_at` is only the stored
-- instruction; delivery belongs to a later phase.

-- ---------------------------------------------------------------------------
-- people
-- ---------------------------------------------------------------------------
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.people is
  'A person the authenticated user keeps close. Intentionally only a name and an optional avatar.';

-- ---------------------------------------------------------------------------
-- memories
--
-- person_id is NULLABLE on purpose: "capture first, organize later". A memory
-- may exist with nobody attached, and a person may be deleted later without
-- losing the memory (the reference is set to NULL).
-- ---------------------------------------------------------------------------
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid references public.people (id) on delete set null,
  content text not null check (length(btrim(content)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.memories is
  'Something worth remembering. person_id is optional by design.';

-- ---------------------------------------------------------------------------
-- reminders
--
-- memory_id is NOT NULL: a reminder always hangs off a real memory, and
-- deleting that memory takes its reminders with it.
-- ---------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  memory_id uuid not null references public.memories (id) on delete cascade,
  remind_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.reminders is
  'When the user wants a memory handed back. Delivery is a later phase.';

-- ---------------------------------------------------------------------------
-- updated_at — reuses the exact function created by Phase 1
-- ---------------------------------------------------------------------------
drop trigger if exists people_set_updated_at on public.people;
create trigger people_set_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
--
-- PostgreSQL does not index foreign keys automatically. people.user_id backs
-- every "my people" read plus every RLS policy check; memories.person_id and
-- reminders.memory_id keep the delete cascades cheap; the composite index backs
-- the ordered "coming up" queries.
-- ---------------------------------------------------------------------------
create index if not exists people_user_id_idx on public.people (user_id);
create index if not exists memories_user_id_idx on public.memories (user_id);
create index if not exists memories_person_id_idx on public.memories (person_id);
create index if not exists reminders_user_id_idx on public.reminders (user_id);
create index if not exists reminders_memory_id_idx on public.reminders (memory_id);
create index if not exists reminders_user_remind_at_idx
  on public.reminders (user_id, remind_at);

-- ---------------------------------------------------------------------------
-- Grants — `authenticated` only. The `anon` role gets nothing.
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.people to authenticated;
grant select, insert, update, delete on table public.memories to authenticated;
grant select, insert, update, delete on table public.reminders to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Every table is owner-only, in both directions: `using` filters what a row
-- policy can see/touch, `with check` validates the row being written. Because
-- the UPDATE policies carry a WITH CHECK on user_id, a user cannot re-assign
-- one of their own rows to somebody else's account.
-- ---------------------------------------------------------------------------
alter table public.people enable row level security;
alter table public.memories enable row level security;
alter table public.reminders enable row level security;

-- people ------------------------------------------------------------------------
drop policy if exists "Users can read their own people" on public.people;
create policy "Users can read their own people"
  on public.people for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own people" on public.people;
create policy "Users can add their own people"
  on public.people for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own people" on public.people;
create policy "Users can update their own people"
  on public.people for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own people" on public.people;
create policy "Users can delete their own people"
  on public.people for delete
  using (auth.uid() = user_id);

-- memories ----------------------------------------------------------------------
drop policy if exists "Users can read their own memories" on public.memories;
create policy "Users can read their own memories"
  on public.memories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own memories" on public.memories;
create policy "Users can add their own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own memories" on public.memories;
create policy "Users can update their own memories"
  on public.memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own memories" on public.memories;
create policy "Users can delete their own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- reminders ---------------------------------------------------------------------
drop policy if exists "Users can read their own reminders" on public.reminders;
create policy "Users can read their own reminders"
  on public.reminders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own reminders" on public.reminders;
create policy "Users can add their own reminders"
  on public.reminders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own reminders" on public.reminders;
create policy "Users can update their own reminders"
  on public.reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own reminders" on public.reminders;
create policy "Users can delete their own reminders"
  on public.reminders for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Cross-user reference protection
--
-- RLS alone does NOT stop this:
--
--   insert into memories (user_id, person_id, content)
--   values (auth.uid(), <somebody else's person uuid>, 'hello');
--
-- The row is owned by me, so every ownership policy is satisfied, yet I would
-- have attached a memory to someone else's person. The same hole exists for
-- reminders -> memories.
--
-- These triggers close it in the database, so the guarantee holds no matter
-- which client writes the row (browser, future server route, or a service-role
-- call that forgets to check ownership). A NULL person_id is always allowed —
-- that is the "capture first, organize later" rule.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_memory_person_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.person_id is null then
    return new;
  end if;

  if not exists (
    select 1 from public.people p
    where p.id = new.person_id and p.user_id = new.user_id
  ) then
    raise exception 'person_id must belong to the same user as the memory'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists memories_person_belongs_to_owner on public.memories;
create trigger memories_person_belongs_to_owner
  before insert or update on public.memories
  for each row execute function public.enforce_memory_person_owner();

create or replace function public.enforce_reminder_memory_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.memories m
    where m.id = new.memory_id and m.user_id = new.user_id
  ) then
    raise exception 'memory_id must belong to the same user as the reminder'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists reminders_memory_belongs_to_owner on public.reminders;
create trigger reminders_memory_belongs_to_owner
  before insert or update on public.reminders
  for each row execute function public.enforce_reminder_memory_owner();

