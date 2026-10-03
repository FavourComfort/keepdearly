/**
 * Server-only Plus purchase logic (Phase 6D).
 *
 * One-time KeepDearly Plus: UGX 2,000, paid once through Nylon Pay by Mobile
 * Money (MTN MoMo or Airtel Money). No subscription, no wallet, no balance.
 *
 * The one rule this whole module exists to enforce
 * -----------------------------------------------
 *   Plus is activated only after THIS SERVER has asked Nylon Pay for the real
 *   transaction status and seen it come back `successful`, at the expected
 *   amount and currency. Nothing the browser says can grant Plus, and nothing in
 *   a webhook body is trusted for the user id -- the account is derived from the
 *   purchase row that this server created at checkout, looked up by reference.
 *
 * That is why there are two independent ways an outcome is recorded, both of
 * which verify against Nylon Pay before touching the database:
 *
 *   - the status route the browser polls (`confirmPlusPurchase`), so the user
 *     sees Plus without a webhook ever arriving;
 *   - the webhook (`applyNylonWebhookEvent`), the push path Nylon Pay
 *     documents for delivering status changes.
 *
 * Both call the same `recordOutcome`, and both are idempotent, so a duplicate
 * webhook or a browser that polls fifty times still completes exactly one
 * purchase and never errors.
 *
 * Credentials come from `serverEnv()` and are read on the server only. This is
 * a `*.server.ts` file, so it is never bundled to the browser, and no key or
 * secret is ever logged or returned to the client.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createNylonPay, parseError, type NylonPaySdk } from "@nile-squad/nylonpay-ts";

import { serverEnv } from "./reminder-delivery.server";
import type { Database } from "./supabase.types";

/**
 * The Plus price. Server-owned and deliberately a constant.
 *
 * The browser never sends an amount or a currency; both come from here, and
 * migration 0011 additionally CHECK-constrains `plus_purchases.amount` to 2000
 * and `.currency` to 'UGX', and re-tests them inside
 * `complete_plus_purchase()`. So the price cannot be changed by a request body,
 * a tampered webhook, or a bad write from anywhere.
 *
 * Nylon Pay's minimum collection is 500 UGX; 2,000 clears it comfortably.
 */
export const PLUS_PRICE_UGX = 2000;
export const PLUS_CURRENCY = "UGX";

/** The provider this build talks to. Matched by the table's CHECK constraint. */
const PROVIDER = "nylonpay";

/** What the purchase screen describes the charge as, shown to the payer. */
const PLUS_DESCRIPTION = "KeepDearly Plus (one time)";

/**
 * Configuration problems are about this deployment, not the user, so they name
 * the missing variable and never its value. Mirrors EmailConfigError from 6C.
 */
export class PlusConfigError extends Error {
  constructor(reason: string) {
    super(`Plus payments are not configured — ${reason}`);
    this.name = "PlusConfigError";
  }
}

/**
 * A request the user is allowed to see something about, but that did not end in
 * a granted entitlement. Deliberately coarse: the UI needs to say "that didn't
 * work", never why the provider refused or what our keys are.
 */
export class PlusPaymentError extends Error {
  constructor(
    message: string,
    /** Safe to show the user: a category, never a provider message. */
    readonly reason: PlusFailureReason,
  ) {
    super(message);
    this.name = "PlusPaymentError";
  }
}

/** Categories the UI may branch on. Nothing provider-specific leaks here. */
export type PlusFailureReason =
  | "not_configured"
  | "unauthenticated"
  | "already_plus"
  | "invalid_phone"
  | "invalid_request"
  | "payment_failed"
  | "pending"
  | "provider_error";

/** The shape the browser receives after checkout or status polling. */
export type PlusPurchaseView = {
  reference: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  currency: string;
  plusActive: boolean;
};

