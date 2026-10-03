import { createFileRoute } from "@tanstack/react-router";

import { confirmPlusPurchase } from "@/lib/plus.server";
import { errorResponse } from "./api.plus.checkout";

/**
 * Phase 6D Plus confirmation: `GET|POST /api/plus/status`.
 *
 * The purchase screen polls this while the payer approves the Mobile Money
 * prompt, so Plus appears without waiting for a webhook to arrive.
 *
 * It is authenticated the same way checkout is: the browser sends its Supabase
 * access token and the server verifies it, then looks the purchase up by
 * reference AND user id together. A reference belonging to someone else simply
 * does not match, so one user cannot poll another's payment.
 *
 * Critically, this route does NOT believe the browser. Whatever the screen says,
 * the outcome here comes from asking Nylon Pay for the real transaction status
 * and only then recording it. A client-supplied "success" is not even read: the
 * body is not parsed at all, only the `reference` query parameter.
 *
 * It is also idempotent. Polling ten times completes exactly one purchase and
 * `plus_active` simply stays true.
 */
async function handleStatus(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference") ?? "";

    const purchase = await confirmPlusPurchase(request, reference);
    return Response.json(purchase);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/plus/status")({
  server: {
    handlers: {
      GET: async ({ request }) => handleStatus(request),
      POST: async ({ request }) => handleStatus(request),
    },
  },
});