import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { RedirectIfAuthenticated } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { AuthField } from "@/components/keepdearly/AuthField";
import { AuthNotice } from "@/components/keepdearly/AuthNotice";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an account — keepdearly" },
      {
        name: "description",
        content: "Start keeping the small things that actually matter.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const { signUp, isConfigured, configMessage } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    const { error: signUpError, needsEmailConfirmation } = await signUp({
      email: email.trim(),
      password,
      fullName,
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsEmailConfirmation) {
      setCheckEmail(true);
      return;
    }
    await navigate({ to: "/" });
  }

  return (
    <RedirectIfAuthenticated>
      <AppShell>
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-6">
          <header className="flex flex-col gap-1">
            <span className="text-label-sm uppercase tracking-widest text-outline">
              keep it close
            </span>
            <h1 className="text-headline-lg text-on-surface">Create an account</h1>
            <p className="text-body-md text-on-surface-variant">
              Just an email and a password. Quietly yours.
            </p>
          </header>

          {isConfigured ? null : <AuthNotice tone="info">{configMessage}</AuthNotice>}

          {checkEmail ? (
            <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <AuthNotice tone="success">
                Check your inbox — we sent a confirmation link to {email.trim()}.
              </AuthNotice>
              <p className="text-body-sm text-on-surface-variant">
                Once you've confirmed it, you can sign in and start keeping things.
              </p>
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
                id="full-name"
                label="Your name"
                autoComplete="name"
                placeholder="Favour"
                value={fullName}
                onChange={setFullName}
              />
              <AuthField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
              />
              <AuthField
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="at least 6 characters"
                value={password}
                onChange={setPassword}
              />

              {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

              <PrimaryButton type="submit" disabled={busy} className={cn(busy && "opacity-60")}>
                {busy ? "Creating…" : "Create account"}
              </PrimaryButton>
            </form>
          )}

          <p className="text-body-sm text-on-surface-variant">
            Already keeping something?{" "}
            <Link to="/login" className="text-label-md text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </AppShell>
    </RedirectIfAuthenticated>
  );
}
