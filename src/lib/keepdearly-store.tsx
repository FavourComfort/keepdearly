import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./auth";
import { getSupabase } from "./supabase";
import type { MemoryRow, PersonRow, ReminderRow } from "./supabase.types";
import {
  PERSONAL_NOTE_LABEL,
  initialForName,
  isFutureMoment,
  memoryWhen,
  remindAtForChosenDate,
  remindAtForOption,
  reminderBucket,
  reminderIsOverdue,
  reminderTiming,
  toneForId,
  type Memory,
  type Person,
  type Reminder,
} from "./keepdearly-data";

/**
 * KeepDearly's data, now backed by Supabase for the signed-in user.
 *
 * Same shape as the demo store it replaces — a context holding people, memories
 * and reminders — so the screens did not have to be rewritten. What changed is
 * where the rows come from and that writes actually persist.
 *
 * The user id always comes from the Supabase session via useAuth(). It is never
 * read from a form, a URL or a prop.
 */

const LOAD_ERROR = "We couldn't reach your keeps just now.";
const REMINDER_ERROR = "We couldn't update that reminder just now.";
const PAST_REMINDER_ERROR = "Pick a moment that hasn't happened yet.";

export type SaveMemoryInput = {
  content: string;
  /** An existing person, or undefined for a personal note. */
  personId?: string | undefined;
  /** A person typed into the Capture screen's "or add someone new…" field. */
  newPersonName?: string | undefined;
  /** One of the ReminderSelector option ids. */
  reminderOption: string;
  /** The `<input type="date">` value behind "Choose date", if it was picked. */
  reminderDate?: string | undefined;
  /** The optional `<input type="time">` value behind "Choose date". */
  reminderTime?: string | undefined;
};

export type SaveMemoryResult = {
  ok: boolean;
  error: string | null;
  /** The person the memory ended up on, if any — null for a personal note. */
  personId: string | null;
};

/** Every reminder mutation reports the same way, so screens handle one shape. */
export type ReminderActionResult = {
  ok: boolean;
  error: string | null;
};

type Store = {
  people: Person[];
  memories: Memory[];
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  personById: (id?: string | undefined) => Person | undefined;
  memoriesFor: (personId: string) => Memory[];
  saveMemory: (input: SaveMemoryInput) => Promise<SaveMemoryResult>;
  completeReminder: (id: string) => Promise<ReminderActionResult>;
  cancelReminder: (id: string) => Promise<ReminderActionResult>;
  rescheduleReminder: (id: string, remindAt: Date) => Promise<ReminderActionResult>;
};

const KeepDearlyContext = createContext<Store | null>(null);

function toMemoryView(row: MemoryRow, people: PersonRow[]): Memory {
  const person = row.person_id ? people.find((p) => p.id === row.person_id) : undefined;
  return {
    id: row.id,
    personId: row.person_id ?? undefined,
    personLabel: person?.name ?? PERSONAL_NOTE_LABEL,
    text: row.content,
    when: memoryWhen(row.created_at),
    tone: row.person_id ? toneForId(row.person_id) : "neutral",
  };
}

function toPersonView(row: PersonRow, memories: MemoryRow[], reminders: ReminderRow[]): Person {
  // `memories` arrives newest first, so the first match is the latest one.
  const latest = memories.find((memory) => memory.person_id === row.id);
  const ownMemoryIds = new Set(
    memories.filter((memory) => memory.person_id === row.id).map((memory) => memory.id),
  );
  const hasActiveReminder = reminders.some(
    (reminder) => reminder.status === "pending" && ownMemoryIds.has(reminder.memory_id),
  );

  return {
    id: row.id,
    name: row.name,
    initial: initialForName(row.name),
    tone: toneForId(row.id),
    headline: latest?.content ?? "Nothing kept yet.",
    // No columns back these yet, and inventing values would be fake data.
    likes: [],
    dislikes: [],
    giftIdeas: [],
    hasActiveReminder,
  };
}

