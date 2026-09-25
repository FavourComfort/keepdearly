import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { RedirectIfAuthenticated } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { AuthField } from "@/components/keepdearly/AuthField";
import { AuthNotice } from "@/components/keepdearly/AuthNotice";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — keepdearly" },
      {
        name: "description",
        content: "We'll send you a link to choose a new password.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { requestPasswordReset, isConfigured, configMessage } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    const { error: resetError } = await requestPasswordReset(email.trim());
    setBusy(false);

    if (resetError) {
      setError(resetError);
      return;
    }
    setSent(true);
  }

  return (
    <RedirectIfAuthenticated>
      <AppShell>
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-6">
          <header className="flex flex-col gap-1">
            <span className="text-label-sm uppercase tracking-widest text-outline">no rush</span>
            <h1 className="text-headline-lg text-on-surface">Reset your password</h1>
            <p className="text-body-md text-on-surface-variant">
              Tell us the email you keep things under, and we'll send a link.
            </p>
          </header>

          {isConfigured ? null : <AuthNotice tone="info">{configMessage}</AuthNotice>}

          {sent ? (
            <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <AuthNotice tone="success">
                If that email has an account, a reset link is on its way.
              </AuthNotice>
              <Link to="/login" className="text-label-md text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm"
            >
              <AuthField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />

              {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

              <PrimaryButton type="submit" disabled={busy} className={cn(busy && "opacity-60")}>
                {busy ? "Sending…" : "Send the link"}
              </PrimaryButton>
            </form>
          )}

          <p className="text-body-sm text-on-surface-variant">
            Remembered it after all?{" "}
            <Link to="/login" className="text-label-md text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </AppShell>
    </RedirectIfAuthenticated>
  );
}
