import { Link } from "@tanstack/react-router";
import type { Reminder, Tone } from "@/lib/keepdearly-data";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

const chipTone: Record<Tone, string> = {
  primary: "bg-primary-fixed/70 text-on-primary-fixed-variant",
  secondary: "bg-secondary-fixed text-on-secondary-fixed-variant",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

/** Small "coming up" card, used on Home and in the Reminders upcoming grid. */
export function ReminderCard({ reminder }: { reminder: Reminder }) {
  return (
    <article className="flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-title-md text-on-surface">{reminder.title}</span>
            <span className="mt-0.5 text-label-sm text-on-surface-variant">{reminder.timing}</span>
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
    </article>
  );
}

/** Featured reminder card with the note highlight, used for today / this week. */
export function ReminderFeature({
  reminder,
  accent,
}: {
  reminder: Reminder;
  accent?: boolean;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {accent ? <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-primary-container" /> : null}
      <div className={cn("flex flex-col gap-4", accent && "pl-1")}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-headline-sm text-on-surface">{reminder.title}</span>
            <span className="mt-1 flex items-center gap-1 text-label-md font-medium text-primary">
              <Icon name="schedule" className="text-[16px]" />
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
      </div>
    </article>
  );
}
