import { cn } from "@/lib/utils";

export function Icon({
  name,
  className,
  filled,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span aria-hidden className={cn("ms-icon", filled && "ms-filled", className)}>
      {name}
    </span>
  );
}
