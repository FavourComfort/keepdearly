import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Reminder, Tone } from "@/lib/keepdearly-data";
import { isFutureMoment, remindAtForChosenDate, todayDateInputValue } from "@/lib/keepdearly-data";
import { useKeepDearly } from "@/lib/keepdearly-store";
import { DataNotice } from "./DataState";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

const chipTone: Record<Tone, string> = {
  primary: "bg-primary-fixed/70 text-on-primary-fixed-variant",
  secondary: "bg-secondary-fixed text-on-secondary-fixed-variant",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

/**
 * The three quiet things you can do about a nudge.
 *
 * These are small text buttons — not checkboxes, swipes or a task manager. A
 * reminder here is a memory someone wanted to be handed back, so the actions
 * read the same way: "Done", "Let it go", "Reschedule".
 *
 * Reschedule is a plain date and time pair that unfolds in place. Still no
 * calendar — two inputs name any moment just as well.
 */
export function ReminderActions({ reminder }: { reminder: Reminder }) {
  const { completeReminder, cancelReminder, rescheduleReminder } = useKeepDearly();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Failures are surfaced, never swallowed — a silently ignored "Done" is worse
  // than no button at all, because the nudge would come back around.
  async function run(action: () => Promise<{ ok: boolean; error: string | null }>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) setError(result.error ?? "That didn't work just now.");
  }

  function startReschedule() {
    setDate(todayDateInputValue());
    setTime("");
    setError(null);
    setEditing(true);
  }

  function saveReschedule() {
    const next = remindAtForChosenDate(date, time);
    if (!next || !isFutureMoment(next)) {
      setError("Pick a moment that hasn't happened yet.");
      return;
    }
    void run(async () => {
      const result = await rescheduleReminder(reminder.id, next);
      if (result.ok) setEditing(false);
      return result;
    });
  }

  const quietButton =
    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50";

  if (editing) {
    return (
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex flex-wrap items-end gap-2 rounded-lg bg-surface-container-low p-3">
          <label className="sr-only" htmlFor={`reschedule-date-${reminder.id}`}>
            New day
          </label>
          <input
            id={`reschedule-date-${reminder.id}`}
            type="date"
            value={date}
            min={todayDateInputValue()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg bg-surface-container-lowest px-3 py-1.5 text-body-sm text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <label className="sr-only" htmlFor={`reschedule-time-${reminder.id}`}>
            New time, optional
          </label>
          <input
            id={`reschedule-time-${reminder.id}`}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg bg-surface-container-lowest px-3 py-1.5 text-body-sm text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={saveReschedule}
            disabled={busy}
            className="rounded-full bg-primary px-4 py-1.5 text-label-md text-on-primary shadow-sm transition-all hover:bg-tertiary disabled:opacity-50"
          >
            {busy ? "Moving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={busy}
            className={quietButton}
          >
            Keep as is
          </button>
        </div>
        {error ? <DataNotice tone="error">{error}</DataNotice> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 pt-1">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => void run(() => completeReminder(reminder.id))}
          disabled={busy}
          className={quietButton}
        >
          <Icon name="check" className="text-[16px]" />
          Done
        </button>
        <button
          type="button"
          onClick={() => void run(() => cancelReminder(reminder.id))}
          disabled={busy}
          className={quietButton}
        >
          <Icon name="not_interested" className="text-[16px]" />
          Let it go
        </button>
        <button type="button" onClick={startReschedule} disabled={busy} className={quietButton}>
          <Icon name="event_repeat" className="text-[16px]" />
          Reschedule
        </button>
      </div>
      {error ? <DataNotice tone="error">{error}</DataNotice> : null}
    </div>
  );
}

/** Small "coming up" card, used on Home and in the Reminders upcoming grid. */
export function ReminderCard({ reminder }: { reminder: Reminder }) {
  const isOverdue = reminder.isOverdue;
  return (
    <article className="flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-title-md text-on-surface">{reminder.title}</span>
            <span
              className={cn(
                "mt-0.5 text-label-sm text-on-surface-variant",
                isOverdue && "text-error",
              )}
            >
              {isOverdue ? "Overdue · " : ""}
              {reminder.timing}
            </span>
          </div>
          {reminder.personLabel ? (
            <span
              className={cn(
                "shrink-0 rounded-full px-4 py-0.5 text-label-sm",
                chipTone[reminder.tone],
              )}
            >
              {reminder.personLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-1 rounded-lg bg-surface-container-low p-2">
          <p className="text-body-sm italic text-on-surface">You noted: “{reminder.note}”</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-on-surface-variant">
        <span className="text-label-sm text-secondary">{reminder.meta}</span>
        {reminder.personId ? (
          <Link
            to="/people/$personId"
            params={{ personId: reminder.personId }}
            className="transition-colors hover:text-primary"
            aria-label={`Open ${reminder.personLabel}'s profile`}
          >
            <Icon name="edit_note" className="text-[20px]" />
          </Link>
        ) : (
          <Icon name="edit_note" className="text-[20px]" />
        )}
      </div>
      <ReminderActions reminder={reminder} />
    </article>
  );
}

/** Featured reminder card with the note highlight, used for today / this week. */
export function ReminderFeature({ reminder, accent }: { reminder: Reminder; accent?: boolean }) {
  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {accent ? (
        <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary-container" />
      ) : null}
      <div className={cn("flex flex-col gap-4", accent && "pl-1")}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-headline-sm text-on-surface">{reminder.title}</span>
            <span className="mt-1 flex items-center gap-1 text-label-md font-medium text-primary">
              <Icon name={reminder.isOverdue ? "history" : "schedule"} className="text-[16px]" />
              {reminder.isOverdue ? "Overdue · " : ""}
              {reminder.timing}
            </span>
          </div>
          {reminder.meta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-label-sm",
                chipTone[reminder.tone],
              )}
            >
              <Icon name="favorite" filled className="text-[14px]" />
              <span>{reminder.meta}</span>
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-surface-container-low p-4">
          <span className="flex items-center gap-2 text-label-sm font-semibold uppercase tracking-wider text-primary">
            <Icon name="bookmark_added" className="text-[16px]" />
            Attached note highlight
          </span>
          <p className="text-body-md italic text-on-surface">You noted: “{reminder.note}”</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {reminder.personId ? (
            <Link
              to="/people/$personId"
              params={{ personId: reminder.personId }}
              className="rounded-full bg-primary-container px-4 py-1.5 text-label-md text-on-primary-container shadow-sm transition-all hover:bg-primary hover:text-on-primary"
            >
              View {reminder.personLabel}'s profile
            </Link>
          ) : null}
          <Link
            to="/capture"
            search={{ person: reminder.personId }}
            className="rounded-full bg-surface-container-high px-4 py-1.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
          >
            Add a gift note
          </Link>
        </div>
        <ReminderActions reminder={reminder} />
      </div>
    </article>
  );
}
