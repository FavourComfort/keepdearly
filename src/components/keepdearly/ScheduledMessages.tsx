import { useState } from "react";

import { Icon } from "./Icon";
import { DataNotice } from "./DataState";
import type { ScheduledMessage, ScheduledMessageStatus } from "@/lib/keepdearly-data";
import { useKeepDearly } from "@/lib/keepdearly-store";

/**
 * The messages queued up for one person (Phase 6B).
 *
 * Reads as a short list, not a management system: the words, when it is due,
 * and where it has got to. Only a `pending` message can be withdrawn, because
 * anything already on its way is no longer the user's to pull back.
 *
 * It uses the same pieces the rest of the person screen uses — Icon, DataNotice,
 * the rounded container cards and the pill buttons — so it reads as part of
 * KeepDearly rather than a new surface bolted on.
 */

/** Plain words for each state. `sending` is what a claimed message looks like. */
const STATUS_WORDS: Record<ScheduledMessageStatus, string> = {
  pending: "waiting to go",
  sending: "on its way",
  sent: "sent",
  failed: "couldn't send",
  cancelled: "cancelled",
};

/** Longest preview shown before the body is cut with an ellipsis. */
const PREVIEW_LENGTH = 140;

function previewOf(body: string): string {
  const flattened = body.replace(/\s+/g, " ").trim();
  return flattened.length > PREVIEW_LENGTH
    ? `${flattened.slice(0, PREVIEW_LENGTH).trimEnd()}…`
    : flattened;
}

function statusTone(status: ScheduledMessageStatus): string {
  if (status === "sent") return "bg-primary-fixed text-on-primary-fixed-variant";
  if (status === "failed") return "bg-error-container text-on-error";
  return "bg-surface-container-high text-on-surface-variant";
}

export function ScheduledMessages({
  personId,
  personName,
}: {
  personId: string;
  personName: string;
}) {
  const { scheduledMessagesFor, cancelScheduledMessage, refresh } = useKeepDearly();
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const messages = scheduledMessagesFor(personId);
  // Cancelled messages are noise once the user has withdrawn them, so they are
  // hidden rather than listed as clutter. Everything else stays visible.
  const visible = messages.filter((message) => message.status !== "cancelled");

  async function handleCancel(id: string) {
    if (cancelling) return;
    setCancelling(id);
    setError(null);

    const result = await cancelScheduledMessage(id);
    setCancelling(null);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    await refresh();
  }

  if (!visible.length) {
    return (
      <p className="rounded-xl bg-surface-container-low p-6 text-body-md italic text-on-surface-variant">
        Nothing queued for {personName} yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <DataNotice tone="error">{error}</DataNotice> : null}
      {visible.map((message) => (
        <article
          key={message.id}
          className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-6 shadow-sm"
        >
          <p className="text-body-md text-on-surface">{previewOf(message.body)}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-label-sm text-on-surface-variant">
              <Icon name="schedule" className="text-[14px]" />
              {message.timing}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-label-sm ${statusTone(message.status)}`}
            >
              {STATUS_WORDS[message.status]}
            </span>
            {message.status === "pending" ? (
              <button
                type="button"
                onClick={() => void handleCancel(message.id)}
                disabled={cancelling === message.id}
                className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="close" className="text-[14px]" />
                {cancelling === message.id ? "Cancelling…" : "Cancel"}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
