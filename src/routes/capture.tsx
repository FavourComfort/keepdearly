import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { Icon } from "@/components/keepdearly/Icon";
import { MemoryInput } from "@/components/keepdearly/MemoryInput";
import { PersonAvatar } from "@/components/keepdearly/PersonAvatar";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { ReminderSelector } from "@/components/keepdearly/ReminderSelector";
import { useKeepDearly } from "@/lib/keepdearly-store";
import { cn } from "@/lib/utils";

type CaptureSearch = { person?: string | undefined };

export const Route = createFileRoute("/capture")({
  validateSearch: (search: Record<string, unknown>): CaptureSearch => ({
    person: typeof search["person"] === "string" ? (search["person"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Keep a memory — keepdearly" },
      {
        name: "description",
        content: "Write down the small thing someone told you, while it's still fresh.",
      },
      { property: "og:title", content: "Keep a memory — keepdearly" },
      {
        property: "og:description",
        content: "Write down the small thing someone told you, while it's still fresh.",
      },
    ],
  }),
  component: Capture,
});

function Capture() {
  const { person: initialPerson } = Route.useSearch();
  const navigate = useNavigate();
  const { people, addMemory, addPerson, personById } = useKeepDearly();

  const [text, setText] = useState("");
  const [personId, setPersonId] = useState<string | undefined>(initialPerson);
  const [newName, setNewName] = useState("");
  const [reminder, setReminder] = useState("none");

  const canSave = text.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    let id = personId;
    if (!id && newName.trim()) {
      id = addPerson(newName).id;
    }
    const person = id ? personById(id) : undefined;
    addMemory({
      text: text.trim(),
      personId: id,
      personLabel: person?.name,
      tone: person?.tone ?? "neutral",
    });
    navigate({ to: id ? "/people/$personId" : "/", params: { personId: id ?? "" } });
  }

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6 pt-8">
          <header className="flex flex-col gap-1">
            <span className="text-label-sm uppercase tracking-widest text-outline">
              keep a memory
            </span>
            <h1 className="text-headline-lg text-on-surface">What&rsquo;s worth remembering?</h1>
            <p className="text-body-md text-on-surface-variant">
              Just as they said it. You can attach a person later, or never.
            </p>
          </header>

          <MemoryInput value={text} onChange={setText} />

          <section className="flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="text-title-md text-on-surface">Who is this about?</h2>
            <p className="-mt-2 text-body-sm text-on-surface-variant">
              Optional — leave it as a personal note.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPersonId(undefined)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-label-md transition-all",
                  !personId
                    ? "bg-primary-container text-on-primary-container shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                )}
              >
                <Icon name="self_improvement" className="text-[16px]" />
                Just me
              </button>
              {people.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => setPersonId(person.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-label-md transition-all",
                    personId === person.id
                      ? "bg-primary-container text-on-primary-container shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                  )}
                >
                  <PersonAvatar
                    initial={person.initial}
                    tone={person.tone}
                    size="sm"
                    className="h-7 w-7 text-[12px]"
                  />
                  {person.name}
                </button>
              ))}
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-1.5">
              <Icon name="person_add" className="text-[16px] text-outline" />
              <input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (e.target.value) setPersonId(undefined);
                }}
                placeholder="or add someone new…"
                className="w-full bg-transparent text-label-md text-on-surface outline-none placeholder:text-outline"
              />
            </div>
          </section>

          <section className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="text-title-md text-on-surface">Nudge me about it</h2>
            <p className="-mt-1 text-body-sm text-on-surface-variant">
              A quiet reminder, only if you want one.
            </p>
            <ReminderSelector value={reminder} onChange={setReminder} />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <span className="text-label-sm text-outline">Kept privately on this device.</span>
            <PrimaryButton
              onClick={handleSave}
              disabled={!canSave}
              className={cn(!canSave && "opacity-50")}
            >
              <Icon name="favorite" filled className="text-[18px]" />
              Keep it
            </PrimaryButton>
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
