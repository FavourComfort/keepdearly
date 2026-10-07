import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { s as cn } from "./AppShell-D5MibK33.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PrimaryButton-D1tbk-xH.js
var import_jsx_runtime = require_jsx_runtime();
var variants = {
	primary: "bg-primary text-on-primary hover:bg-tertiary shadow-md text-title-md py-3.5 px-9",
	soft: "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary shadow-sm text-label-md py-3 px-6",
	quiet: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-label-md py-1.5 px-4",
	outline: "bg-surface-container-lowest text-primary hover:bg-primary-fixed hover:text-on-primary-fixed shadow-sm text-label-md py-1.5 px-4"
};
function PrimaryButton({ variant = "primary", className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-95", variants[variant], className),
		children
	});
}
//#endregion
export { PrimaryButton as t };