/**
 * The service-role Supabase client.
 *
 * It bypasses RLS, which is required here and dangerous anywhere else: it is the
 * only credential that may write `plus_purchases` (the client has SELECT only)
 * and the only one that may call `complete_plus_purchase` / `fail_plus_purchase`
 * (service_role only). It never reaches a browser bundle.
 */
function serviceClient(): SupabaseClient<Database> {
  const url = serverEnv("VITE_SUPABASE_URL");
  const serviceRoleKey = serverEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    const missing = [!url && "VITE_SUPABASE_URL", !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY"]
      .filter(Boolean)
      .join(" and ");
    throw new PlusConfigError(`missing ${missing}.`);
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/**
 * The Nylon Pay SDK instance, built once per process from server-only env vars.
 *
 * Sandbox vs live is decided by the API KEY itself, exactly as Nylon Pay
 * documents: a `npk_test_` key runs against sandbox providers, a `npk_live_` key
 * processes real money. There is deliberately no separate environment flag here,
 * so there is no way for the two to disagree.
 *
 * `onError` reports the category and reason only. A Nylon Pay error message can
 * echo the payer's phone number, so the message itself is never logged.
 */
let sdk: NylonPaySdk | null = null;

function nylonPay(): NylonPaySdk {
  if (sdk) return sdk;

  const apiKey = serverEnv("NYLONPAY_API_KEY");
  const apiSecret = serverEnv("NYLONPAY_API_SECRET");
  const webhookSecret = serverEnv("NYLONPAY_WEBHOOK_SECRET");

  const missing = [
    !apiKey && "NYLONPAY_API_KEY",
    !apiSecret && "NYLONPAY_API_SECRET",
    !webhookSecret && "NYLONPAY_WEBHOOK_SECRET",
  ].filter(Boolean);
  if (missing.length) {
    throw new PlusConfigError(`missing ${missing.join(" and ")}.`);
  }

  sdk = createNylonPay({
    apiKey: apiKey as string,
    apiSecret: apiSecret as string,
  });

  return sdk;
}

/**
 * Normalises a Ugandan Mobile Money number to the international form Nylon Pay
 * documents (+2567XXXXXXXX).
 *
 * Nylon Pay accepts "any common format" and auto-normalises, but validating here
 * gives the user an immediate, clear error instead of a provider-side failure
 * after their prompt has already been sent.
 *
 * Accepted: `+2567XXXXXXXX`, `2567XXXXXXXX`, and the local `07XXXXXXXX` /
 * `7XXXXXXXX` forms. Anything else is rejected. The returned value is the
 * normalised number; the input is never logged.
 */
export function normalizeUgandanPhone(raw: string): string {
  const digits = raw.replace(/[\s()\-.]/g, "");

  let local: string;
  if (/^\+?2567\d{8}$/.test(digits)) {
    local = digits.replace(/^\+?256/, "");
  } else if (/^0(7\d{8})$/.test(digits)) {
    local = digits.slice(1);
  } else if (/^7\d{8}$/.test(digits)) {
    local = digits;
  } else {
    throw new PlusPaymentError("Enter a valid Ugandan Mobile Money number.", "invalid_phone");
  }

  return `+256${local}`;
}

/**
 * Resolves the signed-in user from the request's Supabase access token.
 *
 * The browser sends its own Supabase JWT in `Authorization: Bearer <token>`.
 * The token is VERIFIED by asking Supabase, not by decoding it here, so a
 * forged or expired token cannot pass. The returned id is the only user id this
 * module ever acts on — a client-supplied user id is never read.
 */
async function requireUserId(request: Request): Promise<string> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    throw new PlusPaymentError("Sign in to buy Plus.", "unauthenticated");
  }

  const supabase = serviceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    // The token itself is never logged or echoed.
    throw new PlusPaymentError("Sign in to buy Plus.", "unauthenticated");
  }

  return data.user.id;
}

/** Whether this account already has Plus, read from our own database. */
async function readPlusActive(userId: string): Promise<boolean> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("plus_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not read Plus entitlement:", { reason: "profile_read_failed" });
    throw new PlusPaymentError("We couldn't check your Plus status just now.", "provider_error");
  }

  return data?.plus_active === true;
}

