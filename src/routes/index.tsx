import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataEmpty, DataError, DataLoading } from "@/components/keepdearly/DataState";
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
  const { memories, people, reminders, loading, error } = useKeepDearly();
  // "Coming up" means coming up. A reminder you already marked done, let go, or
  // simply never got to is not coming up, and neither is yesterday's.
  const upcoming = reminders
    .filter((reminder) => reminder.status === "pending" && !reminder.isOverdue)
    .slice(0, 2);

  return (
    <RequireAuth>
      <AppShell>
        <section className="flex flex-col items-center gap-3 pt-8 text-center sm:pt-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
            <Icon name="favorite" filled className="text-[14px]" />
            the little things that actually matter
          </span>
          <h1 className="max-w-xl text-headline-lg leading-tight text-on-surface">
            Know something today that&rsquo;s worth remembering later?
          </h1>
          <p className="max-w-md text-body-md text-on-surface-variant">
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
          <Link
            to="/plus"
            className="group mt-2 flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-4 text-left transition-colors hover:bg-surface-container-low sm:px-5"
          >
            <span className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <Icon name="schedule" className="text-[18px]" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-label-sm text-on-surface-variant">KeepDearly Plus</span>
                <span className="text-title-sm text-on-surface">
                  Let KeepDearly remember for you.
                </span>
                <span className="text-body-sm text-on-surface-variant">
                  Write a message today. We&rsquo;ll send it when the moment comes.
                </span>
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-label-sm text-on-surface-variant">UGX 2,000 once</span>
              <span className="inline-flex items-center gap-1 text-label-md font-medium text-primary">
                Learn more
                <Icon
                  name="arrow_forward"
                  className="text-[16px] transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        </section>

        {loading ? (
          <DataLoading />
        ) : error ? (
          <DataError />
        ) : (
          <>
            <section className="mt-10 flex flex-col gap-4 sm:mt-12">
              <h2 className="text-headline-sm text-on-surface">Recently kept</h2>
              {memories.length ? (
                // A dense collection rather than a tall stack: one column of
                // compact rows on a phone, two on a tablet, three on a desktop —
                // so several recent keeps are visible at once.
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {memories.slice(0, 6).map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </div>
              ) : (
                <DataEmpty>
                  Nothing kept yet. Capture the first small thing someone tells you.
                </DataEmpty>
              )}
            </section>

            <section className="mt-10 flex flex-col gap-4 sm:mt-12">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-headline-sm text-on-surface">People you keep close</h2>
                {people.length ? (
                  <Link to="/people" className="text-label-md text-primary hover:underline">
                    See all
                  </Link>
                ) : null}
              </div>
              {people.length ? (
                // A portrait rail, not a grid of cards: a quiet row of the first few
                // people. Home deliberately shows only the first five — "See all" is
                // where everybody else lives. The negative margin lets the rail
                // reach the screen edge on a phone while the page itself never
                // scrolls sideways.
                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                  {people.slice(0, 5).map((person) => (
                    <PersonCard key={person.id} person={person} variant="rail" />
                  ))}
                  {/* The one affordance at the end of the rail. It is not a person,
                    so it never changes the "first five" rule above. */}
                  <Link
                    to="/capture"
                    className="flex w-[76px] shrink-0 flex-col items-center gap-2 rounded-2xl text-center"
                    title="Keep a memory and add someone"
                  >
                    <span className="flex h-[70px] w-[70px] items-center justify-center rounded-2xl border border-dashed border-outline-variant text-primary transition-colors hover:bg-surface-container-low">
                      <Icon name="add" className="text-[22px]" />
                    </span>
                    <span className="w-full truncate text-label-md text-on-surface-variant">
                      Add
                    </span>
                  </Link>
                </div>
              ) : (
                <DataEmpty>
                  Nobody kept close yet. Add a person while you capture, and they will appear here.
                </DataEmpty>
              )}
            </section>

            <section className="mt-10 flex flex-col gap-4 sm:mt-12">
              <div className="flex items-baseline justify-between">
                <h2 className="text-headline-sm text-on-surface">Coming up</h2>
                <Link to="/reminders" className="text-label-md text-primary hover:underline">
                  See all reminders
                </Link>
              </div>
              {upcoming.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcoming.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </div>
              ) : (
                <DataEmpty>
                  Nothing scheduled yet. Keep a memory, choose a nudge, and it will wait for you
                  here.
                </DataEmpty>
              )}
            </section>
          </>
        )}
      </AppShell>
    </RequireAuth>
  );
}
