import { cn } from "@/lib/utils";

type Variant = "primary" | "soft" | "quiet" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-tertiary shadow-md text-title-md py-3.5 px-9",
  soft: "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary shadow-sm text-label-md py-3 px-6",
  quiet:
    "bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-label-md py-1.5 px-4",
  outline:
    "bg-surface-container-lowest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed shadow-sm text-label-md py-1.5 px-4",
};

export function PrimaryButton({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
