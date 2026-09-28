import { createFileRoute } from "@tanstack/react-router";

import {
  DeliveryConfigError,
  processDueReminders,
  serverEnv,
} from "../lib/reminder-delivery.server";

/**
 * The one delivery pass, shared by every HTTP method this route answers.
 *
 * Both GET and POST run exactly the same code, behind exactly the same
 * bearer-token check. GET is what an external scheduler calls in production;
 * POST stays for manual `curl` testing. The two methods are interchangeable.
 */
async function handleDueReminders(request: Request): Promise<Response> {
  const configuredSecret = serverEnv("CRON_SECRET");
  if (!configuredSecret) {
    return Response.json({ error: "Delivery is not configured." }, { status: 503 });
  }

  const presented = request.headers.get("authorization");
  if (presented !== `Bearer ${configuredSecret}`) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    // The origin doubles as the VAPID contact URI when no explicit
    // VAPID_SUBJECT is configured (RFC 8292 wants a https/mailto id).
    const result = await processDueReminders({
      requestOrigin: new URL(request.url).origin,
    });
    return Response.json(result);
  } catch (error) {
    // Missing/malformed server secrets: say which, but never their values.
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
export const Route = createFileRoute("/api/reminders/due")({
  server: {
    handlers: {
      // A scheduler calls GET in production; POST stays for manual invocation.
      GET: async ({ request }) => handleDueReminders(request),
      POST: async ({ request }) => handleDueReminders(request),
    },
  },
});
