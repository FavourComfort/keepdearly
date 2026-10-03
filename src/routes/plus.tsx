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
  const [retrying, setRetrying] = useState(false);

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
   *
   * The session is revalidated here, immediately before each Plus request: the
   * screen can still look signed in while the access token held in browser
   * storage is stale or expired, which is what made the server answer "Sign in
   * to buy Plus" for an apparently signed-in user.
   */
  async function authHeaders(): Promise<Record<string, string>> {
    const supabase = getSupabase();

    const { data: sessionData } = await supabase.auth.getSession();
    const storedSession = sessionData.session;
    // No session at all: unchanged behaviour — the request goes out without a
    // bearer token and the server treats it as signed out.
    if (!storedSession) return {};

    // Ask Supabase for a fresh token and prefer it, falling back to the stored
    // one only when a refresh cannot be completed (e.g. a transient network
    // failure) — the server still verifies whichever token is sent.
    const { data: refreshedData } = await supabase.auth.refreshSession();
    const token = refreshedData.session?.access_token ?? storedSession.access_token;

    return { Authorization: `Bearer ${token}` };
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

  /**
   * Abandons an attempt the payer never got a prompt for, then returns the screen
   * to the form so a fresh one can start. The server re-checks Nylon Pay first
   * and never grants Plus here, so this cannot shortcut payment.
   */
  async function handleRetry() {
    if (retrying || !reference) return;
    setRetrying(true);
    setError(null);

    try {
      const response = await fetch(`/api/plus/retry?reference=${encodeURIComponent(reference)}`, {
        method: "POST",
        headers: await authHeaders(),
      });
      const payload = (await response.json()) as PurchaseView & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "We couldn't reset that payment just now.");
        return;
      }

      if (payload.status === "completed" && payload.plusActive) {
        // It had actually gone through after all.
        setStep("success");
        refreshProfile();
        return;
      }

      if (payload.status === "failed") {
        // Abandoned: the form is free again, so a new attempt can start.
        referenceRef.current = null;
        setReference(null);
        setStep("ready");
        return;
      }

      // Still pending at the provider — keep waiting rather than start a second
      // charge.
      setStep("waiting");
    } catch {
      setError("We couldn't reset that payment. Check your connection and try again.");
    } finally {
      setRetrying(false);
    }
  }

  if (alreadyPlus) {
    return (
      <AppShell>
        <section className="flex flex-col items-center gap-4 pt-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
            <Icon name="workspace_premium" filled className="text-[14px]" />
            KeepDearly Plus
          </span>
          <h1 className="max-w-xl text-headline-lg leading-tight text-on-surface">
            Let the right words arrive at the right moment.
          </h1>
          <p className="max-w-md text-body-md text-on-surface-variant">
            Write a message for someone you care about, choose when it should arrive, and KeepDearly
            sends it for you.
          </p>
          <PrimaryButton variant="soft" onClick={() => void navigate({ to: "/" })} className="mt-2">
            Back home
          </PrimaryButton>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl pb-8 pt-8 sm:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <header className="flex flex-col items-start gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed px-4 py-1 text-label-sm text-on-primary-fixed-variant">
              <Icon name="workspace_premium" filled className="text-[14px]" />
              KeepDearly Plus
            </span>
            <h1 className="text-headline-xl leading-tight text-on-surface">
              Remember it now.
              <br />
              Let KeepDearly handle the moment later.
            </h1>
            <p className="max-w-md text-body-md text-on-surface-variant">
              Write a message for someone you care about, choose when it should arrive, and
              KeepDearly sends it for you automatically.
            </p>
            <p className="text-label-md text-on-surface-variant">{PLUS_PRICE_LABEL} · one time</p>
          </header>

          <article className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-[0_2px_12px_rgba(72,47,35,0.04)] sm:p-7">
            <div
              aria-hidden="true"
              className="absolute bottom-5 left-0 top-5 w-1 rounded-r-full bg-primary-container"
            />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <Icon name="cake" className="text-[20px]" />
                </span>
                <div>
                  <p className="text-title-sm text-on-surface">Bestie&rsquo;s birthday</p>
                  <p className="text-body-sm text-on-surface-variant">October 18</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant">
                <Icon name="event" className="text-[14px]" />A day to remember
              </span>
            </div>

            <p className="mt-6 whitespace-pre-line text-quote-body leading-relaxed text-on-surface">
              Happy birthday dear, Bestie. I hope this year brings you everything you&rsquo;re hoping
              for&hellip;
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-outline-variant/30 pt-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                <Icon name="schedule" className="text-[18px]" />
              </span>
              <div>
                <p className="text-label-md text-on-surface">Scheduled to send</p>
                <p className="text-body-sm text-on-surface-variant">October 18 · 9:00 AM</p>
              </div>
              <span className="ml-auto text-secondary">
                <Icon name="check_circle" filled className="text-[20px]" />
              </span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <Icon name="send" className="text-[15px] text-secondary" />
              KeepDearly will send this automatically
            </p>
          </article>
        </div>

        <section className="mt-12 sm:mt-16" aria-labelledby="how-it-works">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 id="how-it-works" className="text-headline-sm text-on-surface">
              Three small steps
            </h2>
            <span className="text-label-sm text-on-surface-variant">
              Then it&rsquo;s taken care of
            </span>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            <li className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm text-on-primary-fixed-variant">
                1
              </span>
              <span>
                <span className="block text-title-sm text-on-surface">Write it now</span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  Capture the message while you remember.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm text-on-primary-fixed-variant">
                2
              </span>
              <span>
                <span className="block text-title-sm text-on-surface">Choose the moment</span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  Pick the date and time.
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm text-on-primary-fixed-variant">
                3
              </span>
              <span>
                <span className="block text-title-sm text-on-surface">Let KeepDearly send it</span>
                <span className="mt-1 block text-body-sm text-on-surface-variant">
                  Your message arrives automatically.
                </span>
              </span>
            </li>
          </ol>
        </section>

        <section
          id="payment"
          className="mt-12 scroll-mt-24 sm:mt-16"
          aria-labelledby="payment-title"
        >
          <div className="grid gap-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
            <header className="flex flex-col items-start gap-3">
              <span className="text-label-sm text-on-surface-variant">
                A little more room for care
              </span>
              <h2 id="payment-title" className="text-headline-md text-on-surface">
                One payment. No subscription.
              </h2>
              <p className="text-body-md text-on-surface-variant">Pay once. Nothing renews.</p>
              <p className="text-headline-lg text-on-surface">
                {PLUS_PRICE_LABEL}
                <span className="ml-2 align-middle text-body-sm text-on-surface-variant">once</span>
              </p>
            </header>

            <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 sm:p-5">
              {error ? <DataNotice tone="error">{error}</DataNotice> : null}

              {step === "success" ? (
                <div className="flex flex-col items-start gap-4" role="status">
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
                <div className="flex flex-col items-start gap-4" role="status">
                  <DataNotice tone="info">
                    Approve the payment on your phone. This page updates on its own — you can leave
                    it open while you do.
                  </DataNotice>
                  <p className="text-body-sm text-on-surface-variant">
                    Checking your payment&hellip;
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <PrimaryButton variant="quiet" onClick={() => void navigate({ to: "/" })}>
                      I&rsquo;ll come back later
                    </PrimaryButton>
                    <PrimaryButton
                      variant="quiet"
                      onClick={() => void handleRetry()}
                      disabled={retrying}
                    >
                      {retrying ? "Resetting…" : "No prompt? Start over"}
                    </PrimaryButton>
                  </div>
                </div>
              ) : step === "failed" ? (
                <div className="flex flex-col items-start gap-4" role="alert">
                  <DataNotice tone="error">
                    That payment didn&rsquo;t go through, so Plus isn&rsquo;t switched on. You can
                    try again.
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
                      MTN MoMo or Airtel Money. You&rsquo;ll get a prompt to approve the payment.
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
          </div>
          <div className="mt-4 flex flex-col gap-2 px-1 text-body-sm text-on-surface-variant sm:flex-row sm:gap-6">
            <p className="flex items-center gap-2">
              <Icon name="event_available" className="shrink-0 text-[16px] text-secondary" />
              Your message stays scheduled until the moment you choose.
            </p>
            <p className="flex items-center gap-2">
              <Icon name="favorite" className="shrink-0 text-[16px] text-primary" />
              You can still send another message yourself that day.
            </p>
          </div>
        </section>
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
