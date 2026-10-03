import { createFileRoute } from "@tanstack/react-router";

import { retryPlusPurchase } from "@/lib/plus.server";
import { errorResponse } from "./api.plus.checkout";

/**
 * Phase 6D Plus retry: `POST /api/plus/retry?reference=...`.
 *
 * The purchase screen calls this only while it is waiting, when the payer did
 * not get a prompt on their phone. The server re-checks Nylon Pay and, for a
 * sandbox attempt only, abandons the stuck pending row so a fresh one can be
 * started. A live attempt is never abandoned while the provider still reports it
 * pending, so a prompt already on the payer's phone can still be approved.
 *
 * Authenticated exactly like checkout and status, and it never grants Plus by
 * itself — it defers to the same verification the status route uses.
 */
async function handleRetry(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference") ?? "";

    const purchase = await retryPlusPurchase(request, reference);
    return Response.json(purchase);
  } catch (error) {
    return errorResponse(error);
  }
}

export const Route = createFileRoute("/api/plus/retry")({
  server: {
    handlers: {
      POST: async ({ request }) => handleRetry(request),
    },
  },
});
