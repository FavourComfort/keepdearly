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
  /**
   * Phase 6A: the Plus entitlement flag. Read-only from the client — migration
   * 0007 revoked table-level UPDATE and re-granted it per column, so the
   * browser cannot set this for itself. Only a trusted server path can.
   */
  plus_active: boolean;
  created_at: string;
  updated_at: string;
};

/** A row of `public.people`. Intentionally only a name and an optional avatar. */
export type PersonRow = {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  /**
   * Phase 6A: where to send this person a scheduled message. Optional — most
   * people have no address, and a recipient needs no KeepDearly account.
   */
  email: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * A row of `public.scheduled_messages` (Phase 6A).
 *
 * One prepared message for one saved person, waiting to be sent by email at
 * `send_at`. Delivery fields (`sent_at`, `last_error`, `attempts`) belong to the
 * server's delivery job; the client only ever writes `body` and `send_at`.
 */
export type ScheduledMessageRow = {
  id: string;
  user_id: string;
  person_id: string;
  body: string;
  send_at: string;
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
  sent_at: string | null;
  last_error: string | null;
  attempts: number;
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
          /** Phase 6B: set or cleared (null) by the owner from their person screen. */
          email?: string | null;
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
      scheduled_messages: {
        Row: ScheduledMessageRow;
        Insert: {
          id?: string;
          user_id: string;
          person_id: string;
          body: string;
          send_at: string;
          // Server-owned delivery fields. Absent from Insert on purpose: the
          // client cannot set `status`, `sent_at`, `last_error` or `attempts`,
          // so a browser cannot forge a "sent" row.
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          // Only what the owner may legitimately change. Cancelling moves
          // status; the body and moment stay as the user wrote them.
          status?: ScheduledMessageRow["status"];
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
