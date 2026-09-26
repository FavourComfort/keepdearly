import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string | undefined;
  autoComplete?: string | undefined;
  required?: boolean | undefined;
  /** Optional control rendered inside the field, on the trailing edge. */
  trailing?: ReactNode | undefined;
};

/** Labelled input for the sign-in / sign-up / reset screens. */
export function AuthField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
  trailing,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface shadow-sm outline-none",
            "ring-primary transition-shadow placeholder:text-outline focus:ring-2",
            trailing && "pe-12",
          )}
        />
        {trailing ? (
          <div className="absolute inset-y-0 end-0 flex items-center pe-1">{trailing}</div>
        ) : null}
      </div>
    </div>
  );
}