/**
 * The single place a verified provider outcome becomes a database outcome.
 *
 * Everything else in this file funnels through here, so there is exactly one
 * code path that can grant Plus, and it always: verifies the reference exists,
 * checks the amount and currency against the fixed Plus price, and only then
 * calls the service-role-only `complete_plus_purchase`. That function derives the
 * user from the purchase row, so there is no argument here that could name a
 * different account.
 *
 * A duplicate call is not an error: `complete_plus_purchase` simply activates
 * nothing and returns `out_activated = false`.
 */
async function recordOutcome(
  reference: string,
  outcome: {
    status: "pending" | "processing" | "on_hold" | "successful" | "failed" | "cancelled";
    transactionId: string | null;
    failureReason: string | null;
  },
): Promise<PlusPurchaseView> {
  const supabase = serviceClient();

  // Is this reference one of ours at all? Resolved before anything else, so an
  // unknown or spoofed reference never reaches the provider or the database.
  const { data: purchase, error: lookupError } = await supabase
    .from("plus_purchases")
    .select("id, user_id, provider_reference, status, amount, currency")
    .eq("provider_reference", reference)
    .maybeSingle();

  if (lookupError) {
    console.error("Could not read the Plus purchase:", { reason: "purchase_read_failed" });
    throw new PlusPaymentError("We couldn't check that payment just now.", "provider_error");
  }
  if (!purchase) {
    // Nylon Pay knows this reference but KeepDearly does not, so there is
    // nothing to grant. Never activated for a reference we did not create.
    throw new PlusPaymentError("We couldn't find that payment.", "invalid_request");
  }

  // Re-assert the fixed price here too. The table's CHECK constraint already
  // guarantees it, but this is the security boundary, so it is stated plainly.
  if (purchase.amount !== PLUS_PRICE_UGX || purchase.currency !== PLUS_CURRENCY) {
    throw new PlusPaymentError("We couldn't verify that payment.", "provider_error");
  }

  if (outcome.status === "successful") {
    const { error } = await supabase.rpc("complete_plus_purchase", {
      p_reference: reference,
      p_provider_transaction_id: outcome.transactionId,
    });
    if (error) {
      console.error("Could not complete the Plus purchase:", { reason: "activation_failed" });
      throw new PlusPaymentError("We couldn't finish setting up Plus.", "provider_error");
    }
  } else if (outcome.status === "failed" || outcome.status === "cancelled") {
    // A stored category only. Nylon Pay's failure text can echo the payer's
    // number, so it is deliberately dropped here.
    const { error } = await supabase.rpc("fail_plus_purchase", {
      p_reference: reference,
      p_failure_reason: outcome.failureReason ?? "payment_failed",
    });
    if (error) {
      console.error("Could not record the failed Plus purchase:", {
        reason: "failure_record_failed",
      });
    }
  }
  // pending / processing / on_hold are NOT terminal: the row stays pending and no
  // RPC is called. The browser keeps polling; Plus is not granted.

  // Re-read from the database so the screen reflects committed truth rather
  // than the provider's word or anything the client asserted.
  const { data: refreshed } = await supabase
    .from("plus_purchases")
    .select("provider_reference, status, amount, currency")
    .eq("id", purchase.id)
    .maybeSingle();

  const plusActive = await readPlusActive(purchase.user_id);
  const row = refreshed ?? {
    provider_reference: purchase.provider_reference,
    status: purchase.status,
    amount: purchase.amount,
    currency: purchase.currency,
  };

  return toPurchaseView(row, plusActive);
}

