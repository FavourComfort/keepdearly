import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import {
  disablePushNotifications,
  enablePushNotifications,
  readPushStatus,
  type PushStatus,
} from "@/lib/push-subscriptions";
import { DataNotice } from "./DataState";
import { Icon } from "./Icon";

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
export function PushOptIn() {
  const { status: authStatus } = useAuth();
  const authenticated = authStatus === "authenticated";

  const [status, setStatus] = useState<PushStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [reloads, setReloads] = useState(0);

  // Reading the current state never prompts and never writes, so it is safe on
  // mount and after every change.
  useEffect(() => {
    if (authStatus === "loading") return;

    let active = true;
    void readPushStatus(authenticated).then((next) => {
      if (active) setStatus(next);
    });

    return () => {
      active = false;
    };
  }, [authStatus, authenticated, reloads]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);

    const result =
      status === "enabled" ? await disablePushNotifications() : await enablePushNotifications();

    setBusy(false);
    setStatus(result.status);
    setError(result.error);
    if (result.ok) setReloads((count) => count + 1);
  }

  // Nothing to say: still checking, or nothing this browser/deployment can do.
  if (status === "checking" || status === "unsupported" || status === "unconfigured") {
    return null;
  }
  if (status === "signed-out") return null;

  return (
    <div className="flex flex-col items-center gap-1 sm:items-end">
      {status === "denied" ? (
        <span
          className="inline-flex items-center gap-1.5 text-label-sm text-inverse-on-surface/70 select-none"
          title="Notifications are blocked in your browser settings"
          aria-label="Quiet nudges are blocked in this browser's settings"
        >
          <Icon name="notifications_off" className="text-[16px] text-inverse-on-surface/50" />
          <span>Quiet nudges · Blocked</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={busy}
          title={
            status === "enabled"
              ? "Turn off quiet push nudges on this device"
              : "Turn on quiet push nudges on this device"
          }
          aria-label={
            busy
              ? "Updating quiet nudges…"
              : status === "enabled"
                ? "Quiet nudges are on. Click to turn off."
                : "Quiet nudges are off. Click to turn on."
          }
          className="group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-label-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-on-surface hover:bg-inverse-on-surface/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inverse-primary/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Icon
            name={status === "enabled" ? "notifications_active" : "notifications"}
            className={
              status === "enabled"
                ? "text-[16px] text-inverse-primary"
                : "text-[16px] text-inverse-on-surface/50 transition-colors group-hover:text-inverse-on-surface"
            }
          />
          <span>
            {busy
              ? "Quiet nudges · One moment…"
              : status === "enabled"
                ? "Quiet nudges · Turn off"
                : "Quiet nudges · Turn on"}
          </span>
        </button>
      )}

      {error ? <DataNotice tone="error">{error}</DataNotice> : null}
    </div>
  );
}
