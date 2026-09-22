import { Link } from "@tanstack/react-router";
import type { Person, Tone } from "@/lib/keepdearly-data";
import { PersonAvatar } from "./PersonAvatar";
import { cn } from "@/lib/utils";

const countTone: Record<Tone, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  neutral: "text-on-surface-variant",
};

export function PersonCard({ person, memoryCount }: { person: Person; memoryCount: number }) {
  return (
    <Link
      to="/people/$personId"
      params={{ personId: person.id }}
      className="group flex cursor-pointer flex-col items-center gap-1 rounded-xl bg-surface-container-lowest p-4 text-center shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <PersonAvatar
        initial={person.initial}
        tone={person.tone}
        className="transition-transform group-hover:scale-105"
      >
        {person.hasActiveReminder ? (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
        ) : null}
      </PersonAvatar>
      <div className="mt-1 flex flex-col items-center">
        <span className="text-title-sm text-on-surface">{person.name}</span>
        <span className={cn("text-label-sm font-medium", countTone[person.tone])}>
          {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
        </span>
      </div>
      <p className="mt-0.5 line-clamp-1 text-body-sm italic text-on-surface-variant">
        “{person.headline}”
      </p>
    </Link>
  );
}
