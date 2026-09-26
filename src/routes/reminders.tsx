import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataEmpty, DataError, DataLoading } from "@/components/keepdearly/DataState";
import { ReminderCard, ReminderFeature } from "@/components/keepdearly/ReminderCard";
import { useKeepDearly } from "@/lib/keepdearly-store";

export const Route = createFileRoute("/reminders")({
  head: () => ({
    meta: [
      { title: "Reminders — keepdearly" },
      {
        name: "description",
        content: "The gentle nudges ahead: birthdays, big days, and notes you attached to them.",
      },
      { property: "og:title", content: "Reminders — keepdearly" },
      {
        property: "og:description",
        content: "The gentle nudges ahead: birthdays, big days, and notes you attached to them.",
      },
    ],
  }),
  component: Reminders,
});

function Reminders() {
  const { reminders, loading, error } = useKeepDearly();

  // Only pending rows are live. Anything completed or cancelled has been dealt
  // with, so it leaves the working sections entirely and settles at the bottom.
  const active = reminders.filter((reminder) => reminder.status === "pending");
  const overdue = active.filter((reminder) => reminder.isOverdue);
  const today = active.filter((reminder) => reminder.bucket === "today");
  const week = active.filter((reminder) => reminder.bucket === "week");
  const later = active.filter((reminder) => reminder.bucket === "upcoming");
  // Newest decision first — the handled list is a small footnote, not a log.
  const handled = reminders
    .filter((reminder) => reminder.status !== "pending")
    .sort((a, b) => b.remindAt.localeCompare(a.remindAt))
    .slice(0, 5);

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-10 pt-8">
          <header className="flex flex-col gap-1">
            <span className="text-label-sm uppercase tracking-widest text-outline">reminders</span>
            <h1 className="text-headline-lg text-on-surface">Gentle nudges ahead</h1>
            <p className="text-body-md text-on-surface-variant">
              Nothing urgent — just the moments you said you&rsquo;d remember.
            </p>
          </header>

          {loading ? (
            <DataLoading />
          ) : error ? (
            <DataError />
          ) : active.length === 0 ? (
            <DataEmpty>
              Nothing scheduled yet. Keep a memory, choose a nudge, and it will wait for you here.
            </DataEmpty>
          ) : (
            <>
              {overdue.length ? (
                <section className="flex flex-col gap-4">
                  <h2 className="text-headline-sm text-on-surface-variant">Overdue</h2>
                  {overdue.map((reminder) => (
                    <ReminderFeature key={reminder.id} reminder={reminder} />
                  ))}
                </section>
              ) : null}

              {today.length ? (
                <section className="flex flex-col gap-4">
                  <h2 className="text-headline-sm text-on-surface">Today</h2>
                  {today.map((reminder) => (
                    <ReminderFeature key={reminder.id} reminder={reminder} accent />
                  ))}
                </section>
              ) : null}

              {week.length ? (
                <section className="flex flex-col gap-4">
                  <h2 className="text-headline-sm text-on-surface">This week</h2>
                  {week.map((reminder) => (
                    <ReminderFeature key={reminder.id} reminder={reminder} />
                  ))}
                </section>
              ) : null}

              {later.length ? (
                <section className="flex flex-col gap-4">
                  <h2 className="text-headline-sm text-on-surface">Further ahead</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {later.map((reminder) => (
                      <ReminderCard key={reminder.id} reminder={reminder} />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}

          {loading || error || handled.length === 0 ? null : (
            <section className="flex flex-col gap-2">
              <h2 className="text-label-sm uppercase tracking-widest text-outline">
                Already handled
              </h2>
              <ul className="flex flex-col gap-1">
                {handled.map((reminder) => (
                  <li
                    key={reminder.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-body-sm text-on-surface-variant"
                  >
                    <span className="italic">
                      {reminder.personLabel ?? reminder.title} &mdash; &ldquo;{reminder.note}&rdquo;
                    </span>
                    <span className="text-label-sm text-outline">
                      {reminder.status === "completed" ? "Done" : "Let it go"} · {reminder.timing}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
