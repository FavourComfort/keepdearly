/**
 * Server-only email sending (Phase 6C).
 *
 * The one place in KeepDearly that talks to an email provider. Everything else
 * — the delivery pass, the route — depends only on `sendEmail()` below, so
 * swapping Resend for Postmark or SES later is a change to this file alone and
 * nothing else has to move.
 *
 * Deliberately minimal: one function, plain text, no templates, no attachments,
 * no tracking pixels, no batching, no framework. That is the whole v1 surface.
 *
 * It calls the provider's HTTP API directly with `fetch`, for the same reason
 * `web-push.server.ts` does — the project hand-rolls protocol integrations
 * rather than taking an SDK dependency.
 *
 * Security and privacy, both deliberate:
 *  - This file is `*.server.ts` and is never bundled to the browser. The API key
 *    is read through `serverEnv()`, which never touches `import.meta.env`, so it
 *    cannot leak through a `VITE_` prefixed variable.
 *  - Nothing here logs the API key, the recipient address, or the message body.
 *    Failures come back as a short category string, not a payload dump.
 *
 * The sender identity is configuration, not code: `RESEND_FROM` decides who the
 * mail appears to come from, so the same build works in staging and production.
 */

import { serverEnv } from "./reminder-delivery.server";

/** Resend's send endpoint. Unversioned and stable. */
const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** A send request. Plain text only in v1 — that is all a prepared message is. */
export type EmailRequest = {
  to: string;
  subject: string;
  text: string;
};

/**
 * Why a send did not succeed, in a form safe to store and log.
 *
 * These are deliberately coarse. A provider error body can echo the recipient
 * address or message content, so it is never propagated: only this category is.
 */
export type EmailFailure = "not_configured" | "rejected" | "unreachable";

export type EmailResult = { ok: true; providerId: string } | { ok: false; reason: EmailFailure };

/** Configuration errors are about this deployment, so they say so by name. */
export class EmailConfigError extends Error {
  constructor(reason: string) {
    super(`Email sending is not configured — ${reason}`);
    this.name = "EmailConfigError";
  }
}

/** Resolves the provider settings, or explains precisely what is missing. */
function resolveConfig(): { apiKey: string; from: string } {
  const apiKey = serverEnv("RESEND_API_KEY");
  const from = serverEnv("RESEND_FROM");

  if (!apiKey || !from) {
    const missing: string[] = [];
    if (!apiKey) missing.push("RESEND_API_KEY");
    if (!from) missing.push("RESEND_FROM");
    // Names only, never values.
    throw new EmailConfigError(`missing ${missing.join(" and ")}.`);
  }
  return { apiKey, from };
}

/**
 * Fails fast when the provider is not configured, WITHOUT sending anything.
 *
 * The delivery pass calls this once at the very start, before it looks at a
 * single due row. That ordering matters: a message is claimed atomically
 * before it is sent, and a claimed message is deliberately never released (a
 * silent reset could duplicate an email the provider already accepted). So if
 * the configuration were discovered *after* claiming, one unconfigured run
 * would strand every due message in `sending` forever, undeliverable.
 *
 * Checking up front means an unconfigured deployment claims nothing at all and
 * the endpoint answers 503 instead.
 */
export function assertEmailConfigured(): void {
  resolveConfig();
}

/**
 * Sends one email.
 *
 * A 2xx means the provider accepted the message for delivery; that is the same
 * bar the Web Push path uses for "delivered", and it is the strongest claim this
 * codebase can honestly make. It is not proof the recipient read anything.
 */
export async function sendEmail(request: EmailRequest): Promise<EmailResult> {
  const { apiKey, from } = resolveConfig();

  let response: Response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [request.to],
        subject: request.subject,
        text: request.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    // Network/DNS/timeout. Only the category and the error type are reported —
    // never the address or the body, and never the provider's error text, which
    // can echo both back.
    console.error("Email provider request failed before any response:", { reason: "unreachable" });
    return { ok: false, reason: "unreachable" };
  }

  if (response.ok) {
    // The provider returns { id }. Only the id is kept, and only to correlate a
    // delivery in Resend's own logs if an operator needs to.
    try {
      const payload = (await response.json()) as { id?: unknown };
      return { ok: true, providerId: typeof payload.id === "string" ? payload.id : "" };
    } catch {
      // Accepted, but the body was not the shape we expected. Still a success.
      return { ok: true, providerId: "" };
    }
  }

  // 401/403 is a bad key or an unverified sender; 422 is usually a rejected
  // address. All of them mean "do not retry", so they collapse to one category.
  return { ok: false, reason: "rejected" };
}
