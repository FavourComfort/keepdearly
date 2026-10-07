import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as readyServiceWorkerRegistration, c as useAuth, i as getSupabase, l as useAuthDisplayName, r as BrandMark, s as serviceWorkersSupported } from "./BrandMark-D4AhOfJ-.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-D5MibK33.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Icon({ name, className, filled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		className: cn("ms-icon", filled && "ms-filled", className),
		children: name
	});
}
/**
* Web Push subscription plumbing: the Phase 4A foundation.
*
* This module answers three questions and performs two writes: is push usable
* in this browser, is it configured, and is this device already registered —
* then lets the user turn that registration on or off.
*
* It never sends a notification, schedules anything, decides what a notification
* says, or tracks what has been delivered. Those belong to a later phase.
*
* Security boundary:
*   - Only the PUBLIC VAPID key is read here, from `VITE_VAPID_PUBLIC_KEY`.
*   - The VAPID private key and the Supabase service_role key never appear in
*     client code, and the private key is never read at all.
*   - Rows are written with the signed-in Supabase session, so `user_id` comes
*     from the session. It is never accepted from a form, a URL or a prop.
*
* The reminder engine is untouched: nothing here reads or writes `reminders`.
*/
/** The public half of the VAPID keypair, injected from `.env.local`. */
var vapidPublicKey = "BErMl5ZW3qvDsOawMgLe0epUYf4RcsIktLyBVXav33BGjc2uvl2cKp9dRRlm-i2tc5Pxgyc-sp93niWP-wx4flA";
var PUSH_UNSUPPORTED_MESSAGES = {
	"no-service-worker": "This browser can't run the background worker nudges need.",
	"no-push-manager": "This browser can't receive push notifications.",
	"no-notification-api": "This browser has no notification support.",
	"insecure-origin": "Nudges need a secure (https) connection.",
	"no-vapid-key": "Push isn't set up yet on this deployment."
};
var GENERIC_ERROR = "We couldn't set up nudges just now.";
var UNSUPPORTED_ERROR = "This browser can't receive nudges.";
var DENIED_ERROR = "Notifications are blocked for keepdearly in this browser.";
var DISMISSED_ERROR = "You closed the permission prompt, so nudges stay off.";
var SIGNED_OUT_ERROR = "Sign in first, then turn on nudges.";
var UNSET_ERROR = "We couldn't turn nudges off just now.";
/**
* Whether this browser can carry push at all, and whether it is configured.
*
* Checked in this order on purpose: a browser without a worker or the
* Notification API is a browser limitation whatever the env says, and only then
* does our own missing VAPID key become the reason.
*/
function getPushSupport() {
	if (typeof window === "undefined" || typeof navigator === "undefined") return {
		supported: false,
		reason: "no-service-worker"
	};
	if (!serviceWorkersSupported()) return {
		supported: false,
		reason: "no-service-worker"
	};
	if (!("PushManager" in window)) return {
		supported: false,
		reason: "no-push-manager"
	};
	if (!("Notification" in window)) return {
		supported: false,
		reason: "no-notification-api"
	};
	if (!window.isSecureContext) return {
		supported: false,
		reason: "insecure-origin"
	};
	return {
		supported: true,
		reason: null
	};
}
/** A message for the current blocker, or null when nothing is blocking. */
function pushSupportMessage(support) {
	return support.supported ? null : PUSH_UNSUPPORTED_MESSAGES[support.reason];
}
/** The browser's existing subscription for this device, if it has one. */
async function currentBrowserSubscription() {
	const registration = await readyServiceWorkerRegistration();
	if (!registration?.pushManager) return null;
	try {
		return await registration.pushManager.getSubscription();
	} catch (error) {
		console.error("Could not read the existing push subscription:", error);
		return null;
	}
}
/** Converts the base64url VAPID key into the byte array `subscribe()` expects. */
function decodeVapidKey(key) {
	const base64 = (key + "=".repeat((4 - key.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
	const binary = window.atob(base64);
	const bytes = new Uint8Array(new ArrayBuffer(binary.length));
	for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
	return bytes;
}
/** The fields stored in `public.push_subscriptions` for one browser/device. */
function subscriptionFields(subscription, userId) {
	const json = subscription.toJSON();
	return {
		user_id: userId,
		endpoint: subscription.endpoint,
		p256dh: json.keys?.["p256dh"] ?? "",
		auth: json.keys?.["auth"] ?? "",
		user_agent: typeof navigator === "undefined" ? null : navigator.userAgent
	};
}
/**
* What to show right now, for a signed-in user.
*
* Reads only. Safe to call on every screen mount: it registers the worker if it
* has not been registered yet and asks the browser whether a subscription
* already exists, but it never prompts and never writes.
*/
async function readPushStatus(authenticated) {
	const support = getPushSupport();
	if (support.reason === "no-vapid-key") return "unconfigured";
	if (!support.supported) return "unsupported";
	if (!authenticated) return "signed-out";
	if (typeof Notification !== "undefined" && Notification.permission === "denied") return "denied";
	return await currentBrowserSubscription() ? "enabled" : "available";
}
/**
* Turns nudges on for this browser/device.
*
* Order matters: the permission prompt must follow the user's click, so this is
* only ever called from an explicit gesture. The subscription is then stored
* under the session user, keyed on the unique `endpoint` so re-subscribing on
* the same browser updates one row instead of adding another.
*/
async function enablePushNotifications() {
	const support = getPushSupport();
	if (!support.supported) return {
		ok: false,
		status: support.reason === "no-vapid-key" ? "unconfigured" : "unsupported",
		error: pushSupportMessage(support) ?? UNSUPPORTED_ERROR
	};
	const supabase = getSupabase();
	const applicationServerKey = vapidPublicKey;
	const { data: sessionData } = await supabase.auth.getSession();
	const userId = sessionData.session?.user.id;
	if (!userId) return {
		ok: false,
		status: "signed-out",
		error: SIGNED_OUT_ERROR
	};
	let permission;
	try {
		permission = await Notification.requestPermission();
	} catch (error) {
		console.error("Could not request notification permission:", error);
		return {
			ok: false,
			status: "available",
			error: GENERIC_ERROR
		};
	}
	if (permission === "denied") return {
		ok: false,
		status: "denied",
		error: DENIED_ERROR
	};
	if (permission !== "granted") return {
		ok: false,
		status: "available",
		error: DISMISSED_ERROR
	};
	const registration = await readyServiceWorkerRegistration();
	if (!registration?.pushManager) return {
		ok: false,
		status: "unsupported",
		error: UNSUPPORTED_ERROR
	};
	let subscription;
	try {
		subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: decodeVapidKey(applicationServerKey)
		});
	} catch (error) {
		console.error("Could not create the push subscription:", error);
		return {
			ok: false,
			status: "available",
			error: GENERIC_ERROR
		};
	}
	const { error: saveError } = await supabase.from("push_subscriptions").upsert(subscriptionFields(subscription, userId), { onConflict: "endpoint" });
	if (saveError) {
		console.error("Could not save the push subscription:", saveError.message);
		return {
			ok: false,
			status: "available",
			error: GENERIC_ERROR
		};
	}
	return {
		ok: true,
		status: "enabled",
		error: null
	};
}
/**
* Turns nudges off for this browser/device.
*
* The browser subscription is released first: a row without a live subscription
* would be a destination that can no longer accept anything.
*/
async function disablePushNotifications() {
	const subscription = await currentBrowserSubscription();
	try {
		await subscription?.unsubscribe();
	} catch (error) {
		console.error("Could not release the push subscription:", error);
	}
	if (subscription) {
		const supabase = getSupabase();
		const { data: sessionData } = await supabase.auth.getSession();
		const userId = sessionData.session?.user.id;
		if (userId) {
			const { error: deleteError } = await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", subscription.endpoint);
			if (deleteError) {
				console.error("Could not remove the push subscription:", deleteError.message);
				return {
					ok: false,
					status: "enabled",
					error: UNSET_ERROR
				};
			}
		}
	}
	return {
		ok: true,
		status: "available",
		error: null
	};
}
/**
* The small loading / empty / error states the real data needs.
*
* Reuses the existing KeepDearly wording and token classes (surface-container
* cards, italic body copy) rather than introducing a new visual language.
*/
/** Shown while a screen is waiting on Supabase. */
function DataLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[40vh] items-center justify-center py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-body-md text-outline",
			children: "just a moment…"
		})
	});
}
/** Shown when a screen has genuinely nothing to show yet. */
function DataEmpty({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface-container-low p-6 text-body-md italic text-on-surface-variant",
		children
	});
}
var noticeTones = {
	info: "bg-surface-container-low text-on-surface-variant",
	error: "bg-error-container text-on-error"
};
/** Inline notice for save failures and unmet expectations. */
function DataNotice({ tone = "info", children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: tone === "error" ? "alert" : "status",
		className: cn("rounded-lg px-4 py-3 text-body-sm", noticeTones[tone], className),
		children
	});
}
/**
* Shown when a read fails. Deliberately vague: the underlying Supabase error
* goes to the console, never to the screen.
*/
function DataError() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
		tone: "error",
		className: "mt-4",
		children: "We couldn’t reach your keeps just now. Give it a moment and try again."
	});
}
/**
* A small, quiet footer control for web push notifications.
*
* It lives inside the dark closing card, so every colour comes from the
* palette's `inverse-*` tokens rather than the light-surface ones — the same
* warm off-white, muted warm-gray and soft terracotta as the card around it.
* Visual weight stays minimal and aesthetic aligned with KeepDearly:
* - AVAILABLE / OFF: [bell icon] Quiet nudges · Turn on
* - ENABLED:         [active bell icon] Quiet nudges · Turn off
* - DENIED:          [muted bell icon] Quiet nudges · Blocked
* - UNSUPPORTED / UNCONFIGURED / SIGNED OUT / CHECKING: renders nothing
*/
function PushOptIn() {
	const { status: authStatus } = useAuth();
	const authenticated = authStatus === "authenticated";
	const [status, setStatus] = (0, import_react.useState)("checking");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [reloads, setReloads] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (authStatus === "loading") return;
		let active = true;
		readPushStatus(authenticated).then((next) => {
			if (active) setStatus(next);
		});
		return () => {
			active = false;
		};
	}, [
		authStatus,
		authenticated,
		reloads
	]);
	async function toggle() {
		if (busy) return;
		setBusy(true);
		setError(null);
		const result = status === "enabled" ? await disablePushNotifications() : await enablePushNotifications();
		setBusy(false);
		setStatus(result.status);
		setError(result.error);
		if (result.ok) setReloads((count) => count + 1);
	}
	if (status === "checking" || status === "unsupported" || status === "unconfigured") return null;
	if (status === "signed-out") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-1 sm:items-end",
		children: [status === "denied" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1.5 text-label-sm text-inverse-on-surface/70 select-none",
			title: "Notifications are blocked in your browser settings",
			"aria-label": "Quiet nudges are blocked in this browser's settings",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				name: "notifications_off",
				className: "text-[16px] text-inverse-on-surface/50"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quiet nudges · Blocked" })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => void toggle(),
			disabled: busy,
			title: status === "enabled" ? "Turn off quiet push nudges on this device" : "Turn on quiet push nudges on this device",
			"aria-label": busy ? "Updating quiet nudges…" : status === "enabled" ? "Quiet nudges are on. Click to turn off." : "Quiet nudges are off. Click to turn on.",
			className: "group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-label-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-on-surface hover:bg-inverse-on-surface/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inverse-primary/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				name: status === "enabled" ? "notifications_active" : "notifications",
				className: status === "enabled" ? "text-[16px] text-inverse-primary" : "text-[16px] text-inverse-on-surface/50 transition-colors group-hover:text-inverse-on-surface"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: busy ? "Quiet nudges · One moment…" : status === "enabled" ? "Quiet nudges · Turn off" : "Quiet nudges · Turn on" })]
		}), error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataNotice, {
			tone: "error",
			children: error
		}) : null]
	});
}
var navLinkBase = "rounded-full px-4 py-1 text-label-md transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low";
var navLinkActive = "bg-surface-container-high text-on-surface font-medium";
function BottomNavigation() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-surface/90 px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl md:hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				activeOptions: { exact: true },
				activeProps: { className: "text-primary" },
				inactiveProps: { className: "text-on-surface-variant" },
				className: "flex flex-col items-center gap-0.5 transition-colors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "cottage",
					className: "text-[20px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-label-sm lowercase",
					children: "home"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/capture",
				className: "flex flex-col items-center gap-0.5 rounded-full bg-primary-container px-4 py-1 text-on-primary-container shadow-sm transition-transform active:scale-95",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "favorite",
					className: "text-[20px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-label-sm font-semibold lowercase",
					children: "keep"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/reminders",
				activeProps: { className: "text-primary" },
				inactiveProps: { className: "text-on-surface-variant" },
				className: "flex flex-col items-center gap-0.5 transition-colors",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					name: "calendar_today",
					className: "text-[20px]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-label-sm lowercase",
					children: "reminders"
				})]
			})
		]
	});
}
function AppShell({ children }) {
	const { status, signOut } = useAuth();
	const displayName = useAuthDisplayName();
	const displayInitial = displayName.trim().charAt(0).toUpperCase() || "G";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "fixed left-0 right-0 top-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-20 max-w-3xl items-center justify-between gap-4 px-4 pt-[env(safe-area-inset-top)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "group flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "transition-transform group-hover:scale-105",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "h-8 w-8" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-headline-md lowercase leading-none tracking-tight text-primary",
									children: "keepdearly"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 hidden text-body-sm leading-tight text-on-surface-variant sm:inline-block",
									children: "the little things that actually matter"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden items-center gap-1 md:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/",
									activeOptions: { exact: true },
									className: navLinkBase,
									activeProps: { className: navLinkActive },
									children: "Home"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/capture",
									className: navLinkBase,
									activeProps: { className: navLinkActive },
									children: "Keep a Memory"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/reminders",
									className: navLinkBase,
									activeProps: { className: navLinkActive },
									children: "Reminders"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/capture",
								className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm transition-all active:scale-95 md:hidden",
								"aria-label": "Keep a memory",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									name: "add",
									className: "text-[18px]"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 pl-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-title-sm text-primary",
										children: displayInitial
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden text-label-md font-medium text-on-surface sm:inline",
										children: displayName || "Guest"
									}),
									status === "authenticated" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void signOut(),
										"aria-label": "Sign out",
										title: "Sign out",
										className: "flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											name: "logout",
											className: "text-[18px]"
										})
									}) : null
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "w-full bg-surface pb-24 pt-20 md:pb-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto min-h-[calc(100vh-14rem)] min-h-[calc(100dvh-14rem)] max-w-3xl px-4",
					children
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNavigation, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "mt-14 w-full px-4 py-9 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-9",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl bg-inverse-surface px-6 py-7 text-center sm:flex-row sm:items-start sm:px-8 sm:text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-headline-sm lowercase text-inverse-primary",
							children: "keepdearly"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-body-sm text-inverse-on-surface/80",
							children: "A quiet sanctuary for beloved memories and small tokens of tenderness."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-2 sm:items-end",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PushOptIn, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-label-sm text-inverse-on-surface/70",
							children: "© 2026 keepdearly. Gentle & discreet."
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { DataNotice as a, DataLoading as i, DataEmpty as n, Icon as o, DataError as r, cn as s, AppShell as t };
