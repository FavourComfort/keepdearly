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

import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./supabase.types";
import {
  sendWebPush,
  validateVapidKeys,
  type PushPayload,
  type PushSendOutcome,
  type VapidKeys,
} from "./web-push.server";

/**
 * Delivery cannot run because a server-side secret is absent or malformed.
 * The route maps this to HTTP 503 with the variable NAMES (never values),
 * so an operator can see exactly what to set.
 */
export class DeliveryConfigError extends Error {
  constructor(reason: string) {
    super(`Reminder delivery is not configured — ${reason}`);
    this.name = "DeliveryConfigError";
  }
}

/** Counters for one pass. A scanned row lands in at most one of them — one a racing pass claimed first belongs to that pass. */
export type DeliveryRunResult = {
  /** Due rows examined in this pass. */
  scanned: number;
  /** Claimed and accepted by at least one push endpoint. */
  delivered: number;
  /** Nothing to send to (no subscription, or nothing to say) — left pending. */
  skipped: number;
  /** Claimed, but no endpoint accepted; claim released to retry later. */
  retried: number;
  /** Endpoints the push service reported gone; their rows were removed. */
  expiredSubscriptions: number;
  /** Rows that hit an unexpected error; reported, never silently dropped. */
  errors: number;
};

/** How many due rows one pass handles; the next minute picks up the rest. */
const BATCH_LIMIT = 10;

/** The memory text shown in the notification body, capped for a toast. */
const BODY_LENGTH_LIMIT = 160;

/** In-app path a notification click opens (the Reminders screen). */
const NOTIFICATION_PATH = "/reminders";

/** Fallback title when a memory has no person — mirrors `toReminderView`. */
const FALLBACK_TITLE = "A memory to revisit";

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
let localEnvCache: Record<string, string> | null = null;

