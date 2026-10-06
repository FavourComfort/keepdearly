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
  photoUrl,
  children,
}: {
  initial: string;
  tone?: Tone;
  size?: keyof typeof sizeClasses;
  className?: string;
  /** A signed profile photo. Falls back to the initial when there isn't one. */
  photoUrl?: string | undefined;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full shadow-sm",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
    >
      {/* The photo fills whatever shape the caller asked for and crops to it, so
          it never stretches or changes the layout as it loads. The initial sits
          behind it and simply shows through when there is no photo, or if one
          ever fails to load. */}
      <span
        aria-hidden={photoUrl ? "true" : undefined}
        className={photoUrl ? "sr-only" : undefined}
      >
        {initial}
      </span>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {children}
    </div>
  );
}
