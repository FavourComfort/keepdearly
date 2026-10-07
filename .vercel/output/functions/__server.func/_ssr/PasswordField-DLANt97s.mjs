import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { o as Icon } from "./AppShell-D5MibK33.mjs";
import { t as AuthField } from "./AuthNotice-C0a9nQ8A.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PasswordField-DLANt97s.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* AuthField for passwords, with a show/hide toggle sitting inside the input.
* Toggling only flips the input's type — the value is never read or rewritten.
*/
function PasswordField({ id, label, value, onChange, placeholder, autoComplete, required = true }) {
	const [visible, setVisible] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
		id,
		label,
		type: visible ? "text" : "password",
		value,
		onChange,
		placeholder,
		autoComplete,
		required,
		trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setVisible((current) => !current),
			"aria-label": visible ? "Hide password" : "Show password",
			"aria-pressed": visible,
			title: visible ? "Hide password" : "Show password",
			className: "flex h-9 w-9 items-center justify-center rounded-full text-outline transition-colors hover:bg-surface-container-low hover:text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				name: visible ? "visibility_off" : "visibility",
				className: "text-[20px]"
			})
		})
	});
}
//#endregion
export { PasswordField as t };
