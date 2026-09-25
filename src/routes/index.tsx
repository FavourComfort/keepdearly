import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { Icon } from "@/components/keepdearly/Icon";
import { MemoryCard } from "@/components/keepdearly/MemoryCard";
import { PersonCard } from "@/components/keepdearly/PersonCard";
import { ReminderCard } from "@/components/keepdearly/ReminderCard";
import { useKeepDearly } from "@/lib/keepdearly-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "keepdearly — the little things that actually matter" },
      {
        name: "description",
        content:
          "A quiet place to keep the small things people tell you, and a gentle nudge when they matter.",
      },
      { property: "og:title", content: "keepdearly — the little things that actually matter" },
      {
        property: "og:description",
        content:
          "A quiet place to keep the small things people tell you, and a gentle nudge when they matter.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { memories, people, reminders, memoriesFor } = useKeepDearly();
  const upcoming = reminders.slice(0, 2);

  return (
    <RequireAuth>
      <AppShell>
        <section className="flex flex-col items-center gap-4 pt-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
            <Icon name="favorite" filled className="text-[14px]" />
            the little things that actually matter
          </span>
          <h1 className="max-w-xl text-headline-xl leading-tight text-on-surface">
            Know something today that&rsquo;s worth remembering later?
          </h1>
          <p className="max-w-md text-body-lg text-on-surface-variant">
            Keep it here while it&rsquo;s fresh. We&rsquo;ll hand it back to you at the right
            moment.
          </p>
          <Link
            to="/capture"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-9 py-3.5 text-title-md text-on-primary shadow-md transition-all hover:bg-tertiary active:scale-95"
          >
            <Icon name="edit" className="text-[18px]" />
            Keep a memory
          </Link>
        </section>

        <section className="mt-14 flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-headline-sm text-on-surface">Coming up</h2>
            <Link to="/reminders" className="text-label-md text-primary hover:underline">
              See all reminders
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">People you keep close</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                memoryCount={memoriesFor(person.id).length}
              />
            ))}
          </div>
        </section>

        <section className="mt-14 flex flex-col gap-4">
          <h2 className="text-headline-sm text-on-surface">Recently kept</h2>
          <div className="flex flex-col gap-4">
            {memories.slice(0, 4).map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </section>
      </AppShell>
    </RequireAuth>
  );
}
