/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public URL of the Supabase project. Set in `.env.local`. */
  readonly VITE_SUPABASE_URL?: string;
  /** Public anon key of the Supabase project. Set in `.env.local`. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /**
   * PUBLIC half of the VAPID keypair, used to register a Web Push subscription.
   * The private half must never appear in client code or in this file.
   */
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
