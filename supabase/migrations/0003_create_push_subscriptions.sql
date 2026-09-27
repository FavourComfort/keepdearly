-- KeepDearly — Phase 4A: push subscriptions.
--
-- One row per authenticated user per browser/device Web Push subscription.
-- This migration only stores where notifications may be sent later; it does not
-- deliver notifications, send reminders, track daily check-ins, or change any
-- existing people, memories, reminders, profiles, authentication, or RLS behavior.
--
-- Privacy: only opaque Push API endpoint URLs and encryption keys are stored.
-- No notification text, message content, delivery timestamps, or preferences.
--
-- Run this AFTER 0002_create_people_memories_reminders.sql, in the Supabase SQL
-- editor or via supabase db push. 0001 and 0002 are left untouched.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null check (length(btrim(p256dh)) > 0),
  auth text not null check (length(btrim(auth)) > 0),
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.push_subscriptions is
  'Web Push destination for one authenticated user on one browser/device. Storage only; delivery is a later phase.';
comment on column public.push_subscriptions.endpoint is
  'Unique Push API endpoint URL issued by the browser push service.';
comment on column public.push_subscriptions.p256dh is
  'Browser-generated P-256 ECDH public key, base64url-encoded.';
comment on column public.push_subscriptions.auth is
  'Browser-generated push authentication secret, base64url-encoded.';
comment on column public.push_subscriptions.user_agent is
  'Optional browser/device hint from navigator.userAgent. Never used for identity.';

-- ---------------------------------------------------------------------------
-- updated_at — reuses the exact function created by Phase 1
-- ---------------------------------------------------------------------------
drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
--
-- user_id supports ownership filtering and cleanup; endpoint uniqueness prevents
-- the same browser subscription from being stored twice.
-- ---------------------------------------------------------------------------
create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);
create unique index if not exists push_subscriptions_endpoint_uidx
  on public.push_subscriptions (endpoint);

-- ---------------------------------------------------------------------------
-- Grants — authenticated only. The anon role gets nothing.
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Owner-only in both directions, matching people/memories/reminders. Updates
-- cannot transfer a subscription to another account.
-- ---------------------------------------------------------------------------
alter table public.push_subscriptions enable row level security;

drop policy if exists 'Users can read their own push subscriptions' on public.push_subscriptions;
create policy 'Users can read their own push subscriptions'
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists 'Users can add their own push subscriptions' on public.push_subscriptions;
create policy 'Users can add their own push subscriptions'
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists 'Users can update their own push subscriptions' on public.push_subscriptions;
create policy 'Users can update their own push subscriptions'
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists 'Users can delete their own push subscriptions' on public.push_subscriptions;
create policy 'Users can delete their own push subscriptions'
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
