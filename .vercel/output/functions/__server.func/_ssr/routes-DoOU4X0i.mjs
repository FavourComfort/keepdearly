import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useKeepDearly } from "./keepdearly-store-XbRJti1g.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { i as DataLoading, n as DataEmpty, o as Icon, r as DataError, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as MemoryCard } from "./MemoryCard-DAfs3JYd.mjs";
import { t as PersonCard } from "./PersonCard-CtcXp3K-.mjs";
import { t as ReminderCard } from "./ReminderCard-DDjb6BnY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DoOU4X0i.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { memories, people, reminders, loading, error } = useKeepDearly();
	const upcoming = reminders.filter((reminder) => reminder.status === "pending" && !reminder.isOverdue).slice(0, 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col items-center gap-3 pt-8 text-center sm:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "favorite",
					filled: true,
					className: "text-[14px]"
				}), "the little things that actually matter"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "max-w-xl text-headline-lg leading-tight text-on-surface",
				children: "Know something today that’s worth remembering later?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-body-md text-on-surface-variant",
				children: "Keep it here while it’s fresh. We’ll hand it back to you at the right moment."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/capture",
				className: "mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-9 py-3.5 text-title-md text-on-primary shadow-md transition-all hover:bg-tertiary active:scale-95",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "edit",
					className: "text-[18px]"
				}), "Keep a memory"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/plus",
				className: "group mt-2 flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-4 text-left transition-colors hover:bg-surface-container-low sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex min-w-0 items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "schedule",
							className: "text-[18px]"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex min-w-0 flex-col gap-0.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-label-sm text-on-surface-variant",
								children: "KeepDearly Plus"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-title-sm text-on-surface",
								children: "Let KeepDearly remember for you."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-body-sm text-on-surface-variant",
								children: "Write a message today. We’ll send it when the moment comes."
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex shrink-0 flex-col items-end gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm text-on-surface-variant",
						children: "UGX 2,000 once"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-label-md font-medium text-primary",
						children: ["Learn more", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "arrow_forward",
							className: "text-[16px] transition-transform group-hover:translate-x-0.5"
						})]
					})]
				})]
			})
		]
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataLoading, {}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataError, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 flex flex-col gap-4 sm:mt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-headline-sm text-on-surface",
					children: "People you keep close"
				}), people.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/people",
					className: "text-label-md text-primary hover:underline",
					children: "See all"
				}) : null]
			}), people.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0",
				children: [people.slice(0, 5).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCard, {
					person,
					variant: "rail"
				}, person.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/people/new",
					className: "flex w-[76px] shrink-0 flex-col items-center gap-2 rounded-2xl text-center",
					title: "Add someone",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-[70px] w-[70px] items-center justify-center rounded-2xl border border-dashed border-outline-variant text-primary transition-colors hover:bg-surface-container-low",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: "add",
							className: "text-[22px]"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-full truncate text-label-md text-on-surface-variant",
						children: "Add"
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataEmpty, { children: "Nobody kept close yet. Add a person while you capture, and they will appear here." })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 flex flex-col gap-4 sm:mt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-headline-sm text-on-surface",
					children: "Coming up"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/reminders",
					className: "text-label-md text-primary hover:underline",
					children: "See all reminders"
				})]
			}), upcoming.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: upcoming.map((reminder) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderCard, { reminder }, reminder.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataEmpty, { children: "Nothing scheduled yet. Keep a memory, choose a nudge, and it will wait for you here." })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10 flex flex-col gap-4 sm:mt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-headline-sm text-on-surface",
				children: "Recently kept"
			}), memories.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: memories.slice(0, 6).map((memory) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoryCard, { memory }, memory.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataEmpty, { children: "Nothing kept yet. Capture the first small thing someone tells you." })]
		})
	] })] }) });
}
//#endregion
export { Home as component };
