import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
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
  const { reminders } = useKeepDearly();
  const today = reminders.filter((r) => r.bucket === "today");
  const week = reminders.filter((r) => r.bucket === "week");
  const later = reminders.filter((r) => r.bucket === "upcoming");

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
        </div>
      </AppShell>
    </RequireAuth>
  );
}
