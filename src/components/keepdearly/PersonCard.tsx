import { Link } from "@tanstack/react-router";
import type { Person } from "@/lib/keepdearly-data";
import { PersonAvatar } from "./PersonAvatar";
import { cn } from "@/lib/utils";

/**
 * How a person appears.
 *
 * `rail`   — the Home portrait rail: a soft squircle portrait about 70px with
 *            the name underneath. No card, no container, no metadata.
 * `bubble` — the full people view: a larger circular portrait with the name
 *            underneath, airy and spaced in a collection.
 *
 * Two presentations, one component, one link. Both go to exactly the same
 * `/people/$personId` profile they always did; only the way the person is
 * shown changes. The old large person card is gone rather than kept around.
 */
export type PersonCardVariant = "rail" | "bubble";

export function PersonCard({ person, variant }: { person: Person; variant: PersonCardVariant }) {
  const rail = variant === "rail";

  return (
    <Link
      to="/people/$personId"
      params={{ personId: person.id }}
      aria-label={`Open ${person.name}'s profile`}
      className={cn(
        "group flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-2xl text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
        rail ? "w-[76px]" : "w-full",
      )}
    >
      <PersonAvatar
        initial={person.initial}
        tone={person.tone}
        size={rail ? "rail" : "lg"}
        photoUrl={person.avatarUrl}
        // A soft squircle on the rail, a clean circle in the full view.
        className={cn(
          "transition-transform duration-200 group-hover:-translate-y-0.5",
          rail && "rounded-2xl",
        )}
      >
        {/* The one piece of status worth showing: someone has a nudge waiting.
            Ring matches whatever the portrait is sitting on. */}
        {person.hasActiveReminder ? (
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 right-0 rounded-full bg-secondary",
              rail ? "h-3 w-3 ring-2 ring-surface" : "h-3.5 w-3.5 ring-2",
            )}
          />
        ) : null}
      </PersonAvatar>
      <span
        className={cn("w-full truncate text-on-surface", rail ? "text-label-md" : "text-title-sm")}
      >
        {person.name}
      </span>
    </Link>
  );
}
