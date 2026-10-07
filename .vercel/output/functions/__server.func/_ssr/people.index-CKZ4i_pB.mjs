import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as useKeepDearly } from "./keepdearly-store-XbRJti1g.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RequireAuth } from "./guards-DciwJQVH.mjs";
import { i as DataLoading, n as DataEmpty, o as Icon, r as DataError, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PersonCard } from "./PersonCard-CtcXp3K-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/people.index-CKZ4i_pB.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Everyone you keep close.
*
* This is the other half of the Home rail: Home shows the first five as a
* compact portrait rail, and this page shows all of them as an airy collection
* of circular portraits with a name underneath. Same data, same store, same
* links — only the arrangement differs, so the two never read as the same card
* twice.
*
* No cards around the people, no counts, no headlines. Just the people.
*/
function People() {
	const { people, loading, error } = useKeepDearly();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequireAuth, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 pt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "inline-flex w-fit items-center gap-1 text-label-md text-primary hover:underline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "arrow_back",
					className: "text-[16px]"
				}), "Home"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-headline-lg text-on-surface",
				children: "People you keep close"
			})]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataLoading, {}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataError, {}) : people.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-5",
			children: [people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCard, {
				person,
				variant: "bubble"
			}, person.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/people/new",
				className: "flex w-full flex-col items-center gap-2 rounded-2xl text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
				title: "Add someone",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-outline-variant text-primary transition-colors hover:bg-surface-container-low md:h-24 md:w-24",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						name: "add",
						className: "text-[26px]"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-full truncate text-title-sm text-on-surface-variant",
					children: "Add someone"
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataEmpty, { children: "Nobody kept close yet. Add a person while you capture, and they will appear here." })]
	}) }) });
}
//#endregion
export { People as component };
