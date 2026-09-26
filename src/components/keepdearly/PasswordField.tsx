import { useState } from "react";

import { AuthField } from "@/components/keepdearly/AuthField";
import { Icon } from "@/components/keepdearly/Icon";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  autoComplete?: string | undefined;
  required?: boolean | undefined;
};

/**
 * AuthField for passwords, with a show/hide toggle sitting inside the input.
 * Toggling only flips the input's type — the value is never read or rewritten.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
          className="flex h-9 w-9 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-low hover:text-primary"
        >
          <Icon name={visible ? "visibility_off" : "visibility"} className="text-[20px]" />
        </button>
      }
    />
  );
}
