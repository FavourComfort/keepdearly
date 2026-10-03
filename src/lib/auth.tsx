import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getSupabase, isSupabaseConfigured, SUPABASE_MISSING_ENV_MESSAGE } from "./supabase";
import type { Profile } from "./supabase.types";

/**
 * Authentication for KeepDearly, built directly on Supabase Auth.
 *
 * Deliberately minimal in Phase 1: email + password sign up, sign in, sign out
 * and password reset. No OAuth, no social login, no onboarding, no billing.
 */

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthResult = { error: string | null };

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
};

type SignUpResult = AuthResult & {
  /** True when the project requires email confirmation before first sign-in. */
  needsEmailConfirmation: boolean;
};

type AuthStore = {
  /** "loading" until Supabase has restored (or ruled out) a session. */
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** False when the Supabase env vars are missing; the UI explains what to do. */
  isConfigured: boolean;
  configMessage: string | null;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  /**
   * Phase 6D: re-read this user's own profile from the database.
   *
   * Needed after a Plus purchase, because `plus_active` is set by the server
   * rather than by anything the browser does. Without this, the Plus gate would
   * keep reading the flag as it was loaded at sign-in and the user would appear
   * not to have paid.
   */
  refreshProfile: () => void;
};

const AuthContext = createContext<AuthStore | null>(null);

/** Normalises a Supabase error or a thrown `unknown` into a displayable string. */
function messageOf(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && "message" in error) {
    const { message } = error as { message: unknown };
    if (typeof message === "string" && message) return message;
  }
  if (typeof error === "string" && error) return error;
  return "Something went wrong — please try again.";
}

/** Best available human name for the signed-in user, without a profile yet. */
export function fallbackName(user: User | null): string {
  if (!user) return "";
  const fromMetadata = user.user_metadata["full_name"];
  if (typeof fromMetadata === "string" && fromMetadata.trim()) return fromMetadata.trim();
  return user.email ?? "";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Bumped by refreshProfile() to re-run the profile effect below. Phase 6D only:
  // it lets the app pick up a server-set plus_active without a full reload.
  const [profileReload, setProfileReload] = useState(0);
  const refreshProfile = useCallback(() => setProfileReload((count) => count + 1), []);
  const isConfigured = isSupabaseConfigured;

  // Restore the session on load and keep it in sync with Supabase's auth events.
  // The state starts as "loading" precisely so a page refresh never flashes the
  // signed-out UI before Supabase has restored the session.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("unauthenticated");
      return;
    }

    let active = true;
    const supabase = getSupabase();

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Only synchronous state updates here — awaiting another Supabase call
      // inside this callback can deadlock the auth client's internal lock.
      // The profile is fetched by the effect below instead.
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load the signed-in user's own profile, scoped to their id — the RLS policy
  // blocks reading anyone else's row.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    void getSupabase()
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          // A missing profile is not fatal: the header falls back to metadata.
          console.error("Could not load profile:", error.message);
          setProfile(null);
          return;
        }
        setProfile(data);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, profileReload]);

  const signUp = useCallback(async ({ email, password, fullName }: SignUpInput) => {
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          // Read by the database trigger that creates the profile row, so the
          // name is stored server-side against the authenticated user id.
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) return { error: error.message, needsEmailConfirmation: false };
      return { error: null, needsEmailConfirmation: !data.session };
    } catch (error) {
      return { error: messageOf(error), needsEmailConfirmation: false };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      return { error: messageOf(error) };
    } catch (error) {
      return { error: messageOf(error) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await getSupabase().auth.signOut();
      return { error: messageOf(error) };
    } catch (error) {
      return { error: messageOf(error) };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: messageOf(error) };
    } catch (error) {
      return { error: messageOf(error) };
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      const { error } = await getSupabase().auth.updateUser({ password });
      return { error: messageOf(error) };
    } catch (error) {
      return { error: messageOf(error) };
    }
  }, []);

  const value = useMemo<AuthStore>(
    () => ({
      status,
      user,
      session,
      profile,
      isConfigured,
      configMessage: isConfigured ? null : SUPABASE_MISSING_ENV_MESSAGE,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      refreshProfile,
    }),
    [
      status,
      user,
      session,
      profile,
      isConfigured,
      signUp,
      signIn,
      signOut,
      requestPasswordReset,
      updatePassword,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Name to show for the signed-in user, falling back profile -> auth metadata. */
export function useAuthDisplayName(): string {
  const { profile, user } = useAuth();
  if (profile?.full_name && profile.full_name.trim()) return profile.full_name.trim();
  return fallbackName(user);
}