/**
 * Starts a Plus purchase: creates the pending row, then prompts the payer.
 *
 * Order matters. The reference is generated and the `pending` row is written
 * BEFORE Nylon Pay is called, so if the provider call succeeds but this process
 * dies immediately afterwards, the transaction can still be reconciled — the
 * reference Nylon Pay holds is already in our database.
 *
 * The user id is the verified session's, and the amount/currency are constants
 * from this module. The only thing the browser contributes is the phone number
 * to prompt, which is validated and normalised above.
 */
export async function startPlusPurchase(
  request: Request,
  body: { phoneNumber?: unknown },
): Promise<PlusPurchaseView> {
  const userId = await requireUserId(request);

  // Already Plus: answer with the truth and create nothing. Re-buying is a no-op
  // rather than an error, so a refresh after paying never shows a red error.
  if (await readPlusActive(userId)) {
    const supabase = serviceClient();
    const { data } = await supabase
      .from("plus_purchases")
      .select("provider_reference, status, amount, currency")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return toPurchaseView(data, true);
    throw new PlusPaymentError("You already have KeepDearly Plus.", "already_plus");
  }

  if (typeof body?.phoneNumber !== "string" || !body.phoneNumber.trim()) {
    throw new PlusPaymentError("Enter your Mobile Money number.", "invalid_request");
  }
  const phoneNumber = normalizeUgandanPhone(body.phoneNumber);

  const client = nylonPay();
  const supabase = serviceClient();

  // A fresh UUID per attempt. Nylon Pay treats `reference` as the idempotency
  // key, and ours is unique, so a retried checkout can never double-charge.
  const reference = crypto.randomUUID();

  // Only the minimal PII: the prompted number, kept for reconciliation.
  const { error: insertError } = await supabase.from("plus_purchases").insert({
    user_id: userId,
    provider: PROVIDER,
    provider_reference: reference,
    amount: PLUS_PRICE_UGX,
    currency: PLUS_CURRENCY,
    status: "pending",
    payer_phone: phoneNumber,
  });

  if (insertError) {
    // The partial unique index (one pending attempt per user) fires here on a
    // double-tap. That is a client race, not a server fault: report the existing
    // attempt instead of creating a second charge.
    const { data: existing } = await supabase
      .from("plus_purchases")
      .select("provider_reference, status, amount, currency")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) return toPurchaseView(existing, false);

    console.error("Could not create the Plus purchase:", { reason: "purchase_create_failed" });
    throw new PlusPaymentError("We couldn't start that payment just now.", "provider_error");
  }

  const accountName = await readDisplayName(userId);

  try {
    // Throws only on client-side validation problems; a server-side rejection
    // surfaces as an "error" event instead, handled just below.
    const payment = await client.collectPayment({
      amount: PLUS_PRICE_UGX,
      currency: PLUS_CURRENCY,
      description: PLUS_DESCRIPTION,
      customer: { name: accountName, phoneNumber },
      method: "mobileMoney",
      reference,
      // Reconciliation only. Nothing here is ever used to decide who gets Plus.
      metadata: { source: "keepdearly-plus" },
    });

    // Initiation rejections (auth, limits, provider down, network) arrive here
    // rather than as a throw. The purchase row stays pending so the user can
    // retry; nothing is granted.
    payment.on("error", ({ category }) => {
      console.error("Nylon Pay could not start the collection:", { category });
    });
  } catch (error) {
    // A synchronous throw means our own input was rejected before any network
    // call, so no transaction exists. Leave the row pending and report plainly.
    console.error("Nylon Pay rejected the collection request:", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    throw new PlusPaymentError("We couldn't start that payment just now.", "provider_error");
  }

  // Deliberately NOT plus-active. The prompt is on the payer's phone and has not
  // been approved yet, so the screen must keep waiting rather than claim success.
  return {
    reference,
    status: "pending",
    amount: PLUS_PRICE_UGX,
    currency: PLUS_CURRENCY,
    plusActive: false,
  };
}

