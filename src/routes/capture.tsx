import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { DataNotice } from "@/components/keepdearly/DataState";
import { Icon } from "@/components/keepdearly/Icon";
import { MemoryInput } from "@/components/keepdearly/MemoryInput";
import { PersonAvatar } from "@/components/keepdearly/PersonAvatar";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { ReminderSelector } from "@/components/keepdearly/ReminderSelector";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isFutureMoment, remindAtForChosenDate, reminderTiming } from "@/lib/keepdearly-data";
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
  const { people, saveMemory } = useKeepDearly();

  const [text, setText] = useState("");
  const [personId, setPersonId] = useState<string | undefined>(initialPerson);
  const [newName, setNewName] = useState("");
  // "See all" is a sheet rather than a page: the words already written in this
  // composer are never unmounted, so they are still here when a person is picked.
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [reminder, setReminder] = useState("none");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  // The one optional attachment. It travels with the memory through a single
  // "Keep it", so the user never sees an upload step of their own.
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Choose date" only counts as chosen once it names a moment that hasn't
  // happened yet. The memory itself is always allowed to be kept.
  const chosenRemindAt =
    reminder === "date" ? remindAtForChosenDate(reminderDate, reminderTime) : null;
  const dateMissing = reminder === "date" && chosenRemindAt === null;
  const dateInPast =
    reminder === "date" && chosenRemindAt !== null && !isFutureMoment(chosenRemindAt);
  const reminderInvalid = dateMissing || dateInPast;

  const canSave = text.trim().length > 0 && !saving && !reminderInvalid;

  // The composer shows at most five people so it can never become a wall of
  // chips as the collection grows. `people` arrives in a stable created_at
  // order from the store, so the same five come back every time — nothing here
  // shuffles between renders.
  //
  // If the chosen person sits outside those five they are shown anyway, because
  // a selection you cannot see is worse than one that breaks the tidy row.
  const featuredPeople = people.slice(0, 5);
  const chosenOutside = personId ? people.find((person) => person.id === personId) : undefined;
  const visiblePeople =
    chosenOutside && !featuredPeople.some((person) => person.id === chosenOutside.id)
      ? [chosenOutside, ...featuredPeople.slice(0, 4)]
      : featuredPeople;

  // Search only appears once there is enough to be worth searching.
  const trimmedQuery = query.trim().toLowerCase();
  const matchingPeople = trimmedQuery
    ? people.filter((person) => person.name.toLowerCase().includes(trimmedQuery))
    : people;

  async function handleSave() {
    if (!canSave) return;

    setSaving(true);
    setError(null);

    const result = await saveMemory({
      content: text,
      personId,
      newPersonName: newName,
      reminderOption: reminder,
      reminderDate,
      reminderTime,
      photo,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await navigate({
      to: result.personId ? "/people/$personId" : "/",
      params: { personId: result.personId ?? "" },
    });
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

          <MemoryInput value={text} onChange={setText} photo={photo} onPhotoChange={setPhoto} />

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
              {visiblePeople.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    setPersonId(person.id);
                    setNewName("");
                  }}
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
                    photoUrl={person.avatarUrl}
                    className="h-7 w-7 text-[12px]"
                  />
                  {person.name}
                </button>
              ))}
              {people.length > 5 ? (
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  className="flex items-center gap-1.5 rounded-full border border-outline-variant/50 px-3.5 py-1.5 text-label-md text-primary transition-all hover:bg-surface-container-low"
                >
                  See all ({people.length})
                </button>
              ) : null}
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
            <Link
              to="/people/new"
              className="mt-1 w-fit text-label-sm text-primary hover:underline"
              title="Add someone with a photo"
            >
              Add someone with a photo
            </Link>
          </section>

          {/* The full people picker. A sheet, not a page, precisely so the
              memory being written is never unmounted: pick someone, close, and
              keep typing. */}
          <Sheet open={picking} onOpenChange={setPicking}>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] overflow-y-auto sm:mx-auto sm:max-w-lg sm:rounded-2xl"
            >
              <SheetHeader>
                <SheetTitle className="text-title-md text-on-surface">
                  Who is this about?
                </SheetTitle>
                <SheetDescription className="text-body-sm text-on-surface-variant">
                  Your words stay exactly where you left them.
                </SheetDescription>
              </SheetHeader>

              {people.length > 8 ? (
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search people…"
                  aria-label="Search people"
                  className="mb-2 w-full rounded-full bg-surface-container-low px-4 py-2.5 text-body-md text-on-surface outline-none placeholder:text-outline focus:ring-1 focus:ring-primary/40"
                />
              ) : null}

              <div className="flex flex-col gap-1 pb-6">
                {matchingPeople.length ? (
                  matchingPeople.map((person) => {
                    const selected = personId === person.id;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          setPersonId(person.id);
                          setNewName("");
                          setPicking(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-full px-3 py-2 text-left text-body-md transition-colors",
                          selected
                            ? "bg-primary-container text-on-primary-container"
                            : "text-on-surface hover:bg-surface-container-low",
                        )}
                      >
                        <PersonAvatar
                          initial={person.initial}
                          tone={person.tone}
                          size="sm"
                          photoUrl={person.avatarUrl}
                        />
                        <span className="truncate">{person.name}</span>
                        {selected ? <Icon name="check" className="ml-auto text-[18px]" /> : null}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-body-sm italic text-on-surface-variant">
                    Nobody by that name yet.
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <section className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="text-title-md text-on-surface">Nudge me about it</h2>
            <p className="-mt-1 text-body-sm text-on-surface-variant">
              A quiet reminder, only if you want one.
            </p>
            <ReminderSelector
              value={reminder}
              onChange={setReminder}
              date={reminderDate}
              time={reminderTime}
              onDateChange={setReminderDate}
              onTimeChange={setReminderTime}
            />
            {dateMissing ? (
              <DataNotice className="mt-2">
                Pick the day you&rsquo;d like to be nudged &mdash; we&rsquo;ll use 9:00 AM unless
                you choose a time.
              </DataNotice>
            ) : dateInPast ? (
              <DataNotice tone="error" className="mt-2">
                That moment has already passed. Pick a day or time that&rsquo;s still ahead, or
                choose &ldquo;No reminder&rdquo;.
              </DataNotice>
            ) : reminder === "date" && chosenRemindAt ? (
              <DataNotice className="mt-2">
                Your nudge lands {reminderTiming(chosenRemindAt.toISOString())}.
              </DataNotice>
            ) : null}
          </section>

          {error ? <DataNotice tone="error">{error}</DataNotice> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <span className="text-label-sm text-outline">Kept privately in your account.</span>
            <PrimaryButton
              onClick={handleSave}
              disabled={!canSave}
              className={cn(!canSave && "opacity-50")}
            >
              <Icon name="favorite" filled className="text-[18px]" />
              {saving ? (photo ? "Uploading photo…" : "Keeping…") : "Keep it"}
            </PrimaryButton>
          </div>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
