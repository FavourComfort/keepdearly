import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  info: "bg-surface-container-low text-on-surface-variant",
  error: "bg-error-container text-on-error",
  success: "bg-primary-fixed text-on-primary-fixed-variant",
} as const;

/** Inline feedback (errors, confirmations) for the authentication screens. */
export function AuthNotice({
  tone = "info",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg px-4 py-3 text-body-sm", tones[tone], className)}
    >
      {children}
    </p>
  );
}
