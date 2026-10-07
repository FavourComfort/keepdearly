import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as cn } from "./AppShell-D5MibK33.mjs";
import { t as PersonAvatar } from "./PersonAvatar-BzyVLKjW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PersonCard-CtcXp3K-.js
var import_jsx_runtime = require_jsx_runtime();
function PersonCard({ person, variant }) {
	const rail = variant === "rail";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/people/$personId",
		params: { personId: person.id },
		"aria-label": `Open ${person.name}'s profile`,
		className: cn("group flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-2xl text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40", rail ? "w-[76px]" : "w-full"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonAvatar, {
			initial: person.initial,
			tone: person.tone,
			size: rail ? "rail" : "lg",
			photoUrl: person.avatarUrl,
			className: cn("transition-transform duration-200 group-hover:-translate-y-0.5", rail && "rounded-2xl"),
			children: person.hasActiveReminder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: cn("absolute bottom-0 right-0 rounded-full bg-secondary", rail ? "h-3 w-3 ring-2 ring-surface" : "h-3.5 w-3.5 ring-2")
			}) : null
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("w-full truncate text-on-surface", rail ? "text-label-md" : "text-title-sm"),
			children: person.name
		})]
	});
}
//#endregion
export { PersonCard as t };
