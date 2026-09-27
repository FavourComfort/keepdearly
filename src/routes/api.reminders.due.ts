import { createFileRoute } from "@tanstack/react-router";

import {
  DeliveryConfigError,
  processDueReminders,
  serverEnv,
} from "../lib/reminder-delivery.server";

/**
 * Phase 4B delivery endpoint: `POST /api/reminders/due`.
 *
 * Runs the deterministic due-reminder pass (find due → claim → notify →
 * record) behind the `CRON_SECRET` bearer token. Supabase pg_cron (or any
 * external scheduler) invokes this once per minute; overlapping runs are
 * safe because delivery claims are atomic.
 */
export const Route = createFileRoute("/api/reminders/due")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
      },
    },
  },
});
