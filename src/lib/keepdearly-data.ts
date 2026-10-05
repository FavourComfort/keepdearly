/**
 * View models and display derivations for the KeepDearly UI.
 *
 * The demo records that used to live here — Sarah, Mum, Daniel, Julian, their
 * memories and their reminders — are gone. Real rows now arrive from Supabase
 * through keepdearly-store.tsx. What remains here is:
 *
 *  - the shapes the existing components already render, so no UI component had
 *    to be rewritten for Phase 2, and
 *  - the small pure derivations that turn a database row into those shapes.
 *
 * Phase 3 adds the reminder status vocabulary (pending / completed / cancelled /
 * overdue) and the "Choose date" resolution. Still no network, still no state.
 */

import type { ReminderStatus } from "./supabase.types";

export type Tone = "primary" | "secondary" | "tertiary" | "neutral";

/** What an unattached memory is called in the UI. */
export const PERSONAL_NOTE_LABEL = "Personal Note";

/**
 * A person as the UI sees them.
 *
 * Only `name`, the attached memories and the pending-reminder dot are backed
 * by data in Phase 2. The relationship, birthday, likes, dislikes and gift
 * ideas stay empty on purpose — there are no columns for them, and showing
 * invented ones would be fake data. The components already render their own
 * empty states for those sections.
 */
export type Person = {
  id: string;
  name: string;
  /** First letter of the name, derived — nothing is stored for this. */
  initial: string;
  /** Stable accent derived from the id so a person keeps one colour. */
  tone: Tone;
  /** The person's most recent memory, or a short fallback. */
  headline: string;
  likes: string[];
  dislikes: string[];
  giftIdeas: { title: string; note: string; icon: string; tone: Tone }[];
  hasActiveReminder: boolean;
  /**
   * Phase 6B: where a scheduled message to this person would be sent, or null
   * when they have no address yet. Saved once on the person so the user is
   * never asked to retype it for every message.
   */
  email: string | null;
  relationship?: string | undefined;
  birthday?: string | undefined;
  birthdayIn?: string | undefined;
};

export type Memory = {
  id: string;
  personId?: string | undefined;
  /** The attached person's name, or "Personal Note" when kept on its own. */
  personLabel?: string | undefined;
  text: string;
  when: string;
  tone: Tone;
  /**
   * A short-lived signed URL for the memory's photo, or unset when it has none.
   *
   * Resolved once per load in the store: the bucket is private, so a URL cannot
   * be derived from the path alone. Never a permanent link.
   */
  photoUrl?: string | undefined;
  // No data source in Phase 2 — left unset so the existing markup hides them.
  topic?: string | undefined;
  footnote?: string | undefined;
  footnoteIcon?: string | undefined;
};

/**
 * Which section of the Reminders screen a reminder belongs to.
 *
 * Phase 3 splits the old catch-all "today" bucket: a pending reminder whose time
 * has already passed is overdue, and saying so is more honest than filing it
 * under Today.
 */
export type ReminderBucket = "overdue" | "today" | "week" | "upcoming";

export type Reminder = {
  id: string;
  title: string;
  personId?: string | undefined;
  personLabel?: string | undefined;
  timing: string;
  bucket: ReminderBucket;
  /** The stored `remind_at`, so the UI and the bucket can agree on one moment. */
  remindAt: string;
  /** The row's real status. "overdue" is not a status — see `isOverdue`. */
  status: ReminderStatus;
  /** True only while `status === "pending"` and `remind_at` is in the past. */
  isOverdue: boolean;
  note: string;
  tone: Tone;
  /**
   * Left unset on purpose. The demo used strings like "Notified this morning",
   * but nothing is delivered yet — that is a later phase.
   */
  meta?: string | undefined;
};

/**
 * The Capture-screen options.
 *
 * "Custom" is gone. It had no date, no time and no behaviour behind it, and a
 * button that silently does nothing is worse than one fewer choice. Five honest
 * options beat six where one is a lie.
 */
export const reminderOptions = [
  { id: "none", label: "No reminder", icon: "notifications_off" },
  { id: "1-week", label: "1 week before", icon: "schedule" },
  { id: "3-days", label: "3 days before", icon: "hourglass_empty" },
  { id: "1-day", label: "1 day before", icon: "wb_twilight" },
  { id: "date", label: "Choose date", icon: "calendar_month" },
];

const TONES: Tone[] = ["primary", "secondary", "tertiary", "neutral"];

