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

  return (
    <div className="relative rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all focus-within:shadow-md sm:p-9">
      <div className="pointer-events-none absolute bottom-4 right-4 text-primary opacity-[0.06]">
        <svg fill="currentColor" height="88" width="88" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>
      <label className="sr-only" htmlFor="memory-input">
        Memory content
      </label>
      <textarea
        id="memory-input"
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ??
          "Sarah mentioned she loves vanilla perfume and can never find a miniature rollerball to carry in her bag…"
        }
        className="w-full resize-none bg-transparent text-quote-body leading-relaxed text-on-surface outline-none placeholder:text-outline-variant/80"
      />

      {preview ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-container-low p-2.5">
          <img
            src={preview}
            alt="The photo picked for this memory"
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
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

      <div className="mt-2 flex items-center justify-between pt-4 text-on-surface-variant">
        {/* Visually hidden but still a real input, because iOS opens the picker
            more reliably from a rendered element than a display:none one. The
            button above is the accessible control. */}
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
          className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-label-md transition-all hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="add_photo_alternate" className="text-[16px]" />
          <span>{preview ? "change photo" : "photo"}</span>
        </button>
        <span className="text-label-sm text-outline">
          {value.trim() ? `${value.trim().length} characters` : "just as it is"}
        </span>
      </div>
    </div>
  );
}
