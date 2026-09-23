import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  memories as seedMemories,
  people as seedPeople,
  reminders as seedReminders,
  type Memory,
  type Person,
  type Reminder,
  type Tone,
} from "./keepdearly-data";

type NewMemory = {
  text: string;
  personId?: string | undefined;
  personLabel?: string | undefined;
  tone?: Tone | undefined;
};

type Store = {
  people: Person[];
  memories: Memory[];
  reminders: Reminder[];
  personById: (id?: string | undefined) => Person | undefined;
  memoriesFor: (personId: string) => Memory[];
  addMemory: (memory: NewMemory) => void;
  addPerson: (name: string) => Person;
};

const KeepDearlyContext = createContext<Store | null>(null);

const tones: Tone[] = ["primary", "secondary", "tertiary", "neutral"];

export function KeepDearlyProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>(seedPeople);
  const [memories, setMemories] = useState<Memory[]>(seedMemories);
  const [reminders] = useState<Reminder[]>(seedReminders);

  const addMemory = useCallback((memory: NewMemory) => {
    setMemories((prev) => [
      {
        id: `m-${Date.now()}`,
        text: memory.text,
        personId: memory.personId,
        personLabel: memory.personLabel ?? "Personal Note",
        when: "just now",
        tone: memory.tone ?? "primary",
      },
      ...prev,
    ]);
  }, []);

  const addPerson = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      const person: Person = {
        id: `${trimmed.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        name: trimmed,
        initial: trimmed.charAt(0).toUpperCase(),
        tone: tones[people.length % tones.length] ?? "primary",
        headline: "Newly kept close",
        likes: [],
        dislikes: [],
        giftIdeas: [],
      };
      setPeople((prev) => [...prev, person]);
      return person;
    },
    [people.length],
  );

  const value = useMemo<Store>(
    () => ({
      people,
      memories,
      reminders,
      personById: (id) => people.find((p) => p.id === id),
      memoriesFor: (personId) => memories.filter((m) => m.personId === personId),
      addMemory,
      addPerson,
    }),
    [people, memories, reminders, addMemory, addPerson],
  );

  return <KeepDearlyContext.Provider value={value}>{children}</KeepDearlyContext.Provider>;
}

export function useKeepDearly() {
  const ctx = useContext(KeepDearlyContext);
  if (!ctx) throw new Error("useKeepDearly must be used inside KeepDearlyProvider");
  return ctx;
}
