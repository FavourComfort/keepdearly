import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useKeepDearly, g as todayDateInputValue, l as isFutureMoment, p as remindAtForChosenDate } from "./keepdearly-store-XbRJti1g.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as DataNotice, o as Icon, s as cn } from "./AppShell-D5MibK33.mjs";
import { t as TimePicker } from "./TimePicker-B_RCLLvN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ReminderCard-DDjb6BnY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var chipTone = {
	primary: "bg-primary-fixed/70 text-on-primary-fixed-variant",
	secondary: "bg-secondary-fixed text-on-secondary-fixed-variant",
	tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
	neutral: "bg-surface-container-high text-on-surface-variant"
};
/**
* The three quiet things you can do about a nudge.
*
* These are small text buttons — not checkboxes, swipes or a task manager. A
* reminder here is a memory someone wanted to be handed back, so the actions
* read the same way: "Done", "Let it go", "Reschedule".
*
* Reschedule is a plain date and time pair that unfolds in place. Still no
* calendar — two inputs name any moment just as well.
*/
function ReminderActions({ reminder }) {
	const { completeReminder, cancelReminder, rescheduleReminder } = useKeepDearly();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [date, setDate] = (0, import_react.useState)("");
	const [time, setTime] = (0, import_react.useState)("");
	async function run(action) {
		if (busy) return;
		setBusy(true);
		setError(null);
		const result = await action();
		setBusy(false);
		if (!result.ok) setError(result.error ?? "That didn't work just now.");
	}
	function startReschedule() {
		setDate(todayDateInputValue());
		setTime("");
		setError(null);
		setEditing(true);
	}
	function saveReschedule() {
		const next = remindAtForChosenDate(date, time);
		if (!next || !isFutureMoment(next)) {
			setError("Pick a moment that hasn't happened yet.");
			return;
		}
		run(async () => {
			const result = await rescheduleReminder(reminder.id, next);
			if (result.ok) setEditing(false);
			return result;
		});
	}
	const quietButton = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface disabled:opacity-50";
	if (editing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2 pt-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end gap-2 rounded-lg bg-surface-container-low p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "sr-only",
					htmlFor: `reschedule-date-${reminder.id}`,
					children: "New day"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: `reschedule-date-${reminder.id}`,
					type: "date",
					value: date,
					min: todayDateInputValue(),
					onChange: (e) => setDate(e.target.value),
					className: "rounded-lg bg-surface-container-lowest px-3 py-1.5 text-body-sm text-on-surface shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "sr-only",
					htmlFor: `reschedule-time-${reminder.id}`,
					children: "New time, optional"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimePicker, {
					id: `reschedule-time-${reminder.id}`,
					value: time,
					onChange: setTime,
					className: "w-auto py-1.5 text-body-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: saveReschedule,
					disabled: busy,
					className: "rounded-full bg-primary px-4 py-1.5 text-label-md text-on-primary shadow-sm transition-all hover:bg-tertiary disabled:opacity-50",
					children: busy ? "Moving…" : "Save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setEditing(false),
					disabled: busy,
					className: quietButton,
					children: "Keep as is"
				})
			]
		}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
			tone: "error",
			children: error
		}) : null]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1 pt-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void run(() => completeReminder(reminder.id)),
					disabled: busy,
					className: quietButton,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "check",
						className: "text-[16px]"
					}), "Done"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void run(() => cancelReminder(reminder.id)),
					disabled: busy,
					className: quietButton,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "not_interested",
						className: "text-[16px]"
					}), "Let it go"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: startReschedule,
					disabled: busy,
					className: quietButton,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "event_repeat",
						className: "text-[16px]"
					}), "Reschedule"]
				})
			]
		}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
			tone: "error",
			children: error
		}) : null]
	});
}
/** Small "coming up" card, used on Home and in the Reminders upcoming grid. */
function ReminderCard({ reminder }) {
	const isOverdue = reminder.isOverdue;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-title-md text-on-surface",
							children: reminder.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("mt-0.5 text-label-sm text-on-surface-variant", isOverdue && "text-error"),
							children: [isOverdue ? "Overdue · " : "", reminder.timing]
						})]
					}), reminder.personLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("shrink-0 rounded-full px-4 py-0.5 text-label-sm", chipTone[reminder.tone]),
						children: reminder.personLabel
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 rounded-lg bg-surface-container-low p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-body-sm italic text-on-surface",
						children: [
							"You noted: “",
							reminder.note,
							"”"
						]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-on-surface-variant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-label-sm text-secondary",
					children: reminder.meta
				}), reminder.personId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/people/$personId",
					params: { personId: reminder.personId },
					className: "transition-colors hover:text-primary",
					"aria-label": `Open ${reminder.personLabel}'s profile`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "edit_note",
						className: "text-[20px]"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "edit_note",
					className: "text-[20px]"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderActions, { reminder })
		]
	});
}
/** Featured reminder card with the note highlight, used for today / this week. */
function ReminderFeature({ reminder, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
		children: [accent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-0 left-0 top-0 w-1.5 bg-primary-container" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex flex-col gap-4", accent && "pl-1"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-headline-sm text-on-surface",
							children: reminder.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 flex items-center gap-1 text-label-md font-medium text-primary",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									name: reminder.isOverdue ? "history" : "schedule",
									className: "text-[16px]"
								}),
								reminder.isOverdue ? "Overdue · " : "",
								reminder.timing
							]
						})]
					}), reminder.meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-label-sm", chipTone[reminder.tone]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "favorite",
							filled: true,
							className: "text-[14px]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reminder.meta })]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1 rounded-lg bg-surface-container-low p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-label-sm font-semibold uppercase tracking-wider text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "bookmark_added",
							className: "text-[16px]"
						}), "Attached note highlight"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-body-md italic text-on-surface",
						children: [
							"You noted: “",
							reminder.note,
							"”"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 pt-1",
					children: [reminder.personId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/people/$personId",
						params: { personId: reminder.personId },
						className: "rounded-full bg-primary-container px-4 py-1.5 text-label-md text-on-primary-container shadow-sm transition-all hover:bg-primary hover:text-on-primary",
						children: [
							"View ",
							reminder.personLabel,
							"'s profile"
						]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/capture",
						search: { person: reminder.personId },
						className: "rounded-full bg-surface-container-high px-4 py-1.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-highest",
						children: "Add a gift note"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderActions, { reminder })
			]
		})]
	});
}
//#endregion
export { ReminderFeature as n, ReminderCard as t };
