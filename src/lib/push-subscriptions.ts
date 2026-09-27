import { readyServiceWorkerRegistration, serviceWorkersSupported } from "./service-worker";
import { getSupabase } from "./supabase";
import type { PushSubscriptionRow } from "./supabase.types";

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
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/** Why push is unavailable here. Every case gets its own honest message. */
export type PushUnsupportedReason =
  | "no-service-worker"
  | "no-push-manager"
  | "no-notification-api"
  | "insecure-origin"
  | "no-vapid-key";

export type PushSupport =
  { supported: true; reason: null } | { supported: false; reason: PushUnsupportedReason };

/**
 * What the UI needs to know. `unsupported` and `unconfigured` are deliberately
 * separate: one is the browser's limit, the other is ours.
 */
export type PushStatus =
  "checking" | "unsupported" | "unconfigured" | "signed-out" | "denied" | "available" | "enabled";

export type PushResult = {
  ok: boolean;
  status: PushStatus;
  /** A gentle sentence when something went wrong, otherwise null. */
  error: string | null;
};

export const PUSH_UNSUPPORTED_MESSAGES: Record<PushUnsupportedReason, string> = {
  "no-service-worker": "This browser can't run the background worker nudges need.",
  "no-push-manager": "This browser can't receive push notifications.",
  "no-notification-api": "This browser has no notification support.",
  "insecure-origin": "Nudges need a secure (https) connection.",
  "no-vapid-key": "Push isn't set up yet on this deployment.",
};

const GENERIC_ERROR = "We couldn't set up nudges just now.";
const UNSUPPORTED_ERROR = "This browser can't receive nudges.";
const DENIED_ERROR = "Notifications are blocked for keepdearly in this browser.";
const DISMISSED_ERROR = "You closed the permission prompt, so nudges stay off.";
const SIGNED_OUT_ERROR = "Sign in first, then turn on nudges.";
const UNSET_ERROR = "We couldn't turn nudges off just now.";

/**
 * Whether this browser can carry push at all, and whether it is configured.
 *
 * Checked in this order on purpose: a browser without a worker or the
 * Notification API is a browser limitation whatever the env says, and only then
 * does our own missing VAPID key become the reason.
 */
export function getPushSupport(): PushSupport {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { supported: false, reason: "no-service-worker" };
  }
  if (!serviceWorkersSupported()) return { supported: false, reason: "no-service-worker" };
  if (!("PushManager" in window)) return { supported: false, reason: "no-push-manager" };
  if (!("Notification" in window)) return { supported: false, reason: "no-notification-api" };
  // Push is only ever granted on a secure origin, so say so plainly rather than
  // letting `subscribe()` fail with something obscure.
  if (!window.isSecureContext) return { supported: false, reason: "insecure-origin" };
  if (!vapidPublicKey) return { supported: false, reason: "no-vapid-key" };
  return { supported: true, reason: null };
}

/** A message for the current blocker, or null when nothing is blocking. */
export function pushSupportMessage(support: PushSupport): string | null {
  return support.supported ? null : PUSH_UNSUPPORTED_MESSAGES[support.reason];
}

/** The browser's existing subscription for this device, if it has one. */
async function currentBrowserSubscription(): Promise<PushSubscription | null> {
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
function decodeVapidKey(key: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const base64 = (key + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/** The fields stored in `public.push_subscriptions` for one browser/device. */
function subscriptionFields(subscription: PushSubscription, userId: string) {
  // `toJSON()` carries the endpoint and both browser-generated encryption keys.
  const json = subscription.toJSON();
  return {
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh: json.keys?.["p256dh"] ?? "",
    auth: json.keys?.["auth"] ?? "",
    user_agent: typeof navigator === "undefined" ? null : navigator.userAgent,
  };
}

/**
 * What to show right now, for a signed-in user.
 *
 * Reads only. Safe to call on every screen mount: it registers the worker if it
 * has not been registered yet and asks the browser whether a subscription
 * already exists, but it never prompts and never writes.
 */
export async function readPushStatus(authenticated: boolean): Promise<PushStatus> {
  const support = getPushSupport();
  if (support.reason === "no-vapid-key") return "unconfigured";
  if (!support.supported) return "unsupported";
  if (!authenticated) return "signed-out";

  if (typeof Notification !== "undefined" && Notification.permission === "denied") {
    return "denied";
  }

  const subscription = await currentBrowserSubscription();
  return subscription ? "enabled" : "available";
}

/**
 * Turns nudges on for this browser/device.
 *
 * Order matters: the permission prompt must follow the user's click, so this is
 * only ever called from an explicit gesture. The subscription is then stored
 * under the session user, keyed on the unique `endpoint` so re-subscribing on
 * the same browser updates one row instead of adding another.
 */
export async function enablePushNotifications(): Promise<PushResult> {
  const support = getPushSupport();
  if (!support.supported) {
    return {
      ok: false,
      status: support.reason === "no-vapid-key" ? "unconfigured" : "unsupported",
      error: pushSupportMessage(support) ?? UNSUPPORTED_ERROR,
    };
  }

  const supabase = getSupabase();
  // `import.meta.env` values are typed as optional, so the key is re-checked
  // here to keep it a plain string for the subscription call.
  const applicationServerKey = vapidPublicKey;
  if (!applicationServerKey) {
    return {
      ok: false,
      status: "unconfigured",
      error: PUSH_UNSUPPORTED_MESSAGES["no-vapid-key"],
    };
  }
  // user_id always comes from the session — never from an argument.
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { ok: false, status: "signed-out", error: SIGNED_OUT_ERROR };

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch (error) {
    console.error("Could not request notification permission:", error);
    return { ok: false, status: "available", error: GENERIC_ERROR };
  }

  if (permission === "denied") {
    return { ok: false, status: "denied", error: DENIED_ERROR };
  }
  if (permission !== "granted") {
    return { ok: false, status: "available", error: DISMISSED_ERROR };
  }

  const registration = await readyServiceWorkerRegistration();
  if (!registration?.pushManager) {
    return { ok: false, status: "unsupported", error: UNSUPPORTED_ERROR };
  }

  let subscription: PushSubscription;
  try {
    subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        // Required by Chrome, and honest: every push here is user-visible.
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(applicationServerKey),
      }));
  } catch (error) {
    console.error("Could not create the push subscription:", error);
    return { ok: false, status: "available", error: GENERIC_ERROR };
  }

  const { error: saveError } = await supabase
    .from("push_subscriptions")
    .upsert(subscriptionFields(subscription, userId), { onConflict: "endpoint" });

  if (saveError) {
    // The browser is subscribed but we could not remember where. Reported rather
    // than swallowed, so nobody believes nudges are on when they are not.
    console.error("Could not save the push subscription:", saveError.message);
    return { ok: false, status: "available", error: GENERIC_ERROR };
  }

  return { ok: true, status: "enabled", error: null };
}

/**
 * Turns nudges off for this browser/device.
 *
 * The browser subscription is released first: a row without a live subscription
 * would be a destination that can no longer accept anything.
 */
export async function disablePushNotifications(): Promise<PushResult> {
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
      const { error: deleteError } = await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", subscription.endpoint);

      if (deleteError) {
        console.error("Could not remove the push subscription:", deleteError.message);
        return { ok: false, status: "enabled", error: UNSET_ERROR };
      }
    }
  }

  return { ok: true, status: "available", error: null };
}
