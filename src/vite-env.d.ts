/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public URL of the Supabase project. Set in `.env.local`. */
  readonly VITE_SUPABASE_URL?: string;
  /** Public anon key of the Supabase project. Set in `.env.local`. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
