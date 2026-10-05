-- KeepDearly — photos on memories.
--
-- Run this AFTER 0002_create_people_memories_reminders.sql.
--
-- ONE media attachment per memory, and it is always a photo. There is no voice
-- note, no audio column and no transcription job: KeepDearly keeps pictures of
-- the small things, nothing else.
--
-- What this adds
--   memories.photo_path   nullable storage object path. NULL means text only.
--   memory-photos bucket  PRIVATE. Never public — a memory is private to its
--                         owner, and the app hands out short-lived signed URLs
--                         instead of public links.
--
-- Ownership is the FIRST folder of the object path, i.e.
-- `<user_id>/<memory_id>.<ext>`. Every storage policy is anchored on
-- `auth.uid()` and on that first segment, so a user can only ever touch their
-- own objects. The trigger closes the remaining gap: RLS stops one user
-- writing another user's memory ROW, but it cannot see inside storage, so
-- without the check a perfectly valid row could still point at someone else's
-- object.
--
-- There is no audio here, and no `image_url` on people either — this migration
-- touches memories and storage only.

-- ---------------------------------------------------------------------------
-- 1. memories.photo_path
-- ---------------------------------------------------------------------------
alter table public.memories
  add column if not exists photo_path text;

comment on column public.memories.photo_path is
  'Storage object path of this memory''s photo in the private memory-photos bucket, shaped <user_id>/<memory_id>.<ext>. NULL means the memory is text only.';

-- The attachment must belong to the memory's own owner.
create or replace function public.enforce_memory_photo_owner()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.photo_path is not null
     and new.photo_path not like new.user_id::text || '/%' then
    raise exception 'photo_path must live under the memory owner folder'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists memories_photo_belongs_to_owner on public.memories;
create trigger memories_photo_belongs_to_owner
  before insert or update on public.memories
  for each row execute function public.enforce_memory_photo_owner();

-- ---------------------------------------------------------------------------
-- 2. The bucket
-- ---------------------------------------------------------------------------
-- public = false is the whole point: nothing is served by URL without a
-- signature. The size and MIME limits mirror MAX_PHOTO_BYTES / the accepted
-- formats in src/lib/memory-photo.ts, so an oversized or non-image file is
-- refused at the database rather than filling the project.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-photos',
  'memory-photos',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

comment on bucket public.memory-photos is
  'Private photos attached to memories. Objects are named <user_id>/<memory_id>.<ext> and are only ever read through short-lived signed URLs.';

-- ---------------------------------------------------------------------------
-- 3. Policies — the owner's folder is the only folder
-- ---------------------------------------------------------------------------
drop policy if exists "Users read their own memory photos" on storage.objects;
create policy "Users read their own memory photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users add their own memory photos" on storage.objects;
create policy "Users add their own memory photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update their own memory photos" on storage.objects;
create policy "Users update their own memory photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete their own memory photos" on storage.objects;
create policy "Users delete their own memory photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );