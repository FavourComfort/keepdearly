import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/keepdearly/AppShell";
import { AuthNotice } from "@/components/keepdearly/AuthNotice";
import { PasswordField } from "@/components/keepdearly/PasswordField";
import { PrimaryButton } from "@/components/keepdearly/PrimaryButton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * The landing page for the recovery link Supabase emails out. Supabase parses
 * the token from the URL hash itself (detectSessionInUrl) and signs the user in
 * for long enough to set a new password — so this route is intentionally *not*
 * wrapped in RedirectIfAuthenticated, because a recovery visitor is signed in.
 */
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — keepdearly" },
      { name: "description", content: "Set a new password for your keepdearly account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { updatePassword, status, isConfigured, configMessage } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    setBusy(false);

    if (updateError) {
      setError(updateError);
      return;
    }
    await navigate({ to: "/" });
  }

  // No recovery session: the link was never opened, or it expired.
  if (isConfigured && status === "unauthenticated") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-6">
          <header className="flex flex-col gap-1">
            <span className="text-label-sm uppercase tracking-widest text-outline">
              link needed
            </span>
            <h1 className="text-headline-lg text-on-surface">Open the link from your email</h1>
          </header>
          <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <p className="text-body-md text-on-surface-variant">
              This page needs the secure link we emailed you, so we know it's really you.
            </p>
            <Link to="/forgot-password" className="text-label-md text-primary hover:underline">
              Send me a new link
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-6">
        <header className="flex flex-col gap-1">
          <span className="text-label-sm uppercase tracking-widest text-outline">almost there</span>
          <h1 className="text-headline-lg text-on-surface">Choose a new password</h1>
          <p className="text-body-md text-on-surface-variant">
            Something you'll remember on the days that blur together.
          </p>
        </header>

        {isConfigured ? null : <AuthNotice tone="info">{configMessage}</AuthNotice>}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm"
        >
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            placeholder="at least 6 characters"
            value={password}
            onChange={setPassword}
          />

          {error ? <AuthNotice tone="error">{error}</AuthNotice> : null}

          <PrimaryButton type="submit" disabled={busy} className={cn(busy && "opacity-60")}>
            {busy ? "Saving…" : "Save new password"}
          </PrimaryButton>
        </form>
      </div>
    </AppShell>
  );
}