function localEnvValue(name: string): string | undefined {
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
        if (
          (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
          (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
        ) {
          value = value.slice(1, -1);
        }
        localEnvCache[key] = value;
      }
    } catch {
      // No .env.local here — production configures the real environment.
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
export function serverEnv(name: string): string | undefined {
  const direct = process.env[name];
  if (direct && direct.trim()) return direct;
  const fromFile = localEnvValue(name);
  return fromFile && fromFile.trim() ? fromFile : undefined;
}

/**
 * Who the VAPID JWT says we are (RFC 8292 requires https/mailto).
 *
 * Preference: explicit override → this app's own https origin → the
 * project's https Supabase URL (local `http://localhost` dev has no https
 * origin of its own). Every candidate is a real project-owned URI — no
 * contact address is ever invented.
 */
function resolveVapidSubject(requestOrigin: string, supabaseUrl: string): string {
  const configured = serverEnv("VAPID_SUBJECT");
  if (configured) return configured;
  if (requestOrigin.startsWith("https://")) return requestOrigin;
  if (supabaseUrl.startsWith("https://")) return supabaseUrl;
  return requestOrigin;
}

/** Notification copy: the memory text, flattened and capped for one toast. */
function notificationBody(content: string): string | null {
  const flattened = content.replace(/\s+/g, " ").trim();
  if (!flattened) return null;
  if (flattened.length <= BODY_LENGTH_LIMIT) return flattened;
  return `${flattened.slice(0, BODY_LENGTH_LIMIT - 1).trimEnd()}…`;
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
export async function processDueReminders(options: {
  requestOrigin: string;
}): Promise<DeliveryRunResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? serverEnv("VITE_SUPABASE_URL");
  const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublicKey =
    import.meta.env.VITE_VAPID_PUBLIC_KEY ?? serverEnv("VITE_VAPID_PUBLIC_KEY");
  const vapidPrivateKey = serverEnv("VAPID_PRIVATE_KEY");

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    const missing: string[] = [];
    if (!supabaseUrl) missing.push("VITE_SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!vapidPublicKey) missing.push("VITE_VAPID_PUBLIC_KEY");
    if (!vapidPrivateKey) missing.push("VAPID_PRIVATE_KEY");
    throw new DeliveryConfigError(
      `missing server-side environment variable(s): ${missing.join(", ")}.`,
    );
  }

  const vapidKeys: VapidKeys = { publicKey: vapidPublicKey, privateKey: vapidPrivateKey };
  const keyProblem = validateVapidKeys(vapidKeys);
  if (keyProblem) throw new DeliveryConfigError(keyProblem);

  // service_role bypasses RLS — the only credential that may see every
  // user's due rows from the server. It never appears in client code.
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const subject = resolveVapidSubject(options.requestOrigin, supabaseUrl);

  const { data: due, error: dueError } = await supabase
    .from("reminders")
    .select("id, user_id, memory_id")
    .eq("status", "pending")
    .lte("remind_at", new Date().toISOString())
    .is("notified_at", null)
    .order("remind_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (dueError) throw new Error(`Could not read due reminders: ${dueError.message}`);

  const result: DeliveryRunResult = {
    scanned: (due ?? []).length,
    delivered: 0,
    skipped: 0,
    retried: 0,
    expiredSubscriptions: 0,
    errors: 0,
  };

  // Per-row isolation: one bad row must not starve the rest of the batch.
  for (const row of due ?? []) {
    try {
      // Destination first: without a subscription nothing can arrive, and
      // marking such a row delivered would be a lie.
      const { data: subscriptions, error: subscriptionError } = await supabase
        .from("push_subscriptions")
        .select("id, endpoint, p256dh, auth")
        .eq("user_id", row.user_id)
        .order("created_at", { ascending: false });
      if (subscriptionError) {
        console.error("Could not read push subscriptions:", subscriptionError.message);
        result.errors += 1;
        continue;
      }
      if (!subscriptions?.length) {
        // Stays pending: if this device subscribes later, the nudge goes out
        // on a following pass — same honest behaviour as an overdue row.
        result.skipped += 1;
        continue;
      }

      const { data: memory, error: memoryError } = await supabase
        .from("memories")
        .select("id, content, person_id")
        .eq("id", row.memory_id)
        .maybeSingle();
      if (memoryError) {
        console.error("Could not read the reminder's memory:", memoryError.message);
        result.errors += 1;
        continue;
      }
      // The FK should make this impossible; if it ever happens we send
      // nothing rather than a notification with no memory behind it.
      if (!memory) {
        result.skipped += 1;
        continue;
      }
      const body = notificationBody(memory.content);
      if (!body) {
        result.skipped += 1;
        continue;
      }

      // Same fallback title the reminder card uses (`toReminderView`).
      let title = FALLBACK_TITLE;
      if (memory.person_id) {
        const { data: person } = await supabase
          .from("people")
          .select("id, name")
          .eq("id", memory.person_id)
          .maybeSingle();
        if (person) title = person.name;
      }

      // Atomic claim (migration 0004): only one run can ever win this row.
      const { data: claim, error: claimError } = await supabase.rpc("claim_due_reminder", {
        p_reminder_id: row.id,
      });
      if (claimError) {
        console.error("Could not claim the due reminder:", claimError.message);
        result.errors += 1;
        continue;
      }
      // Lost the race: another pass owns the row (and will count it).
      if (claim?.[0]?.claimed !== true) continue;

      const payload: PushPayload = { title, body, url: NOTIFICATION_PATH };
      let accepted = false;
      for (const subscription of subscriptions) {
        let outcome: PushSendOutcome;
        try {
          outcome = await sendWebPush(
            {
              endpoint: subscription.endpoint,
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
            payload,
            vapidKeys,
            subject,
          );
        } catch (error) {
          console.error("Web Push threw while sending:", error);
          continue; // still try the person's other destinations
        }

        if (outcome === "delivered") {
          accepted = true;
          break;
        }
        if (outcome === "expired") {
          // The push service says this endpoint is gone. Removing the row
          // keeps future passes from aiming at a dead destination.
          const { error: removeError } = await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
          if (removeError) {
            console.error("Could not remove an expired push subscription:", removeError.message);
          } else {
            result.expiredSubscriptions += 1;
          }
        }
        // "transient" and "rejected" fall through to the next destination.
      }

      if (accepted) {
        result.delivered += 1;
        continue;
      }

      // No destination accepted the message: release the claim so the next
      // minute tries again instead of swallowing the nudge.
      const { error: releaseError } = await supabase
        .from("reminders")
        .update({ notified_at: null })
        .eq("id", row.id)
        .eq("status", "pending")
        .not("notified_at", "is", null);
      if (releaseError) {
        console.error("Could not release the delivery claim:", releaseError.message);
        result.errors += 1;
      } else {
        result.retried += 1;
      }
    } catch (error) {
      console.error(`Delivery failed for reminder ${row.id}:`, error);
      result.errors += 1;
    }
  }

  console.log(
    `Reminder delivery pass: scanned=${result.scanned} delivered=${result.delivered} skipped=${result.skipped} retried=${result.retried} expired=${result.expiredSubscriptions} errors=${result.errors}`,
  );
  return result;
}
