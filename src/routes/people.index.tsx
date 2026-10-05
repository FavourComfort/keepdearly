import { createFileRoute, Link } from "@tanstack/react-router";

import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataEmpty, DataError, DataLoading } from "@/components/keepdearly/DataState";
import { Icon } from "@/components/keepdearly/Icon";
import { PersonCard } from "@/components/keepdearly/PersonCard";
import { useKeepDearly } from "@/lib/keepdearly-store";

export const Route = createFileRoute("/people/")({
  head: () => ({
    meta: [
      { title: "People you keep close — keepdearly" },
      {
        name: "description",
        content: "Everyone you keep close, all in one quiet place.",
      },
      { property: "og:title", content: "People you keep close — keepdearly" },
      {
        property: "og:description",
        content: "Everyone you keep close, all in one quiet place.",
      },
    ],
  }),
  component: People,
});

/**
 * Everyone you keep close.
 *
 * This is the other half of the Home rail: Home shows the first five as a
 * compact portrait rail, and this page shows all of them as an airy collection
 * of circular portraits with a name underneath. Same data, same store, same
 * links — only the arrangement differs, so the two never read as the same card
 * twice.
 *
 * No cards around the people, no counts, no headlines. Just the people.
 */
function People() {
  const { people, loading, error } = useKeepDearly();

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-8 pt-8">
          <header className="flex flex-col gap-2">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-1 text-label-md text-primary hover:underline"
            >
              <Icon name="arrow_back" className="text-[16px]" />
              Home
            </Link>
            <h1 className="text-headline-lg text-on-surface">People you keep close</h1>
          </header>

          {loading ? (
            <DataLoading />
          ) : error ? (
            <DataError />
          ) : people.length ? (
            <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-5">
              {people.map((person) => (
                <PersonCard key={person.id} person={person} variant="bubble" />
              ))}

              {/* Adding a person still happens while keeping a memory — that is
                  the existing flow, and it is not redesigned here. */}
              <Link
                to="/capture"
                className="flex w-full flex-col items-center gap-2 rounded-2xl text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40"
                title="Keep a memory and add someone"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-outline-variant text-primary transition-colors hover:bg-surface-container-low md:h-24 md:w-24">
                  <Icon name="add" className="text-[26px]" />
                </span>
                <span className="w-full truncate text-title-sm text-on-surface-variant">
                  Add someone
                </span>
              </Link>
            </div>
          ) : (
            <DataEmpty>
              Nobody kept close yet. Add a person while you capture, and they will appear here.
            </DataEmpty>
          )}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
