import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Icon, s as cn } from "./AppShell-D5MibK33.mjs";
import { c as require_react_dom } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TimePicker-B_RCLLvN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
var MINUTES = Array.from({ length: 60 }, (_, index) => index);
/** What an unset field opens on — the same 9:00 AM the relative options use. */
var DEFAULT_HOUR = 9;
var DEFAULT_MINUTE = 0;
var DEFAULT_PERIOD = "AM";
function pad(value) {
	return String(value).padStart(2, "0");
}
/** Parses the stored "HH:MM" 24-hour value, or null when unset/unparseable. */
function parseTime(value) {
	const [rawHour, rawMinute] = (value ?? "").split(":");
	if (rawHour === void 0 || rawMinute === void 0) return null;
	const hour24 = Number(rawHour);
	const minute = Number(rawMinute);
	if (!Number.isInteger(hour24) || !Number.isInteger(minute)) return null;
	if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) return null;
	return {
		hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
		minute,
		period: hour24 >= 12 ? "PM" : "AM"
	};
}
/** The 24-hour "HH:MM" the rest of the app expects back. */
function toValue(hour12, minute, period) {
	return `${pad(hour12 % 12 + (period === "PM" ? 12 : 0))}:${pad(minute)}`;
}
/** A warm "2:30 PM", matching every other time string in the app. */
function formatValue(value) {
	const parsed = parseTime(value);
	if (!parsed) return null;
	return `${parsed.hour12}:${pad(parsed.minute)} ${parsed.period}`;
}
/** One scrollable column of numbers (hours, then minutes). */
function TimeColumn({ label, values, selected, onSelect, scrollRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-1 flex-col gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-center text-label-sm uppercase tracking-wide text-on-surface-variant",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scrollRef,
			className: "h-44 overflow-y-auto rounded-lg bg-surface-container-low p-1",
			children: values.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"data-active": value === selected,
				"aria-pressed": value === selected,
				onClick: () => onSelect(value),
				className: cn("block w-full rounded-md px-3 py-2 text-center text-body-md transition-colors", value === selected ? "bg-primary text-on-primary shadow-sm" : "text-on-surface hover:bg-surface-container"),
				children: pad(value)
			}, value))
		})]
	});
}
/**
* The modal itself. Mounted only while open, so its draft always begins from
* the caller's saved value — closing it can never wipe a committed time.
*/
function TimePickerDialog({ value, onConfirm, onCancel, onClear }) {
	const parsed = parseTime(value);
	const [hour12, setHour12] = (0, import_react.useState)(parsed?.hour12 ?? DEFAULT_HOUR);
	const [minute, setMinute] = (0, import_react.useState)(parsed?.minute ?? DEFAULT_MINUTE);
	const [period, setPeriod] = (0, import_react.useState)(parsed?.period ?? DEFAULT_PERIOD);
	const dialogRef = (0, import_react.useRef)(null);
	const hourColumn = (0, import_react.useRef)(null);
	const minuteColumn = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialogRef.current?.focus();
		const onKeyDown = (event) => {
			if (event.key === "Escape") onCancel();
		};
		document.addEventListener("keydown", onKeyDown);
		for (const column of [hourColumn.current, minuteColumn.current]) column?.querySelector("[data-active=\"true\"]")?.scrollIntoView({ block: "center" });
		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [onCancel]);
	const preview = formatValue(toValue(hour12, minute, period)) ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			onClick: onCancel,
			className: "absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: dialogRef,
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Choose a time",
			tabIndex: -1,
			className: "relative z-10 flex w-full max-w-sm flex-col overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-xl outline-none animate-in slide-in-from-bottom-4 fade-in duration-200 sm:rounded-2xl sm:zoom-in-95 sm:slide-in-from-bottom-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 px-5 pt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-title-md text-on-surface",
						children: "What time?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-1 rounded-full bg-surface-container-low p-1",
						children: ["AM", "PM"].map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPeriod(option),
							"aria-pressed": option === period,
							className: cn("rounded-full px-3 py-1 text-label-md transition-colors", option === period ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"),
							children: option
						}, option))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "px-5 pt-1 text-body-sm text-on-surface-variant",
					children: ["Selected ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold tabular-nums text-on-surface",
						children: preview
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-stretch gap-3 px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeColumn, {
						label: "Hour",
						values: HOURS,
						selected: hour12,
						onSelect: setHour12,
						scrollRef: hourColumn
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimeColumn, {
						label: "Minute",
						values: MINUTES,
						selected: minute,
						onSelect: setMinute,
						scrollRef: minuteColumn
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 border-t border-outline-variant/50 px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClear,
						className: "rounded-full px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface",
						children: "Clear"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onCancel,
							className: "rounded-full px-4 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onConfirm(toValue(hour12, minute, period)),
							className: "rounded-full bg-primary px-5 py-2 text-label-md text-on-primary shadow-sm transition-all hover:bg-tertiary active:scale-95",
							children: "OK"
						})]
					})]
				})
			]
		})]
	});
}
/**
* The field the screens render: a button showing the chosen time that opens the
* dialog. Controlled — the parent owns the value and receives every commit
* through `onChange`. Optional, so an empty value simply shows the placeholder.
*/
function TimePicker({ value, onChange, id, placeholder = "Choose a time", className }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const display = formatValue(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		id,
		type: "button",
		onClick: () => setOpen(true),
		"aria-haspopup": "dialog",
		className: cn("flex w-full items-center justify-between gap-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-left shadow-sm outline-none transition-colors hover:bg-surface-container focus-visible:ring-2 focus-visible:ring-primary/30", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("truncate", display ? "text-on-surface" : "text-outline"),
			children: display ?? placeholder
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			name: "schedule",
			className: "shrink-0 text-[18px] text-outline"
		})]
	}), open ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimePickerDialog, {
		value,
		onConfirm: (next) => {
			onChange(next);
			setOpen(false);
		},
		onCancel: () => setOpen(false),
		onClear: () => {
			onChange("");
			setOpen(false);
		}
	}), document.body) : null] });
}
//#endregion
export { TimePicker as t };
