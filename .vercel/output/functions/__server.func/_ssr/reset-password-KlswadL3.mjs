import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth } from "./BrandMark-D4AhOfJ-.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as cn, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PrimaryButton } from "./PrimaryButton-D1tbk-xH.mjs";
import { n as AuthNotice } from "./AuthNotice-C0a9nQ8A.mjs";
import { t as PasswordField } from "./PasswordField-DLANt97s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-KlswadL3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The landing page for the recovery link Supabase emails out. Supabase parses
* the token from the URL hash itself (detectSessionInUrl) and signs the user in
* for long enough to set a new password — so this route is intentionally *not*
* wrapped in RedirectIfAuthenticated, because a recovery visitor is signed in.
*/
function ResetPassword() {
	const { updatePassword, status, isConfigured, configMessage } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		if (busy) return;
		setBusy(true);
		setError(null);
		const { error: updateError } = await updatePassword(password);
		setBusy(false);
		if (updateError) {
			setError(updateError);
			return;
		}
		await navigate({ to: "/" });
	}
	if (isConfigured && status === "unauthenticated") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-md flex-col gap-6 pt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex flex-col gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-label-sm uppercase tracking-widest text-outline",
				children: "link needed"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-headline-lg text-on-surface",
				children: "Open the link from your email"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-body-md text-on-surface-variant",
				children: "This page needs the secure link we emailed you, so we know it's really you."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/forgot-password",
				className: "text-label-md text-primary hover:underline",
				children: "Send me a new link"
			})]
		})]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-md flex-col gap-6 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm uppercase tracking-widest text-outline",
						children: "almost there"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-headline-lg text-on-surface",
						children: "Choose a new password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-body-md text-on-surface-variant",
						children: "Something you'll remember on the days that blur together."
					})
				]
			}),
			isConfigured ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthNotice, {
				tone: "info",
				children: configMessage
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordField, {
						id: "password",
						label: "New password",
						autoComplete: "new-password",
						placeholder: "at least 6 characters",
						value: password,
						onChange: setPassword
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthNotice, {
						tone: "error",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryButton, {
						type: "submit",
						disabled: busy,
						className: cn(busy && "opacity-60"),
						children: busy ? "Saving…" : "Save new password"
					})
				]
			})
		]
	}) });
}
//#endregion
export { ResetPassword as component };
