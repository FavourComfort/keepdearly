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

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./supabase.types";
import { DeliveryConfigError, serverEnv } from "./reminder-delivery.server";
import {
  sendWebPush,
  validateVapidKeys,
  type PushPayload,
  type PushSendOutcome,
  type VapidKeys,
} from "./web-push.server";

/** Re-exported so the route depends on this module alone. */
export { DeliveryConfigError };

/**
 * `supabase.types.ts` is hand-maintained and deliberately left untouched by
 * this step, so `claim_daily_nudge` is declared here instead. Only the RPC is
 * added; `push_subscriptions` is read through the existing `Database` shape.
 */
type DailyNudgeDatabase = {
  public: Database["public"] & {
    Functions: Database["public"]["Functions"] & {
      /** Phase 4C: returns true only when THIS call made the claim for `p_day`. */
      claim_daily_nudge: {
        Args: { p_user_id: string; p_day: string };
        Returns: boolean;
      };
    };
  };
};

/** Counters for one pass. A user lands in at most one of scanned→claimed→{delivered | sendFailed}, or in skipped. */
export type DailyNudgeRunResult = {
  /** Distinct users with at least one push subscription. */
  scanned: number;
  /** Users that won the atomic claim for today's UTC day. */
  claimed: number;
  /** Claimed users whose push was accepted by the push service (2xx). */
  delivered: number;
  /** Users that had already claimed today's UTC day. */
  skipped: number;
  /** Claimed users whose push was NOT accepted; that day's nudge is forfeited. */
  sendFailed: number;
  /** Subscription rows the push service reported gone and this pass removed. */
  expiredSubscriptions: number;
  /** Users that hit an unexpected error; reported, never silently dropped. */
  errors: number;
};

/** Notification copy: generic and warm, with no personal content at all. */
const NUDGE_TITLE = "Know something worth remembering?";

/** Notification copy: the reason to act now, before the moment is gone. */
const NUDGE_BODY = "Capture a little memory before it slips away.";

/** In-app path a tap opens. `/capture` already exists and is auth-guarded. */
const NOTIFICATION_PATH = "/capture";

/** Subscription rows read per round trip. This pass is paged, not capped at 10. */
const PAGE_SIZE = 500;

/** One subscription row, exactly the columns this pass needs. */
type SubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

/**
 * The current UTC day as `YYYY-MM-DD`, which is the `date` literal
 * `claim_daily_nudge` expects. UTC only, deliberately: there is no timezone
 * infrastructure in this schema, so the day boundary is the same everywhere.
 */
function currentUtcDay(now: Date = new Date()): string {
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
function resolveVapidSubject(requestOrigin: string, supabaseUrl: string): string {
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
function newestPerUser(rows: SubscriptionRow[]): SubscriptionRow[] {
  const newest: SubscriptionRow[] = [];
  let currentUserId: string | null = null;
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
export async function processDailyNudges(options: {
  requestOrigin: string;
}): Promise<DailyNudgeRunResult> {
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

  // service_role bypasses RLS — the only credential that may read every user's
  // subscriptions and call the claim function. It never reaches a client bundle.
  const supabase = createClient<DailyNudgeDatabase>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const subject = resolveVapidSubject(options.requestOrigin, supabaseUrl);
  const utcDay = currentUtcDay();
  const payload: PushPayload = {
    title: NUDGE_TITLE,
    body: NUDGE_BODY,
    url: NOTIFICATION_PATH,
  };

  const result: DailyNudgeRunResult = {
    scanned: 0,
    claimed: 0,
    delivered: 0,
    skipped: 0,
    sendFailed: 0,
    expiredSubscriptions: 0,
    errors: 0,
  };

  // Paged, because this pass walks every subscribed user rather than a sparse
  // set of due reminders. The trailing `id` key keeps paging stable when two
  // rows share a user and a creation instant.
  let offset = 0;
  for (;;) {
    const { data, error: pageError } = await supabase
      .from("push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth, created_at")
      .order("user_id", { ascending: true })
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (pageError) {
      throw new Error(`Could not read push subscriptions: ${pageError.message}`);
    }

    const page: SubscriptionRow[] = data ?? [];
    if (page.length === 0) break;
    offset += page.length;

    // Per-user isolation: one bad user must not starve the rest of the pass.
    for (const subscription of newestPerUser(page)) {
      result.scanned += 1;
      try {
        const { data: claim, error: claimError } = await supabase.rpc("claim_daily_nudge", {
          p_user_id: subscription.user_id,
          p_day: utcDay,
        });
        if (claimError) {
          console.error("Could not claim the daily nudge:", claimError.message);
          result.errors += 1;
          continue;
        }
        // The function is the atomic claim: true only for the caller that made
        // it. Anything else means today is already spoken for.
        if (claim !== true) {
          result.skipped += 1;
          continue;
        }
        result.claimed += 1;

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
          console.error("Web Push threw while sending the daily nudge:", error);
          result.sendFailed += 1;
          continue;
        }

        if (outcome === "delivered") {
          result.delivered += 1;
          continue;
        }

        // The claim is already held and cannot be released (see the module
        // header), so every other outcome forfeits today's nudge and is
        // reported as a send failure rather than as a delivery.
        if (outcome === "expired") {
          // Same cleanup as Phase 4B: a row pointing at a dead endpoint would
          // otherwise keep this user eligible forever with nowhere to send.
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
        result.sendFailed += 1;
      } catch (error) {
        console.error(`Daily nudge failed for user ${subscription.user_id}:`, error);
        result.errors += 1;
      }
    }

    if (page.length < PAGE_SIZE) break;
  }

  console.log(
    `Daily nudge pass (${utcDay}): scanned=${result.scanned} claimed=${result.claimed} delivered=${result.delivered} skipped=${result.skipped} sendFailed=${result.sendFailed} expired=${result.expiredSubscriptions} errors=${result.errors}`,
  );
  return result;
}
