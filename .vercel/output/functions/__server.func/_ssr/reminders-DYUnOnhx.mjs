import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useKeepDearly } from "./keepdearly-store-XbRJti1g.mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { i as DataLoading, n as DataEmpty, r as DataError, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { n as ReminderFeature, t as ReminderCard } from "./ReminderCard-DDjb6BnY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reminders-DYUnOnhx.js
var import_jsx_runtime = require_jsx_runtime();
function Reminders() {
	const { reminders, loading, error } = useKeepDearly();
	const active = reminders.filter((reminder) => reminder.status === "pending");
	const overdue = active.filter((reminder) => reminder.isOverdue);
	const today = active.filter((reminder) => reminder.bucket === "today");
	const week = active.filter((reminder) => reminder.bucket === "week");
	const later = active.filter((reminder) => reminder.bucket === "upcoming");
	const handled = reminders.filter((reminder) => reminder.status !== "pending").sort((a, b) => b.remindAt.localeCompare(a.remindAt)).slice(0, 5);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-10 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm uppercase tracking-widest text-outline",
						children: "reminders"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-headline-lg text-on-surface",
						children: "Gentle nudges ahead"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-body-md text-on-surface-variant",
						children: "Nothing urgent — just the moments you said you’d remember."
					})
				]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataLoading, {}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataError, {}) : active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataEmpty, { children: "Nothing scheduled yet. Keep a memory, choose a nudge, and it will wait for you here." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				overdue.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-headline-sm text-on-surface-variant",
						children: "Overdue"
					}), overdue.map((reminder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderFeature, { reminder }, reminder.id))]
				}) : null,
				today.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-headline-sm text-on-surface",
						children: "Today"
					}), today.map((reminder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderFeature, {
						reminder,
						accent: true
					}, reminder.id))]
				}) : null,
				week.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-headline-sm text-on-surface",
						children: "This week"
					}), week.map((reminder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderFeature, { reminder }, reminder.id))]
				}) : null,
				later.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-headline-sm text-on-surface",
						children: "Further ahead"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: later.map((reminder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderCard, { reminder }, reminder.id))
					})]
				}) : null
			] }),
			loading || error || handled.length === 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-label-sm uppercase tracking-widest text-outline",
					children: "Already handled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-1",
					children: handled.map((reminder) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-baseline justify-between gap-2 text-body-sm text-on-surface-variant",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "italic",
							children: [
								reminder.personLabel ?? reminder.title,
								" — “",
								reminder.note,
								"”"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-label-sm text-outline",
							children: [
								reminder.status === "completed" ? "Done" : "Let it go",
								" · ",
								reminder.timing
							]
						})]
					}, reminder.id))
				})]
			})
		]
	}) }) });
}
//#endregion
export { Reminders as component };
