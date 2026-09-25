type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * A row of the public `profiles` table.
 *
 * Phase 1 only ships `profiles` — people, memories, reminders and push
 * subscriptions are deliberately absent until their own phases.
 */
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Minimal hand-written shape of the Supabase generated database types.
 * Regenerate with `npx supabase gen types typescript` once the project
 * has a CLI link; until then this keeps `from("profiles")` fully typed.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
