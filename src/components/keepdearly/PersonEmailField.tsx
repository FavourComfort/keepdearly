import { useEffect, useState } from "react";

import { Icon } from "./Icon";
import { DataNotice } from "./DataState";
import { isReasonableEmail } from "@/lib/keepdearly-data";
import { useKeepDearly } from "@/lib/keepdearly-store";

/**
 * The person's email address (Phase 6B).
 *
 * Saved once on the person, so scheduling a message never asks for it again.
 * Optional by design: plenty of people have no address the user knows, and
 * leaving this blank is a perfectly good answer — it just means messages can't
 * be queued for them yet.
 *
 * Nothing is sent or verified here. This only remembers where a message would
 * go; whether it is reachable is the sender's problem, not this field's.
 */
export function PersonEmailField({
  personId,
  personName,
}: {
  personId: string;
  personName: string;
}) {
  const { personById, savePersonEmail, refresh } = useKeepDearly();
  const person = personById(personId);

  const [value, setValue] = useState(person?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the field in step when the store finishes its first load, so the
  // placeholder never sits under a real address (or vice versa).
  useEffect(() => {
    setValue(person?.email ?? "");
  }, [person?.email]);

  async function handleSave() {
    if (saving) return;
    const trimmed = value.trim();
    if (trimmed && !isReasonableEmail(trimmed)) {
      setError("That doesn't look like an email address.");
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    const result = await savePersonEmail(personId, value);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    await refresh();
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-title-md text-on-surface">
        <Icon name="mail" className="text-[16px] text-primary" />
        Email
      </h2>
      <p className="-mt-1 text-body-sm text-on-surface-variant">
        Where a message for {personName} would go. Optional — and never shared.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="email"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSaved(false);
            setError(null);
          }}
          placeholder="they@example.com"
          autoComplete="off"
          className="w-full flex-1 rounded-full bg-surface-container-low px-4 py-2 text-body-md text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="shrink-0 rounded-full bg-surface-container px-4 py-2 text-label-md text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {error ? <DataNotice tone="error">{error}</DataNotice> : null}
      {saved && !error ? (
        <span className="text-label-sm text-on-surface-variant">Saved.</span>
      ) : null}
    </div>
  );
}