/**
 * Asks Nylon Pay for the authoritative state of a transaction, then records it.
 *
 * This is the confirmation path the browser polls. It is deliberately the same
 * code the webhook uses, because a browser saying "it worked" is not evidence —
 * only this server's own lookup of Nylon Pay's status is.
 *
 * The reference comes from our own checkout response, and is re-checked against
 * our own purchases table before anything happens, so a caller cannot point this
 * at another user's transaction. A caller also cannot claim success: the status
 * that decides the outcome is the one Nylon Pay returns.
 */
export async function confirmPlusPurchase(
  request: Request,
  reference: string,
): Promise<PlusPurchaseView> {
  const userId = await requireUserId(request);

  if (!reference || !isUuid(reference)) {
    throw new PlusPaymentError("That payment reference isn't valid.", "invalid_request");
  }

  // Ownership: only this user's own purchase may be polled. The row is found by
  // reference AND user id together, so a reference belonging to someone else
  // simply does not match.
  const supabase = serviceClient();
  const { data: purchase } = await supabase
    .from("plus_purchases")
    .select("id, status, amount, currency")
    .eq("provider_reference", reference)
    .eq("user_id", userId)
    .maybeSingle();

  if (!purchase) {
    throw new PlusPaymentError("We couldn't find that payment.", "invalid_request");
  }

  const statusResult = await nylonPay().getStatus({ reference });

  if (!statusResult.isOk) {
    const error = parseError(statusResult.error);
    // Category only. The provider's message can contain the payer's number.
    console.error("Could not read the Plus payment status:", { category: error.category });
    throw new PlusPaymentError(
      "We couldn't check that payment just now. Try again in a moment.",
      "provider_error",
    );
  }

  const status = statusResult.value;

  // Verify what Nylon Pay actually charged, not what we asked for. A mismatch is
  // never treated as a successful Plus purchase.
  if (status.amount !== PLUS_PRICE_UGX || status.currency !== PLUS_CURRENCY) {
    console.error("Nylon Pay reported an unexpected amount or currency.", {
      reference,
      mismatch: true,
    });
    throw new PlusPaymentError("We couldn't verify that payment.", "provider_error");
  }

  const transactionResult = await nylonPay().getTransaction({ reference });
  const transaction = transactionResult.isOk ? transactionResult.value : null;

  // A payout is not a purchase. Defensive: our reference is only ever used for a
  // collection, but the check costs nothing.
  if (transaction?.type === "payout") {
    throw new PlusPaymentError("We couldn't verify that payment.", "provider_error");
  }

  return recordOutcome(reference, {
    status: status.status,
    transactionId: transaction?.id ?? null,
    failureReason: transaction?.failureReason ?? null,
  });
}

/**
 * The name shown to the payer on the Mobile Money prompt.
 *
 * Falls back to a neutral label rather than an email address, because this ends
 * up on a telco prompt the payer did not type into. Never logged.
 */
async function readDisplayName(userId: string): Promise<string> {
  const supabase = serviceClient();
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const name = data?.full_name?.trim();
  return name && name.length > 0 ? name : "KeepDearly Plus";
}

/** Shaped for the browser: counts and state, never a phone number or a secret. */
function toPurchaseView(
  row: {
    provider_reference: string;
    status: "pending" | "completed" | "failed";
    amount: number;
    currency: string;
  },
  plusActive: boolean,
): PlusPurchaseView {
  return {
    reference: row.provider_reference,
    status: row.status,
    amount: row.amount,
    currency: row.currency,
    plusActive,
  };
}

/**
 * Handles one Nylon Pay webhook delivery.
 *
 * Two independent checks stand between an inbound POST and Plus being granted:
 *
 *  1. verifyWebhookSignature over the RAW body: HMAC-SHA256 plus Nylon Pay's
 *     freshness window. The raw bytes matter -- parsing and re-serialising
 *     first would change the signed content. A tampered or replayed body fails
 *     here and never reaches the database.
 *  2. getStatus() against Nylon Pay itself. Nylon Pay's own guidance is to
 *     treat webhooks as the fast path, not the only path, and to verify with
 *     getStatus before fulfilling. A correctly signed but stale event cannot
 *     grant Plus on its own.
 *
 * Only payload.reference is read from the body. The user id is never taken from
 * the webhook -- it comes from the purchase row that reference resolves to -- so
 * a signed event for someone else's transaction cannot grant Plus to us.
 *
 * Returns the HTTP status the route should answer with. A 2xx acknowledges the
 * delivery; Nylon Pay retries anything else.
 */
