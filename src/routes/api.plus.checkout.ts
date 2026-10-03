import { createFileRoute } from "@tanstack/react-router";

import { PlusConfigError, PlusPaymentError, startPlusPurchase } from "@/lib/plus.server";

/**
 * Phase 6D Plus purchase: `POST /api/plus/checkout`.
 *
 * Creates the pending purchase, then initiates the UGX 2,000 Mobile Money
 * collection.
 *
 * Authenticated. The browser sends its own Supabase access token as
 * `Authorization: Bearer <token>`, which this server VERIFIES with Supabase
 * before doing anything. The user id is taken from that verified session only,
 * so a client-supplied user id is never read, and the price is the constant
 * UGX 2,000 rather than anything the request body contains.
 *
 * This route accepts no amount, no currency, no user id and no claimed success:
 * the only client input is a phone number to prompt. Confirmation lives at
 * `/api/plus/status` and `/api/plus/webhook`, which ask Nylon Pay directly.
 */
async function handleCheckout(request: Request): Promise<Response> {
  try {
    // Only a phone number is accepted. Anything else in the body is ignored, so
    // extra fields cannot smuggle in an amount, currency or user id.
    let body: { phoneNumber?: unknown } = {};
    try {
      body = (await request.json()) as { phoneNumber?: unknown };
    } catch {
      // An empty body is a user who has not typed a number yet.
      body = {};
    }

    const purchase = await startPlusPurchase(request, body);
    return Response.json(purchase, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Errors the browser is allowed to see.
 *
 * A missing/misconfigured server secret is a 503 naming the variable. Everything
 * else is a safe, coarse message plus a category: no provider message, no phone
 * number, no database or credential detail ever crosses this boundary.
 */
export function errorResponse(error: unknown): Response {
  if (error instanceof PlusConfigError) {
    console.error(error.message);
    return Response.json({ error: error.message, reason: "not_configured" }, { status: 503 });
  }

  if (error instanceof PlusPaymentError) {
    // 401 for a missing/invalid session, 400 for everything the user can act on.
    // The message is deliberately the same for "not yours" and "unknown", so a
    // caller cannot use the response to probe which references exist.
    const status = error.reason === "unauthenticated" ? 401 : 400;
    return Response.json({ error: error.message, reason: error.reason }, { status });
  }

  console.error("Could not handle a Plus purchase request:", {
    reason: error instanceof Error ? error.name : "unknown",
  });
  return Response.json(
    { error: "Something went wrong. Try again in a moment.", reason: "provider_error" },
    { status: 500 },
  );
}

export const Route = createFileRoute("/api/plus/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => handleCheckout(request),
    },
  },
});