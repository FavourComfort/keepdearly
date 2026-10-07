import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as cn } from "./AppShell-D5MibK33.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PersonAvatar-BzyVLKjW.js
var import_jsx_runtime = require_jsx_runtime();
var toneClasses = {
	primary: "bg-primary-fixed text-primary",
	secondary: "bg-secondary-fixed text-secondary",
	tertiary: "bg-tertiary-fixed text-tertiary",
	neutral: "bg-surface-container-high text-on-surface-variant"
};
var sizeClasses = {
	xs: "w-5 h-5 text-[10px] font-semibold",
	sm: "w-9 h-9 text-title-sm",
	md: "w-14 h-14 text-headline-md",
	/** The Home portrait rail: a touch larger than `md`, squircle-shaped. */
	rail: "w-[70px] h-[70px] text-headline-sm",
	lg: "w-20 h-20 md:w-24 md:h-24 text-headline-xl italic"
};
function PersonAvatar({ initial, tone = "primary", size = "md", className, photoUrl, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full shadow-sm", toneClasses[tone], sizeClasses[size], className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": photoUrl ? "true" : void 0,
				className: photoUrl ? "sr-only" : void 0,
				children: initial
			}),
			photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photoUrl,
				alt: "",
				loading: "lazy",
				className: "absolute inset-0 h-full w-full object-cover"
			}) : null,
			children
		]
	});
}
//#endregion
export { PersonAvatar as t };
