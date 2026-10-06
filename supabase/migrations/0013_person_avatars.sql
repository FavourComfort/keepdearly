-- KeepDearly — profile photos on people.
--
-- Run this AFTER 0002_create_people_memories_reminders.sql.
--
-- This is a PERSON PROFILE PHOTO and is deliberately kept apart from the memory
-- photo added in 0012. They are different things belonging to different rows:
--
--   people.avatar_url  -> the person   -> <user_id>/<person_id>.<ext>
--   memories.photo_path-> the memory   -> <user_id>/<memory_id>.<ext>
--
-- Different buckets, different policies, different columns. Nothing here reads
-- or writes a memory photo, and 0012 is not touched.
--
-- `people.avatar_url` already exists (unused since 0002) so no new column is
-- added — it simply gains a meaning: a storage object path, never a public URL.

-- ---------------------------------------------------------------------------
-- 1. The column's contract
-- ---------------------------------------------------------------------------
comment on column public.people.avatar_url is
  'Storage object path of this person''s profile photo in the private person-avatars bucket, shaped <user_id>/<person_id>.<ext>. NULL means no photo, and the UI falls back to their initial.';

-- RLS already stops one user writing another user's person ROW, but it cannot
-- see inside storage. Without this check a perfectly valid row could point at
-- somebody else's object. Same reasoning, and the same shape, as
-- enforce_memory_photo_owner in 0012.
create or replace function public.enforce_person_avatar_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.avatar_url is not null
     and new.avatar_url not like new.user_id::text || '/%' then
    raise exception 'avatar_url must live under the person owner folder'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists people_avatar_belongs_to_owner on public.people;
create trigger people_avatar_belongs_to_owner
  before insert or update on public.people
  for each row execute function public.enforce_person_avatar_owner();

-- ---------------------------------------------------------------------------
-- 2. The bucket
-- ---------------------------------------------------------------------------
-- Private, like every other attachment bucket: nothing is served without a
-- signature. Limits mirror src/lib/person-photo.ts so the user hears about an
-- oversized or non-image file before the database does.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'person-avatars',
  'person-avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

comment on bucket public.person-avatars is
  'Private profile photos for people. Objects are named <user_id>/<person_id>.<ext> and are only ever read through short-lived signed URLs.';

-- ---------------------------------------------------------------------------
-- 3. Policies — the owner's folder is the only folder
-- ---------------------------------------------------------------------------
drop policy if exists "Users read their own person avatars" on storage.objects;
create policy "Users read their own person avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'person-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users add their own person avatars" on storage.objects;
create policy "Users add their own person avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'person-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update their own person avatars" on storage.objects;
create policy "Users update their own person avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'person-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'person-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their own person avatars" on storage.objects;
create policy "Users delete their own person avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'person-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );