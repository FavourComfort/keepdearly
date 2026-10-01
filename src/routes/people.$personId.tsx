import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataError, DataLoading } from "@/components/keepdearly/DataState";
import { Icon } from "@/components/keepdearly/Icon";
import { MemoryNote } from "@/components/keepdearly/MemoryCard";
import { PersonAvatar } from "@/components/keepdearly/PersonAvatar";
import { PersonEmailField } from "@/components/keepdearly/PersonEmailField";
import { ScheduledMessages } from "@/components/keepdearly/ScheduledMessages";
import { useAuth } from "@/lib/auth";
import { useKeepDearly } from "@/lib/keepdearly-store";

export const Route = createFileRoute("/people/$personId")({
  head: () => ({
    meta: [
      { title: "A person you keep close — keepdearly" },
      {
        name: "description",
        content: "Their likes, their dislikes, gift ideas and the little things they've told you.",
      },
      { property: "og:title", content: "A person you keep close — keepdearly" },
      {
        property: "og:description",
        content: "Their likes, their dislikes, gift ideas and the little things they've told you.",
      },
    ],
  }),
  component: PersonProfile,
});

function PersonProfile() {
  const { personId } = Route.useParams();
  const { personById, memoriesFor, loading, error } = useKeepDearly();
  const { profile } = useAuth();
  const person = personById(personId);
  // Phase 6B: scheduling a message is a Plus affordance. Shown as a quiet hint
  // to everyone else rather than a hidden feature — Phase 6D makes the check
  // authoritative on the server.
  const isPlus = profile?.plus_active === true;

  // Wait for the real rows before deciding this person doesn't exist, so a
  // refresh never flashes the "couldn't find them" state.
  if (loading) {
    return (
      <AppShell>
        <DataLoading />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <DataError />
      </AppShell>
    );
  }

  if (!person) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 pt-20 text-center">
          <h1 className="text-headline-lg text-on-surface">We couldn&rsquo;t find them</h1>
          <p className="text-body-md text-on-surface-variant">
            This person isn&rsquo;t kept here yet.
          </p>
          <Link to="/" className="text-label-md text-primary hover:underline">
            Back home
          </Link>
        </div>
      </AppShell>
    );
  }

  const personMemories = memoriesFor(person.id);

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-10 pt-8">
          <header className="flex flex-col items-center gap-3 text-center">
            <PersonAvatar initial={person.initial} tone={person.tone} size="lg" />
            <div className="flex flex-col gap-1">
              <h1 className="text-headline-xl text-on-surface">{person.name}</h1>
              {person.relationship ? (
                <span className="text-body-md italic text-on-surface-variant">
                  {person.relationship}
                </span>
              ) : null}
            </div>
            {person.birthday ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-1 text-label-md text-on-surface-variant">
                <Icon name="cake" className="text-[16px] text-primary" />
                {person.birthday}
                {person.birthdayIn ? ` · ${person.birthdayIn}` : ""}
              </span>
            ) : null}
            <Link
              to="/capture"
              search={{ person: person.id }}
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2.5 text-label-md text-on-primary-container shadow-sm transition-all hover:bg-primary hover:text-on-primary active:scale-95"
            >
              <Icon name="add" className="text-[16px]" />
              Keep something about {person.name}
            </Link>
            {/* Phase 6B entry point. Plus users get the real action; everyone
                else sees a quiet mention of it rather than nothing at all. */}
            {isPlus && person.email ? (
              <Link
                to="/people/$personId/message"
                params={{ personId: person.id }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-label-md text-on-primary shadow-sm transition-all hover:bg-tertiary active:scale-95"
              >
                <Icon name="schedule_send" className="text-[16px]" />
                Send a message later
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1.5 text-label-sm text-on-primary-fixed-variant">
                <Icon name="workspace_premium" filled className="text-[14px]" />
                Send a message later — with Plus
              </span>
            )}
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-title-md text-on-surface">
                <Icon name="favorite" filled className="text-[16px] text-primary" />
                Loves
              </h2>
              <div className="flex flex-wrap gap-2">
                {person.likes.length ? (
                  person.likes.map((like) => (
                    <span
                      key={like}
                      className="rounded-full bg-primary-fixed px-3 py-1 text-label-sm text-on-primary-fixed-variant"
                    >
                      {like}
                    </span>
                  ))
                ) : (
                  <span className="text-body-sm text-outline">Nothing kept yet.</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-title-md text-on-surface">
                <Icon name="do_not_disturb_on" className="text-[16px] text-on-surface-variant" />
                Rather not
              </h2>
              <div className="flex flex-wrap gap-2">
                {person.dislikes.length ? (
                  person.dislikes.map((dislike) => (
                    <span
                      key={dislike}
                      className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm text-on-surface-variant"
                    >
                      {dislike}
                    </span>
                  ))
                ) : (
                  <span className="text-body-sm text-outline">Nothing kept yet.</span>
                )}
              </div>
            </div>
          </section>

          {person.giftIdeas.length ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-headline-sm text-on-surface">Gift ideas</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {person.giftIdeas.map((idea) => (
                  <div
                    key={idea.title}
                    className="flex flex-col gap-1 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Icon name={idea.icon} className="text-[22px] text-primary" />
                    <span className="mt-1 text-title-sm text-on-surface">{idea.title}</span>
                    <span className="text-body-sm text-on-surface-variant">{idea.note}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="text-headline-sm text-on-surface">Little things you&rsquo;ve kept</h2>
            {personMemories.length ? (
              <div className="flex flex-col gap-4">
                {personMemories.map((memory) => (
                  <MemoryNote key={memory.id} memory={memory} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-surface-container-low p-6 text-body-md italic text-on-surface-variant">
                Nothing kept about {person.name} yet — the next small thing they say can live here.
              </p>
            )}
          </section>

          {/* Phase 6B: where a message would go, and what is already queued. */}
          <section className="flex flex-col gap-4">
            <h2 className="text-headline-sm text-on-surface">Send a message</h2>
            <PersonEmailField personId={person.id} personName={person.name} />
            <ScheduledMessages personId={person.id} personName={person.name} />
          </section>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
