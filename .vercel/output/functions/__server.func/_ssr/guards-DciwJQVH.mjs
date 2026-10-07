import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useAuth } from "./BrandMark-D4AhOfJ-.mjs";
import { x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guards-DciwJQVH.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Route guards for Phase 1.
*
* These gate on the client-side Supabase session rather than in the router's
* `beforeLoad`, because the session lives in browser storage: `beforeLoad` also
* runs during SSR, where there is no session to read and a redirect there would
* throw signed-in users out on every refresh. Instead the guard renders a quiet
* "just a moment…" state until Supabase has restored the session, then either
* renders the page or navigates to the sign-in screen.
*/
function AuthLoadingView() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[70vh] items-center justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-body-md text-outline",
			children: "just a moment…"
		})
	});
}
function SupabaseSetupNotice({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-label-sm uppercase tracking-widest text-outline",
				children: "setup needed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-headline-md text-on-surface",
				children: "One small step first"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-body-md text-on-surface-variant",
				children: message ?? "Supabase isn't configured yet."
			})
		]
	});
}
/** Wraps the screens that require an account. */
function RequireAuth({ children }) {
	const { status, isConfigured, configMessage } = useAuth();
	if (!isConfigured) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupabaseSetupNotice, { message: configMessage });
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLoadingView, {});
	if (status === "unauthenticated") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/login" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/** Keeps signed-in users away from /login, /signup and the reset screens. */
function RedirectIfAuthenticated({ children }) {
	const { status, isConfigured } = useAuth();
	if (isConfigured && status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthLoadingView, {});
	if (status === "authenticated") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { RequireAuth as n, RedirectIfAuthenticated as t };
