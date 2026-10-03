import { createFileRoute } from "@tanstack/react-router";

import { PlusConfigError, applyNylonWebhookEvent } from "@/lib/plus.server";

/**
 * Phase 6D Nylon Pay callback: `POST /api/plus/webhook`.
 *
 * Configure this URL in Nylon Pay's Dashboard under the API key's Webhook
 * Configuration, alongside the signing secret stored as
 * `NYLONPAY_WEBHOOK_SECRET`.
 *
 * This endpoint is publicly reachable and unauthenticated by design — Nylon Pay
 * cannot present a Supabase session — so the request proves itself instead:
 *
 *  1. the `x-nylon-signature` header is verified over the RAW request body,
 *     which is why `request.text()` is read once and passed through untouched;
 *  2. the transaction is then re-checked against Nylon Pay itself, so a signed
 *     but stale or forged event still cannot grant Plus;
 *  3. the account that gets Plus comes from the purchase row the reference
 *     resolves to, never from anything in the body.
 *
 * It answers 2xx on success so Nylon Pay stops retrying, 401 for a signature we
 * will not accept, 503 when Nylon Pay is unreachable so the delivery is retried,
 * and 5xx for anything unexpected.
 *
 * The webhook is a fast path, not the only path: /api/plus/status performs the
 * same verification for a browser that is waiting, so a missed delivery still
 * results in Plus.
 */
async function handleWebhook(request: Request): Promise<Response> {
  let rawBody: string;
  try {
    // Read the raw bytes exactly once. Re-serialising parsed JSON would change
    // the signed content and make a genuine delivery look tampered with.
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Could not read the request." }, { status: 400 });
  }

  try {
    const status = await applyNylonWebhookEvent(
      rawBody,
      request.headers.get("x-nylon-signature"),
    );
    return Response.json({ received: status < 400 }, { status });
  } catch (error) {
    if (error instanceof PlusConfigError) {
      console.error(error.message);
      return Response.json({ error: "Webhook is not configured." }, { status: 503 });
    }
    console.error("Could not handle a Nylon Pay webhook:", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return Response.json({ error: "Webhook failed." }, { status: 500 });
  }
}

export const Route = createFileRoute("/api/plus/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => handleWebhook(request),
    },
  },
});