import { reminderOptions } from "@/lib/keepdearly-data";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

export function ReminderSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 pt-1.5 sm:grid-cols-3">
      {reminderOptions.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-label-md shadow-sm transition-all",
              selected
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container-lowest text-on-surface hover:bg-surface-container",
            )}
          >
            <span className="flex items-center gap-2">
              <Icon
                name={option.icon}
                className={cn("text-[16px]", selected ? "" : "text-outline")}
              />
              <span>{option.label}</span>
            </span>
            {selected ? <Icon name="check_circle" className="text-[16px]" /> : null}
          </button>
        );
      })}
    </div>
  );
}
