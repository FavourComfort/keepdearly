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

import { createClient } from "@supabase/supabase-js";

import { EmailConfigError, assertEmailConfigured, sendEmail } from "./email.server";
import { serverEnv } from "./reminder-delivery.server";
import type { Database } from "./supabase.types";

/**
 * `supabase.types.ts` is hand-maintained and carries `scheduled_messages`,
 * `profiles` and `people` from Phase 6A/6B, but not this RPC. So the existing
 * `Database` type is reused whole and only the function is added — the same
 * approach the daily nudge took for `claim_daily_nudge`. No parallel schema
 * copy, and no hand-written claim.
 */
type ScheduledMessageDatabase = {
  public: Database["public"] & {
    Functions: Database["public"]["Functions"] & {
      claim_scheduled_message: {
        Args: { p_message_id: string };
        Returns: {
          id: string;
          recipient_email: string | null;
          body: string;
          person_name: string;
          attempts: number;
        }[];
      };
    };
  };
};

/** Counters for one pass. Counts only — no addresses, no message text. */
export type ScheduledMessageRunResult = {
  scanned: number;
  claimed: number;
  sent: number;
  failed: number;
  /** Due and pending, but the owner has no active Plus entitlement. */
  skippedNotPlus: number;
  /** Due and pending, but another run claimed it first. */
  skippedAlreadyClaimed: number;
  /** Left failed because the person has no email address saved. */
  skippedNoAddress: number;
  errors: number;
};

/** The subject a recipient sees. Names the app so it is never a mystery. */
function subjectFor(): string {
  return "A message for you, via KeepDearly";
}

export async function processScheduledMessages(): Promise<ScheduledMessageRunResult> {
  const supabaseUrl = serverEnv("VITE_SUPABASE_URL");
  const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = [
      !supabaseUrl && "VITE_SUPABASE_URL",
      !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
    ]
      .filter(Boolean)
      .join(" and ");
    throw new EmailConfigError(`missing ${missing}.`);
  }

  // service_role bypasses RLS — the only credential that may read every user's
  // due messages and call the claim function. It never reaches a client bundle.
  const supabase = createClient<ScheduledMessageDatabase>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // BEFORE anything is read or claimed. A message is claimed atomically and then
  // never released, so an unconfigured provider discovered mid-pass would strand
  // every due message in `sending` permanently. Checking here means an
  // unconfigured deployment claims nothing and the endpoint answers 503.
  assertEmailConfigured();

  const result: ScheduledMessageRunResult = {
    scanned: 0,
    claimed: 0,
    sent: 0,
    failed: 0,
    skippedNotPlus: 0,
    skippedAlreadyClaimed: 0,
    skippedNoAddress: 0,
    errors: 0,
  };

  const now = new Date().toISOString();
  const { data: due, error: dueError } = await supabase
    .from("scheduled_messages")
    .select("id, user_id")
    .eq("status", "pending")
    .lte("send_at", now)
    .limit(BATCH_LIMIT);

  if (dueError) {
    throw new Error(`Could not read due scheduled messages: ${dueError.message}`);
  }

  for (const row of due ?? []) {
    result.scanned += 1;

    try {
      // Plus is checked BEFORE claiming. A non-Plus row is never claimed, never
      // sent, and is deliberately left `pending` — if the user gets Plus later the
      // message simply goes out then, rather than being silently thrown away.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, plus_active")
        .eq("id", row.user_id)
        .maybeSingle();

      if (profileError) {
        console.error("Could not read entitlement for a scheduled message:", {
          messageId: row.id,
          reason: "entitlement_read_failed",
        });
        result.errors += 1;
        continue;
      }

      if (!profile?.plus_active) {
        result.skippedNotPlus += 1;
        continue;
      }

      // The claim. Returns no rows unless THIS call won it.
      const { data: claim, error: claimError } = await supabase.rpc("claim_scheduled_message", {
        p_message_id: row.id,
      });

      if (claimError) {
        console.error("Could not claim a scheduled message:", {
          messageId: row.id,
          reason: "claim_failed",
        });
        result.errors += 1;
        continue;
      }

      const claimed = claim?.[0];
      if (!claimed) {
        // Cancelled, sent, in flight, or another run won it. Never sent here.
        result.skippedAlreadyClaimed += 1;
        continue;
      }
      result.claimed += 1;

      // No address means there is nowhere to send. Fail it plainly rather than
      // leaving a row that retries forever.
      if (!claimed.recipient_email) {
        await markFailed(supabase, claimed.id, FAIL_NO_ADDRESS);
        result.failed += 1;
        result.skippedNoAddress += 1;
        continue;
      }

      const sendResult = await sendEmail({
        to: claimed.recipient_email,
        subject: subjectFor(),
        // The recipient gets exactly what the user wrote, and nothing else.
        text: claimed.body,
      });

      if (sendResult.ok) {
        await markSent(supabase, claimed.id);
        result.sent += 1;
      } else {
        // Store the category only. The provider's own error text is never
        // written to the database or the logs — it can echo the address/body.
        await markFailed(supabase, claimed.id, sendResult.reason);
        result.failed += 1;
      }
    } catch {
      // A per-message fault must not abandon the rest of the batch.
      console.error("Scheduled message delivery failed unexpectedly:", {
        messageId: row.id,
        reason: "unexpected",
      });
      result.errors += 1;
    }
  }

  console.log(
    `Scheduled message pass: scanned=${result.scanned} claimed=${result.claimed} sent=${result.sent} failed=${result.failed} notPlus=${result.skippedNotPlus} alreadyClaimed=${result.skippedAlreadyClaimed} noAddress=${result.skippedNoAddress} errors=${result.errors}`,
  );
  return result;
}

type DeliveryClient = ReturnType<typeof createClient<ScheduledMessageDatabase>>;

/** Marks a message delivered, clearing any previous error note. */
async function markSent(supabase: DeliveryClient, id: string): Promise<void> {
  const { error } = await supabase
    .from("scheduled_messages")
    .update({ status: "sent", sent_at: new Date().toISOString(), last_error: null })
    .eq("id", id);
  if (error) {
    console.error("Could not record a sent scheduled message:", {
      messageId: id,
      reason: "write_failed",
    });
  }
}

/** Marks a message failed, with a short non-sensitive reason. */
async function markFailed(supabase: DeliveryClient, id: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from("scheduled_messages")
    .update({ status: "failed", last_error: reason })
    .eq("id", id);
  if (error) {
    console.error("Could not record a failed scheduled message:", {
      messageId: id,
      reason: "write_failed",
    });
  }
}

/** How many due rows one pass looks at. Small on purpose; the cron is frequent. */
const BATCH_LIMIT = 25;

/** Where a failure note goes. Concise categories only — never the body. */
const FAIL_NO_ADDRESS = "no_recipient_email";

export { EmailConfigError };