export async function applyNylonWebhookEvent(
  rawBody: string,
  signatureHeader: string | null,
): Promise<number> {
  const secret = serverEnv("NYLONPAY_WEBHOOK_SECRET");

  if (!secret || !signatureHeader) {
    // Without a secret nothing can be authenticated, so nothing is processed.
    // Failing closed is the only safe answer.
    console.error("Rejected a Nylon Pay webhook: not configured or unsigned.");
    return 401;
  }

  const client = nylonPay();

  // Never throws; returns false on any error.
  const valid = client.verifyWebhookSignature({
    payload: rawBody,
    signature: signatureHeader,
    secret,
  });

  if (!valid) {
    console.error("Rejected a Nylon Pay webhook: signature verification failed.");
    return 401;
  }

  // The delivery is genuine from here. Parse defensively anyway: an unexpected
  // shape must not throw out of the handler.
  let reference: string;
  try {
    const parsed = JSON.parse(rawBody) as { payload?: { reference?: unknown } };
    reference = typeof parsed.payload?.reference === "string" ? parsed.payload.reference : "";
  } catch {
    console.error("Rejected a Nylon Pay webhook: body was not JSON.");
    return 400;
  }

  if (!isUuid(reference)) {
    console.error("Rejected a Nylon Pay webhook: missing or malformed reference.");
    return 400;
  }

  // Authoritative confirmation: ask Nylon Pay, never trust the event's own claim.
  const statusResult = await client.getStatus({ reference });
  if (!statusResult.isOk) {
    const error = parseError(statusResult.error);
    // Transient (rate limit, network, provider down): a 503 makes Nylon Pay
    // retry, which is what we want. Category only, never the message.
    console.error("Could not verify a Nylon Pay webhook transaction:", {
      category: error.category,
    });
    return 503;
  }

  const status = statusResult.value;

  // Entitlement follows the real charge, not the requested one.
  if (status.amount !== PLUS_PRICE_UGX || status.currency !== PLUS_CURRENCY) {
    console.error("Nylon Pay webhook reported an unexpected amount or currency.", {
      reference,
      mismatch: true,
    });
    return 400;
  }

  const transactionResult = await client.getTransaction({ reference });
  const transaction = transactionResult.isOk ? transactionResult.value : null;
  if (transaction?.type === "payout") {
    console.error("Nylon Pay webhook reported a payout as if it were a Plus collection.", {
      reference,
    });
    return 400;
  }

  // An unknown reference is genuinely uninteresting (someone else's transaction,
  // or a replay long after cleanup). Acknowledge it so Nylon Pay stops retrying,
  // without touching the database.
  const { data: known } = await serviceClient()
    .from("plus_purchases")
    .select("provider_reference")
    .eq("provider_reference", reference)
    .maybeSingle();

  if (!known) return 200;

  try {
    await recordOutcome(reference, {
      // The verified status, not the event's own claim.
      status: status.status,
      transactionId: transaction?.id ?? null,
      failureReason: transaction?.failureReason ?? null,
    });
  } catch (error) {
    console.error("Could not apply a Nylon Pay webhook:", {
      reason: error instanceof PlusPaymentError ? error.reason : "unexpected",
    });
    return 500;
  }

  return 200;
}

/**
 * Whether a string is a canonical UUID — the only shape a payment reference may
 * take. A non-UUID reference is rejected before it can reach the provider or the
 * database, so a malformed or hostile value never becomes a query.
 */
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}