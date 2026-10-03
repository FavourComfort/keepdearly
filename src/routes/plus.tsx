import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AppShell } from "@/components/keepdearly/AppShell";
import { DataNotice } from "@/components/keepdearly/DataState";
import { Icon } from "@/components/keepdearly/Icon";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { RequireAuth } from "@/components/auth/guards";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/**
 * The Plus price, shown on the button.
 *
 * Display only. The server charges its own constant and migration 0011
 * CHECK-constrains the stored amount to 2000, so editing this number could not
 * change what anyone is charged — it would only make the screen lie.
 */
const PLUS_PRICE_LABEL = "UGX 2,000";

/** What the screen knows about the current attempt. */
type Step = "ready" | "waiting" | "success" | "failed";

/** The shape the Plus server routes return. Mirrors PlusPurchaseView. */
type PurchaseView = {
  reference: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  currency: string;
  plusActive: boolean;
};

/**
 * Phase 6D: buy KeepDearly Plus, once, for UGX 2,000.
 *
 * Mobile Money only — the payer enters their MTN or Airtel number, approves the
 * prompt on their phone, and the screen waits.
 *
 * The one rule this screen follows: it never believes itself. Starting a payment
 * does not mean it worked, and no redirect or "success" click grants anything.
 * Plus appears only once the SERVER has confirmed with Nylon Pay that the
 * transaction actually completed, which is why the screen polls /api/plus/status
 * and shows the result the server sends back. If the user closes the tab mid
 * payment, the server-recorded outcome still stands and the webhook applies it.
 *
 * Polling stops on a terminal state, on success, and when the screen unmounts.
 */
function BuyPlus() {
  const { profile, status, session, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("ready");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // Guards against setting state after unmount, and against a stale poll
  // continuing after the reference changes.
  const referenceRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const alreadyPlus = profile?.plus_active === true;

  /**
   * The bearer token for our own API routes.
   *
   * This is the browser's Supabase access token, so the server can verify who is
   * asking. It is sent to our own endpoints only and is never logged.
   */
  async function authHeaders(): Promise<Record<string, string>> {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /*
   */
/**
   * Asks the server whether the payment completed.
   *
   * /api/plus/status re-checks Nylon Pay every time, so this is a real
   * confirmation rather than a local guess — and it is safe to call repeatedly.
   */
  const checkStatus = useCallback(
    async (ref: string): Promise<void> => {
      if (referenceRef.current !== ref || !mountedRef.current) return;

      let view: PurchaseView;
      try {
        const response = await fetch(`/api/plus/status?reference=${encodeURIComponent(ref)}`, {
          headers: await authHeaders(),
        });
        const payload = (await response.json()) as PurchaseView & { error?: string };

        if (!response.ok) {
          // A transient failure must not be reported as a declined payment, so
          // the screen keeps waiting and simply tries again.
          throw new Error(payload.error ?? "We couldn't check that payment just now.");
        }

        view = payload;
      } catch (cause) {
        if (!mountedRef.current || referenceRef.current !== ref) return;
        setError(cause instanceof Error ? cause.message : "We couldn't check that payment.");
        return;
      }

      if (!mountedRef.current || referenceRef.current !== ref) return;

      if (view.status === "completed" && view.plusActive) {
        // Only the server's committed answer counts as success.
        setStep("success");
        setError(null);
        // Re-read the profile so the existing Plus gate sees plus_active = true.
        refreshProfile();
        return;
      }

      if (view.status === "failed") {
        setStep("failed");
        return;
      }

      // Still pending: keep waiting.
      setStep("waiting");
    },
    // refreshProfile is stable (useCallback with no dependencies).
    [refreshProfile],
  );

  // Poll while waiting. A few seconds apart keeps Nylon Pay's rate limits happy
  // and matches how long a Mobile Money approval realistically takes.
  useEffect(() => {
    if (step !== "waiting" || !reference) return;

    const timer = setInterval(() => {
      void checkStatus(reference);
    }, 4000);

    return () => clearInterval(timer);
  }, [step, reference, checkStatus]);

  async function handlePay() {
    if (busy || step === "waiting") return;
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/plus/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        // Only the phone number is sent. The amount, currency and user are the
        // server's business, not the client's.
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const payload = (await response.json()) as PurchaseView & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't start that payment.");
        return;
      }

      referenceRef.current = payload.reference;
      setReference(payload.reference);
      // Start waiting, not celebrate. The prompt has not been approved yet.
      setStep("waiting");
      // Ask once straight away in case it was approved very quickly.
      void checkStatus(payload.reference);
    } catch {
      setError("We couldn't reach the payment service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (alreadyPlus) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-4 pt-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
            <Icon name="workspace_premium" filled className="text-[14px]" />
            KeepDearly Plus
          </span>
          <h1 className="text-headline-lg text-on-surface">You have Plus</h1>
          <p className="max-w-md text-body-md text-on-surface-variant">
            Send a message to someone later, and let it arrive on the day you chose.
          </p>
          <PrimaryButton variant="soft" onClick={() => void navigate({ to: "/" })} className="mt-2">
            Back home
          </PrimaryButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-md flex-col gap-6 pt-12">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
            <Icon name="workspace_premium" filled className="text-[14px]" />
            KeepDearly Plus
          </span>
          <h1 className="text-headline-lg text-on-surface">KeepDearly Plus</h1>
          <p className="text-body-md text-on-surface-variant">
            Write a message now and let it arrive on the day, without having to remember. Pay
            once — there is no subscription and nothing renews.
          </p>
          <p className="text-title-lg font-medium text-on-surface">
            {PLUS_PRICE_LABEL}{" "}
            <span className="text-body-md text-on-surface-variant">— one time</span>
          </p>
        </header>

        {error ? <DataNotice tone="error">{error}</DataNotice> : null}

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <DataNotice tone="info">
              Plus is on. You can schedule a message for someone now.
            </DataNotice>
            <PrimaryButton
              variant="soft"
              onClick={() => void navigate({ to: "/" })}
              disabled={status === "loading"}
            >
              Back home
            </PrimaryButton>
          </div>
        ) : step === "waiting" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <DataNotice tone="info">
              Approve the payment on your phone. This page updates on its own — you can leave it
              open while you do.
            </DataNotice>
            <p className="text-body-sm text-on-surface-variant">Checking your payment…</p>
            <PrimaryButton variant="quiet" onClick={() => void navigate({ to: "/" })}>
              I&apos;ll come back later
            </PrimaryButton>
          </div>
        ) : step === "failed" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <DataNotice tone="error">
              That payment didn&apos;t go through, so Plus isn&apos;t switched on. You can try again.
            </DataNotice>
            <PrimaryButton variant="soft" onClick={() => setStep("ready")}>
              Try again
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-label-md text-on-surface">Mobile Money number</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="07XX XXX XXX"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="rounded-xl border border-outline bg-surface-container-lowest px-4 py-3.5 text-body-md text-on-surface outline-none focus:border-primary"
              />
              <span className="text-body-sm text-on-surface-variant">
                MTN MoMo or Airtel Money. You&apos;ll get a prompt to approve the payment.
              </span>
            </label>

            <PrimaryButton
              variant="primary"
              onClick={() => void handlePay()}
              disabled={busy || phone.trim().length === 0}
            >
              {busy ? "Starting…" : `Pay ${PLUS_PRICE_LABEL}`}
            </PrimaryButton>

            {session ? null : <DataNotice tone="error">Sign in to buy Plus.</DataNotice>}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/plus")({
  component: () => (
    <RequireAuth>
      <BuyPlus />
    </RequireAuth>
  ),
});