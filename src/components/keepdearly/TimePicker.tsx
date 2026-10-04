import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/**
 * The KeepDearly time picker.
 *
 * The nudge screens used to lean on the native `<input type="time">`. On
 * Android the platform/Chrome dialog can open with only "Clear" and "Cancel"
 * and no confirm action at all, so a chosen hour and minute had nowhere to
 * land — the value never reached the reminder that depends on it. Rolling our
 * own dialog keeps the same interaction (pick a time) while guaranteeing an
 * unmistakable OK that actually commits, on every platform and touch device.
 *
 * It speaks exactly the value the input used to: a 24-hour "HH:MM" string, or
 * "" when no time is chosen (the caller then falls back to the app's 9:00 AM
 * convention). Nothing here touches the network or the database — it only
 * hands the chosen time back through `onChange`.
 *
 * Reopening the picker always starts from the caller's current `value`, so it
 * shows the saved time, Cancel/backdrop leave it untouched, and Clear resets
 * it to "no time chosen".
 */

type Period = "AM" | "PM";

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

/** What an unset field opens on — the same 9:00 AM the relative options use. */
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;
const DEFAULT_PERIOD: Period = "AM";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Parses the stored "HH:MM" 24-hour value, or null when unset/unparseable. */
function parseTime(value: string | undefined) {
  const [rawHour, rawMinute] = (value ?? "").split(":");
  if (rawHour === undefined || rawMinute === undefined) return null;
  const hour24 = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isInteger(hour24) || !Number.isInteger(minute)) return null;
  if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) return null;
  return {
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute,
    period: (hour24 >= 12 ? "PM" : "AM") as Period,
  };
}

/** The 24-hour "HH:MM" the rest of the app expects back. */
function toValue(hour12: number, minute: number, period: Period): string {
  const hour24 = (hour12 % 12) + (period === "PM" ? 12 : 0);
  return `${pad(hour24)}:${pad(minute)}`;
}

/** A warm "2:30 PM", matching every other time string in the app. */
function formatValue(value: string | undefined): string | null {
  const parsed = parseTime(value);
  if (!parsed) return null;
  return `${parsed.hour12}:${pad(parsed.minute)} ${parsed.period}`;
}

/** One scrollable column of numbers (hours, then minutes). */
function TimeColumn({
  label,
  values,
  selected,
  onSelect,
  scrollRef,
}: {
  label: string;
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="text-center text-label-sm uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <div ref={scrollRef} className="h-44 overflow-y-auto rounded-lg bg-surface-container-low p-1">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            data-active={value === selected}
            aria-pressed={value === selected}
            onClick={() => onSelect(value)}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-center text-body-md transition-colors",
              value === selected
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface hover:bg-surface-container",
            )}
          >
            {pad(value)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The modal itself. Mounted only while open, so its draft always begins from
 * the caller's saved value — closing it can never wipe a committed time.
 */
function TimePickerDialog({
  value,
  onConfirm,
  onCancel,
  onClear,
}: {
  value: string | undefined;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  onClear: () => void;
}) {
  const parsed = parseTime(value);
  const [hour12, setHour12] = useState(parsed?.hour12 ?? DEFAULT_HOUR);
  const [minute, setMinute] = useState(parsed?.minute ?? DEFAULT_MINUTE);
  const [period, setPeriod] = useState<Period>(parsed?.period ?? DEFAULT_PERIOD);

  const dialogRef = useRef<HTMLDivElement>(null);
  const hourColumn = useRef<HTMLDivElement>(null);
  const minuteColumn = useRef<HTMLDivElement>(null);

  // Behave like a real modal: hold focus, close on Escape, keep the page
  // behind still, and bring the saved time into view the moment it opens.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    for (const column of [hourColumn.current, minuteColumn.current]) {
      column
        ?.querySelector<HTMLElement>('[data-active="true"]')
        ?.scrollIntoView({ block: "center" });
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancel]);

  const preview = formatValue(toValue(hour12, minute, period)) ?? "";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      {/* The scrim doubles as Cancel: the previously saved time is untouched. */}
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a time"
        tabIndex={-1}
        className="relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-xl outline-none animate-in slide-in-from-bottom-4 fade-in duration-200 sm:rounded-2xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5">
          <span className="text-title-md text-on-surface">What time?</span>
          <div className="flex items-center gap-1 rounded-full bg-surface-container-low p-1">
            {(["AM", "PM"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPeriod(option)}
                aria-pressed={option === period}
                className={cn(
                  "rounded-full px-3 py-1 text-label-md transition-colors",
                  option === period
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <p className="px-5 pt-1 text-body-sm text-on-surface-variant">
          Selected <span className="font-semibold tabular-nums text-on-surface">{preview}</span>
        </p>

        <div className="flex items-stretch gap-3 px-4 py-3">
          <TimeColumn
            label="Hour"
            values={HOURS}
            selected={hour12}
            onSelect={setHour12}
            scrollRef={hourColumn}
          />
          <TimeColumn
            label="Minute"
            values={MINUTES}
            selected={minute}
            onSelect={setMinute}
            scrollRef={minuteColumn}
          />
        </div>

        {/* Clear / Cancel / OK — the unmistakable confirmation the native
            Android picker could not give us. */}
        <div className="flex items-center justify-between gap-2 border-t border-outline-variant/50 px-3 py-2.5">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            Clear
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-4 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(toValue(hour12, minute, period))}
              className="rounded-full bg-primary px-5 py-2 text-label-md text-on-primary shadow-sm transition-all hover:bg-tertiary active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The field the screens render: a button showing the chosen time that opens the
 * dialog. Controlled — the parent owns the value and receives every commit
 * through `onChange`. Optional, so an empty value simply shows the placeholder.
 */
export function TimePicker({
  value,
  onChange,
  id,
  placeholder = "Choose a time",
  className,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  id?: string | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const display = formatValue(value);

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-left shadow-sm outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary/30",
          className,
        )}
      >
        <span className={cn("truncate", display ? "text-on-surface" : "text-outline")}>
          {display ?? placeholder}
        </span>
        <Icon name="schedule" className="shrink-0 text-[18px] text-outline" />
      </button>

      {open
        ? createPortal(
            <TimePickerDialog
              value={value}
              onConfirm={(next) => {
                onChange(next);
                setOpen(false);
              }}
              onCancel={() => setOpen(false)}
              onClear={() => {
                onChange("");
                setOpen(false);
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}
