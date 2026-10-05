import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/keepdearly-data";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

const sizeClasses = {
  xs: "w-5 h-5 text-[10px] font-semibold",
  sm: "w-9 h-9 text-title-sm",
  md: "w-14 h-14 text-headline-md",
  /** The Home portrait rail: a touch larger than `md`, squircle-shaped. */
  rail: "w-[70px] h-[70px] text-headline-sm",
  lg: "w-20 h-20 md:w-24 md:h-24 text-headline-xl italic",
};

export function PersonAvatar({
  initial,
  tone = "primary",
  size = "md",
  className,
  children,
}: {
  initial: string;
  tone?: Tone;
  size?: keyof typeof sizeClasses;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center rounded-full shadow-sm",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      {initial}
      {children}
    </div>
  );
}