function toReminderView(
  row: ReminderRow,
  memories: MemoryRow[],
  people: PersonRow[],
  now: Date,
): Reminder {
  const memory = memories.find((m) => m.id === row.memory_id);
  const person = memory?.person_id ? people.find((p) => p.id === memory.person_id) : undefined;
  // Overdue is derived, never stored: a row is late only while it is still
  // pending and its moment has passed.
  const isOverdue = reminderIsOverdue(row.remind_at, row.status, now);

  return {
    id: row.id,
    title: person?.name ?? "A memory to revisit",
    personId: person?.id,
    personLabel: person?.name,
    timing: reminderTiming(row.remind_at, now, isOverdue),
    bucket: reminderBucket(row.remind_at, row.status, now),
    remindAt: row.remind_at,
    status: row.status,
    isOverdue,
    note: memory?.content ?? "",
    tone: person ? toneForId(person.id) : "primary",
    // Intentionally no `meta`: nothing is delivered in this phase.
  };
}

export function KeepDearlyProvider({ children }: { children: ReactNode }) {
  const { user, isConfigured } = useAuth();
  const userId = user?.id;

  const [personRows, setPersonRows] = useState<PersonRow[]>([]);
  const [memoryRows, setMemoryRows] = useState<MemoryRow[]>([]);
  const [reminderRows, setReminderRows] = useState<ReminderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // "Overdue" is relative to the current moment, so the view model needs a clock
  // of its own. A minute's resolution is plenty for wording like "3 days ago",
  // and it keeps a reminder from sitting in "Today" for the rest of the session
  // after its moment has passed.
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async () => {
    // Signed out, or Supabase not configured yet: nothing to load, and no
    // client to ask.
    if (!userId || !isConfigured) {
      setPersonRows([]);
      setMemoryRows([]);
      setReminderRows([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabase();
    // Every read is additionally filtered by user_id. RLS already enforces it;
    // being explicit keeps the intent readable and survives a mis-set policy.
    const [peopleResult, memoriesResult, remindersResult] = await Promise.all([
      supabase
        .from("people")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("memories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .order("remind_at", { ascending: true }),
    ]);

    const failure = peopleResult.error ?? memoriesResult.error ?? remindersResult.error;
    if (failure) {
      // The real reason goes to the console; the screen gets a gentle message.
      console.error("Could not load KeepDearly data:", failure.message);
      setError(LOAD_ERROR);
    }

    // Only replace what actually came back, so one failed read cannot wipe
    // data the other two delivered.
    if (peopleResult.data) setPersonRows(peopleResult.data);
    if (memoriesResult.data) setMemoryRows(memoriesResult.data);
    if (remindersResult.data) setReminderRows(remindersResult.data);

    setLoading(false);
  }, [userId, isConfigured]);

  useEffect(() => {
    void load();
  }, [load]);

  const people = useMemo(
    () => personRows.map((row) => toPersonView(row, memoryRows, reminderRows)),
    [personRows, memoryRows, reminderRows],
  );
  const memories = useMemo(
    () => memoryRows.map((row) => toMemoryView(row, personRows)),
    [memoryRows, personRows],
  );
  const reminders = useMemo(
    () => reminderRows.map((row) => toReminderView(row, memoryRows, personRows, new Date(nowMs))),
    [reminderRows, memoryRows, personRows, nowMs],
  );

  const saveMemory = useCallback(
    async ({
      content,
      personId,
      newPersonName,
      reminderOption,
      reminderDate,
      reminderTime,
    }: SaveMemoryInput): Promise<SaveMemoryResult> => {
      const trimmed = content.trim();
      if (!userId || !isConfigured) {
        return { ok: false, error: LOAD_ERROR, personId: null };
      }
      if (!trimmed) {
        return { ok: false, error: "Write something first, then keep it.", personId: null };
      }

      const supabase = getSupabase();

      // A brand new person is created first, so the memory can point at a real
      // id instead of a local placeholder.
      let resolvedPersonId: string | null = personId ?? null;
      const newName = newPersonName?.trim();
      if (!resolvedPersonId && newName) {
        const { data, error: personError } = await supabase
          .from("people")
          .insert({ user_id: userId, name: newName })
          .select("*")
          .single();

        if (personError || !data) {
          console.error("Could not create person:", personError?.message);
          return { ok: false, error: "We couldn't keep that person just now.", personId: null };
        }
        resolvedPersonId = data.id;
      }

      // The memory itself. person_id stays null when nobody was picked — a
      // memory is allowed to exist on its own.
      const { data: memory, error: memoryError } = await supabase
        .from("memories")
        .insert({ user_id: userId, content: trimmed, person_id: resolvedPersonId })
        .select("*")
        .single();

      if (memoryError || !memory) {
        console.error("Could not create memory:", memoryError?.message);
        return { ok: false, error: "We couldn't keep that just now.", personId: resolvedPersonId };
      }

      // A reminder row is created only for options that resolve to a real
      // timestamp, and it always hangs off the memory just written.
      const remindAt =
        reminderOption === "date"
          ? remindAtForChosenDate(reminderDate ?? "", reminderTime)
          : remindAtForOption(reminderOption);

      // "Choose date" with a missing or already-past moment must not write a
      // row: the memory is kept, and the screen says why the nudge was left off.
      if (reminderOption === "date" && !isFutureMoment(remindAt)) {
        console.warn("Reminder skipped — no future date and time were given.");
      } else if (remindAt) {
        const { error: reminderError } = await supabase
          .from("reminders")
          .insert({
            user_id: userId,
            memory_id: memory.id,
            remind_at: remindAt.toISOString(),
            status: "pending",
          })
          .select("id")
          .single();

        // The memory is already saved, so a reminder that fails to attach is
        // logged and the memory is still reported as kept.
        if (reminderError) console.error("Could not create reminder:", reminderError.message);
      }

      // "No reminder" creates no row at all. Then reload so every screen sees
      // the new memory.
      await load();

      return { ok: true, error: null, personId: resolvedPersonId };
    },
    [userId, isConfigured, load],
  );

  /**
   * The three reminder mutations, sharing one shape.
   *
   * `user_id` is never taken from an argument — it always comes from the
   * Supabase session, and the explicit `.eq` mirrors the owner-scoped RLS so the
   * intent survives a mis-set policy. Each one refreshes through `load`, the
   * same path every screen already uses, and every failure is reported back
   * rather than swallowed.
   */
  const updateReminder = useCallback(
    async (id: string, patch: Record<string, unknown>): Promise<ReminderActionResult> => {
      if (!userId || !isConfigured) {
        return { ok: false, error: LOAD_ERROR };
      }

      const supabase = getSupabase();
      const { error: updateError } = await supabase
        .from("reminders")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Could not update reminder:", updateError.message);
        return { ok: false, error: REMINDER_ERROR };
      }

      await load();
      return { ok: true, error: null };
    },
    [userId, isConfigured, load],
  );

  /** "Done" — the moment happened, the nudge was heard. */
  const completeReminder = useCallback(
    (id: string) =>
      updateReminder(id, {
        status: "completed",
        completed_at: new Date().toISOString(),
      }),
    [updateReminder],
  );

  /** "Let it go" — the reminder is dismissed and stays dismissed. */
  const cancelReminder = useCallback(
    (id: string) => updateReminder(id, { status: "cancelled" }),
    [updateReminder],
  );

  /** Moves the moment and puts the reminder back in play. */
  const rescheduleReminder = useCallback(
    (id: string, remindAt: Date) => {
      if (!isFutureMoment(remindAt)) {
        return Promise.resolve({ ok: false, error: PAST_REMINDER_ERROR });
      }
      // A rescheduled nudge is pending again, and any earlier completion no
      // longer applies to the new moment.
      return updateReminder(id, {
        remind_at: remindAt.toISOString(),
        status: "pending",
        completed_at: null,
      });
    },
    [updateReminder],
  );

  const value = useMemo<Store>(
    () => ({
      people,
      memories,
      reminders,
      loading,
      error,
      refresh: load,
      personById: (id) => (id ? people.find((person) => person.id === id) : undefined),
      memoriesFor: (personId) => memories.filter((memory) => memory.personId === personId),
      saveMemory,
      completeReminder,
      cancelReminder,
      rescheduleReminder,
    }),
    [
      people,
      memories,
      reminders,
      loading,
      error,
      load,
      saveMemory,
      completeReminder,
      cancelReminder,
      rescheduleReminder,
    ],
  );

  return <KeepDearlyContext.Provider value={value}>{children}</KeepDearlyContext.Provider>;
}

export function useKeepDearly() {
  const ctx = useContext(KeepDearlyContext);
  if (!ctx) throw new Error("useKeepDearly must be used inside KeepDearlyProvider");
  return ctx;
}
