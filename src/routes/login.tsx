import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { RedirectIfAuthenticated } from "@/components/auth/guards";
import { AppShell } from "@/components/keepdearly/AppShell";
import { AuthField } from "@/components/keepdearly/AuthField";
import { AuthNotice } from "@/components/keepdearly/AuthNotice";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — keepdearly" },
      {
        name: "description",
        content: "Sign in to reach the small things you've kept close.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const { signIn, isConfigured, configMessage } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    const { error: signInError } = await signIn(email.trim(), password);
    setBusy(false);

    if (signInError) {
      setError(signInError);
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
              welcome back
            </span>
            <h1 className="text-headline-lg text-on-surface">Sign in</h1>
            <p className="text-body-md text-on-surface-variant">
              The little things you kept are right where you left them.
            </p>
          </header>

          {isConfigured ? null : <AuthNotice tone="info">{configMessage}</AuthNotice>}

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
            <AuthField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />

            {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

            <PrimaryButton type="submit" disabled={busy} className={cn(busy && "opacity-60")}>
              {busy ? "Signing in…" : "Sign in"}
            </PrimaryButton>
          </form>

          <div className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
            <Link to="/forgot-password" className="text-label-md text-primary hover:underline">
              Forgotten your password?
            </Link>
            <p>
              New here?{" "}
              <Link to="/signup" className="text-label-md text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </AppShell>
    </RedirectIfAuthenticated>
  );
}
