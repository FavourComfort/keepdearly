import { Link } from "@tanstack/react-router";
import type { Memory, Tone } from "@/lib/keepdearly-data";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

const tagTone: Record<Tone, string> = {
  primary: "bg-primary-fixed/60 text-on-primary-fixed-variant font-semibold",
  secondary: "bg-secondary-fixed/70 text-on-secondary-fixed-variant font-semibold",
  tertiary: "bg-tertiary-fixed/60 text-on-tertiary-fixed-variant font-semibold",
  neutral: "bg-surface-container-high text-on-surface-variant font-medium",
};

const accentTone: Record<Tone, string> = {
  primary: "bg-primary-container",
  secondary: "bg-secondary-fixed-dim",
  tertiary: "bg-tertiary-container",
  neutral: "bg-outline-variant",
};

/** Full keepsake card used on the Home stream. */
export function MemoryCard({ memory }: { memory: Memory }) {
  const tag = (
    <span className={cn("rounded-full px-2.5 py-0.5 text-label-sm", tagTone[memory.tone])}>
      {memory.personLabel ?? "Personal Note"}
    </span>
  );

  return (
    <article className="relative flex flex-col gap-1 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-[0_2px_12px_rgba(72,47,35,0.04)] transition-shadow duration-200 hover:shadow-md sm:p-6">
      <div
        aria-hidden="true"
        className={cn("absolute bottom-4 left-0 top-4 w-1 rounded-r-full", accentTone[memory.tone])}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {memory.personId ? (
            <Link to="/people/$personId" params={{ personId: memory.personId }}>
              {tag}
            </Link>
          ) : (
            tag
          )}
          {memory.topic ? (
            <span className="text-label-sm text-outline">{memory.topic}</span>
          ) : null}
        </div>
        <span className="text-label-sm text-on-surface-variant">{memory.when}</span>
      </div>
      <p className="mt-1 text-quote-body leading-relaxed text-on-surface">“{memory.text}”</p>
      {memory.footnote ? (
        <div className="mt-2 flex items-center gap-2 pt-2 text-label-sm text-outline">
          <Icon name={memory.footnoteIcon ?? "favorite"} className="text-[14px]" />
          <span>{memory.footnote}</span>
        </div>
      ) : null}
    </article>
  );
}

/** Compact keepsake note used on a person profile. */
export function MemoryNote({ memory }: { memory: Memory }) {
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-all hover:-translate-y-0.5">
      <div className={cn("absolute bottom-0 left-0 top-0 w-1", accentTone[memory.tone])} />
      <p className="text-quote-body italic leading-relaxed text-on-surface">“{memory.text}”</p>
      <div className="flex items-center justify-between pt-2">
        <span className="text-label-sm font-medium text-on-surface-variant">{memory.when}</span>
        <Icon
          name="favorite"
          className="cursor-pointer text-[16px] text-outline-variant transition-colors hover:text-primary"
        />
      </div>
    </div>
  );
}
