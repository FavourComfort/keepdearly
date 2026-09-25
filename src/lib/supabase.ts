import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./supabase.types";

/**
 * The single Supabase client for the whole application.
 *
 * Credentials come from Vite env vars (`.env.local`), never from source, so
 * nothing secret is bundled. Only the PUBLIC anon key is ever used here; the
 * service_role key bypasses RLS and must stay server-side.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when both Supabase env vars are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const SUPABASE_MISSING_ENV_MESSAGE =
  "Supabase isn't configured yet. Copy .env.example to .env.local, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.";

export class SupabaseConfigError extends Error {
  constructor() {
    super(SUPABASE_MISSING_ENV_MESSAGE);
    this.name = "SupabaseConfigError";
  }
}

let client: SupabaseClient<Database> | null = null;

/**
 * Returns the shared Supabase client, creating it on first use.
 *
 * The client is created lazily rather than at module scope for two reasons:
 *  - a missing `.env.local` then surfaces as a friendly message instead of
 *    crashing the whole module graph at import time;
 *  - nothing is constructed during SSR, so the browser session store is never
 *    touched on the server.
 *
 * Call this from effects and event handlers (browser-only contexts).
 */
export function getSupabase(): SupabaseClient<Database> {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) throw new SupabaseConfigError();

  client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Supabase's own browser session persistence: the session lives in
      // localStorage under the supabase-js key and is refreshed automatically.
      // No custom token handling anywhere in KeepDearly.
      persistSession: true,
      autoRefreshToken: true,
      // Lets Supabase parse the recovery/confirm tokens from the URL hash.
      detectSessionInUrl: true,
    },
  });

  return client;
}
