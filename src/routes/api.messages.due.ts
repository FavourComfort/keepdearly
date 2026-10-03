import { createFileRoute } from "@tanstack/react-router";

import {
  EmailConfigError,
  processScheduledMessages,
} from "@/lib/scheduled-message-delivery.server";
import { serverEnv } from "@/lib/reminder-delivery.server";

/**
 * The one scheduled-message delivery pass, shared by both HTTP methods.
 *
 * GET is what an external scheduler calls in production; POST stays for manual
 * `curl` testing. The two are interchangeable and share the same bearer check.
 */
async function handleMessagesDue(request: Request): Promise<Response> {
  const configuredSecret = serverEnv("CRON_SECRET");
  if (!configuredSecret) {
    return Response.json({ error: "Delivery is not configured." }, { status: 503 });
  }

  const presented = request.headers.get("authorization");
  if (presented !== `Bearer ${configuredSecret}`) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    // No request-scoped input at all: the database decides what is due.
    const result = await processScheduledMessages();
    return Response.json(result);
  } catch (error) {
    // Missing/malformed server secrets: say which, but never their values.
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
export const Route = createFileRoute("/api/messages/due")({
  server: {
    handlers: {
      GET: async ({ request }) => handleMessagesDue(request),
      POST: async ({ request }) => handleMessagesDue(request),
    },
  },
});
