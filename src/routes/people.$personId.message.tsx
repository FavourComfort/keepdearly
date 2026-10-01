import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { RequireAuth } from "@/components/auth/guards";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataLoading, DataNotice } from "@/components/keepdearly/DataState";
import { Icon } from "@/components/keepdearly/Icon";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { isFutureMoment, remindAtForChosenDate, todayDateInputValue } from "@/lib/keepdearly-data";
import { useKeepDearly } from "@/lib/keepdearly-store";

export const Route = createFileRoute("/people/$personId/message")({
  head: () => ({
    meta: [
      { title: "Send a message later — keepdearly" },
      {
        name: "description",
        content: "Write it now, and let it arrive at the right moment.",
      },
    ],
  }),
  component: ScheduleMessage,
});

/**
 * Prepare one message for one person, to be sent at a chosen moment (Phase 6B).
 *
 * The flow is person → message → date/time → save. The recipient is fixed by
 * the route, so there is nothing to pick here: the name and their saved address
 * are shown, and the user only writes the words and chooses the moment.
 *
 * Nothing is sent by this screen. Saving leaves a row that a later server job
 * will deliver; the status simply reads "waiting to go" until then.
 */
function ScheduleMessage() {
  const { personId } = Route.useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { personById, saveScheduledMessage } = useKeepDearly();

  const person = personById(personId);
  const isPlus = profile?.plus_active === true;

  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The user picks a local date and time; this resolves them to one real moment,
  // which is what gets stored. No timezone settings anywhere.
  const chosenSendAt = date ? remindAtForChosenDate(date, time || undefined) : null;
  const dateMissing = !chosenSendAt;
  const dateInPast = !!chosenSendAt && !isFutureMoment(chosenSendAt);
  const momentInvalid = dateMissing || dateInPast;

  const trimmedBody = body.trim();
  const canSave = trimmedBody.length > 0 && !momentInvalid && !saving && !!person?.email;

  async function handleSave() {
    if (!canSave || !chosenSendAt) return;

    setSaving(true);
    setError(null);

    const result = await saveScheduledMessage({ personId, body, sendAt: chosenSendAt });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    await navigate({ to: "/people/$personId", params: { personId } });
  }

  if (!person) {
    return (
      <RequireAuth>
        <AppShell>
          <DataLoading />
        </AppShell>
      </RequireAuth>
    );
  }

  // Plus gate. This is a UI courtesy, not the security boundary — the trusted
  // check arrives in Phase 6D. The database still only ever accepts rows from
  // the signed-in owner.
  if (!isPlus) {
    return (
      <RequireAuth>
        <AppShell>
          <div className="flex flex-col items-center gap-4 pt-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
              <Icon name="workspace_premium" filled className="text-[14px]" />
              KeepDearly Plus
            </span>
            <h1 className="text-headline-lg text-on-surface">
              Send a message later is a Plus thing
            </h1>
            <p className="max-w-md text-body-md text-on-surface-variant">
              Write the message now and let it arrive on the day, without having to remember. That
              comes with Plus.
            </p>
            <button
              type="button"
              onClick={() => void navigate({ to: "/people/$personId", params: { personId } })}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-surface-container px-6 py-2.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
            >
              Back to {person.name}
            </button>
          </div>
        </AppShell>
      </RequireAuth>
    );
  }
  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6 pt-8">
          <header className="flex flex-col gap-1">
            <span className="text-label-sm uppercase tracking-widest text-outline">
              send a message later
            </span>
            <h1 className="text-headline-lg text-on-surface">Say it when the moment comes.</h1>
            <p className="text-body-md text-on-surface-variant">
              Write it now. KeepDearly sends it to {person.name} at the time you choose.
            </p>
          </header>

          <section className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-6">
            <span className="text-label-sm uppercase tracking-widest text-outline">To</span>
            <p className="text-title-md text-on-surface">{person.name}</p>
            {person.email ? (
              <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                <Icon name="mail" className="text-[14px]" />
                {person.email}
              </p>
            ) : (
              <p className="text-body-sm italic text-on-surface-variant">
                No email saved for {person.name} yet — add one on their page first.
              </p>
            )}
          </section>

          <div className="flex flex-col gap-2">
            <label htmlFor="message-body" className="text-title-md text-on-surface">
              Your message
            </label>
            <textarea
              id="message-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              placeholder="Happy birthday Sarah ❤️ I hope you have the most beautiful day…"
              className="w-full resize-y rounded-xl bg-surface-container-lowest p-4 text-body-lg text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <section className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="text-title-md text-on-surface">When should it arrive?</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="send-date" className="text-label-sm text-on-surface-variant">
                  Date
                </label>
                <input
                  id="send-date"
                  type="date"
                  value={date}
                  min={todayDateInputValue()}
                  onChange={(event) => setDate(event.target.value)}
                  className="rounded-full bg-surface-container-low px-4 py-2 text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="send-time" className="text-label-sm text-on-surface-variant">
                  Time
                </label>
                <input
                  id="send-time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="rounded-full bg-surface-container-low px-4 py-2 text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/40"
                />
              </div>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Leave the time empty and it goes out at 9:00 that morning.
            </p>
            {dateMissing ? <DataNotice>Pick the day it should arrive.</DataNotice> : null}
            {dateInPast ? (
              <DataNotice tone="error">Pick a moment that hasn&rsquo;t happened yet.</DataNotice>
            ) : null}
          </section>

          {error ? <DataNotice tone="error">{error}</DataNotice> : null}

          <PrimaryButton onClick={() => void handleSave()} disabled={!canSave}>
            {saving ? "Scheduling…" : "Schedule it"}
          </PrimaryButton>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
