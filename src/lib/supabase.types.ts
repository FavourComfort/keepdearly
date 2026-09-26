type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/**
 * A row of the public `profiles` table.
 *
 * Profiles arrived in Phase 1. People, memories and reminders follow in
 * Phase 2, and push subscriptions are deliberately absent until their phase.
 */
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/** A row of `public.people`. Intentionally only a name and an optional avatar. */
export type PersonRow = {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * A row of `public.memories`. `person_id` is nullable by design — a memory may
 * be captured before anyone is attached to it.
 */
export type MemoryRow = {
  id: string;
  user_id: string;
  person_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ReminderStatus = "pending" | "completed" | "cancelled";

/** A row of `public.reminders`. `remind_at` is the stored intent, not delivery. */
export type ReminderRow = {
  id: string;
  user_id: string;
  memory_id: string;
  remind_at: string;
  status: ReminderStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Hand-written shape of the Supabase generated database types, kept in step
 * with supabase/migrations by hand. Regenerate with
 * `npx supabase gen types typescript` once the project has a CLI link.
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
      people: {
        Row: PersonRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: MemoryRow;
        Insert: {
          id?: string;
          user_id: string;
          person_id?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          person_id?: string | null;
          content?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminders: {
        Row: ReminderRow;
        Insert: {
          id?: string;
          user_id: string;
          memory_id: string;
          remind_at: string;
          status?: ReminderStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          remind_at?: string;
          status?: ReminderStatus;
          completed_at?: string | null;
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
