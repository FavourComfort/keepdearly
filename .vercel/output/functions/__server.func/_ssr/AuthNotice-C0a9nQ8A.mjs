import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as cn } from "./AppShell-D5MibK33.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthNotice-C0a9nQ8A.js
var import_jsx_runtime = require_jsx_runtime();
/** Labelled input for the sign-in / sign-up / reset screens. */
function AuthField({ id, label, value, onChange, type = "text", placeholder, autoComplete, required = true, trailing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: id,
			className: "text-label-md text-on-surface-variant",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				name: id,
				type,
				value,
				required,
				autoComplete,
				placeholder,
				onChange: (e) => onChange(e.target.value),
				className: cn("w-full rounded-lg bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface shadow-sm outline-none", "ring-primary transition-shadow placeholder:text-outline focus:ring-2", trailing && "pe-12")
			}), trailing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-y-0 end-0 flex items-center pe-1",
				children: trailing
			}) : null]
		})]
	});
}
var tones = {
	info: "bg-surface-container-low text-on-surface-variant",
	error: "bg-error-container text-on-error",
	success: "bg-primary-fixed text-on-primary-fixed-variant"
};
/** Inline feedback (errors, confirmations) for the authentication screens. */
function AuthNotice({ tone = "info", children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: tone === "error" ? "alert" : "status",
		className: cn("rounded-lg px-4 py-3 text-body-sm", tones[tone], className),
		children
	});
}
//#endregion
export { AuthNotice as n, AuthField as t };
