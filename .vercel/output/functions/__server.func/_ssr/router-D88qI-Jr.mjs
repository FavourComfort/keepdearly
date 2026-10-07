import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { n as BRAND_NAVY, o as registerServiceWorker, r as BrandMark, t as AuthProvider } from "./BrandMark-D4AhOfJ-.mjs";
import { i as KeepDearlyProvider } from "./keepdearly-store-XbRJti1g.mjs";
import { C as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$17 } from "./capture-Clr17-G-.mjs";
import { t as Route$18 } from "./people._personId-D6GpJZLf.mjs";
import { t as Route$19 } from "./people._personId.message-CA4Q_kVV.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as parseError, t as createNylonPay } from "../_libs/@nile-squad/nylonpay-ts+[...].mjs";
import { readFileSync } from "node:fs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D88qI-Jr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CZXDOplF.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
/**
* The KeepDearly opening sequence and page loader.
*
* It has two jobs that share one look:
*
*  1. On app open — the mark appears on its own, then settles into the
*     wordmark lockup, then gets out of the way. About 1.2 seconds, so a
*     returning user feels a breath rather than a wait.
*
*  2. While a page is loading — that same lockup, held quietly, so a slow
*     navigation reads as "keepdearly is thinking" rather than a blank screen
*     or a browser spinner.
*
* A quiet welcome, not a splash screen: opacity and a whisper of scale, no
* spinner, no progress bar, and never an artificial wait.
*
* It is `pointer-events-none` and `aria-hidden`, so it never steals a click and
* never traps or moves keyboard focus. The real app sits underneath and stays
* reachable throughout, which also means a slow or failed script can never lock
* anyone out of a working page.
*
* The mark is the same `BrandMark` the PWA icons are generated from, so the
* icon on the Home Screen and the one on screen are the same artwork.
*/
/** The wordmark, lowercase, exactly as the brand sets it. */
var WORDMARK = "keepdearly";
/** The tagline, in the brand sheet's uppercase letterspaced setting. */
var TAGLINE = "THE LITTLE THINGS THAT ACTUALLY MATTER";
/** Open-sequence timings in milliseconds. Deliberately short. */
var SHOW_LOCKUP_AFTER = 380;
var FADE_OUT_AFTER = 980;
var UNMOUNT_AFTER = 1260;
/** Reduced motion keeps the same sequence, just shorter and without movement. */
var REDUCED_MOTION_FACTOR = .45;
/**
* How long a navigation must stay pending before the lockup appears. Without
* this, every fast route change would flash the loader and read as jank.
*/
var LOADER_DELAY_MS = 220;
/** The wordmark lockup, shared by the open sequence and the page loader. */
function Lockup({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex flex-col items-center gap-1.5 ${className ?? ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-headline-md leading-none tracking-tight",
			style: {
				color: BRAND_NAVY,
				fontFamily: "var(--font-sans)",
				fontWeight: 700
			},
			children: WORDMARK
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-label-sm uppercase tracking-[0.18em] text-on-surface-variant",
			children: TAGLINE
		})]
	});
}
function OpeningSequence() {
	const routeLoading = useRouterState({ select: (state) => state.isLoading });
	const [step, setStep] = (0, import_react.useState)(0);
	const [opening, setOpening] = (0, import_react.useState)(true);
	const [loaderVisible, setLoaderVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const timers = [];
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const scale = (ms) => ms * (prefersReducedMotion ? REDUCED_MOTION_FACTOR : 1);
		timers.push(window.setTimeout(() => setStep(1), scale(SHOW_LOCKUP_AFTER)));
		timers.push(window.setTimeout(() => setStep(2), scale(FADE_OUT_AFTER)));
		timers.push(window.setTimeout(() => setOpening(false), scale(UNMOUNT_AFTER)));
		return () => {
			for (const timer of timers) window.clearTimeout(timer);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (opening || !routeLoading) {
			setLoaderVisible(false);
			return;
		}
		const timer = window.setTimeout(() => setLoaderVisible(true), LOADER_DELAY_MS);
		return () => window.clearTimeout(timer);
	}, [routeLoading, opening]);
	if (!opening && !loaderVisible) return null;
	if (!opening) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": "true",
		className: "pointer-events-none fixed inset-0 z-100 flex items-center justify-center bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "animate-in fade-in duration-300 motion-reduce:animate-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lockup, {})
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": "true",
		className: "pointer-events-none fixed inset-0 z-100 flex flex-col items-center justify-center bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `flex flex-col items-center gap-3 transition-all duration-500 ease-out motion-reduce:transition-none ${step >= 2 ? "scale-95 opacity-0 motion-reduce:scale-100" : "scale-100 opacity-100"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: `h-18 w-18 transition-all duration-700 ease-out motion-reduce:transition-none ${step >= 1 ? "scale-90 opacity-0" : "scale-100 opacity-100"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `transition-all duration-500 ease-out motion-reduce:transition-none ${step >= 1 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"} motion-reduce:translate-y-0`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lockup, {})
			})]
		})
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$16 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#FDF7F0"
			},
			{ title: "keepdearly" },
			{
				name: "description",
				content: "The little things that actually matter."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "manifest",
				href: "/site.webmanifest"
			},
			{
				rel: "apple-mobile-web-app-capable",
				href: "/site.webmanifest"
			},
			{
				rel: "apple-mobile-web-app-status-bar-style",
				href: "default"
			},
			{
				rel: "apple-mobile-web-app-title",
				href: "keepdearly"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$16.useRouteContext();
	(0, import_react.useEffect)(() => {
		registerServiceWorker();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(KeepDearlyProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpeningSequence, {})] }) })
	});
}
var $$splitComponentImporter$8 = () => import("./routes-DoOU4X0i.mjs");
var Route$15 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "keepdearly — the little things that actually matter" },
		{
			name: "description",
			content: "A quiet place to keep the small things people tell you, and a gentle nudge when they matter."
		},
		{
			property: "og:title",
			content: "keepdearly — the little things that actually matter"
		},
		{
			property: "og:description",
			content: "A quiet place to keep the small things people tell you, and a gentle nudge when they matter."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./forgot-password-DjWa6Wzp.mjs");
var Route$14 = createFileRoute("/forgot-password")({
	head: () => ({ meta: [{ title: "Reset your password — keepdearly" }, {
		name: "description",
		content: "We'll send you a link to choose a new password."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./login-XIdNu30b.mjs");
var Route$13 = createFileRoute("/login")({
	head: () => ({ meta: [{ title: "Sign in — keepdearly" }, {
		name: "description",
		content: "Sign in to reach the small things you've kept close."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./plus-CGiFOb8N.mjs");
/**
* Phase 6D: buy KeepDearly Plus, once, for UGX 2,000.
*
* Mobile Money only — the payer enters their MTN or Airtel number, approves the
* prompt on their phone, and the screen waits.
*
* The one rule this screen follows: it never believes itself. Starting a payment
* does not mean it worked, and no redirect or "success" click grants anything.
* Plus appears only once the SERVER has confirmed with Nylon Pay that the
* transaction actually completed, which is why the screen polls /api/plus/status
* and shows the result the server sends back. If the user closes the tab mid
* payment, the server-recorded outcome still stands and the webhook applies it.
*
* Polling stops on a terminal state, on success, and when the screen unmounts.
*/
var Route$12 = createFileRoute("/plus")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./reminders-DYUnOnhx.mjs");
var Route$11 = createFileRoute("/reminders")({
	head: () => ({ meta: [
		{ title: "Reminders — keepdearly" },
		{
			name: "description",
			content: "The gentle nudges ahead: birthdays, big days, and notes you attached to them."
		},
		{
			property: "og:title",
			content: "Reminders — keepdearly"
		},
		{
			property: "og:description",
			content: "The gentle nudges ahead: birthdays, big days, and notes you attached to them."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./reset-password-KlswadL3.mjs");
/**
* The landing page for the recovery link Supabase emails out. Supabase parses
* the token from the URL hash itself (detectSessionInUrl) and signs the user in
* for long enough to set a new password — so this route is intentionally *not*
* wrapped in RedirectIfAuthenticated, because a recovery visitor is signed in.
*/
var Route$10 = createFileRoute("/reset-password")({
	head: () => ({ meta: [{ title: "Choose a new password — keepdearly" }, {
		name: "description",
		content: "Set a new password for your keepdearly account."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./signup-kiZ852Cc.mjs");
var Route$9 = createFileRoute("/signup")({
	head: () => ({ meta: [{ title: "Create an account — keepdearly" }, {
		name: "description",
		content: "Start keeping the small things that actually matter."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
/** The single record size we announce, matching the RFC 8291 example. */
var RECORD_SIZE = 4096;
/** RFC 8030: how long the push service keeps retrying an undeliverable message. */
var PUSH_TTL_SECONDS = 86400;
/** RFC 8292 limits `exp` to 24h; 12h is the conventional choice. */
var VAPID_EXPIRY_SECONDS = 43200;
/** Per-request budget so one hung push service cannot stall the whole pass. */
var PUSH_REQUEST_TIMEOUT_MS = 15e3;
var encoder = new TextEncoder();
function base64UrlDecode(value) {
	const unurl = value.replace(/-/g, "+").replace(/_/g, "/");
	const padded = unurl + "=".repeat((4 - unurl.length % 4) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
	return bytes;
}
function base64UrlEncode(bytes) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/**
* Checks a VAPID keypair decodes to the shapes P-256 expects.
* Returns a human-readable problem, or null when both halves are usable.
* The message names the variable but never contains the key itself.
*/
function validateVapidKeys(keys) {
	try {
		if (base64UrlDecode(keys.publicKey).length !== 65) return "VITE_VAPID_PUBLIC_KEY is not a 65-byte P-256 public key.";
		if (base64UrlDecode(keys.privateKey).length !== 32) return "VAPID_PRIVATE_KEY is not a 32-byte P-256 private key.";
	} catch {
		return "The VAPID keys are not valid base64url.";
	}
	return null;
}
function concatBytes(...parts) {
	let total = 0;
	for (const part of parts) total += part.length;
	const joined = new Uint8Array(total);
	let offset = 0;
	for (const part of parts) {
		joined.set(part, offset);
		offset += part.length;
	}
	return joined;
}
function uint32Be(value) {
	return new Uint8Array([
		value >>> 24 & 255,
		value >>> 16 & 255,
		value >>> 8 & 255,
		value & 255
	]);
}
async function hmacSha256(key, data) {
	const cryptoKey = await crypto.subtle.importKey("raw", key, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
}
/** Fresh P-256 keypair for a single push message (RFC 8291 §3.1). */
async function generateEphemeralKeyPair() {
	const pair = await crypto.subtle.generateKey({
		name: "ECDH",
		namedCurve: "P-256"
	}, true, ["deriveBits"]);
	return {
		privatePkcs8: new Uint8Array(await crypto.subtle.exportKey("pkcs8", pair.privateKey)),
		publicRaw: new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey))
	};
}
/**
* Encrypts one push message body exactly per RFC 8291 §3.4 + RFC 8188:
*
*   PRK_key = HMAC-SHA-256(auth_secret, ecdh_secret)
*   key_info = "WebPush: info" || 0x00 || ua_public || as_public
*   IKM     = HMAC-SHA-256(PRK_key, key_info || 0x01)          (L = 32)
*   PRK     = HMAC-SHA-256(salt, IKM)
*   CEK     = HMAC-SHA-256(PRK, "Content-Encoding: aes128gcm" || 0x00 || 0x01)[0..15]
*   NONCE   = HMAC-SHA-256(PRK, "Content-Encoding: nonce" || 0x00 || 0x01)[0..11]
*   body    = salt || rs(4096, 4 bytes BE) || len(keyid) || keyid ||
*             AES-128-GCM(CEK, NONCE, plaintext || 0x02)
*
* Every L above fits in one HMAC block, so each Expand is a single HMAC as
* shown. Exported (rather than inlined) so the RFC test vector can drive it
* with fixed inputs.
*/
async function sealAes128gcm(params) {
	const { plaintext, uaPublic, authSecret, salt, ephemeral } = params;
	if (salt.length !== 16) throw new Error(`salt must be 16 bytes, got ${salt.length}.`);
	if (authSecret.length < 16) throw new Error(`auth secret must be at least 16 bytes, got ${authSecret.length}.`);
	if (uaPublic.length !== 65) throw new Error(`subscription public key must be 65 bytes, got ${uaPublic.length}.`);
	const privateKey = await crypto.subtle.importKey("pkcs8", ephemeral.privatePkcs8, {
		name: "ECDH",
		namedCurve: "P-256"
	}, false, ["deriveBits"]);
	const userAgentKey = await crypto.subtle.importKey("raw", uaPublic, {
		name: "ECDH",
		namedCurve: "P-256"
	}, false, []);
	const prk = await hmacSha256(salt, await hmacSha256(await hmacSha256(authSecret, new Uint8Array(await crypto.subtle.deriveBits({
		name: "ECDH",
		public: userAgentKey
	}, privateKey, 256))), concatBytes(concatBytes(encoder.encode("WebPush: info"), new Uint8Array([0]), uaPublic, ephemeral.publicRaw), new Uint8Array([1]))));
	const cek = (await hmacSha256(prk, concatBytes(concatBytes(encoder.encode("Content-Encoding: aes128gcm"), new Uint8Array([0])), new Uint8Array([1])))).slice(0, 16);
	const nonce = (await hmacSha256(prk, concatBytes(concatBytes(encoder.encode("Content-Encoding: nonce"), new Uint8Array([0])), new Uint8Array([1])))).slice(0, 12);
	const header = concatBytes(salt, uint32Be(RECORD_SIZE), new Uint8Array([ephemeral.publicRaw.length]), ephemeral.publicRaw);
	const record = concatBytes(plaintext, new Uint8Array([2]));
	const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
	return concatBytes(header, new Uint8Array(await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv: nonce
	}, aesKey, record)));
}
/**
* DER/PKCS#8 wrapper for a raw 32-byte P-256 private scalar.
*
* Web Crypto will not import a bare scalar (that is how `.env.local` stores
* the VAPID key), but it will import this fixed structure: PKCS#8 wrapping
* the RFC 5915 ECPrivateKey. Only the 32 key bytes are variable.
*/
function p256PrivateKeyToPkcs8(privateScalar) {
	if (privateScalar.length !== 32) throw new Error(`P-256 private scalar must be 32 bytes, got ${privateScalar.length}.`);
	return concatBytes(new Uint8Array([
		48,
		65,
		2,
		1,
		0,
		48,
		19,
		6,
		7,
		42,
		134,
		72,
		206,
		61,
		2,
		1,
		6,
		8,
		42,
		134,
		72,
		206,
		61,
		3,
		1,
		7,
		4,
		39,
		48,
		37,
		2,
		1,
		1,
		4,
		32
	]), privateScalar);
}
async function signEs256(signingInput, privateScalar) {
	const key = await crypto.subtle.importKey("pkcs8", p256PrivateKeyToPkcs8(privateScalar), {
		name: "ECDSA",
		namedCurve: "P-256"
	}, false, ["sign"]);
	const signature = new Uint8Array(await crypto.subtle.sign({
		name: "ECDSA",
		hash: "SHA-256"
	}, key, encoder.encode(signingInput)));
	if (signature.length !== 64) throw new Error(`Unexpected ES256 signature length ${signature.length}; expected 64 (IEEE P1363).`);
	return `${signingInput}.${base64UrlEncode(signature)}`;
}
/**
* Signs the VAPID JWT: header {typ: JWT, alg: ES256} and claims
* {aud: push service origin, exp: now + 12h, sub: contact URI}.
*
* `nowMs` exists only so tests can pin `exp`.
*/
async function signVapidJwt(keys, audience, subject, nowMs = Date.now()) {
	const header = base64UrlEncode(encoder.encode(JSON.stringify({
		typ: "JWT",
		alg: "ES256"
	})));
	const claims = {
		aud: audience,
		exp: Math.floor(nowMs / 1e3) + VAPID_EXPIRY_SECONDS,
		sub: subject
	};
	return signEs256(`${header}.${base64UrlEncode(encoder.encode(JSON.stringify(claims)))}`, base64UrlDecode(keys.privateKey));
}
/**
* Encrypts `payload` for `target` and POSTs it to the subscription endpoint.
*
* Outcomes map from the push service's answer:
*  - 2xx                 -> "delivered"  (RFC 8030 returns 201 Created)
*  - 404 / 410           -> "expired"    (endpoint is gone; caller drops the row)
*  - 429 / 5xx / network -> "transient"  (retry on a later pass)
*  - anything else       -> "rejected"   (logged with the service's reason;
*                                         not delivered, endpoint kept)
*/
async function sendWebPush(target, payload, keys, subject) {
	const sealed = await sealAes128gcm({
		plaintext: encoder.encode(JSON.stringify(payload)),
		uaPublic: base64UrlDecode(target.p256dh),
		authSecret: base64UrlDecode(target.auth),
		salt: crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16)),
		ephemeral: await generateEphemeralKeyPair()
	});
	const audience = new URL(target.endpoint).origin;
	const jwt = await signVapidJwt(keys, audience, subject);
	let response;
	try {
		response = await fetch(target.endpoint, {
			method: "POST",
			headers: {
				Authorization: `vapid t=${jwt}, k=${keys.publicKey}`,
				"Content-Type": "application/octet-stream",
				"Content-Encoding": "aes128gcm",
				TTL: String(PUSH_TTL_SECONDS)
			},
			body: sealed,
			signal: AbortSignal.timeout(PUSH_REQUEST_TIMEOUT_MS)
		});
	} catch (error) {
		console.error("Web Push request failed before any response:", error);
		return "transient";
	}
	if (response.ok) return "delivered";
	if (response.status === 404 || response.status === 410) return "expired";
	if (response.status === 429 || response.status >= 500) return "transient";
	const detail = await response.text().catch(() => "");
	console.error(`Web Push rejected the message (HTTP ${response.status}): ${detail.slice(0, 300)}`);
	return "rejected";
}
/**
* The Phase 4B due-reminder delivery pass: find due → claim → notify → record.
*
* Invoked by `/api/reminders/due`, which the route gates with `CRON_SECRET` and
* answers for both GET and POST. A scheduler calls it once per minute.
* Overlapping runs are safe because delivery claims are atomic:
*
*  1. Read up to 10 rows that are pending, due and not yet delivered.
*  2. Before claiming, check the user has a push subscription — a nudge
*     nobody can receive must not be marked delivered.
*  3. Claim atomically via `claim_due_reminder` (migration 0004), which only
*     wins while the row is still pending/due/unclaimed.
*  4. Send an encrypted Web Push (`web-push.server.ts`) to every subscription.
*  5. If any endpoint accepted it, the claim stands; if none did, the claim
*     is released so the next minute retries. Dead endpoints (404/410) are
*     removed first.
*
* Statuses, completions and cancellations are NEVER touched here: delivery
* only owns `notified_at`, read with the server-side service_role key that
* never reaches the client bundle.
*/
/**
* Delivery cannot run because a server-side secret is absent or malformed.
* The route maps this to HTTP 503 with the variable NAMES (never values),
* so an operator can see exactly what to set.
*/
var DeliveryConfigError = class extends Error {
	constructor(reason) {
		super(`Reminder delivery is not configured — ${reason}`);
		this.name = "DeliveryConfigError";
	}
};
/** How many due rows one pass handles; the next minute picks up the rest. */
var BATCH_LIMIT$1 = 10;
/** The memory text shown in the notification body, capped for a toast. */
var BODY_LENGTH_LIMIT = 160;
/** In-app path a notification click opens (the Reminders screen). */
var NOTIFICATION_PATH$1 = "/reminders";
/** Fallback title when a memory has no person — mirrors `toReminderView`. */
var FALLBACK_TITLE = "A memory to revisit";
/**
* Parsed `.env.local`, read once per process — or an empty object when the
* file is absent (the normal case in production, where real environment
* variables are the source of truth).
*
* Vite only exposes `VITE_`-prefixed variables through `import.meta.env`;
* whether the dev toolchain also copies plain variables into `process.env`
* varies by version, so the file is read directly as a fallback. Production
* never depends on this path: `process.env` is checked first.
*/
var localEnvCache = null;
function localEnvValue(name) {
	if (!localEnvCache) {
		localEnvCache = {};
		try {
			const raw = readFileSync(`${process.cwd()}/.env.local`, "utf8");
			for (const line of raw.split(/\r?\n/)) {
				if (!line || line.startsWith("#")) continue;
				const separator = line.indexOf("=");
				if (separator <= 0) continue;
				const key = line.slice(0, separator).trim();
				let value = line.slice(separator + 1).trim();
				if (value.startsWith("\"") && value.endsWith("\"") && value.length >= 2 || value.startsWith("'") && value.endsWith("'") && value.length >= 2) value = value.slice(1, -1);
				localEnvCache[key] = value;
			}
		} catch {
			localEnvCache = {};
		}
	}
	return localEnvCache[name];
}
/**
* Reads a server-side secret: the real environment first, then `.env.local`
* as a development fallback. Empty/whitespace values count as unset, and no
* value is ever logged — callers only ever report which NAME is missing.
*
* Shared with the delivery route so `CRON_SECRET` and the push secrets are
* resolved one way, in one place.
*/
function serverEnv(name) {
	const direct = process.env[name];
	if (direct && direct.trim()) return direct;
	const fromFile = localEnvValue(name);
	return fromFile && fromFile.trim() ? fromFile : void 0;
}
/**
* Who the VAPID JWT says we are (RFC 8292 requires https/mailto).
*
* Preference: explicit override → this app's own https origin → the
* project's https Supabase URL (local `http://localhost` dev has no https
* origin of its own). Every candidate is a real project-owned URI — no
* contact address is ever invented.
*/
function resolveVapidSubject$1(requestOrigin, supabaseUrl) {
	const configured = serverEnv("VAPID_SUBJECT");
	if (configured) return configured;
	if (requestOrigin.startsWith("https://")) return requestOrigin;
	if (supabaseUrl.startsWith("https://")) return supabaseUrl;
	return requestOrigin;
}
/** Notification copy: the memory text, flattened and capped for one toast. */
function notificationBody(content) {
	const flattened = content.replace(/\s+/g, " ").trim();
	if (!flattened) return null;
	if (flattened.length <= BODY_LENGTH_LIMIT) return flattened;
	return `${flattened.slice(0, 159).trimEnd()}…`;
}
/**
* Runs one due-reminder pass.
*
* `requestOrigin` is the origin the endpoint was called on — used as the
* VAPID contact when no explicit subject is configured.
*
* Throws `DeliveryConfigError` when server secrets are missing; any other
* throw means the pass could not run at all (the route reports it as 500).
*/
async function processDueReminders(options) {
	const supabaseUrl = "https://xnvfqxnaonitfricqzum.supabase.co";
	const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
	const vapidPublicKey = "BErMl5ZW3qvDsOawMgLe0epUYf4RcsIktLyBVXav33BGjc2uvl2cKp9dRRlm-i2tc5Pxgyc-sp93niWP-wx4flA";
	const vapidPrivateKey = serverEnv("VAPID_PRIVATE_KEY");
	if (!serviceRoleKey || !vapidPrivateKey) {
		const missing = [];
		if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
		if (!vapidPrivateKey) missing.push("VAPID_PRIVATE_KEY");
		throw new DeliveryConfigError(`missing server-side environment variable(s): ${missing.join(", ")}.`);
	}
	const vapidKeys = {
		publicKey: vapidPublicKey,
		privateKey: vapidPrivateKey
	};
	const keyProblem = validateVapidKeys(vapidKeys);
	if (keyProblem) throw new DeliveryConfigError(keyProblem);
	const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	} });
	const subject = resolveVapidSubject$1(options.requestOrigin, supabaseUrl);
	const { data: due, error: dueError } = await supabase.from("reminders").select("id, user_id, memory_id").eq("status", "pending").lte("remind_at", (/* @__PURE__ */ new Date()).toISOString()).is("notified_at", null).order("remind_at", { ascending: true }).limit(BATCH_LIMIT$1);
	if (dueError) throw new Error(`Could not read due reminders: ${dueError.message}`);
	const result = {
		scanned: (due ?? []).length,
		delivered: 0,
		skipped: 0,
		retried: 0,
		expiredSubscriptions: 0,
		errors: 0
	};
	for (const row of due ?? []) try {
		const { data: subscriptions, error: subscriptionError } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", row.user_id).order("created_at", { ascending: false });
		if (subscriptionError) {
			console.error("Could not read push subscriptions:", subscriptionError.message);
			result.errors += 1;
			continue;
		}
		if (!subscriptions?.length) {
			result.skipped += 1;
			continue;
		}
		const { data: memory, error: memoryError } = await supabase.from("memories").select("id, content, person_id").eq("id", row.memory_id).maybeSingle();
		if (memoryError) {
			console.error("Could not read the reminder's memory:", memoryError.message);
			result.errors += 1;
			continue;
		}
		if (!memory) {
			result.skipped += 1;
			continue;
		}
		const body = notificationBody(memory.content);
		if (!body) {
			result.skipped += 1;
			continue;
		}
		let title = FALLBACK_TITLE;
		if (memory.person_id) {
			const { data: person } = await supabase.from("people").select("id, name").eq("id", memory.person_id).maybeSingle();
			if (person) title = person.name;
		}
		const { data: claim, error: claimError } = await supabase.rpc("claim_due_reminder", { p_reminder_id: row.id });
		if (claimError) {
			console.error("Could not claim the due reminder:", claimError.message);
			result.errors += 1;
			continue;
		}
		if (claim?.[0]?.claimed !== true) continue;
		const payload = {
			title,
			body,
			url: NOTIFICATION_PATH$1
		};
		let accepted = false;
		for (const subscription of subscriptions) {
			let outcome;
			try {
				outcome = await sendWebPush({
					endpoint: subscription.endpoint,
					p256dh: subscription.p256dh,
					auth: subscription.auth
				}, payload, vapidKeys, subject);
			} catch (error) {
				console.error("Web Push threw while sending:", error);
				continue;
			}
			if (outcome === "delivered") {
				accepted = true;
				break;
			}
			if (outcome === "expired") {
				const { error: removeError } = await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
				if (removeError) console.error("Could not remove an expired push subscription:", removeError.message);
				else result.expiredSubscriptions += 1;
			}
		}
		if (accepted) {
			result.delivered += 1;
			continue;
		}
		const { error: releaseError } = await supabase.from("reminders").update({ notified_at: null }).eq("id", row.id).eq("status", "pending").not("notified_at", "is", null);
		if (releaseError) {
			console.error("Could not release the delivery claim:", releaseError.message);
			result.errors += 1;
		} else result.retried += 1;
	} catch (error) {
		console.error(`Delivery failed for reminder ${row.id}:`, error);
		result.errors += 1;
	}
	console.log(`Reminder delivery pass: scanned=${result.scanned} delivered=${result.delivered} skipped=${result.skipped} retried=${result.retried} expired=${result.expiredSubscriptions} errors=${result.errors}`);
	return result;
}
/**
* The Phase 4C daily proactive memory nudge: one generic, warm push per user
* per UTC day, whether or not any scheduled reminder is due.
*
* Invoked by `/api/daily-nudge`, which gates it with `CRON_SECRET` and answers
* for both GET and POST. An external scheduler calls it once a day; the send
* time is entirely the scheduler's choice and is configured outside this repo.
*
* How one pass works, per user:
*
*  1. Read `push_subscriptions` (paged — this pass is user-driven, so it is NOT
*     bounded by the Phase 4B reminder batch of 10).
*  2. Collapse each user's rows to the NEWEST one, so a user with several
*     devices gets exactly one nudge, on the most recently created endpoint.
*  3. Claim the day atomically via `claim_daily_nudge` (migration 0006). The
*     database function is the ONLY claim mechanism: it is a single
*     `insert ... on conflict do update ... where`, so overlapping scheduler
*     runs can never both win the same user/day. `false` means someone already
*     claimed it, and the user is skipped.
*  4. Send one encrypted Web Push to that newest subscription.
*
* The payload is deliberately generic — the same `{ title, body, url }` shape
* Phase 4B uses — so `public/sw.js` renders it with no client change, and a tap
* opens `/capture`, which already exists and is already auth-guarded.
*
* KNOWN LIMITATION, stated rather than hidden: the claim is taken BEFORE the
* send, and migration 0006 provides no release path. So if a user is claimed
* and the push then fails (expired, transient, or rejected), that UTC day's
* nudge is forfeited and will not be retried. It is counted in `sendFailed`
* rather than being folded into `delivered`, so a run can never report more
* successful deliveries than the push service actually accepted.
*
* Everything here runs server-side only. Secrets are read through the same
* `serverEnv()` helper Phase 4B uses, and no secret is ever logged.
*/
/** Notification copy: generic and warm, with no personal content at all. */
var NUDGE_TITLE = "Known something today worth remembering later?";
/** Notification copy: the reason to act now, before the moment is gone. */
var NUDGE_BODY = "Capture a little memory before it slips away.";
/** In-app path a tap opens. `/capture` already exists and is auth-guarded. */
var NOTIFICATION_PATH = "/capture";
/** Subscription rows read per round trip. This pass is paged, not capped at 10. */
var PAGE_SIZE = 500;
/**
* The current UTC day as `YYYY-MM-DD`, which is the `date` literal
* `claim_daily_nudge` expects. UTC only, deliberately: there is no timezone
* infrastructure in this schema, so the day boundary is the same everywhere.
*/
function currentUtcDay(now = /* @__PURE__ */ new Date()) {
	return now.toISOString().slice(0, 10);
}
/**
* Who the VAPID JWT says we are (RFC 8292 requires https/mailto).
*
* A local copy of the Phase 4B helper, which is intentionally not exported from
* that module: this step does not modify Phase 4B, so the logic is mirrored
* here rather than shared. Preference: explicit override → this app's own https
* origin → the project's https Supabase URL.
*/
function resolveVapidSubject(requestOrigin, supabaseUrl) {
	const configured = serverEnv("VAPID_SUBJECT");
	if (configured) return configured;
	if (requestOrigin.startsWith("https://")) return requestOrigin;
	if (supabaseUrl.startsWith("https://")) return supabaseUrl;
	return requestOrigin;
}
/**
* Reduces one page of subscriptions to the newest row per user.
*
* Only correct because the caller orders by `user_id` ascending then
* `created_at` descending, so each user's rows are adjacent and its first row
* is its newest. A user therefore receives exactly one nudge, and it is sent to
* the most recently created subscription.
*/
function newestPerUser(rows) {
	const newest = [];
	let currentUserId = null;
	for (const row of rows) {
		if (row.user_id === currentUserId) continue;
		currentUserId = row.user_id;
		newest.push(row);
	}
	return newest;
}
/**
* Runs one daily-nudge pass.
*
* `requestOrigin` is the origin the endpoint was called on, used as the VAPID
* contact when no explicit subject is configured.
*
* Throws `DeliveryConfigError` when server secrets are missing; any other throw
* means the pass could not run at all and the route reports it as 500.
*/
async function processDailyNudges(options) {
	const supabaseUrl = "https://xnvfqxnaonitfricqzum.supabase.co";
	const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
	const vapidPublicKey = "BErMl5ZW3qvDsOawMgLe0epUYf4RcsIktLyBVXav33BGjc2uvl2cKp9dRRlm-i2tc5Pxgyc-sp93niWP-wx4flA";
	const vapidPrivateKey = serverEnv("VAPID_PRIVATE_KEY");
	if (!serviceRoleKey || !vapidPrivateKey) {
		const missing = [];
		if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
		if (!vapidPrivateKey) missing.push("VAPID_PRIVATE_KEY");
		throw new DeliveryConfigError(`missing server-side environment variable(s): ${missing.join(", ")}.`);
	}
	const vapidKeys = {
		publicKey: vapidPublicKey,
		privateKey: vapidPrivateKey
	};
	const keyProblem = validateVapidKeys(vapidKeys);
	if (keyProblem) throw new DeliveryConfigError(keyProblem);
	const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	} });
	const subject = resolveVapidSubject(options.requestOrigin, supabaseUrl);
	const utcDay = currentUtcDay();
	const payload = {
		title: NUDGE_TITLE,
		body: NUDGE_BODY,
		url: NOTIFICATION_PATH
	};
	const result = {
		scanned: 0,
		claimed: 0,
		delivered: 0,
		skipped: 0,
		sendFailed: 0,
		expiredSubscriptions: 0,
		errors: 0
	};
	let offset = 0;
	for (;;) {
		const { data, error: pageError } = await supabase.from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth, created_at").order("user_id", { ascending: true }).order("created_at", { ascending: false }).order("id", { ascending: true }).range(offset, offset + PAGE_SIZE - 1);
		if (pageError) throw new Error(`Could not read push subscriptions: ${pageError.message}`);
		const page = data ?? [];
		if (page.length === 0) break;
		offset += page.length;
		for (const subscription of newestPerUser(page)) {
			result.scanned += 1;
			try {
				const { data: claim, error: claimError } = await supabase.rpc("claim_daily_nudge", {
					p_user_id: subscription.user_id,
					p_day: utcDay
				});
				if (claimError) {
					console.error("Could not claim the daily nudge:", claimError.message);
					result.errors += 1;
					continue;
				}
				if (claim !== true) {
					result.skipped += 1;
					continue;
				}
				result.claimed += 1;
				let outcome;
				try {
					outcome = await sendWebPush({
						endpoint: subscription.endpoint,
						p256dh: subscription.p256dh,
						auth: subscription.auth
					}, payload, vapidKeys, subject);
				} catch (error) {
					console.error("Web Push threw while sending the daily nudge:", error);
					result.sendFailed += 1;
					continue;
				}
				if (outcome === "delivered") {
					result.delivered += 1;
					continue;
				}
				if (outcome === "expired") {
					const { error: removeError } = await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
					if (removeError) console.error("Could not remove an expired push subscription:", removeError.message);
					else result.expiredSubscriptions += 1;
				}
				result.sendFailed += 1;
			} catch (error) {
				console.error(`Daily nudge failed for user ${subscription.user_id}:`, error);
				result.errors += 1;
			}
		}
		if (page.length < PAGE_SIZE) break;
	}
	console.log(`Daily nudge pass (${utcDay}): scanned=${result.scanned} claimed=${result.claimed} delivered=${result.delivered} skipped=${result.skipped} sendFailed=${result.sendFailed} expired=${result.expiredSubscriptions} errors=${result.errors}`);
	return result;
}
/**
* The one daily-nudge pass, shared by every HTTP method this route answers.
*
* Both GET and POST run exactly the same code, behind exactly the same
* bearer-token check. GET is what an external scheduler calls in production;
* POST stays for manual `curl` testing. The two methods are interchangeable.
*/
async function handleDailyNudge(request) {
	const configuredSecret = serverEnv("CRON_SECRET");
	if (!configuredSecret) return Response.json({ error: "Delivery is not configured." }, { status: 503 });
	if (request.headers.get("authorization") !== `Bearer ${configuredSecret}`) return Response.json({ error: "Not authorized." }, { status: 401 });
	try {
		const result = await processDailyNudges({ requestOrigin: new URL(request.url).origin });
		return Response.json(result);
	} catch (error) {
		if (error instanceof DeliveryConfigError) {
			console.error(error.message);
			return Response.json({ error: error.message }, { status: 503 });
		}
		console.error("Could not send the daily proactive nudge:", error);
		return Response.json({ error: "Delivery failed." }, { status: 500 });
	}
}
/**
* Phase 4C daily proactive nudge: `GET /api/daily-nudge`.
*
* Runs the once-per-UTC-day pass (read subscriptions → claim → notify) behind
* the `CRON_SECRET` bearer token. The scheduler must present
* `Authorization: Bearer <CRON_SECRET>`, where the secret must equal the
* deployed `CRON_SECRET` exactly.
*
* This is independent of `GET /api/reminders/due`: the daily nudge needs no due
* reminder to exist, and the two passes never share a claim, a counter, or a
* row. The time of day it runs is the scheduler's decision and is deliberately
* not configured in this repository.
*/
var Route$8 = createFileRoute("/api/daily-nudge")({ server: { handlers: {
	GET: async ({ request }) => handleDailyNudge(request),
	POST: async ({ request }) => handleDailyNudge(request)
} } });
var $$splitComponentImporter$1 = () => import("./people.index-CKZ4i_pB.mjs");
var Route$7 = createFileRoute("/people/")({
	head: () => ({ meta: [
		{ title: "People you keep close — keepdearly" },
		{
			name: "description",
			content: "Everyone you keep close, all in one quiet place."
		},
		{
			property: "og:title",
			content: "People you keep close — keepdearly"
		},
		{
			property: "og:description",
			content: "Everyone you keep close, all in one quiet place."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
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
var $$splitComponentImporter = () => import("./people.new-PYaRL-c0.mjs");
var Route$6 = createFileRoute("/people/new")({
	head: () => ({ meta: [
		{ title: "Add someone — keepdearly" },
		{
			name: "description",
			content: "Keep the people who matter close."
		},
		{
			property: "og:title",
			content: "Add someone — keepdearly"
		},
		{
			property: "og:description",
			content: "Keep the people who matter close."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
/**
* Add someone, on their own.
*
* This is the standalone way into the people collection — it used to be a tile
* that quietly opened "Keep a memory", which asked for words before it had even
* asked who the person was. A name is all that is required; a photo is a lovely
* extra and never a condition.
*
* It writes through the same `savePerson` the inline "or add someone new…" field
* inside the memory composer uses, so there is exactly one person model and one
* creation path however you arrive here.
*
* A plain browser file input sits behind the photo button, so Android, iOS and
* desktop all open the picker people already know. No `capture` attribute, which
* would skip the choices they expect.
*/
/**
* Server-only email sending (Phase 6C).
*
* The one place in KeepDearly that talks to an email provider. Everything else
* — the delivery pass, the route — depends only on `sendEmail()` below, so
* swapping Resend for Postmark or SES later is a change to this file alone and
* nothing else has to move.
*
* Deliberately minimal: one function, plain text, no templates, no attachments,
* no tracking pixels, no batching, no framework. That is the whole v1 surface.
*
* It calls the provider's HTTP API directly with `fetch`, for the same reason
* `web-push.server.ts` does — the project hand-rolls protocol integrations
* rather than taking an SDK dependency.
*
* Security and privacy, both deliberate:
*  - This file is `*.server.ts` and is never bundled to the browser. The API key
*    is read through `serverEnv()`, which never touches `import.meta.env`, so it
*    cannot leak through a `VITE_` prefixed variable.
*  - Nothing here logs the API key, the recipient address, or the message body.
*    Failures come back as a short category string, not a payload dump.
*
* The sender identity is configuration, not code: `RESEND_FROM` decides who the
* mail appears to come from, so the same build works in staging and production.
*/
/** Resend's send endpoint. Unversioned and stable. */
var RESEND_ENDPOINT = "https://api.resend.com/emails";
/** Configuration errors are about this deployment, so they say so by name. */
var EmailConfigError = class extends Error {
	constructor(reason) {
		super(`Email sending is not configured — ${reason}`);
		this.name = "EmailConfigError";
	}
};
/** Resolves the provider settings, or explains precisely what is missing. */
function resolveConfig() {
	const apiKey = serverEnv("RESEND_API_KEY");
	const from = serverEnv("RESEND_FROM");
	if (!apiKey || !from) {
		const missing = [];
		if (!apiKey) missing.push("RESEND_API_KEY");
		if (!from) missing.push("RESEND_FROM");
		throw new EmailConfigError(`missing ${missing.join(" and ")}.`);
	}
	return {
		apiKey,
		from
	};
}
/**
* Fails fast when the provider is not configured, WITHOUT sending anything.
*
* The delivery pass calls this once at the very start, before it looks at a
* single due row. That ordering matters: a message is claimed atomically
* before it is sent, and a claimed message is deliberately never released (a
* silent reset could duplicate an email the provider already accepted). So if
* the configuration were discovered *after* claiming, one unconfigured run
* would strand every due message in `sending` forever, undeliverable.
*
* Checking up front means an unconfigured deployment claims nothing at all and
* the endpoint answers 503 instead.
*/
function assertEmailConfigured() {
	resolveConfig();
}
/**
* Sends one email.
*
* A 2xx means the provider accepted the message for delivery; that is the same
* bar the Web Push path uses for "delivered", and it is the strongest claim this
* codebase can honestly make. It is not proof the recipient read anything.
*/
async function sendEmail(request) {
	const { apiKey, from } = resolveConfig();
	let response;
	try {
		response = await fetch(RESEND_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				from,
				to: [request.to],
				subject: request.subject,
				text: request.text
			}),
			signal: AbortSignal.timeout(15e3)
		});
	} catch (error) {
		console.error("Email provider request failed before any response:", { reason: "unreachable" });
		return {
			ok: false,
			reason: "unreachable"
		};
	}
	if (response.ok) try {
		const payload = await response.json();
		return {
			ok: true,
			providerId: typeof payload.id === "string" ? payload.id : ""
		};
	} catch {
		return {
			ok: true,
			providerId: ""
		};
	}
	return {
		ok: false,
		reason: "rejected"
	};
}
/**
* Scheduled-message delivery by email (Phase 6C).
*
* One pass of the job the external scheduler calls:
*
*   find due + pending  ->  check Plus  ->  claim atomically  ->  send  ->  sent/failed
*
* The claim is the important part and it happens BEFORE anything is sent. A
* pass never does "select pending, send, update", because two overlapping runs
* would both see the same row and both send the same email. The database
* function `claim_scheduled_message()` (migration 0008) is the only thing that
* may move a row out of `pending`, and it returns nothing unless this call
* genuinely won it — so a message this pass did not claim is never sent.
*
* Server-side only. Nothing here is imported by client code, and the provider
* key never leaves `email.server.ts`.
*/
/** The subject a recipient sees. Names the app so it is never a mystery. */
function subjectFor() {
	return "A message for you, via KeepDearly";
}
async function processScheduledMessages() {
	const supabaseUrl = serverEnv("VITE_SUPABASE_URL");
	const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
	if (!supabaseUrl || !serviceRoleKey) throw new EmailConfigError(`missing ${[!supabaseUrl && "VITE_SUPABASE_URL", !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean).join(" and ")}.`);
	const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	} });
	assertEmailConfigured();
	const result = {
		scanned: 0,
		claimed: 0,
		sent: 0,
		failed: 0,
		skippedNotPlus: 0,
		skippedAlreadyClaimed: 0,
		skippedNoAddress: 0,
		errors: 0
	};
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { data: due, error: dueError } = await supabase.from("scheduled_messages").select("id, user_id").eq("status", "pending").lte("send_at", now).limit(BATCH_LIMIT);
	if (dueError) throw new Error(`Could not read due scheduled messages: ${dueError.message}`);
	for (const row of due ?? []) {
		result.scanned += 1;
		try {
			const { data: profile, error: profileError } = await supabase.from("profiles").select("id, plus_active").eq("id", row.user_id).maybeSingle();
			if (profileError) {
				console.error("Could not read entitlement for a scheduled message:", {
					messageId: row.id,
					reason: "entitlement_read_failed"
				});
				result.errors += 1;
				continue;
			}
			if (!profile?.plus_active) {
				result.skippedNotPlus += 1;
				continue;
			}
			const { data: claim, error: claimError } = await supabase.rpc("claim_scheduled_message", { p_message_id: row.id });
			if (claimError) {
				console.error("Could not claim a scheduled message:", {
					messageId: row.id,
					reason: "claim_failed"
				});
				result.errors += 1;
				continue;
			}
			const claimed = claim?.[0];
			if (!claimed) {
				result.skippedAlreadyClaimed += 1;
				continue;
			}
			result.claimed += 1;
			if (!claimed.recipient_email) {
				await markFailed(supabase, claimed.id, FAIL_NO_ADDRESS);
				result.failed += 1;
				result.skippedNoAddress += 1;
				continue;
			}
			const sendResult = await sendEmail({
				to: claimed.recipient_email,
				subject: subjectFor(),
				text: claimed.body
			});
			if (sendResult.ok) {
				await markSent(supabase, claimed.id);
				result.sent += 1;
			} else {
				await markFailed(supabase, claimed.id, sendResult.reason);
				result.failed += 1;
			}
		} catch {
			console.error("Scheduled message delivery failed unexpectedly:", {
				messageId: row.id,
				reason: "unexpected"
			});
			result.errors += 1;
		}
	}
	console.log(`Scheduled message pass: scanned=${result.scanned} claimed=${result.claimed} sent=${result.sent} failed=${result.failed} notPlus=${result.skippedNotPlus} alreadyClaimed=${result.skippedAlreadyClaimed} noAddress=${result.skippedNoAddress} errors=${result.errors}`);
	return result;
}
/** Marks a message delivered, clearing any previous error note. */
async function markSent(supabase, id) {
	const { error } = await supabase.from("scheduled_messages").update({
		status: "sent",
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		last_error: null
	}).eq("id", id);
	if (error) console.error("Could not record a sent scheduled message:", {
		messageId: id,
		reason: "write_failed"
	});
}
/** Marks a message failed, with a short non-sensitive reason. */
async function markFailed(supabase, id, reason) {
	const { error } = await supabase.from("scheduled_messages").update({
		status: "failed",
		last_error: reason
	}).eq("id", id);
	if (error) console.error("Could not record a failed scheduled message:", {
		messageId: id,
		reason: "write_failed"
	});
}
/** How many due rows one pass looks at. Small on purpose; the cron is frequent. */
var BATCH_LIMIT = 25;
/** Where a failure note goes. Concise categories only — never the body. */
var FAIL_NO_ADDRESS = "no_recipient_email";
/**
* The one scheduled-message delivery pass, shared by both HTTP methods.
*
* GET is what an external scheduler calls in production; POST stays for manual
* `curl` testing. The two are interchangeable and share the same bearer check.
*/
async function handleMessagesDue(request) {
	const configuredSecret = serverEnv("CRON_SECRET");
	if (!configuredSecret) return Response.json({ error: "Delivery is not configured." }, { status: 503 });
	if (request.headers.get("authorization") !== `Bearer ${configuredSecret}`) return Response.json({ error: "Not authorized." }, { status: 401 });
	try {
		const result = await processScheduledMessages();
		return Response.json(result);
	} catch (error) {
		if (error instanceof EmailConfigError) {
			console.error(error.message);
			return Response.json({ error: error.message }, { status: 503 });
		}
		console.error("Could not deliver scheduled messages:", error);
		return Response.json({ error: "Delivery failed." }, { status: 500 });
	}
}
/**
* Phase 6C scheduled-message delivery: `GET /api/messages/due`.
*
* Sends any due `pending` scheduled message by email. Behind the same
* `CRON_SECRET` bearer token as the other delivery endpoints — it is a
* scheduler-only surface and must never be reachable from a browser, which is
* also why Plus entitlement is enforced inside the pass rather than in the UI.
*
* KeepDearly owns the schedule: `scheduled_messages.send_at` is the source of
* truth and the provider is never asked to schedule anything. A message is
* claimed atomically before it is sent, so overlapping runs cannot double-send.
*
* The response carries counts only. No address, no message body, no key.
*/
var Route$5 = createFileRoute("/api/messages/due")({ server: { handlers: {
	GET: async ({ request }) => handleMessagesDue(request),
	POST: async ({ request }) => handleMessagesDue(request)
} } });
/**
* Server-only Plus purchase logic (Phase 6D).
*
* One-time KeepDearly Plus: UGX 2,000, paid once through Nylon Pay by Mobile
* Money (MTN MoMo or Airtel Money). No subscription, no wallet, no balance.
*
* The one rule this whole module exists to enforce
* -----------------------------------------------
*   Plus is activated only after THIS SERVER has asked Nylon Pay for the real
*   transaction status and seen it come back `successful`, at the expected
*   amount and currency. Nothing the browser says can grant Plus, and nothing in
*   a webhook body is trusted for the user id -- the account is derived from the
*   purchase row that this server created at checkout, looked up by reference.
*
* That is why there are two independent ways an outcome is recorded, both of
* which verify against Nylon Pay before touching the database:
*
*   - the status route the browser polls (`confirmPlusPurchase`), so the user
*     sees Plus without a webhook ever arriving;
*   - the webhook (`applyNylonWebhookEvent`), the push path Nylon Pay
*     documents for delivering status changes.
*
* Both call the same `recordOutcome`, and both are idempotent, so a duplicate
* webhook or a browser that polls fifty times still completes exactly one
* purchase and never errors.
*
* Credentials come from `serverEnv()` and are read on the server only. This is
* a `*.server.ts` file, so it is never bundled to the browser, and no key or
* secret is ever logged or returned to the client.
*/
/**
* The Plus price. Server-owned and deliberately a constant.
*
* The browser never sends an amount or a currency; both come from here, and
* migration 0011 additionally CHECK-constrains `plus_purchases.amount` to 2000
* and `.currency` to 'UGX', and re-tests them inside
* `complete_plus_purchase()`. So the price cannot be changed by a request body,
* a tampered webhook, or a bad write from anywhere.
*
* Nylon Pay's minimum collection is 500 UGX; 2,000 clears it comfortably.
*/
var PLUS_PRICE_UGX = 2e3;
/** The provider this build talks to. Matched by the table's CHECK constraint. */
var PROVIDER = "nylonpay";
/** What the purchase screen describes the charge as, shown to the payer. */
var PLUS_DESCRIPTION = "KeepDearly Plus (one time)";
/**
* Configuration problems are about this deployment, not the user, so they name
* the missing variable and never its value. Mirrors EmailConfigError from 6C.
*/
var PlusConfigError = class extends Error {
	constructor(reason) {
		super(`Plus payments are not configured — ${reason}`);
		this.name = "PlusConfigError";
	}
};
/**
* A request the user is allowed to see something about, but that did not end in
* a granted entitlement. Deliberately coarse: the UI needs to say "that didn't
* work", never why the provider refused or what our keys are.
*/
var PlusPaymentError = class extends Error {
	reason;
	constructor(message, reason) {
		super(message);
		this.reason = reason;
		this.name = "PlusPaymentError";
	}
};
/**
* The service-role Supabase client.
*
* It bypasses RLS, which is required here and dangerous anywhere else: it is the
* only credential that may write `plus_purchases` (the client has SELECT only)
* and the only one that may call `complete_plus_purchase` / `fail_plus_purchase`
* (service_role only). It never reaches a browser bundle.
*/
function serviceClient() {
	const url = serverEnv("VITE_SUPABASE_URL");
	const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
	if (!url || !serviceRoleKey) throw new PlusConfigError(`missing ${[!url && "VITE_SUPABASE_URL", !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean).join(" and ")}.`);
	return createClient(url, serviceRoleKey, { auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false
	} });
}
/**
* The Nylon Pay SDK instance, built once per process from server-only env vars.
*
* Sandbox vs live is decided by the API KEY itself, exactly as Nylon Pay
* documents: a `npk_test_` key runs against sandbox providers, a `npk_live_` key
* processes real money. There is deliberately no separate environment flag here,
* so there is no way for the two to disagree.
*
* `onError` reports the category and reason only. A Nylon Pay error message can
* echo the payer's phone number, so the message itself is never logged.
*/
var sdk = null;
function nylonPay() {
	if (sdk) return sdk;
	const apiKey = serverEnv("NYLONPAY_API_KEY");
	const apiSecret = serverEnv("NYLONPAY_API_SECRET");
	const webhookSecret = serverEnv("NYLONPAY_WEBHOOK_SECRET");
	const missing = [
		!apiKey && "NYLONPAY_API_KEY",
		!apiSecret && "NYLONPAY_API_SECRET",
		!webhookSecret && "NYLONPAY_WEBHOOK_SECRET"
	].filter(Boolean);
	if (missing.length) throw new PlusConfigError(`missing ${missing.join(" and ")}.`);
	sdk = createNylonPay({
		apiKey,
		apiSecret
	});
	return sdk;
}
/**
* True when this deployment talks to Nylon Pay's sandbox.
*
* Test vs live is decided by the API key itself -- there is no environment flag
* -- so the key prefix is the one authoritative signal. Only a key we are
* certain is a test key is treated as sandbox.
*/
function isSandboxMode() {
	const apiKey = serverEnv("NYLONPAY_API_KEY");
	return typeof apiKey === "string" && apiKey.startsWith("npk_test_");
}
/**
* The sandbox-only forced outcome for a collection, or `undefined` for live keys.
*
* Sandbox collections are simulated: nothing is pushed to the payer's phone, so
* without a forced outcome the attempt can sit pending and the purchase screen
* waits forever. `testOutcome` makes the sandbox finish deterministically so the
* one-time flow can be exercised end to end. Defaults to `"success"`; set
* `NYLONPAY_TEST_OUTCOME=fail` to walk the failure screen instead.
*
* Never returned for a live key: Nylon Pay rejects `testOutcome` there, and a
* real charge must always follow the payer's own approval on their phone.
*/
function sandboxTestOutcome() {
	if (!isSandboxMode()) return void 0;
	return serverEnv("NYLONPAY_TEST_OUTCOME") === "fail" ? "fail" : "success";
}
/**
* Normalises a Ugandan Mobile Money number to the international form Nylon Pay
* documents (+2567XXXXXXXX).
*
* Nylon Pay accepts "any common format" and auto-normalises, but validating here
* gives the user an immediate, clear error instead of a provider-side failure
* after their prompt has already been sent.
*
* Accepted: `+2567XXXXXXXX`, `2567XXXXXXXX`, and the local `07XXXXXXXX` /
* `7XXXXXXXX` forms. Anything else is rejected. The returned value is the
* normalised number; the input is never logged.
*/
function normalizeUgandanPhone(raw) {
	const digits = raw.replace(/[\s()\-.]/g, "");
	let local;
	if (/^\+?2567\d{8}$/.test(digits)) local = digits.replace(/^\+?256/, "");
	else if (/^0(7\d{8})$/.test(digits)) local = digits.slice(1);
	else if (/^7\d{8}$/.test(digits)) local = digits;
	else throw new PlusPaymentError("Enter a valid Ugandan Mobile Money number.", "invalid_phone");
	return `+256${local}`;
}
/**
* Resolves the signed-in user from the request's Supabase access token.
*
* The browser sends its own Supabase JWT in `Authorization: Bearer <token>`.
* The token is VERIFIED by asking Supabase, not by decoding it here, so a
* forged or expired token cannot pass. The returned id is the only user id this
* module ever acts on — a client-supplied user id is never read.
*/
async function requireUserId(request) {
	const header = request.headers.get("authorization") ?? "";
	const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
	if (!token) throw new PlusPaymentError("Sign in to buy Plus.", "unauthenticated");
	const { data, error } = await serviceClient().auth.getUser(token);
	if (error || !data.user) throw new PlusPaymentError("Sign in to buy Plus.", "unauthenticated");
	return data.user.id;
}
/** Whether this account already has Plus, read from our own database. */
async function readPlusActive(userId) {
	const { data, error } = await serviceClient().from("profiles").select("plus_active").eq("id", userId).maybeSingle();
	if (error) {
		console.error("Could not read Plus entitlement:", { reason: "profile_read_failed" });
		throw new PlusPaymentError("We couldn't check your Plus status just now.", "provider_error");
	}
	return data?.plus_active === true;
}
/**
* The single place a verified provider outcome becomes a database outcome.
*
* Everything else in this file funnels through here, so there is exactly one
* code path that can grant Plus, and it always: verifies the reference exists,
* checks the amount and currency against the fixed Plus price, and only then
* calls the service-role-only `complete_plus_purchase`. That function derives the
* user from the purchase row, so there is no argument here that could name a
* different account.
*
* A duplicate call is not an error: `complete_plus_purchase` simply activates
* nothing and returns `out_activated = false`.
*/
async function recordOutcome(reference, outcome) {
	const supabase = serviceClient();
	const { data: purchase, error: lookupError } = await supabase.from("plus_purchases").select("id, user_id, provider_reference, status, amount, currency").eq("provider_reference", reference).maybeSingle();
	if (lookupError) {
		console.error("Could not read the Plus purchase:", { reason: "purchase_read_failed" });
		throw new PlusPaymentError("We couldn't check that payment just now.", "provider_error");
	}
	if (!purchase) throw new PlusPaymentError("We couldn't find that payment.", "invalid_request");
	if (purchase.amount !== 2e3 || purchase.currency !== "UGX") throw new PlusPaymentError("We couldn't verify that payment.", "provider_error");
	if (outcome.status === "successful") {
		const { error } = await supabase.rpc("complete_plus_purchase", {
			p_reference: reference,
			p_provider_transaction_id: outcome.transactionId
		});
		if (error) {
			console.error("Could not complete the Plus purchase:", { reason: "activation_failed" });
			throw new PlusPaymentError("We couldn't finish setting up Plus.", "provider_error");
		}
	} else if (outcome.status === "failed" || outcome.status === "cancelled") {
		const { error } = await supabase.rpc("fail_plus_purchase", {
			p_reference: reference,
			p_failure_reason: outcome.failureReason ?? "payment_failed"
		});
		if (error) console.error("Could not record the failed Plus purchase:", { reason: "failure_record_failed" });
	}
	const { data: refreshed } = await supabase.from("plus_purchases").select("provider_reference, status, amount, currency").eq("id", purchase.id).maybeSingle();
	const plusActive = await readPlusActive(purchase.user_id);
	return toPurchaseView(refreshed ?? {
		provider_reference: purchase.provider_reference,
		status: purchase.status,
		amount: purchase.amount,
		currency: purchase.currency
	}, plusActive);
}
/**
* Starts a Plus purchase: creates the pending row, then prompts the payer.
*
* Order matters. The reference is generated and the `pending` row is written
* BEFORE Nylon Pay is called, so if the provider call succeeds but this process
* dies immediately afterwards, the transaction can still be reconciled — the
* reference Nylon Pay holds is already in our database.
*
* The user id is the verified session's, and the amount/currency are constants
* from this module. The only thing the browser contributes is the phone number
* to prompt, which is validated and normalised above.
*/
async function startPlusPurchase(request, body) {
	const userId = await requireUserId(request);
	if (await readPlusActive(userId)) {
		const { data } = await serviceClient().from("plus_purchases").select("provider_reference, status, amount, currency").eq("user_id", userId).eq("status", "completed").order("completed_at", { ascending: false }).limit(1).maybeSingle();
		if (data) return toPurchaseView(data, true);
		throw new PlusPaymentError("You already have KeepDearly Plus.", "already_plus");
	}
	if (typeof body?.phoneNumber !== "string" || !body.phoneNumber.trim()) throw new PlusPaymentError("Enter your Mobile Money number.", "invalid_request");
	const phoneNumber = normalizeUgandanPhone(body.phoneNumber);
	const client = nylonPay();
	const supabase = serviceClient();
	const reference = crypto.randomUUID();
	const { error: insertError } = await supabase.from("plus_purchases").insert({
		user_id: userId,
		provider: PROVIDER,
		provider_reference: reference,
		amount: PLUS_PRICE_UGX,
		currency: "UGX",
		status: "pending",
		payer_phone: phoneNumber
	});
	if (insertError) {
		const { data: existing } = await supabase.from("plus_purchases").select("provider_reference, status, amount, currency").eq("user_id", userId).eq("status", "pending").maybeSingle();
		if (existing) return toPurchaseView(existing, false);
		console.error("Could not create the Plus purchase:", { reason: "purchase_create_failed" });
		throw new PlusPaymentError("We couldn't start that payment just now.", "provider_error");
	}
	const accountName = await readDisplayName(userId);
	const testOutcome = sandboxTestOutcome();
	try {
		(await client.collectPayment({
			amount: PLUS_PRICE_UGX,
			currency: "UGX",
			description: PLUS_DESCRIPTION,
			customer: {
				name: accountName,
				phoneNumber
			},
			method: "mobileMoney",
			reference,
			metadata: { source: "keepdearly-plus" },
			...testOutcome ? { testOutcome } : {}
		})).on("error", ({ category }) => {
			console.error("Nylon Pay could not start the collection:", { category });
		});
	} catch (error) {
		console.error("Nylon Pay rejected the collection request:", { reason: error instanceof Error ? error.name : "unknown" });
		throw new PlusPaymentError("We couldn't start that payment just now.", "provider_error");
	}
	return {
		reference,
		status: "pending",
		amount: PLUS_PRICE_UGX,
		currency: "UGX",
		plusActive: false
	};
}
/**
* Asks Nylon Pay for the authoritative state of a transaction, then records it.
*
* This is the confirmation path the browser polls. It is deliberately the same
* code the webhook uses, because a browser saying "it worked" is not evidence —
* only this server's own lookup of Nylon Pay's status is.
*
* The reference comes from our own checkout response, and is re-checked against
* our own purchases table before anything happens, so a caller cannot point this
* at another user's transaction. A caller also cannot claim success: the status
* that decides the outcome is the one Nylon Pay returns.
*/
async function confirmPlusPurchase(request, reference) {
	const userId = await requireUserId(request);
	if (!reference || !isUuid(reference)) throw new PlusPaymentError("That payment reference isn't valid.", "invalid_request");
	const { data: purchase } = await serviceClient().from("plus_purchases").select("id, status, amount, currency").eq("provider_reference", reference).eq("user_id", userId).maybeSingle();
	if (!purchase) throw new PlusPaymentError("We couldn't find that payment.", "invalid_request");
	const statusResult = await nylonPay().getStatus({ reference });
	if (!statusResult.isOk) {
		const error = parseError(statusResult.error);
		console.error("Could not read the Plus payment status:", { category: error.category });
		throw new PlusPaymentError("We couldn't check that payment just now. Try again in a moment.", "provider_error");
	}
	const status = statusResult.value;
	if (status.amount !== 2e3 || status.currency !== "UGX") {
		console.error("Nylon Pay reported an unexpected amount or currency.", {
			reference,
			mismatch: true
		});
		throw new PlusPaymentError("We couldn't verify that payment.", "provider_error");
	}
	const transactionResult = await nylonPay().getTransaction({ reference });
	const transaction = transactionResult.isOk ? transactionResult.value : null;
	if (transaction?.type === "payout") throw new PlusPaymentError("We couldn't verify that payment.", "provider_error");
	return recordOutcome(reference, {
		status: status.status,
		transactionId: transaction?.id ?? null,
		failureReason: transaction?.failureReason ?? null
	});
}
/**
* Abandons an attempt the payer never received a prompt for, so they can start a
* fresh one.
*
* The purchase screen offers this only while it is waiting on a payment the
* payer does not believe reached their phone. It is deliberately conservative:
*
*  - It reuses `confirmPlusPurchase` first, so every existing safeguard applies
*    unchanged: the caller is authenticated, the reference must belong to them,
*    the amount and currency are re-verified against Nylon Pay, and Plus is
*    granted ONLY by `complete_plus_purchase` on a verified success.
*  - A genuinely successful attempt is kept and completed, never discarded.
*  - A live attempt Nylon Pay still reports as pending is NOT abandoned: the
*    payer may yet approve the prompt, and abandoning it could lead to a second
*    charge. The screen simply keeps waiting.
*  - Only a sandbox attempt is abandoned while still pending, because a sandbox
*    collection never pushes a prompt and can never move real money. The row is
*    moved with `fail_plus_purchase`, which only ever moves pending -> failed and
*    never touches `plus_active`.
*/
async function retryPlusPurchase(request, reference) {
	const view = await confirmPlusPurchase(request, reference);
	if (view.status !== "pending") return view;
	if (!isSandboxMode()) return view;
	const userId = await requireUserId(request);
	const { error } = await serviceClient().rpc("fail_plus_purchase", {
		p_reference: reference,
		p_failure_reason: "abandoned_sandbox"
	});
	if (error) {
		console.error("Could not reset the sandbox Plus purchase:", { reason: "failure_record_failed" });
		throw new PlusPaymentError("We couldn't reset that payment just now.", "provider_error");
	}
	return {
		reference,
		status: "failed",
		amount: PLUS_PRICE_UGX,
		currency: "UGX",
		plusActive: await readPlusActive(userId)
	};
}
/**
* The name shown to the payer on the Mobile Money prompt.
*
* Falls back to a neutral label rather than an email address, because this ends
* up on a telco prompt the payer did not type into. Never logged.
*/
async function readDisplayName(userId) {
	const { data } = await serviceClient().from("profiles").select("full_name").eq("id", userId).maybeSingle();
	const name = data?.full_name?.trim();
	return name && name.length > 0 ? name : "KeepDearly Plus";
}
/** Shaped for the browser: counts and state, never a phone number or a secret. */
function toPurchaseView(row, plusActive) {
	return {
		reference: row.provider_reference,
		status: row.status,
		amount: row.amount,
		currency: row.currency,
		plusActive
	};
}
/**
* Handles one Nylon Pay webhook delivery.
*
* Two independent checks stand between an inbound POST and Plus being granted:
*
*  1. verifyWebhookSignature over the RAW body: HMAC-SHA256 plus Nylon Pay's
*     freshness window. The raw bytes matter -- parsing and re-serialising
*     first would change the signed content. A tampered or replayed body fails
*     here and never reaches the database.
*  2. getStatus() against Nylon Pay itself. Nylon Pay's own guidance is to
*     treat webhooks as the fast path, not the only path, and to verify with
*     getStatus before fulfilling. A correctly signed but stale event cannot
*     grant Plus on its own.
*
* Only payload.reference is read from the body. The user id is never taken from
* the webhook -- it comes from the purchase row that reference resolves to -- so
* a signed event for someone else's transaction cannot grant Plus to us.
*
* Returns the HTTP status the route should answer with. A 2xx acknowledges the
* delivery; Nylon Pay retries anything else.
*/
async function applyNylonWebhookEvent(rawBody, signatureHeader) {
	const secret = serverEnv("NYLONPAY_WEBHOOK_SECRET");
	if (!secret || !signatureHeader) {
		console.error("Rejected a Nylon Pay webhook: not configured or unsigned.");
		return 401;
	}
	const client = nylonPay();
	if (!client.verifyWebhookSignature({
		payload: rawBody,
		signature: signatureHeader,
		secret
	})) {
		console.error("Rejected a Nylon Pay webhook: signature verification failed.");
		return 401;
	}
	let reference;
	try {
		const parsed = JSON.parse(rawBody);
		reference = typeof parsed.payload?.reference === "string" ? parsed.payload.reference : "";
	} catch {
		console.error("Rejected a Nylon Pay webhook: body was not JSON.");
		return 400;
	}
	if (!isUuid(reference)) {
		console.error("Rejected a Nylon Pay webhook: missing or malformed reference.");
		return 400;
	}
	const statusResult = await client.getStatus({ reference });
	if (!statusResult.isOk) {
		const error = parseError(statusResult.error);
		console.error("Could not verify a Nylon Pay webhook transaction:", { category: error.category });
		return 503;
	}
	const status = statusResult.value;
	if (status.amount !== 2e3 || status.currency !== "UGX") {
		console.error("Nylon Pay webhook reported an unexpected amount or currency.", {
			reference,
			mismatch: true
		});
		return 400;
	}
	const transactionResult = await client.getTransaction({ reference });
	const transaction = transactionResult.isOk ? transactionResult.value : null;
	if (transaction?.type === "payout") {
		console.error("Nylon Pay webhook reported a payout as if it were a Plus collection.", { reference });
		return 400;
	}
	const { data: known } = await serviceClient().from("plus_purchases").select("provider_reference").eq("provider_reference", reference).maybeSingle();
	if (!known) return 200;
	try {
		await recordOutcome(reference, {
			status: status.status,
			transactionId: transaction?.id ?? null,
			failureReason: transaction?.failureReason ?? null
		});
	} catch (error) {
		console.error("Could not apply a Nylon Pay webhook:", { reason: error instanceof PlusPaymentError ? error.reason : "unexpected" });
		return 500;
	}
	return 200;
}
/**
* Whether a string is a canonical UUID — the only shape a payment reference may
* take. A non-UUID reference is rejected before it can reach the provider or the
* database, so a malformed or hostile value never becomes a query.
*/
function isUuid(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
/**
* Phase 6D Plus purchase: `POST /api/plus/checkout`.
*
* Creates the pending purchase, then initiates the UGX 2,000 Mobile Money
* collection.
*
* Authenticated. The browser sends its own Supabase access token as
* `Authorization: Bearer <token>`, which this server VERIFIES with Supabase
* before doing anything. The user id is taken from that verified session only,
* so a client-supplied user id is never read, and the price is the constant
* UGX 2,000 rather than anything the request body contains.
*
* This route accepts no amount, no currency, no user id and no claimed success:
* the only client input is a phone number to prompt. Confirmation lives at
* `/api/plus/status` and `/api/plus/webhook`, which ask Nylon Pay directly.
*/
async function handleCheckout(request) {
	try {
		let body = {};
		try {
			body = await request.json();
		} catch {
			body = {};
		}
		const purchase = await startPlusPurchase(request, body);
		return Response.json(purchase, { status: 201 });
	} catch (error) {
		return errorResponse(error);
	}
}
/**
* Errors the browser is allowed to see.
*
* A missing/misconfigured server secret is a 503 naming the variable. Everything
* else is a safe, coarse message plus a category: no provider message, no phone
* number, no database or credential detail ever crosses this boundary.
*/
function errorResponse(error) {
	if (error instanceof PlusConfigError) {
		console.error(error.message);
		return Response.json({
			error: error.message,
			reason: "not_configured"
		}, { status: 503 });
	}
	if (error instanceof PlusPaymentError) {
		const status = error.reason === "unauthenticated" ? 401 : 400;
		return Response.json({
			error: error.message,
			reason: error.reason
		}, { status });
	}
	console.error("Could not handle a Plus purchase request:", { reason: error instanceof Error ? error.name : "unknown" });
	return Response.json({
		error: "Something went wrong. Try again in a moment.",
		reason: "provider_error"
	}, { status: 500 });
}
var Route$4 = createFileRoute("/api/plus/checkout")({ server: { handlers: { POST: async ({ request }) => handleCheckout(request) } } });
/**
* Phase 6D Plus retry: `POST /api/plus/retry?reference=...`.
*
* The purchase screen calls this only while it is waiting, when the payer did
* not get a prompt on their phone. The server re-checks Nylon Pay and, for a
* sandbox attempt only, abandons the stuck pending row so a fresh one can be
* started. A live attempt is never abandoned while the provider still reports it
* pending, so a prompt already on the payer's phone can still be approved.
*
* Authenticated exactly like checkout and status, and it never grants Plus by
* itself — it defers to the same verification the status route uses.
*/
async function handleRetry(request) {
	try {
		const purchase = await retryPlusPurchase(request, new URL(request.url).searchParams.get("reference") ?? "");
		return Response.json(purchase);
	} catch (error) {
		return errorResponse(error);
	}
}
var Route$3 = createFileRoute("/api/plus/retry")({ server: { handlers: { POST: async ({ request }) => handleRetry(request) } } });
/**
* Phase 6D Plus confirmation: `GET|POST /api/plus/status`.
*
* The purchase screen polls this while the payer approves the Mobile Money
* prompt, so Plus appears without waiting for a webhook to arrive.
*
* It is authenticated the same way checkout is: the browser sends its Supabase
* access token and the server verifies it, then looks the purchase up by
* reference AND user id together. A reference belonging to someone else simply
* does not match, so one user cannot poll another's payment.
*
* Critically, this route does NOT believe the browser. Whatever the screen says,
* the outcome here comes from asking Nylon Pay for the real transaction status
* and only then recording it. A client-supplied "success" is not even read: the
* body is not parsed at all, only the `reference` query parameter.
*
* It is also idempotent. Polling ten times completes exactly one purchase and
* `plus_active` simply stays true.
*/
async function handleStatus(request) {
	try {
		const purchase = await confirmPlusPurchase(request, new URL(request.url).searchParams.get("reference") ?? "");
		return Response.json(purchase);
	} catch (error) {
		return errorResponse(error);
	}
}
var Route$2 = createFileRoute("/api/plus/status")({ server: { handlers: {
	GET: async ({ request }) => handleStatus(request),
	POST: async ({ request }) => handleStatus(request)
} } });
/**
* Phase 6D Nylon Pay callback: `POST /api/plus/webhook`.
*
* Configure this URL in Nylon Pay's Dashboard under the API key's Webhook
* Configuration, alongside the signing secret stored as
* `NYLONPAY_WEBHOOK_SECRET`.
*
* This endpoint is publicly reachable and unauthenticated by design — Nylon Pay
* cannot present a Supabase session — so the request proves itself instead:
*
*  1. the `x-nylon-signature` header is verified over the RAW request body,
*     which is why `request.text()` is read once and passed through untouched;
*  2. the transaction is then re-checked against Nylon Pay itself, so a signed
*     but stale or forged event still cannot grant Plus;
*  3. the account that gets Plus comes from the purchase row the reference
*     resolves to, never from anything in the body.
*
* It answers 2xx on success so Nylon Pay stops retrying, 401 for a signature we
* will not accept, 503 when Nylon Pay is unreachable so the delivery is retried,
* and 5xx for anything unexpected.
*
* The webhook is a fast path, not the only path: /api/plus/status performs the
* same verification for a browser that is waiting, so a missed delivery still
* results in Plus.
*/
async function handleWebhook(request) {
	let rawBody;
	try {
		rawBody = await request.text();
	} catch {
		return Response.json({ error: "Could not read the request." }, { status: 400 });
	}
	try {
		const status = await applyNylonWebhookEvent(rawBody, request.headers.get("x-nylon-signature"));
		return Response.json({ received: status < 400 }, { status });
	} catch (error) {
		if (error instanceof PlusConfigError) {
			console.error(error.message);
			return Response.json({ error: "Webhook is not configured." }, { status: 503 });
		}
		console.error("Could not handle a Nylon Pay webhook:", { reason: error instanceof Error ? error.name : "unknown" });
		return Response.json({ error: "Webhook failed." }, { status: 500 });
	}
}
var Route$1 = createFileRoute("/api/plus/webhook")({ server: { handlers: { POST: async ({ request }) => handleWebhook(request) } } });
/**
* The one delivery pass, shared by every HTTP method this route answers.
*
* Both GET and POST run exactly the same code, behind exactly the same
* bearer-token check. GET is what an external scheduler calls in production;
* POST stays for manual `curl` testing. The two methods are interchangeable.
*/
async function handleDueReminders(request) {
	const configuredSecret = serverEnv("CRON_SECRET");
	if (!configuredSecret) return Response.json({ error: "Delivery is not configured." }, { status: 503 });
	if (request.headers.get("authorization") !== `Bearer ${configuredSecret}`) return Response.json({ error: "Not authorized." }, { status: 401 });
	try {
		const result = await processDueReminders({ requestOrigin: new URL(request.url).origin });
		return Response.json(result);
	} catch (error) {
		if (error instanceof DeliveryConfigError) {
			console.error(error.message);
			return Response.json({ error: error.message }, { status: 503 });
		}
		console.error("Could not deliver due reminders:", error);
		return Response.json({ error: "Delivery failed." }, { status: 500 });
	}
}
/**
* Phase 4B delivery endpoint: `/api/reminders/due`.
*
* Runs the deterministic due-reminder pass (find due → claim → notify →
* record) behind the `CRON_SECRET` bearer token. The scheduler must present
* `Authorization: Bearer <CRON_SECRET>`, where the secret must equal the
* deployed `CRON_SECRET` exactly. It is invoked periodically — once per minute
* is the intended cadence — with GET in production; POST is also accepted so
* the same endpoint can be exercised by hand. Overlapping runs are safe
* because delivery claims are atomic.
*
* This is the ONLY route that runs the delivery pass. It never touches
* reminder status, completion or cancellation — delivery owns `notified_at`
* alone.
*/
var Route = createFileRoute("/api/reminders/due")({ server: { handlers: {
	GET: async ({ request }) => handleDueReminders(request),
	POST: async ({ request }) => handleDueReminders(request)
} } });
var IndexRoute = Route$15.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$16
});
var CaptureRoute = Route$17.update({
	id: "/capture",
	path: "/capture",
	getParentRoute: () => Route$16
});
var ForgotPasswordRoute = Route$14.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$16
});
var LoginRoute = Route$13.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$16
});
var PlusRoute = Route$12.update({
	id: "/plus",
	path: "/plus",
	getParentRoute: () => Route$16
});
var RemindersRoute = Route$11.update({
	id: "/reminders",
	path: "/reminders",
	getParentRoute: () => Route$16
});
var ResetPasswordRoute = Route$10.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$16
});
var SignupRoute = Route$9.update({
	id: "/signup",
	path: "/signup",
	getParentRoute: () => Route$16
});
var ApiDailyNudgeRoute = Route$8.update({
	id: "/api/daily-nudge",
	path: "/api/daily-nudge",
	getParentRoute: () => Route$16
});
var PeopleIndexRoute = Route$7.update({
	id: "/people/",
	path: "/people/",
	getParentRoute: () => Route$16
});
var PeoplePersonIdRoute = Route$18.update({
	id: "/people/$personId",
	path: "/people/$personId",
	getParentRoute: () => Route$16
});
var PeopleNewRoute = Route$6.update({
	id: "/people/new",
	path: "/people/new",
	getParentRoute: () => Route$16
});
var ApiMessagesDueRoute = Route$5.update({
	id: "/api/messages/due",
	path: "/api/messages/due",
	getParentRoute: () => Route$16
});
var ApiPlusCheckoutRoute = Route$4.update({
	id: "/api/plus/checkout",
	path: "/api/plus/checkout",
	getParentRoute: () => Route$16
});
var ApiPlusRetryRoute = Route$3.update({
	id: "/api/plus/retry",
	path: "/api/plus/retry",
	getParentRoute: () => Route$16
});
var ApiPlusStatusRoute = Route$2.update({
	id: "/api/plus/status",
	path: "/api/plus/status",
	getParentRoute: () => Route$16
});
var ApiPlusWebhookRoute = Route$1.update({
	id: "/api/plus/webhook",
	path: "/api/plus/webhook",
	getParentRoute: () => Route$16
});
var ApiRemindersDueRoute = Route.update({
	id: "/api/reminders/due",
	path: "/api/reminders/due",
	getParentRoute: () => Route$16
});
var PeoplePersonIdRouteChildren = { PeoplePersonIdMessageRoute: Route$19.update({
	id: "/message",
	path: "/message",
	getParentRoute: () => PeoplePersonIdRoute
}) };
var rootRouteChildren = {
	IndexRoute,
	CaptureRoute,
	ForgotPasswordRoute,
	LoginRoute,
	PlusRoute,
	RemindersRoute,
	ResetPasswordRoute,
	SignupRoute,
	ApiDailyNudgeRoute,
	PeoplePersonIdRoute: PeoplePersonIdRoute._addFileChildren(PeoplePersonIdRouteChildren),
	PeopleNewRoute,
	PeopleIndexRoute,
	ApiMessagesDueRoute,
	ApiPlusCheckoutRoute,
	ApiPlusRetryRoute,
	ApiPlusStatusRoute,
	ApiPlusWebhookRoute,
	ApiRemindersDueRoute
};
var routeTree = Route$16._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
