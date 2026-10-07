import { useEffect, useRef, useState } from "react";

import { Icon } from "./Icon";
import {
  MAX_PHOTO_BYTES,
  PHOTO_ACCEPT,
  PHOTO_TOO_LARGE_MESSAGE,
  PHOTO_WRONG_TYPE_MESSAGE,
  isSupportedPhoto,
} from "@/lib/memory-photo";

/**
 * The composer's writing surface.
 *
 * The one attachment KeepDearly offers is a photo, chosen through a normal
 * browser file input behind the button. Android, iOS and desktop therefore
 * open the picker the user already knows — gallery, camera roll, files — with
 * no bespoke upload screen, no desktop-only drag-and-drop, and nothing to
 * install.
 *
 * There is deliberately no voice note here and no recording control: a button
 * that recorded nothing was worse than no button at all. Whisper is gone rather
 * than disabled.
 *
 * The preview is a local object URL at a fixed size, so a 12-megapixel original
 * cannot shove the composer around while it loads, and the blob is revoked the
 * moment it is replaced or the composer unmounts.
 */
export function MemoryInput({
  value,
  onChange,
  photo,
  onPhotoChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  photo?: File | null | undefined;
  onPhotoChange?: ((file: File | null) => void) | undefined;
  placeholder?: string | undefined;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  // Let the surface start compact and grow with the words, so a short note
  // never sits in a tall empty rectangle.
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function openPicker() {
    // Clearing the value first means picking the same file twice still fires
    // `change` — which is exactly what someone does when they change their mind.
    if (fileInput.current) fileInput.current.value = "";
    fileInput.current?.click();
  }

  function accept(next: File | undefined) {
    setProblem(null);
    if (!next) return;
    if (!isSupportedPhoto(next)) {
      setProblem(PHOTO_WRONG_TYPE_MESSAGE);
      return;
    }
    if (next.size > MAX_PHOTO_BYTES) {
      setProblem(PHOTO_TOO_LARGE_MESSAGE);
      return;
    }
    onPhotoChange?.(next);
  }

  function clearPhoto() {
    setProblem(null);
    onPhotoChange?.(null);
  }

  const length = value.trim().length;

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-5 py-4 transition-colors focus-within:border-primary/40 sm:px-6 sm:py-5">
      <label className="sr-only" htmlFor="memory-input">
        Memory content
      </label>
      <textarea
        id="memory-input"
        ref={areaRef}
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ??
          "Sarah mentioned she loves vanilla perfume and can never find a miniature rollerball to carry in her bag…"
        }
        className="max-h-80 w-full resize-none overflow-y-auto bg-transparent text-quote-body leading-relaxed text-on-surface outline-none placeholder:font-normal placeholder:text-outline-variant/70"
      />

      {preview ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-container-low p-2.5">
          <img
            src={preview}
            alt="The photo picked for this memory"
            className="h-16 w-16 shrink-0 rounded-xl object-cover"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-label-md text-on-surface">Photo attached</span>
            <span className="truncate text-label-sm text-on-surface-variant">{photo?.name}</span>
          </span>
          <button
            type="button"
            onClick={clearPhoto}
            aria-label="Remove the photo"
            title="Remove the photo"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ) : null}

      {problem ? (
        <p role="alert" className="mt-3 text-label-sm text-error">
          {problem}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-3 text-on-surface-variant">
        {/* Visually hidden but still a real input, because iOS opens the picker
            more reliably from a rendered element than a display:none one. The
            button below is the accessible control. */}
        <input
          ref={fileInput}
          type="file"
          accept={PHOTO_ACCEPT}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => accept(event.target.files?.[0])}
          className="sr-only"
        />
        <button
          type="button"
          onClick={openPicker}
          className="flex items-center gap-1.5 rounded-full px-1 py-1 text-label-md text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Icon name="add" className="text-[18px]" />
          <span>{preview ? "Change photo" : "Add photo"}</span>
        </button>
        {length > 0 ? (
          <span className="text-label-sm text-outline" aria-live="polite">
            {length} character{length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
