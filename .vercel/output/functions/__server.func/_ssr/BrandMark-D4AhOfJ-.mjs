import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BrandMark-D4AhOfJ-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* The single Supabase client for the whole application.
*
* Credentials come from Vite env vars (`.env.local`), never from source, so
* nothing secret is bundled. Only the PUBLIC anon key is ever used here; the
* service_role key bypasses RLS and must stay server-side.
*/
var supabaseUrl = "https://xnvfqxnaonitfricqzum.supabase.co";
var supabaseAnonKey = "sb_publishable_ibtM6InE9PBlb-Wr9geJxw_ACebjjDQ";
/** True when both Supabase env vars are present. */
var isSupabaseConfigured = Boolean(supabaseAnonKey);
var SUPABASE_MISSING_ENV_MESSAGE = "Supabase isn't configured yet. Copy .env.example to .env.local, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.";
var client = null;
/**
* Returns the shared Supabase client, creating it on first use.
*
* The client is created lazily rather than at module scope for two reasons:
*  - a missing `.env.local` then surfaces as a friendly message instead of
*    crashing the whole module graph at import time;
*  - nothing is constructed during SSR, so the browser session store is never
*    touched on the server.
*
* Call this from effects and event handlers (browser-only contexts).
*/
function getSupabase() {
	if (client) return client;
	client = createClient(supabaseUrl, supabaseAnonKey, { auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	} });
	return client;
}
var AuthContext = (0, import_react.createContext)(null);
/** Normalises a Supabase error or a thrown `unknown` into a displayable string. */
function messageOf(error) {
	if (!error) return null;
	if (typeof error === "object" && "message" in error) {
		const { message } = error;
		if (typeof message === "string" && message) return message;
	}
	if (typeof error === "string" && error) return error;
	return "Something went wrong — please try again.";
}
/** Best available human name for the signed-in user, without a profile yet. */
function fallbackName(user) {
	if (!user) return "";
	const fromMetadata = user.user_metadata["full_name"];
	if (typeof fromMetadata === "string" && fromMetadata.trim()) return fromMetadata.trim();
	return user.email ?? "";
}
function AuthProvider({ children }) {
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [session, setSession] = (0, import_react.useState)(null);
	const [user, setUser] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [profileReload, setProfileReload] = (0, import_react.useState)(0);
	const refreshProfile = (0, import_react.useCallback)(() => setProfileReload((count) => count + 1), []);
	const isConfigured = isSupabaseConfigured;
	(0, import_react.useEffect)(() => {
		if (!isSupabaseConfigured) {
			setStatus("unauthenticated");
			return;
		}
		let active = true;
		const supabase = getSupabase();
		supabase.auth.getSession().then(({ data }) => {
			if (!active) return;
			setSession(data.session);
			setUser(data.session?.user ?? null);
			setStatus(data.session ? "authenticated" : "unauthenticated");
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession);
			setUser(nextSession?.user ?? null);
			setStatus(nextSession ? "authenticated" : "unauthenticated");
		});
		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const userId = user?.id;
		if (!userId) {
			setProfile(null);
			return;
		}
		if (!isSupabaseConfigured) return;
		let cancelled = false;
		getSupabase().from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data, error }) => {
			if (cancelled) return;
			if (error) {
				console.error("Could not load profile:", error.message);
				setProfile(null);
				return;
			}
			setProfile(data);
		});
		return () => {
			cancelled = true;
		};
	}, [user?.id, profileReload]);
	const signUp = (0, import_react.useCallback)(async ({ email, password, fullName }) => {
		try {
			const { data, error } = await getSupabase().auth.signUp({
				email,
				password,
				options: {
					data: { full_name: fullName.trim() },
					emailRedirectTo: `${window.location.origin}/`
				}
			});
			if (error) return {
				error: error.message,
				needsEmailConfirmation: false
			};
			return {
				error: null,
				needsEmailConfirmation: !data.session
			};
		} catch (error) {
			return {
				error: messageOf(error),
				needsEmailConfirmation: false
			};
		}
	}, []);
	const signIn = (0, import_react.useCallback)(async (email, password) => {
		try {
			const { error } = await getSupabase().auth.signInWithPassword({
				email,
				password
			});
			return { error: messageOf(error) };
		} catch (error) {
			return { error: messageOf(error) };
		}
	}, []);
	const signOut = (0, import_react.useCallback)(async () => {
		try {
			const { error } = await getSupabase().auth.signOut();
			return { error: messageOf(error) };
		} catch (error) {
			return { error: messageOf(error) };
		}
	}, []);
	const requestPasswordReset = (0, import_react.useCallback)(async (email) => {
		try {
			const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
			return { error: messageOf(error) };
		} catch (error) {
			return { error: messageOf(error) };
		}
	}, []);
	const updatePassword = (0, import_react.useCallback)(async (password) => {
		try {
			const { error } = await getSupabase().auth.updateUser({ password });
			return { error: messageOf(error) };
		} catch (error) {
			return { error: messageOf(error) };
		}
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		status,
		user,
		session,
		profile,
		isConfigured,
		configMessage: isConfigured ? null : SUPABASE_MISSING_ENV_MESSAGE,
		signUp,
		signIn,
		signOut,
		requestPasswordReset,
		updatePassword,
		refreshProfile
	}), [
		status,
		user,
		session,
		profile,
		isConfigured,
		signUp,
		signIn,
		signOut,
		requestPasswordReset,
		updatePassword,
		refreshProfile
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
/** Name to show for the signed-in user, falling back profile -> auth metadata. */
function useAuthDisplayName() {
	const { profile, user } = useAuth();
	if (profile?.full_name && profile.full_name.trim()) return profile.full_name.trim();
	return fallbackName(user);
}
/**
* Service-worker registration: the Phase 4A foundation.
*
* Registered exactly once for the whole app, from the root route, so no screen
* can accidentally register a second worker and no second app shell is needed.
*
* The worker itself (`public/sw.js`) renders incoming reminder pushes and
* focuses/opens the app on notification click (Phase 4B delivery). This module
* only registers and looks it up — it never sends or decrypts anything, and
* nothing here touches the reminder engine.
*
* Every entry point is a no-op outside the browser, so server rendering and
* unsupported browsers both pass through without throwing.
*/
/** Where the worker lives. Served as-is from `public/`, never bundled. */
var SERVICE_WORKER_PATH = "/sw.js";
/** True only in a browser that actually supports service workers. */
function serviceWorkersSupported() {
	return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}
/**
* One promise for the process lifetime.
*
* Memoising the registration is what makes "registered once" true rather than
* merely likely: however many callers ask, the browser is told once. A failure
* is cached too, so a broken registration is not retried in a loop.
*/
var registrationPromise = null;
/** Registers the worker once, or resolves null where that is impossible. */
function registerServiceWorker() {
	if (!serviceWorkersSupported()) return Promise.resolve(null);
	if (!registrationPromise) registrationPromise = navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" }).catch((error) => {
		console.error("Could not register the service worker:", error);
		return null;
	});
	return registrationPromise;
}
/**
* The registration already known to the browser, if any.
*
* Used when a device subscribed in an earlier visit: the subscription still
* exists, so it can be re-checked without registering anything new.
*/
async function getServiceWorkerRegistration() {
	if (!serviceWorkersSupported()) return null;
	try {
		return await navigator.serviceWorker.getRegistration("/sw.js") ?? null;
	} catch (error) {
		console.error("Could not read the service worker registration:", error);
		return null;
	}
}
/**
* A registration with an active worker, registering first when necessary.
*
* `pushManager.subscribe()` needs an active worker, so this waits for the one
* already installing if the first call happens during page load.
*/
async function readyServiceWorkerRegistration() {
	let registration = await registerServiceWorker();
	if (!registration) registration = await getServiceWorkerRegistration();
	if (!registration) return null;
	if (registration.active) return registration;
	const pending = registration.installing ?? registration.waiting;
	if (!pending) return registration;
	await new Promise((resolve) => {
		const settle = () => {
			pending.removeEventListener("statechange", onChange);
			resolve();
		};
		const onChange = () => {
			if (pending.state !== "installing" && pending.state !== "installed") settle();
		};
		pending.addEventListener("statechange", onChange);
		setTimeout(settle, 1e4);
	});
	return registration;
}
/**
* The KeepDearly mark.
*
* The abstract mark from the brand sheet: a deep-navy half-pill, a soft-blush
* circle, and a small lavender dot — "people and the memories between them".
*
* This is a faithful vector reconstruction of the mark, built from the brand
* sheet's own palette (sampled, not guessed):
*
*   Deep Navy   #0C244A  — primary
*   Soft Blush  #F59E82  — accent circle
*   Lavender    #B9A8D6  — the dot
*   Cream       #FDF7F0  — app background
*
* It is drawn here rather than loaded as a bitmap for two reasons: the PWA
* icons need it crisp at every size, and the opening sequence needs it inline
* so it inherits the page's colours instead of shipping another asset.
*
* Geometry is expressed in a 120x120 box to match the viewBox the PWA icon
* generator rasterises, so the SVG in the app and the PNGs on the Home Screen
* are provably the same artwork.
*/
/** Sampled from the brand sheet. Do not substitute by eye. */
var NAVY = "#0C244A";
var BLUSH = "#F59E82";
var LAVENDER = "#B9A8D6";
/** Deep Navy — the wordmark and primary brand colour. */
var BRAND_NAVY = NAVY;
/**
* The mark on its own, with a transparent background.
*
* Sized by the caller. `title` is only set when the mark is meaningful on its
* own; everywhere else it should stay decorative and be hidden from assistive
* technology instead.
*/
function BrandMark({ className, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 120 120",
		className,
		fill: "none",
		role: title ? "img" : void 0,
		"aria-hidden": title ? void 0 : true,
		"aria-label": title,
		children: [
			title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: title }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20 28 H52 A32 32 0 0 1 52 92 H20 Z",
				fill: NAVY
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "74",
				cy: "63",
				r: "24",
				fill: BLUSH
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "99",
				cy: "30",
				r: "11",
				fill: LAVENDER
			})
		]
	});
}
//#endregion
export { readyServiceWorkerRegistration as a, useAuth as c, getSupabase as i, useAuthDisplayName as l, BRAND_NAVY as n, registerServiceWorker as o, BrandMark as r, serviceWorkersSupported as s, AuthProvider as t };
