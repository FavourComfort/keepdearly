import { getSupabase } from "./supabase";

/**
 * Profile photos for people.
 *
 * This is NOT the memory photo in `memory-photo.ts`. The two are separate on
 * purpose — different buckets, different columns, different owners:
 *
 *   people.avatar_url  -> the person
 *   memories.photo_path-> the memory
 *
 * Nothing here reads, writes or cleans up a memory photo, and the memory flow
 * does not know this module exists.
 *
 * The bucket is private. People are private to their owner, so a portrait is
 * only ever read through a short-lived signed URL rather than a permanent link.
 * Object paths are `<user_id>/<person_id>.<ext>` — the leading folder is the
 * owner, which is what the storage policies key off, so the browser can only
 * ever write into its own folder.
 */

/** Private bucket. Created by migration 0013. */
export const PERSON_AVATAR_BUCKET = "person-avatars";

/** 5 MB — mirrors the bucket's own limit so the user hears it first. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

/**
 * A plain `image/*` accept, no `capture` attribute: that would skip the
 * gallery/file choices people expect on Android and iOS.
 */
export const AVATAR_ACCEPT = "image/*";

export const AVATAR_WRONG_TYPE_MESSAGE = "That file isn't an image.";
export const AVATAR_TOO_LARGE_MESSAGE = "That photo is over 5 MB. Try a smaller one.";

/** True when the browser handed us something the bucket will actually take. */
export function isSupportedAvatar(file: File): boolean {
  return file.type.startsWith("image/");
}

/** Keeps a filename-ish extension without ever producing a path segment. */
function extensionFor(file: File): string {
  const fromType = file.type.split("/")[1]?.replace("jpeg", "jpg").replace(/\+.*$/, "");
  if (fromType && /^[a-z0-9]+$/.test(fromType)) return `.${fromType}`;

  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return `.${fromName}`;

  return ".bin";
}

/** Where one person's portrait lives. The first segment is the owner id. */
export function personAvatarPath(userId: string, personId: string, file: File): string {
  return `${userId}/${personId}${extensionFor(file)}`;
}

/**
 * Uploads one portrait against the person's own id.
 *
 * Returns the object path to store on `people.avatar_url`. Throws on failure —
 * by then the person row already exists, so the caller decides what that means.
 */
export async function uploadPersonAvatar(
  userId: string,
  personId: string,
  file: File,
): Promise<string> {
  const path = personAvatarPath(userId, personId, file);

  const { error } = await getSupabase()
    .storage.from(PERSON_AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(error.message);
  return path;
}

/** Best-effort cleanup, used when an upload succeeded but attaching it did not. */
export async function deletePersonAvatar(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(PERSON_AVATAR_BUCKET).remove([path]);
  if (error) console.error("Could not remove person avatar:", error.message);
}

/**
 * A short-lived URL for display, or null when there is nothing to show.
 *
 * Resolved once per load alongside the memory photos rather than per render:
 * signing is a network round trip, and a URL that expires within the hour is
 * refreshed by the next load.
 */
export async function signedPersonAvatarUrl(path: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .storage.from(PERSON_AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    console.error("Could not sign person avatar:", error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}
