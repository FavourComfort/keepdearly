import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";

/**
 * Route guards for Phase 1.
 *
 * These gate on the client-side Supabase session rather than in the router's
 * `beforeLoad`, because the session lives in browser storage: `beforeLoad` also
 * runs during SSR, where there is no session to read and a redirect there would
 * throw signed-in users out on every refresh. Instead the guard renders a quiet
 * "just a moment…" state until Supabase has restored the session, then either
 * renders the page or navigates to the sign-in screen.
 */

function AuthLoadingView() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <span className="text-body-md text-outline">just a moment…</span>
    </div>
  );
}

function SupabaseSetupNotice({ message }: { message: string | null }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="text-label-sm uppercase tracking-widest text-outline">setup needed</span>
      <h1 className="text-headline-md text-on-surface">One small step first</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        {message ?? "Supabase isn't configured yet."}
      </p>
    </div>
  );
}

/** Wraps the screens that require an account. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, isConfigured, configMessage } = useAuth();

  if (!isConfigured) return <SupabaseSetupNotice message={configMessage} />;
  if (status === "loading") return <AuthLoadingView />;
  if (status === "unauthenticated") return <Navigate to="/login" />;

  return <>{children}</>;
}

/** Keeps signed-in users away from /login, /signup and the reset screens. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status, isConfigured } = useAuth();

  if (isConfigured && status === "loading") return <AuthLoadingView />;
  if (status === "authenticated") return <Navigate to="/" />;

  return <>{children}</>;
}