/** Stable per-id accent so a person keeps the same colour across the app. */
export function toneForId(seed: string | null | undefined): Tone {
  if (!seed) return "neutral";
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100003;
  }
  return TONES[hash % TONES.length] ?? "neutral";
}

export function initialForName(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

// ---------------------------------------------------------------------------
// Dates
//
// Hand-rolled instead of using date-fns or the locale API so the wording stays
// exactly as the demo screens showed it ("Added Sep 18", "Today · 2:00 PM") and
// does not drift with the viewer's locale.
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DAY_MS = 86_400_000;

function parseDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value: Date): number {
  const copy = new Date(value);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/** Whole calendar days from today until `iso` (negative when in the past). */
export function daysFromToday(iso: string, now: Date = new Date()): number {
  const target = parseDate(iso);
  if (!target) return 0;
  return Math.round((startOfDay(target) - startOfDay(now)) / DAY_MS);
}

export function formatDay(iso: string, now: Date = new Date()): string {
  const date = parseDate(iso);
  if (!date) return "";
  const month = MONTHS[date.getMonth()] ?? "";
  const day = date.getDate();
  return date.getFullYear() === now.getFullYear()
    ? `${month} ${day}`
    : `${month} ${day}, ${date.getFullYear()}`;
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? "PM" : "AM";
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelve}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** The "Added …" stamp on a memory card. */
export function memoryWhen(iso: string, now: Date = new Date()): string {
  const diff = daysFromToday(iso, now);
  if (diff === 0) return "Added today";
  if (diff === -1) return "Added yesterday";
  return `Added ${formatDay(iso, now)}`;
}

/**
 * The "Today · 2:00 PM" line on a reminder.
 *
 * `overdue` only changes today's case. A nudge set for 2:00 PM that is read at
 * 4:00 PM is not "Today" any more, so it says so. The "Yesterday" / "N days ago"
 * wording is unchanged — it was always honest.
 */
export function reminderTiming(iso: string, now: Date = new Date(), overdue = false): string {
  const date = parseDate(iso);
  if (!date) return "";

  const time = formatTime(date);
  const diff = daysFromToday(iso, now);
  if (diff === 0) return overdue ? `Earlier today · ${time}` : `Today · ${time}`;
  if (diff === 1) return `Tomorrow · ${time}`;
  if (diff === -1) return `Yesterday · ${time}`;
  if (diff > 1 && diff <= 7) return `In ${diff} days · ${time}`;
  if (diff < -1) return `${Math.abs(diff)} days ago · ${time}`;
  return `${formatDay(iso, now)} · ${time}`;
}

/**
 * Overdue means exactly one thing: still pending, and its moment has passed.
 *
 * A completed or cancelled reminder is never overdue no matter how old it is —
 * it is handled, not late.
 */
export function reminderIsOverdue(
  iso: string,
  status: ReminderStatus,
  now: Date = new Date(),
): boolean {
  if (status !== "pending") return false;
  const date = parseDate(iso);
  if (!date) return false;
  return date.getTime() < now.getTime();
}

/** Which of the Reminders screen sections this belongs to. */
export function reminderBucket(
  iso: string,
  status: ReminderStatus,
  now: Date = new Date(),
): ReminderBucket {
  if (reminderIsOverdue(iso, status, now)) return "overdue";

  const diff = daysFromToday(iso, now);
  if (diff <= 0) return "today";
  if (diff <= 7) return "week";
  return "upcoming";
}

// ---------------------------------------------------------------------------
// Reminder timing
//
// The selector's four meaningful choices and what each one resolves to:
//
//   "1 week before" / "3 days before" / "1 day before"  -> offset from now
//   "Choose date"                                     -> the date (and optional
//                                                       time) the user picked
//   "No reminder"                                     -> no row at all
//
// "Custom" used to sit here as well. It carried no information, so it could
// only ever guess a moment — and a wrong guess written to the database is worse
// than no reminder at all. It has been removed rather than faked.
// ---------------------------------------------------------------------------

export const REMINDER_OFFSET_DAYS: Record<string, number> = {
  "1-week": 7,
  "3-days": 3,
  "1-day": 1,
};

/** Time of day for the relative options — the UI offers no clock. */
export const DEFAULT_REMINDER_HOUR = 9;

/** The timestamp the relative options resolve to, or null when unsupported. */
export function remindAtForOption(optionId: string, from: Date = new Date()): Date | null {
  const days = REMINDER_OFFSET_DAYS[optionId];
  if (days === undefined) return null;

  const when = new Date(from);
  when.setDate(when.getDate() + days);
  when.setHours(DEFAULT_REMINDER_HOUR, 0, 0, 0);
  return when;
}

/**
 * Resolves "Choose date" into a real local moment.
 *
 * `dateValue` is a `<input type="date">` value ("2026-10-04") and `timeValue` a
 * 24-hour "HH:MM" value ("14:30"). An empty or malformed time falls back to the
 * app's existing 9:00 AM convention, so a date alone is always enough.
 *
 * Both halves are wall-clock, not UTC: someone who picked "21:00" meant 21:00
 * where they are sitting. So the moment is built with the local-time
 * constructor. Nothing here parses a date-only string (which JavaScript reads
 * as UTC midnight) or joins "YYYY-MM-DDTHH:MM" (which pulls the offset in), and
 * nothing is derived from `new Date()` — the chosen day and clock are used
 * exactly as written, so the result can never slide onto a neighbouring
 * calendar day because of where the device or server happens to be running.
 * `toISOString()` does the single UTC conversion, later, at the storage edge.
 *
 * Returns null when the date is missing or unparseable — the caller shows a
 * gentle message rather than inventing a moment.
 */
export function remindAtForChosenDate(
  dateValue: string,
  timeValue: string | undefined,
): Date | null {
  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return null;

  // "HH:MM", strictly. Range-checked because `setHours(25, 0)` would silently
  // roll over into tomorrow 01:00 — a chosen time must never move the date.
  const [rawHours, rawMinutes] = (timeValue ?? "").split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const hasTime =
    rawHours !== undefined &&
    rawMinutes !== undefined &&
    rawHours !== "" &&
    rawMinutes !== "" &&
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59;

  // Local wall-clock: year, zero-based month, day, hour, minute, and zeroed
  // seconds/milliseconds so the moment is never a fraction into the minute.
  const when = new Date(
    year,
    month - 1,
    day,
    hasTime ? hours : DEFAULT_REMINDER_HOUR,
    hasTime ? minutes : 0,
    0,
    0,
  );
  return Number.isNaN(when.getTime()) ? null : when;
}

/**
 * True when a moment is still ahead of us.
 *
 * Saving an already-past reminder would quietly create something overdue the
 * instant it is written, so the Capture screen and the reschedule control both
 * check this first.
 */
export function isFutureMoment(value: Date | null | undefined, now: Date = new Date()): boolean {
  return !!value && value.getTime() > now.getTime();
}

/** The `min` value for a date input, so the browser blocks yesterday itself. */
export function todayDateInputValue(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Scheduled messages (Phase 6B)
// ---------------------------------------------------------------------------

/** Mirrors the database's status vocabulary; nothing here invents a state. */
export type ScheduledMessageStatus = "pending" | "sending" | "sent" | "failed" | "cancelled";

/**
 * A scheduled message as the UI sees it.
 *
 * Only what the person screen renders: the words, who they are for, when they
 * are due, and where they have got to. Delivery bookkeeping (attempts,
 * last_error) stays on the server side where it belongs.
 */
export type ScheduledMessage = {
  id: string;
  personId: string;
  body: string;
  /** The stored moment, as an ISO string. */
  sendAt: string;
  status: ScheduledMessageStatus;
  /** A human phrase for `send_at`, e.g. "in 3 days". Derived, never stored. */
  timing: string;
};

/**
 * Says when a scheduled message goes out, in the same warm register as
 * `reminderTiming` rather than a raw timestamp.
 */
export function scheduledMessageTiming(sendAt: string, now: Date = new Date()): string {
  const when = new Date(sendAt);
  if (Number.isNaN(when.getTime())) return "at a moment to decide";

  const diffMs = when.getTime() - now.getTime();
  if (diffMs <= 0) return "due now";

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;

  const days = Math.round(hours / 24);
  if (days <= 30) return `in ${days} day${days === 1 ? "" : "s"}`;

  return when.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/**
 * A deliberately forgiving email check.
 *
 * Enough to catch a typo or a pasted phone number before it is saved, not a
 * full RFC 5322 parser — real validation belongs to whoever eventually sends,
 * and a stricter rule would only push people into giving up.
 */
export function isReasonableEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  const at = trimmed.indexOf("@");
  if (at < 1 || at !== trimmed.lastIndexOf("@")) return false;
  const domain = trimmed.slice(at + 1);
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}
