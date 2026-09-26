import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The small loading / empty / error states the real data needs.
 *
 * Reuses the existing KeepDearly wording and token classes (surface-container
 * cards, italic body copy) rather than introducing a new visual language.
 */

/** Shown while a screen is waiting on Supabase. */
export function DataLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center py-10">
      <span className="text-body-md text-outline">just a moment…</span>
    </div>
  );
}

/** Shown when a screen has genuinely nothing to show yet. */
export function DataEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-surface-container-low p-6 text-body-md italic text-on-surface-variant">
      {children}
    </p>
  );
}

const noticeTones = {
  info: "bg-surface-container-low text-on-surface-variant",
  error: "bg-error-container text-on-error",
} as const;

/** Inline notice for save failures and unmet expectations. */
export function DataNotice({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof noticeTones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg px-4 py-3 text-body-sm", noticeTones[tone], className)}
    >
      {children}
    </p>
  );
}

/**
 * Shown when a read fails. Deliberately vague: the underlying Supabase error
 * goes to the console, never to the screen.
 */
export function DataError() {
  return (
    <DataNotice tone="error" className="mt-4">
      We couldn&rsquo;t reach your keeps just now. Give it a moment and try again.
    </DataNotice>
  );
}
