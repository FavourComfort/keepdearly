import { reminderOptions, todayDateInputValue } from "@/lib/keepdearly-data";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/**
 * The nudge picker.
 *
 * "Choose date" is no longer a dead option: picking it reveals a plain date
 * input and an optional time input right here, in the same card language as the
 * rest of the screen. No calendar, no month grid — just the two fields a person
 * needs to name a moment.
 *
 * The time is optional on purpose. Left empty it falls back to the app's
 * existing 9:00 AM convention, which is what the relative options already use.
 */
export function ReminderSelector({
  value,
  onChange,
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  value: string;
  onChange: (value: string) => void;
  date?: string | undefined;
  time?: string | undefined;
  onDateChange?: ((value: string) => void) | undefined;
  onTimeChange?: ((value: string) => void) | undefined;
}) {
  return (
    <div className="flex flex-col gap-3 pt-1.5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {reminderOptions.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
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

      {value === "date" ? (
        <div className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1">
            <label
              className="flex items-center gap-1.5 text-label-sm text-on-surface-variant"
              htmlFor="reminder-date"
            >
              <Icon name="calendar_month" className="text-[16px]" />
              Which day?
            </label>
            <input
              id="reminder-date"
              type="date"
              value={date ?? ""}
              min={todayDateInputValue()}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="rounded-lg bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label
              className="flex items-center gap-1.5 text-label-sm text-on-surface-variant"
              htmlFor="reminder-time"
            >
              <Icon name="schedule" className="text-[16px]" />
              What time? (optional)
            </label>
            <input
              id="reminder-time"
              type="time"
              value={time ?? ""}
              onChange={(e) => onTimeChange?.(e.target.value)}
              className="rounded-lg bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
