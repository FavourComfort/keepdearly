import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as initialForName } from "./keepdearly-store-XbRJti1g.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Icon, s as cn } from "./AppShell-D5MibK33.mjs";
import { t as PersonAvatar } from "./PersonAvatar-BzyVLKjW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MemoryCard-DAfs3JYd.js
var import_jsx_runtime = require_jsx_runtime();
var accentTone = {
	primary: "bg-primary-container",
	secondary: "bg-secondary-fixed-dim",
	tertiary: "bg-tertiary-container",
	neutral: "bg-outline-variant"
};
/**
* Compact keepsake card for the Home "Recently kept" collection.
*
* This used to be a full keepsake — 24px padding, an 18px serif quote and a
* heavy pill tag — so four of them stacked were taller than the rest of the
* page put together. It still carries every field it always had (who it is
* for, the topic, when it was kept, the words, the footnote); they are simply
* set at a size and rhythm that read as a curated collection instead of a
* stack of posters.
*
* A tone drives exactly one restrained accent — a hairline edge plus the
* avatar — so repeated cards feel like siblings rather than shouting. Nothing
* here is clickable except the person's name, which is still the one link it
* always was, pointing at the same profile route.
*
* Home only. The person screen uses `MemoryNote` below, which is untouched.
*/
function MemoryCard({ memory }) {
	const who = memory.personLabel ?? "Personal Note";
	const identity = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [memory.personId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
		initial: initialForName(who),
		tone: memory.tone,
		size: "xs"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			name: "favorite",
			filled: true,
			className: "text-[11px]"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate",
		children: who
	})] });
	const identityClass = "flex min-w-0 items-center gap-1.5 rounded-full text-label-md";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: cn("absolute inset-y-0 left-0 w-[3px]", accentTone[memory.tone])
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full gap-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [
							memory.personId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/people/$personId",
								params: { personId: memory.personId },
								"aria-label": `Open ${who}'s profile`,
								className: cn(identityClass, "text-on-surface transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"),
								children: identity
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn(identityClass, "text-on-surface"),
								children: identity
							}),
							memory.topic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 truncate text-label-sm text-outline",
								children: memory.topic
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto shrink-0 text-label-sm text-outline",
								children: memory.when
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "line-clamp-2 text-body-md leading-snug text-on-surface",
						children: [
							"“",
							memory.text,
							"”"
						]
					}),
					memory.footnote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex min-w-0 items-center gap-1.5 text-label-sm text-outline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: memory.footnoteIcon ?? "favorite",
							className: "shrink-0 text-[13px]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: memory.footnote
						})]
					}) : null
				]
			}), memory.photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: memory.photoUrl,
				alt: "Photo kept with this memory",
				loading: "lazy",
				className: "h-16 w-16 shrink-0 rounded-lg object-cover"
			}) : null]
		})]
	});
}
/**
* Compact keepsake note used on a person profile.
*
* Same visual language as the Home `MemoryCard` above — compact rounded
* surface, hairline tone accent, small muted metadata, restrained square photo
* — so "Little things you've kept" reads as part of the same modern collection
* rather than a stack of posters.
*
* The photo is a 1:1 `object-cover` thumbnail in a fixed box: one consistent
* frame whatever shape the original is, no stretching, and no layout jump when
* it arrives. It sits beside the words rather than above them, so a photo never
* becomes the memory. A memory with no photo simply has no thumbnail — there is
* no empty photo-shaped hole left behind.
*
* Deliberately not clickable: this screen already *is* that person's page, so a
* link here would only ever be a self-link. Interaction is unchanged.
*/
function MemoryNote({ memory }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "relative h-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-200 hover:shadow-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: cn("absolute inset-y-0 left-0 w-[3px]", accentTone[memory.tone])
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full gap-3 p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-1 flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [memory.topic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 truncate text-label-sm text-outline",
							children: memory.topic
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto shrink-0 text-label-sm text-outline",
							children: memory.when
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "line-clamp-3 text-body-md leading-snug text-on-surface",
						children: [
							"“",
							memory.text,
							"”"
						]
					}),
					memory.footnote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "flex min-w-0 items-center gap-1.5 text-label-sm text-outline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							name: memory.footnoteIcon ?? "favorite",
							className: "shrink-0 text-[13px]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: memory.footnote
						})]
					}) : null
				]
			}), memory.photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: memory.photoUrl,
				alt: "Photo kept with this memory",
				loading: "lazy",
				className: "h-16 w-16 shrink-0 rounded-lg object-cover"
			}) : null]
		})]
	});
}
//#endregion
export { MemoryNote as n, MemoryCard as t };
