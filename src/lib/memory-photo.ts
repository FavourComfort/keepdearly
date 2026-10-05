import { getSupabase } from "./supabase";

/**
 * Photos on memories.
 *
 * One picture per memory, and that is the whole media story in KeepDearly —
 * there is no voice note, no recording control and no transcription. Keeping
 * this in one place means the composer, the store and the migration in
 * `supabase/migrations/0012_memory_photos.sql` all agree on the bucket name,
 * the size ceiling and the object path.
 *
 * The bucket is PRIVATE. Nothing is served from a public URL; the app asks
 * Supabase for a short-lived signed URL instead, so a leaked link stops working
 * within the hour and no memory photo is ever world-readable.
 *
 * Object paths are `<user_id>/<memory_id>.<ext>`. The leading folder is the
 * owner, which is what every storage policy keys off, so the browser can only
 * ever write into its own folder.
 */

/** Private bucket. Created by migration 0012. */
export const MEMORY_PHOTO_BUCKET = "memory-photos";

/** 8 MB — mirrors the bucket's own file_size_limit so the user hears it first. */
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/**
 * A plain `image/*` accept. No `capture` attribute: that would skip the
 * gallery/file choices that Android and iOS users expect, and photos are more
 * often chosen from an existing library than taken on the spot.
 */
export const PHOTO_ACCEPT = "image/*";

export const PHOTO_WRONG_TYPE_MESSAGE = "That file isn't an image.";
export const PHOTO_TOO_LARGE_MESSAGE = "That photo is over 8 MB. Try a smaller one.";

/** True when the browser handed us something the bucket will actually take. */
export function isSupportedPhoto(file: File): boolean {
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

/** Where one memory's photo lives. The first segment must be the owner id. */
export function memoryPhotoPath(userId: string, memoryId: string, file: File): string {
  return `${userId}/${memoryId}${extensionFor(file)}`;
}

/**
 * Uploads one photo against the memory's own id.
 *
 * Returns the object path to store on the row. Throws on failure — the caller
 * decides what that means, because by then the memory itself already exists.
 */
export async function uploadMemoryPhoto(
  userId: string,
  memoryId: string,
  file: File,
): Promise<string> {
  const path = memoryPhotoPath(userId, memoryId, file);

  const { error } = await getSupabase()
    .storage.from(MEMORY_PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error(error.message);
  return path;
}

/** Best-effort cleanup, used when an upload succeeded but attaching it did not. */
export async function deleteMemoryPhoto(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(MEMORY_PHOTO_BUCKET).remove([path]);
  if (error) console.error("Could not remove memory photo:", error.message);
}

/**
 * A short-lived URL for display, or null when there is nothing to show.
 *
 * Resolved once per load rather than per render: signing is a network round
 * trip, and a signed URL that expires within the hour is refreshed by the next
 * load (the 60s store tick) rather than by every component.
 */
export async function signedMemoryPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .storage.from(MEMORY_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error) {
    console.error("Could not sign memory photo:", error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}
