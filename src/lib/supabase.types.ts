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
 * be captured before anyone is attached to it. `photo_path` is the private
 * storage object path of the one optional photo; null means text only.
 */
export type MemoryRow = {
  id: string;
  user_id: string;
  person_id: string | null;
  content: string;
  photo_path: string | null;
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
 * A row of `public.plus_purchases` (Phase 6D).
 *
 * One KeepDearly-initiated Nylon Pay attempt for Plus: UGX 2,000, paid once.
 * Readable by its owner for status history, and writable by nobody on the client
 * — `authenticated` holds SELECT only, so every field here is set server-side.
 */
export type PlusPurchaseRow = {
  id: string;
  user_id: string;
  provider: string;
  provider_reference: string;
  provider_transaction_id: string | null;
  /** Always 2000 for Plus. CHECK-constrained in the database, not by the client. */
  amount: number;
  currency: string;
  status: PlusPurchaseStatus;
  /** Kept for reconciliation only; never logged and never sent to the browser. */
  payer_phone: string | null;
  /** A short category only — never raw provider error text. */
  failure_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PlusPurchaseStatus = "pending" | "completed" | "failed";

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
          /** Private storage path under this memory's owner folder; null = no photo. */
          photo_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          person_id?: string | null;
          content?: string;
          photo_path?: string | null;
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
          // `status` is the only field the Phase 6B client writes, when the
          // owner cancels a pending message.
          status?: ScheduledMessageRow["status"];
          // Server-only (Phase 6C delivery job). The browser has no code path
          // that writes these; see the report note on the residual risk that
          // these are still reachable through PostgREST by the row owner.
          sent_at?: string | null;
          last_error?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      plus_purchases: {
        Row: PlusPurchaseRow;
        Insert: {
          // Server-only. The client has SELECT on this table and nothing else, so
          // these Insert/Update shapes exist for the service-role client and are
          // never reachable from a browser.
          id?: string;
          user_id: string;
          provider?: string;
          provider_reference: string;
          provider_transaction_id?: string | null;
          amount: number;
          currency: string;
          status?: PlusPurchaseStatus;
          payer_phone?: string | null;
          failure_reason?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          provider_transaction_id?: string | null;
          status?: PlusPurchaseStatus;
          failure_reason?: string | null;
          completed_at?: string | null;
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
      /**
       * Phase 6C (migration 0010): cancel one of the calling user's own
       * PENDING scheduled messages. SECURITY DEFINER; ownership is enforced in
       * the function with `auth.uid()`, which is why `authenticated` has no
       * UPDATE privilege on this table at all.
       *
       * Returns one row on success. Raises `P0002` when there is nothing to
       * cancel (not the caller's message, or it has already been claimed or
       * delivered) — deliberately without saying which, so the function cannot
       * be used to probe other users' message ids.
       */
      cancel_scheduled_message: {
        Args: { p_message_id: string };
        Returns: {
          id: string;
          person_id: string;
          status: string;
        }[];
      };
      /**
       * Phase 6D: record a VERIFIED successful Plus payment and set
       * `profiles.plus_active` for the purchase's own user.
       *
       * The user id is derived from the purchase row, never from an argument, so
       * a caller cannot choose the account that gets Plus. Idempotent:
       * `out_activated` is false when the purchase was already completed, which
       * is what a duplicate webhook sees. service_role only.
       */
      complete_plus_purchase: {
        Args: { p_reference: string; p_provider_transaction_id: string | null };
        Returns: {
          out_user_id: string;
          out_activated: boolean;
        }[];
      };
      /**
       * Phase 6D: record a terminal Plus payment failure as a short category.
       * Never grants Plus and never downgrades a completed purchase. service_role
       * only.
       */
      fail_plus_purchase: {
        Args: { p_reference: string; p_failure_reason: string | null };
        Returns: {
          out_user_id: string;
          out_recorded: boolean;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
