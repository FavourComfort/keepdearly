import { createFileRoute } from "@tanstack/react-router";

import { DeliveryConfigError, processDailyNudges } from "@/lib/daily-nudge.server";
import { serverEnv } from "@/lib/reminder-delivery.server";

/**
 * The one daily-nudge pass, shared by every HTTP method this route answers.
 *
 * Both GET and POST run exactly the same code, behind exactly the same
 * bearer-token check. GET is what an external scheduler calls in production;
 * POST stays for manual `curl` testing. The two methods are interchangeable.
 */
async function handleDailyNudge(request: Request): Promise<Response> {
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
    const result = await processDailyNudges({
      requestOrigin: new URL(request.url).origin,
    });
    return Response.json(result);
  } catch (error) {
    // Missing/malformed server secrets: say which, but never their values.
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
export const Route = createFileRoute("/api/daily-nudge")({
  server: {
    handlers: {
      // A scheduler calls GET in production; POST stays for manual invocation.
      GET: async ({ request }) => handleDailyNudge(request),
      POST: async ({ request }) => handleDailyNudge(request),
    },
  },
});
