import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataNotice } from "@/components/keepdearly/DataState";
import { Icon } from "@/components/keepdearly/Icon";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { useKeepDearly } from "@/lib/keepdearly-store";
import {
  AVATAR_ACCEPT,
  AVATAR_TOO_LARGE_MESSAGE,
  AVATAR_WRONG_TYPE_MESSAGE,
  MAX_AVATAR_BYTES,
  isSupportedAvatar,
} from "@/lib/person-photo";

export const Route = createFileRoute("/people/new")({
  head: () => ({
    meta: [
      { title: "Add someone — keepdearly" },
      { name: "description", content: "Keep the people who matter close." },
      { property: "og:title", content: "Add someone — keepdearly" },
      { property: "og:description", content: "Keep the people who matter close." },
    ],
  }),
  component: NewPerson,
});

/**
 * Add someone, on their own.
 *
 * This is the standalone way into the people collection — it used to be a tile
 * that quietly opened "Keep a memory", which asked for words before it had even
 * asked who the person was. A name is all that is required; a photo is a lovely
 * extra and never a condition.
 *
 * It writes through the same `savePerson` the inline "or add someone new…" field
 * inside the memory composer uses, so there is exactly one person model and one
 * creation path however you arrive here.
 *
 * A plain browser file input sits behind the photo button, so Android, iOS and
 * desktop all open the picker people already know. No `capture` attribute, which
 * would skip the choices they expect.
 */
function NewPerson() {
  const navigate = useNavigate();
  const { savePerson } = useKeepDearly();

  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && !saving;

  function openPicker() {
    // Clearing first means choosing the same file twice still fires `change` —
    // exactly what someone does when they change their mind.
    if (fileInput.current) fileInput.current.value = "";
    fileInput.current?.click();
  }

  function accept(next: File | undefined) {
    setProblem(null);
    if (!next) return;
    if (!isSupportedAvatar(next)) {
      setProblem(AVATAR_WRONG_TYPE_MESSAGE);
      return;
    }
    if (next.size > MAX_AVATAR_BYTES) {
      setProblem(AVATAR_TOO_LARGE_MESSAGE);
      return;
    }
    // The previous object URL is released here, so choosing a second photo never
    // leaves the first blob alive.
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(next);
    setPreview(URL.createObjectURL(next));
  }

  function clearPhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPhoto(null);
    setProblem(null);
  }

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    const result = await savePerson({ name: trimmed, photo });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // Straight to them. The person is already in the store — saving reloads it —
    // so their portrait, memories and reminders are one tap away.
    if (result.personId) {
      await navigate({ to: "/people/$personId", params: { personId: result.personId } });
      return;
    }
    await navigate({ to: "/people" });
  }

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-8 pt-8">
          <header className="flex flex-col gap-3">
            <Link
              to="/people"
              className="inline-flex w-fit items-center gap-1 text-label-md text-primary hover:underline"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              People you keep close
            </Link>
            <div className="flex flex-col gap-1">
              <h1 className="text-headline-lg text-on-surface">Add someone</h1>
              <p className="text-body-md text-on-surface-variant">
                Keep the people who matter close.
              </p>
            </div>
          </header>

          <section className="flex flex-col gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {/* The same 96px box either way, so the row never jumps when a
                  photo is chosen or removed. */}
              <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-fixed text-headline-md text-primary shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="The photo you picked"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon name="person" className="text-[36px]" />
                )}
              </span>

              <div className="flex min-w-0 flex-col items-start gap-2">
                {/* Visually hidden but still a real input: iOS opens the picker
                    more reliably from a rendered element than a display:none one. */}
                <input
                  ref={fileInput}
                  type="file"
                  accept={AVATAR_ACCEPT}
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(event) => accept(event.target.files?.[0])}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={openPicker}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-label-md transition-all hover:bg-surface-container hover:text-on-surface"
                >
                  <Icon name="add_photo_alternate" className="text-[16px]" />
                  {preview ? "Change photo" : "Add photo"}
                </button>
                {preview ? (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="inline-flex items-center gap-1.5 px-1 text-label-sm text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    <Icon name="close" className="text-[14px]" />
                    Remove photo
                  </button>
                ) : (
                  <span className="text-label-sm text-outline">Optional</span>
                )}
              </div>
            </div>

            {problem ? (
              <p role="alert" className="text-label-sm text-error">
                {problem}
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <label htmlFor="person-name" className="text-title-sm text-on-surface">
                Name
              </label>
              <input
                id="person-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleSave();
                }}
                placeholder="Who is it?"
                autoComplete="off"
                className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-lg text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
              />
            </div>

            {error ? <DataNotice tone="error">{error}</DataNotice> : null}

            <PrimaryButton
              onClick={() => void handleSave()}
              disabled={!canSave}
              className={canSave ? undefined : "opacity-50"}
            >
              <Icon name="person_add" className="text-[18px]" />
              {saving ? "Adding…" : "Add person"}
            </PrimaryButton>
          </section>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
