import { Link } from "@tanstack/react-router";
import { initialForName, type Memory, type Tone } from "@/lib/keepdearly-data";
import { Icon } from "./Icon";
import { PersonAvatar } from "./PersonAvatar";
import { cn } from "@/lib/utils";

const accentTone: Record<Tone, string> = {
  primary: "bg-primary-container",
  secondary: "bg-secondary-fixed-dim",
  tertiary: "bg-tertiary-container",
  neutral: "bg-outline-variant",
};

/**
 * Compact keepsake card for the Home "Recently kept" collection.
 *
 * This used to be a full keepsake — 24px padding, an 18px serif quote and a
 * heavy pill tag — so four of them stacked were taller than the rest of the
 * page put together. It still carries every field it always had (who it is
 * for, the topic, when it was kept, the words, the footnote); they are simply
 * set at a size and rhythm that read as a curated collection instead of a
 * stack of posters.
 *
 * A tone drives exactly one restrained accent — a hairline edge plus the
 * avatar — so repeated cards feel like siblings rather than shouting. Nothing
 * here is clickable except the person's name, which is still the one link it
 * always was, pointing at the same profile route.
 *
 * Home only. The person screen uses `MemoryNote` below, which is untouched.
 */
export function MemoryCard({ memory }: { memory: Memory }) {
  const who = memory.personLabel ?? "Personal Note";

  // The identity reads the same either way — a person gets their initial, a
  // personal note gets the keepsake mark. Only a person is a link.
  const identity = (
    <>
      {memory.personId ? (
        <PersonAvatar initial={initialForName(who)} tone={memory.tone} size="xs" />
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <Icon name="favorite" filled className="text-[11px]" />
        </span>
      )}
      <span className="truncate">{who}</span>
    </>
  );

  const identityClass = "flex min-w-0 items-center gap-1.5 rounded-full text-label-md";

  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-md">
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-[3px]", accentTone[memory.tone])}
      />
      <div className="flex h-full gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            {memory.personId ? (
              <Link
                to="/people/$personId"
                params={{ personId: memory.personId }}
                aria-label={`Open ${who}'s profile`}
                className={cn(
                  identityClass,
                  "text-on-surface transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                )}
              >
                {identity}
              </Link>
            ) : (
              <span className={cn(identityClass, "text-on-surface")}>{identity}</span>
            )}
            {memory.topic ? (
              <span className="min-w-0 truncate text-label-sm text-outline">{memory.topic}</span>
            ) : null}
            <span className="ml-auto shrink-0 text-label-sm text-outline">{memory.when}</span>
          </div>

          {/* Clamped so one long memory can never make its neighbours look sparse. */}
          <p className="line-clamp-2 text-body-md leading-snug text-on-surface">“{memory.text}”</p>

          {memory.footnote ? (
            <p className="flex min-w-0 items-center gap-1.5 text-label-sm text-outline">
              <Icon name={memory.footnoteIcon ?? "favorite"} className="shrink-0 text-[13px]" />
              <span className="truncate">{memory.footnote}</span>
            </p>
          ) : null}
        </div>

        {/* A small keepsake thumbnail rather than a banner: the collection stays
            compact, and the fixed box means a full-resolution original cannot
            change the card's height once it arrives. */}
        {memory.photoUrl ? (
          <img
            src={memory.photoUrl}
            alt="Photo kept with this memory"
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : null}
      </div>
    </article>
  );
}

/**
 * Compact keepsake note used on a person profile.
 *
 * Same visual language as the Home `MemoryCard` above — compact rounded
 * surface, hairline tone accent, small muted metadata, restrained square photo
 * — so "Little things you've kept" reads as part of the same modern collection
 * rather than a stack of posters.
 *
 * The photo is a 1:1 `object-cover` thumbnail in a fixed box: one consistent
 * frame whatever shape the original is, no stretching, and no layout jump when
 * it arrives. It sits beside the words rather than above them, so a photo never
 * becomes the memory. A memory with no photo simply has no thumbnail — there is
 * no empty photo-shaped hole left behind.
 *
 * Deliberately not clickable: this screen already *is* that person's page, so a
 * link here would only ever be a self-link. Interaction is unchanged.
 */
export function MemoryNote({ memory }: { memory: Memory }) {
  return (
    <article className="relative h-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-md">
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-[3px]", accentTone[memory.tone])}
      />
      <div className="flex h-full gap-3 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-2">
            {memory.topic ? (
              <span className="min-w-0 truncate text-label-sm text-outline">{memory.topic}</span>
            ) : null}
            <span className="ml-auto shrink-0 text-label-sm text-outline">{memory.when}</span>
          </div>

          {/* Bounded, so one long memory cannot stretch the whole grid row, while
              still showing the whole thing for the short ones people actually
              write. */}
          <p className="line-clamp-3 text-body-md leading-snug text-on-surface">“{memory.text}”</p>

          {memory.footnote ? (
            <p className="flex min-w-0 items-center gap-1.5 text-label-sm text-outline">
              <Icon name={memory.footnoteIcon ?? "favorite"} className="shrink-0 text-[13px]" />
              <span className="truncate">{memory.footnote}</span>
            </p>
          ) : null}
        </div>

        {/* Fixed square frame: same aspect ratio as the Home card, `object-cover`
            so nothing is stretched, and a box the browser reserves up front so
            the photo cannot push the layout around as it decodes. */}
        {memory.photoUrl ? (
          <img
            src={memory.photoUrl}
            alt="Photo kept with this memory"
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : null}
      </div>
    </article>
  );
}
