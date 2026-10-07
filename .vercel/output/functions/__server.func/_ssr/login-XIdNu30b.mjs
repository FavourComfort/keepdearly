import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth } from "./BrandMark-D4AhOfJ-.mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as RedirectIfAuthenticated } from "./guards-DciwJQVH.mjs";
import { s as cn, t as AppShell } from "./AppShell-D5MibK33.mjs";
import { t as PrimaryButton } from "./PrimaryButton-D1tbk-xH.mjs";
import { n as AuthNotice, t as AuthField } from "./AuthNotice-C0a9nQ8A.mjs";
import { t as PasswordField } from "./PasswordField-DLANt97s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-XIdNu30b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { signIn, isConfigured, configMessage } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function handleSubmit(event) {
		event.preventDefault();
		if (busy) return;
		setBusy(true);
		setError(null);
		const { error: signInError } = await signIn(email.trim(), password);
		setBusy(false);
		if (signInError) {
			setError(signInError);
			return;
		}
		await navigate({ to: "/" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectIfAuthenticated, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-md flex-col gap-6 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-label-sm uppercase tracking-widest text-outline",
						children: "welcome back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-headline-lg text-on-surface",
						children: "Sign in"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-body-md text-on-surface-variant",
						children: "The little things you kept are right where you left them."
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthField, {
						id: "email",
						label: "Email",
						type: "email",
						autoComplete: "email",
						placeholder: "you@example.com",
						value: email,
						onChange: setEmail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordField, {
						id: "password",
						label: "Password",
						autoComplete: "current-password",
						placeholder: "••••••••",
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
						children: busy ? "Signing in…" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 text-body-sm text-on-surface-variant",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/forgot-password",
					className: "text-label-md text-primary hover:underline",
					children: "Forgotten your password?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"New here?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signup",
						className: "text-label-md text-primary hover:underline",
						children: "Create an account"
					})
				] })]
			})
		]
	}) }) });
}
//#endregion
export { Login as component };
