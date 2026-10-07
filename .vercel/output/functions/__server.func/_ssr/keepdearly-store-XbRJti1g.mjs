import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth, i as getSupabase } from "./BrandMark-D4AhOfJ-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/keepdearly-store-XbRJti1g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The Capture-screen options.
*
* "Custom" is gone. It had no date, no time and no behaviour behind it, and a
* button that silently does nothing is worse than one fewer choice. Five honest
* options beat six where one is a lie.
*/
var reminderOptions = [
	{
		id: "none",
		label: "No reminder",
		icon: "notifications_off"
	},
	{
		id: "1-week",
		label: "1 week before",
		icon: "schedule"
	},
	{
		id: "3-days",
		label: "3 days before",
		icon: "hourglass_empty"
	},
	{
		id: "1-day",
		label: "1 day before",
		icon: "wb_twilight"
	},
	{
		id: "date",
		label: "Choose date",
		icon: "calendar_month"
	}
];
var TONES = [
	"primary",
	"secondary",
	"tertiary",
	"neutral"
];
/** Stable per-id accent so a person keeps the same colour across the app. */
function toneForId(seed) {
	if (!seed) return "neutral";
	let hash = 0;
	for (let index = 0; index < seed.length; index++) hash = (hash * 31 + seed.charCodeAt(index)) % 100003;
	return TONES[hash % TONES.length] ?? "neutral";
}
function initialForName(name) {
	return name.trim().charAt(0).toUpperCase() || "?";
}
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
var DAY_MS = 864e5;
function parseDate(iso) {
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date;
}
function startOfDay(value) {
	const copy = new Date(value);
	copy.setHours(0, 0, 0, 0);
	return copy.getTime();
}
/** Whole calendar days from today until `iso` (negative when in the past). */
function daysFromToday(iso, now = /* @__PURE__ */ new Date()) {
	const target = parseDate(iso);
	if (!target) return 0;
	return Math.round((startOfDay(target) - startOfDay(now)) / DAY_MS);
}
function formatDay(iso, now = /* @__PURE__ */ new Date()) {
	const date = parseDate(iso);
	if (!date) return "";
	const month = MONTHS[date.getMonth()] ?? "";
	const day = date.getDate();
	return date.getFullYear() === now.getFullYear() ? `${month} ${day}` : `${month} ${day}, ${date.getFullYear()}`;
}
function formatTime(date) {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const suffix = hours >= 12 ? "PM" : "AM";
	return `${hours % 12 === 0 ? 12 : hours % 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
/** The "Added …" stamp on a memory card. */
function memoryWhen(iso, now = /* @__PURE__ */ new Date()) {
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
function reminderTiming(iso, now = /* @__PURE__ */ new Date(), overdue = false) {
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
function reminderIsOverdue(iso, status, now = /* @__PURE__ */ new Date()) {
	if (status !== "pending") return false;
	const date = parseDate(iso);
	if (!date) return false;
	return date.getTime() < now.getTime();
}
/** Which of the Reminders screen sections this belongs to. */
function reminderBucket(iso, status, now = /* @__PURE__ */ new Date()) {
	if (reminderIsOverdue(iso, status, now)) return "overdue";
	const diff = daysFromToday(iso, now);
	if (diff <= 0) return "today";
	if (diff <= 7) return "week";
	return "upcoming";
}
var REMINDER_OFFSET_DAYS = {
	"1-week": 7,
	"3-days": 3,
	"1-day": 1
};
/** The timestamp the relative options resolve to, or null when unsupported. */
function remindAtForOption(optionId, from = /* @__PURE__ */ new Date()) {
	const days = REMINDER_OFFSET_DAYS[optionId];
	if (days === void 0) return null;
	const when = new Date(from);
	when.setDate(when.getDate() + days);
	when.setHours(9, 0, 0, 0);
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
function remindAtForChosenDate(dateValue, timeValue) {
	const [year, month, day] = dateValue.split("-").map(Number);
	if (!year || !month || !day) return null;
	const [rawHours, rawMinutes] = (timeValue ?? "").split(":");
	const hours = Number(rawHours);
	const minutes = Number(rawMinutes);
	const hasTime = rawHours !== void 0 && rawMinutes !== void 0 && rawHours !== "" && rawMinutes !== "" && Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
	const when = new Date(year, month - 1, day, hasTime ? hours : 9, hasTime ? minutes : 0, 0, 0);
	return Number.isNaN(when.getTime()) ? null : when;
}
/**
* True when a moment is still ahead of us.
*
* Saving an already-past reminder would quietly create something overdue the
* instant it is written, so the Capture screen and the reschedule control both
* check this first.
*/
function isFutureMoment(value, now = /* @__PURE__ */ new Date()) {
	return !!value && value.getTime() > now.getTime();
}
/** The `min` value for a date input, so the browser blocks yesterday itself. */
function todayDateInputValue(now = /* @__PURE__ */ new Date()) {
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${now.getFullYear()}-${month}-${day}`;
}
/**
* Says when a scheduled message goes out, in the same warm register as
* `reminderTiming` rather than a raw timestamp.
*/
function scheduledMessageTiming(sendAt, now = /* @__PURE__ */ new Date()) {
	const when = new Date(sendAt);
	if (Number.isNaN(when.getTime())) return "at a moment to decide";
	const diffMs = when.getTime() - now.getTime();
	if (diffMs <= 0) return "due now";
	const minutes = Math.round(diffMs / 6e4);
	if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
	const days = Math.round(hours / 24);
	if (days <= 30) return `in ${days} day${days === 1 ? "" : "s"}`;
	return when.toLocaleDateString(void 0, {
		day: "numeric",
		month: "short"
	});
}
/**
* A deliberately forgiving email check.
*
* Enough to catch a typo or a pasted phone number before it is saved, not a
* full RFC 5322 parser — real validation belongs to whoever eventually sends,
* and a stricter rule would only push people into giving up.
*/
function isReasonableEmail(value) {
	const trimmed = value.trim();
	if (!trimmed || /\s/.test(trimmed)) return false;
	const at = trimmed.indexOf("@");
	if (at < 1 || at !== trimmed.lastIndexOf("@")) return false;
	const domain = trimmed.slice(at + 1);
	return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".");
}
/**
* Photos on memories.
*
* One picture per memory, and that is the whole media story in KeepDearly —
* there is no voice note, no recording control and no transcription. Keeping
* this in one place means the composer, the store and the migration in
* `supabase/migrations/0012_memory_photos.sql` all agree on the bucket name,
* the size ceiling and the object path.
*
* The bucket is PRIVATE. Nothing is served from a public URL; the app asks
* Supabase for a short-lived signed URL instead, so a leaked link stops working
* within the hour and no memory photo is ever world-readable.
*
* Object paths are `<user_id>/<memory_id>.<ext>`. The leading folder is the
* owner, which is what every storage policy keys off, so the browser can only
* ever write into its own folder.
*/
/** Private bucket. Created by migration 0012. */
var MEMORY_PHOTO_BUCKET = "memory-photos";
/**
* A plain `image/*` accept. No `capture` attribute: that would skip the
* gallery/file choices that Android and iOS users expect, and photos are more
* often chosen from an existing library than taken on the spot.
*/
var PHOTO_ACCEPT = "image/*";
var PHOTO_WRONG_TYPE_MESSAGE = "That file isn't an image.";
var PHOTO_TOO_LARGE_MESSAGE = "That photo is over 8 MB. Try a smaller one.";
/** True when the browser handed us something the bucket will actually take. */
function isSupportedPhoto(file) {
	return file.type.startsWith("image/");
}
/** Keeps a filename-ish extension without ever producing a path segment. */
function extensionFor$1(file) {
	const fromType = file.type.split("/")[1]?.replace("jpeg", "jpg").replace(/\+.*$/, "");
	if (fromType && /^[a-z0-9]+$/.test(fromType)) return `.${fromType}`;
	const fromName = file.name.split(".").pop()?.toLowerCase();
	if (fromName && /^[a-z0-9]+$/.test(fromName)) return `.${fromName}`;
	return ".bin";
}
/** Where one memory's photo lives. The first segment must be the owner id. */
function memoryPhotoPath(userId, memoryId, file) {
	return `${userId}/${memoryId}${extensionFor$1(file)}`;
}
/**
* Uploads one photo against the memory's own id.
*
* Returns the object path to store on the row. Throws on failure — the caller
* decides what that means, because by then the memory itself already exists.
*/
async function uploadMemoryPhoto(userId, memoryId, file) {
	const path = memoryPhotoPath(userId, memoryId, file);
	const { error } = await getSupabase().storage.from(MEMORY_PHOTO_BUCKET).upload(path, file, {
		contentType: file.type,
		upsert: true
	});
	if (error) throw new Error(error.message);
	return path;
}
/** Best-effort cleanup, used when an upload succeeded but attaching it did not. */
async function deleteMemoryPhoto(path) {
	const { error } = await getSupabase().storage.from(MEMORY_PHOTO_BUCKET).remove([path]);
	if (error) console.error("Could not remove memory photo:", error.message);
}
/**
* A short-lived URL for display, or null when there is nothing to show.
*
* Resolved once per load rather than per render: signing is a network round
* trip, and a signed URL that expires within the hour is refreshed by the next
* load (the 60s store tick) rather than by every component.
*/
async function signedMemoryPhotoUrl(path) {
	const { data, error } = await getSupabase().storage.from(MEMORY_PHOTO_BUCKET).createSignedUrl(path, 3600);
	if (error) {
		console.error("Could not sign memory photo:", error.message);
		return null;
	}
	return data?.signedUrl ?? null;
}
/**
* Profile photos for people.
*
* This is NOT the memory photo in `memory-photo.ts`. The two are separate on
* purpose — different buckets, different columns, different owners:
*
*   people.avatar_url  -> the person
*   memories.photo_path-> the memory
*
* Nothing here reads, writes or cleans up a memory photo, and the memory flow
* does not know this module exists.
*
* The bucket is private. People are private to their owner, so a portrait is
* only ever read through a short-lived signed URL rather than a permanent link.
* Object paths are `<user_id>/<person_id>.<ext>` — the leading folder is the
* owner, which is what the storage policies key off, so the browser can only
* ever write into its own folder.
*/
/** Private bucket. Created by migration 0013. */
var PERSON_AVATAR_BUCKET = "person-avatars";
/**
* A plain `image/*` accept, no `capture` attribute: that would skip the
* gallery/file choices people expect on Android and iOS.
*/
var AVATAR_ACCEPT = "image/*";
var AVATAR_WRONG_TYPE_MESSAGE = "That file isn't an image.";
var AVATAR_TOO_LARGE_MESSAGE = "That photo is over 5 MB. Try a smaller one.";
/** True when the browser handed us something the bucket will actually take. */
function isSupportedAvatar(file) {
	return file.type.startsWith("image/");
}
/** Keeps a filename-ish extension without ever producing a path segment. */
function extensionFor(file) {
	const fromType = file.type.split("/")[1]?.replace("jpeg", "jpg").replace(/\+.*$/, "");
	if (fromType && /^[a-z0-9]+$/.test(fromType)) return `.${fromType}`;
	const fromName = file.name.split(".").pop()?.toLowerCase();
	if (fromName && /^[a-z0-9]+$/.test(fromName)) return `.${fromName}`;
	return ".bin";
}
/** Where one person's portrait lives. The first segment is the owner id. */
function personAvatarPath(userId, personId, file) {
	return `${userId}/${personId}${extensionFor(file)}`;
}
/**
* Uploads one portrait against the person's own id.
*
* Returns the object path to store on `people.avatar_url`. Throws on failure —
* by then the person row already exists, so the caller decides what that means.
*/
async function uploadPersonAvatar(userId, personId, file) {
	const path = personAvatarPath(userId, personId, file);
	const { error } = await getSupabase().storage.from(PERSON_AVATAR_BUCKET).upload(path, file, {
		contentType: file.type,
		upsert: true
	});
	if (error) throw new Error(error.message);
	return path;
}
/** Best-effort cleanup, used when an upload succeeded but attaching it did not. */
async function deletePersonAvatar(path) {
	const { error } = await getSupabase().storage.from(PERSON_AVATAR_BUCKET).remove([path]);
	if (error) console.error("Could not remove person avatar:", error.message);
}
/**
* A short-lived URL for display, or null when there is nothing to show.
*
* Resolved once per load alongside the memory photos rather than per render:
* signing is a network round trip, and a URL that expires within the hour is
* refreshed by the next load.
*/
async function signedPersonAvatarUrl(path) {
	const { data, error } = await getSupabase().storage.from(PERSON_AVATAR_BUCKET).createSignedUrl(path, 3600);
	if (error) {
		console.error("Could not sign person avatar:", error.message);
		return null;
	}
	return data?.signedUrl ?? null;
}
/**
* KeepDearly's data, now backed by Supabase for the signed-in user.
*
* Same shape as the demo store it replaces — a context holding people, memories
* and reminders — so the screens did not have to be rewritten. What changed is
* where the rows come from and that writes actually persist.
*
* The user id always comes from the Supabase session via useAuth(). It is never
* read from a form, a URL or a prop.
*/
var LOAD_ERROR = "We couldn't reach your keeps just now.";
var REMINDER_ERROR = "We couldn't update that reminder just now.";
var PAST_REMINDER_ERROR = "Pick a moment that hasn't happened yet.";
var MESSAGE_ERROR = "We couldn't save that message just now.";
var EMAIL_ERROR = "We couldn't save that email just now.";
var BAD_EMAIL_ERROR = "That doesn't look like an email address.";
var PAST_MESSAGE_ERROR = "Pick a moment that hasn't happened yet.";
var CANCEL_ERROR = "We couldn't cancel that message just now.";
var KeepDearlyContext = (0, import_react.createContext)(null);
function toMemoryView(row, people, photoUrl) {
	const person = row.person_id ? people.find((p) => p.id === row.person_id) : void 0;
	return {
		id: row.id,
		personId: row.person_id ?? void 0,
		personLabel: person?.name ?? "Personal Note",
		text: row.content,
		when: memoryWhen(row.created_at),
		tone: row.person_id ? toneForId(row.person_id) : "neutral",
		photoUrl
	};
}
function toPersonView(row, memories, reminders, avatarUrl) {
	const latest = memories.find((memory) => memory.person_id === row.id);
	const ownMemoryIds = new Set(memories.filter((memory) => memory.person_id === row.id).map((memory) => memory.id));
	const hasActiveReminder = reminders.some((reminder) => reminder.status === "pending" && ownMemoryIds.has(reminder.memory_id));
	return {
		id: row.id,
		name: row.name,
		initial: initialForName(row.name),
		tone: toneForId(row.id),
		avatarUrl,
		headline: latest?.content ?? "Nothing kept yet.",
		likes: [],
		dislikes: [],
		giftIdeas: [],
		hasActiveReminder,
		email: row.email
	};
}
function toScheduledMessageView(row, now) {
	return {
		id: row.id,
		personId: row.person_id,
		body: row.body,
		sendAt: row.send_at,
		status: row.status,
		timing: scheduledMessageTiming(row.send_at, now)
	};
}
function toReminderView(row, memories, people, now) {
	const memory = memories.find((m) => m.id === row.memory_id);
	const person = memory?.person_id ? people.find((p) => p.id === memory.person_id) : void 0;
	const isOverdue = reminderIsOverdue(row.remind_at, row.status, now);
	return {
		id: row.id,
		title: person?.name ?? "A memory to revisit",
		personId: person?.id,
		personLabel: person?.name,
		timing: reminderTiming(row.remind_at, now, isOverdue),
		bucket: reminderBucket(row.remind_at, row.status, now),
		remindAt: row.remind_at,
		status: row.status,
		isOverdue,
		note: memory?.content ?? "",
		tone: person ? toneForId(person.id) : "primary"
	};
}
function KeepDearlyProvider({ children }) {
	const { user, isConfigured } = useAuth();
	const userId = user?.id;
	const [personRows, setPersonRows] = (0, import_react.useState)([]);
	const [memoryRows, setMemoryRows] = (0, import_react.useState)([]);
	const [reminderRows, setReminderRows] = (0, import_react.useState)([]);
	const [scheduledMessageRows, setScheduledMessageRows] = (0, import_react.useState)([]);
	const [photoUrls, setPhotoUrls] = (0, import_react.useState)({});
	const [avatarUrls, setAvatarUrls] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [nowMs, setNowMs] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => setNowMs(Date.now()), 6e4);
		return () => clearInterval(timer);
	}, []);
	const resolvePhotoUrls = (0, import_react.useCallback)(async (rows) => {
		const signed = {};
		await Promise.all(rows.map(async (row) => {
			if (!row.photo_path) return;
			const url = await signedMemoryPhotoUrl(row.photo_path);
			if (url) signed[row.id] = url;
		}));
		setPhotoUrls(signed);
	}, []);
	const resolveAvatarUrls = (0, import_react.useCallback)(async (rows) => {
		const signed = {};
		await Promise.all(rows.map(async (row) => {
			if (!row.avatar_url) return;
			const url = await signedPersonAvatarUrl(row.avatar_url);
			if (url) signed[row.id] = url;
		}));
		setAvatarUrls(signed);
	}, []);
	(0, import_react.useEffect)(() => {
		const hasPhotos = memoryRows.some((row) => row.photo_path);
		const hasAvatars = personRows.some((row) => row.avatar_url);
		if (!hasPhotos && !hasAvatars) return;
		const onVisibilityChange = () => {
			if (document.visibilityState !== "visible") return;
			if (hasPhotos) resolvePhotoUrls(memoryRows);
			if (hasAvatars) resolveAvatarUrls(personRows);
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => document.removeEventListener("visibilitychange", onVisibilityChange);
	}, [
		memoryRows,
		personRows,
		resolvePhotoUrls,
		resolveAvatarUrls
	]);
	const load = (0, import_react.useCallback)(async () => {
		if (!userId || !isConfigured) {
			setPersonRows([]);
			setMemoryRows([]);
			setReminderRows([]);
			setScheduledMessageRows([]);
			setPhotoUrls({});
			setAvatarUrls({});
			setLoading(false);
			setError(null);
			return;
		}
		setLoading(true);
		setError(null);
		const supabase = getSupabase();
		const [peopleResult, memoriesResult, remindersResult, scheduledResult] = await Promise.all([
			supabase.from("people").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
			supabase.from("memories").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
			supabase.from("reminders").select("*").eq("user_id", userId).order("remind_at", { ascending: true }),
			supabase.from("scheduled_messages").select("*").eq("user_id", userId).order("send_at", { ascending: true })
		]);
		const failure = peopleResult.error ?? memoriesResult.error ?? remindersResult.error ?? scheduledResult.error;
		if (failure) {
			console.error("Could not load KeepDearly data:", failure.message);
			setError(LOAD_ERROR);
		}
		if (peopleResult.data) {
			setPersonRows(peopleResult.data);
			resolveAvatarUrls(peopleResult.data);
		}
		if (memoriesResult.data) {
			setMemoryRows(memoriesResult.data);
			resolvePhotoUrls(memoriesResult.data);
		}
		if (remindersResult.data) setReminderRows(remindersResult.data);
		if (scheduledResult.data) setScheduledMessageRows(scheduledResult.data);
		setLoading(false);
	}, [
		userId,
		isConfigured,
		resolvePhotoUrls,
		resolveAvatarUrls
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const people = (0, import_react.useMemo)(() => personRows.map((row) => toPersonView(row, memoryRows, reminderRows, avatarUrls[row.id])), [
		personRows,
		memoryRows,
		reminderRows,
		avatarUrls
	]);
	const memories = (0, import_react.useMemo)(() => memoryRows.map((row) => toMemoryView(row, personRows, photoUrls[row.id])), [
		memoryRows,
		personRows,
		photoUrls
	]);
	const reminders = (0, import_react.useMemo)(() => reminderRows.map((row) => toReminderView(row, memoryRows, personRows, new Date(nowMs))), [
		reminderRows,
		memoryRows,
		personRows,
		nowMs
	]);
	const scheduledMessages = (0, import_react.useMemo)(() => scheduledMessageRows.map((row) => toScheduledMessageView(row, new Date(nowMs))), [scheduledMessageRows, nowMs]);
	const savePersonEmail = (0, import_react.useCallback)(async (personId, email) => {
		const trimmed = email.trim();
		if (trimmed && !isReasonableEmail(trimmed)) return {
			ok: false,
			error: BAD_EMAIL_ERROR
		};
		const { error } = await getSupabase().from("people").update({ email: trimmed || null }).eq("id", personId).eq("user_id", userId ?? "");
		if (error) {
			console.error("Could not save person email:", error.message);
			return {
				ok: false,
				error: EMAIL_ERROR
			};
		}
		return {
			ok: true,
			error: null
		};
	}, [userId]);
	const saveScheduledMessage = (0, import_react.useCallback)(async ({ personId, body, sendAt }) => {
		const trimmed = body.trim();
		if (!trimmed) return {
			ok: false,
			error: MESSAGE_ERROR
		};
		if (!isFutureMoment(sendAt)) return {
			ok: false,
			error: PAST_MESSAGE_ERROR
		};
		if (!userId) return {
			ok: false,
			error: MESSAGE_ERROR
		};
		const { error } = await getSupabase().from("scheduled_messages").insert({
			user_id: userId,
			person_id: personId,
			body: trimmed,
			send_at: sendAt.toISOString()
		});
		if (error) {
			console.error("Could not save scheduled message:", error.message);
			return {
				ok: false,
				error: MESSAGE_ERROR
			};
		}
		return {
			ok: true,
			error: null
		};
	}, [userId]);
	const cancelScheduledMessage = (0, import_react.useCallback)(async (id) => {
		const { error } = await getSupabase().rpc("cancel_scheduled_message", { p_message_id: id });
		if (error) {
			console.error("Could not cancel scheduled message:", error.message);
			return {
				ok: false,
				error: CANCEL_ERROR
			};
		}
		return {
			ok: true,
			error: null
		};
	}, []);
	/**
	* Create a person on their own, without a memory attached.
	*
	* This is the same insert `saveMemory` already performs for its inline
	* "or add someone new…" field — one model, one code path, so a person added
	* here is indistinguishable from one added mid-memory.
	*
	* The portrait goes up only after the row exists, because the object is named
	* after the person's own id. A failed upload is reported rather than allowed
	* to throw away the name someone just typed: the person is kept, and the
	* screen simply moves on to them.
	*/
	const savePerson = (0, import_react.useCallback)(async ({ name, photo }) => {
		const trimmed = name.trim();
		if (!userId || !isConfigured) return {
			ok: false,
			error: LOAD_ERROR,
			personId: null
		};
		if (!trimmed) return {
			ok: false,
			error: "Give them a name first.",
			personId: null
		};
		const supabase = getSupabase();
		const { data: person, error: personError } = await supabase.from("people").insert({
			user_id: userId,
			name: trimmed
		}).select("id").single();
		if (personError || !person) {
			console.error("Could not create person:", personError?.message);
			return {
				ok: false,
				error: "We couldn't keep that person just now.",
				personId: null
			};
		}
		if (photo) try {
			const avatarPath = await uploadPersonAvatar(userId, person.id, photo);
			const { error: avatarError } = await supabase.from("people").update({ avatar_url: avatarPath }).eq("id", person.id).eq("user_id", userId);
			if (avatarError) {
				console.error("Could not attach photo:", avatarError.message);
				await deletePersonAvatar(avatarPath);
			}
		} catch (uploadError) {
			console.error("Could not upload photo:", uploadError);
		}
		await load();
		return {
			ok: true,
			error: null,
			personId: person.id
		};
	}, [
		userId,
		isConfigured,
		load
	]);
	const saveMemory = (0, import_react.useCallback)(async ({ content, personId, newPersonName, reminderOption, reminderDate, reminderTime, photo }) => {
		const trimmed = content.trim();
		if (!userId || !isConfigured) return {
			ok: false,
			error: LOAD_ERROR,
			personId: null
		};
		if (!trimmed) return {
			ok: false,
			error: "Write something first, then keep it.",
			personId: null
		};
		const supabase = getSupabase();
		let resolvedPersonId = personId ?? null;
		const newName = newPersonName?.trim();
		if (!resolvedPersonId && newName) {
			const { data, error: personError } = await supabase.from("people").insert({
				user_id: userId,
				name: newName
			}).select("*").single();
			if (personError || !data) {
				console.error("Could not create person:", personError?.message);
				return {
					ok: false,
					error: "We couldn't keep that person just now.",
					personId: null
				};
			}
			resolvedPersonId = data.id;
		}
		const { data: memory, error: memoryError } = await supabase.from("memories").insert({
			user_id: userId,
			content: trimmed,
			person_id: resolvedPersonId
		}).select("*").single();
		if (memoryError || !memory) {
			console.error("Could not create memory:", memoryError?.message);
			return {
				ok: false,
				error: "We couldn't keep that just now.",
				personId: resolvedPersonId
			};
		}
		if (photo) try {
			const photoPath = await uploadMemoryPhoto(userId, memory.id, photo);
			const { error: photoError } = await supabase.from("memories").update({ photo_path: photoPath }).eq("id", memory.id).eq("user_id", userId);
			if (photoError) {
				console.error("Could not attach photo:", photoError.message);
				await deleteMemoryPhoto(photoPath);
			}
		} catch (uploadError) {
			console.error("Could not upload photo:", uploadError);
		}
		const remindAt = reminderOption === "date" ? remindAtForChosenDate(reminderDate ?? "", reminderTime) : remindAtForOption(reminderOption);
		if (reminderOption === "date" && !isFutureMoment(remindAt)) console.warn("Reminder skipped — no future date and time were given.");
		else if (remindAt) {
			const { error: reminderError } = await supabase.from("reminders").insert({
				user_id: userId,
				memory_id: memory.id,
				remind_at: remindAt.toISOString(),
				status: "pending"
			}).select("id").single();
			if (reminderError) console.error("Could not create reminder:", reminderError.message);
		}
		await load();
		return {
			ok: true,
			error: null,
			personId: resolvedPersonId
		};
	}, [
		userId,
		isConfigured,
		load
	]);
	/**
	* The three reminder mutations, sharing one shape.
	*
	* `user_id` is never taken from an argument — it always comes from the
	* Supabase session, and the explicit `.eq` mirrors the owner-scoped RLS so the
	* intent survives a mis-set policy. Each one refreshes through `load`, the
	* same path every screen already uses, and every failure is reported back
	* rather than swallowed.
	*/
	const updateReminder = (0, import_react.useCallback)(async (id, patch) => {
		if (!userId || !isConfigured) return {
			ok: false,
			error: LOAD_ERROR
		};
		const { error: updateError } = await getSupabase().from("reminders").update({
			...patch,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id).eq("user_id", userId);
		if (updateError) {
			console.error("Could not update reminder:", updateError.message);
			return {
				ok: false,
				error: REMINDER_ERROR
			};
		}
		await load();
		return {
			ok: true,
			error: null
		};
	}, [
		userId,
		isConfigured,
		load
	]);
	/** "Done" — the moment happened, the nudge was heard. */
	const completeReminder = (0, import_react.useCallback)((id) => updateReminder(id, {
		status: "completed",
		completed_at: (/* @__PURE__ */ new Date()).toISOString()
	}), [updateReminder]);
	/** "Let it go" — the reminder is dismissed and stays dismissed. */
	const cancelReminder = (0, import_react.useCallback)((id) => updateReminder(id, { status: "cancelled" }), [updateReminder]);
	/** Moves the moment and puts the reminder back in play. */
	const rescheduleReminder = (0, import_react.useCallback)((id, remindAt) => {
		if (!isFutureMoment(remindAt)) return Promise.resolve({
			ok: false,
			error: PAST_REMINDER_ERROR
		});
		return updateReminder(id, {
			remind_at: remindAt.toISOString(),
			status: "pending",
			completed_at: null
		});
	}, [updateReminder]);
	const value = (0, import_react.useMemo)(() => ({
		people,
		memories,
		reminders,
		scheduledMessages,
		loading,
		error,
		refresh: load,
		personById: (id) => id ? people.find((person) => person.id === id) : void 0,
		memoriesFor: (personId) => memories.filter((memory) => memory.personId === personId),
		scheduledMessagesFor: (personId) => scheduledMessages.filter((message) => message.personId === personId),
		savePerson,
		saveMemory,
		completeReminder,
		cancelReminder,
		rescheduleReminder,
		savePersonEmail,
		saveScheduledMessage,
		cancelScheduledMessage
	}), [
		people,
		memories,
		reminders,
		scheduledMessages,
		loading,
		error,
		load,
		savePerson,
		saveMemory,
		completeReminder,
		cancelReminder,
		rescheduleReminder,
		savePersonEmail,
		saveScheduledMessage,
		cancelScheduledMessage
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeepDearlyContext.Provider, {
		value,
		children
	});
}
function useKeepDearly() {
	const ctx = (0, import_react.useContext)(KeepDearlyContext);
	if (!ctx) throw new Error("useKeepDearly must be used inside KeepDearlyProvider");
	return ctx;
}
//#endregion
export { useKeepDearly as _, PHOTO_ACCEPT as a, initialForName as c, isSupportedAvatar as d, isSupportedPhoto as f, todayDateInputValue as g, reminderTiming as h, KeepDearlyProvider as i, isFutureMoment as l, reminderOptions as m, AVATAR_TOO_LARGE_MESSAGE as n, PHOTO_TOO_LARGE_MESSAGE as o, remindAtForChosenDate as p, AVATAR_WRONG_TYPE_MESSAGE as r, PHOTO_WRONG_TYPE_MESSAGE as s, AVATAR_ACCEPT as t, isReasonableEmail as u };
