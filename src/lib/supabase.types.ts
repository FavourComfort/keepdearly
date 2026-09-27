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

/** A row of public.push_subscriptions: one browser/device Web Push destination. */
export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
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
  /**
   * Phase 4B: when the due-reminder scheduler delivered this row as Web Push.
   * NULL means not yet delivered. Claimed atomically by
   * `claim_due_reminder` so a nudge is never sent twice.
   */
  notified_at: string | null;
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
          notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          remind_at?: string;
          status?: ReminderStatus;
          completed_at?: string | null;
          notified_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscriptionRow;
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      /**
       * Phase 4B: atomically claim one due reminder for delivery. Sets
       * `notified_at = now()` only while the row is still pending, still due
       * and still unclaimed; returns one row either way.
       */
      claim_due_reminder: {
        Args: { p_reminder_id: string };
        Returns: {
          claimed: boolean;
          id: string;
          user_id: string;
          memory_id: string;
          remind_at: string;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
