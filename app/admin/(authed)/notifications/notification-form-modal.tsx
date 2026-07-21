"use client";

import { useEffect, useState } from "react";
import { AdvertImageField } from "../partners/advert-image-field";
import type { AppNotification, NotificationAudience } from "@/lib/notification-store";

export type NotificationDraft = {
  title: string;
  message: string;
  imageUrl: string | null;
  actionLink: string;
  audience: NotificationAudience;
  scheduledAt: string;
};

const AUDIENCE_OPTIONS: { id: NotificationAudience; label: string }[] = [
  { id: "both", label: "Customers & Drivers" },
  { id: "customers", label: "Customers only" },
  { id: "drivers", label: "Drivers only" },
];

function draftFromNotification(notification: AppNotification | null): NotificationDraft {
  if (!notification) {
    return { title: "", message: "", imageUrl: null, actionLink: "", audience: "both", scheduledAt: "" };
  }
  return {
    title: notification.title,
    message: notification.message,
    imageUrl: notification.imageUrl ?? null,
    actionLink: notification.actionLink ?? "",
    audience: notification.audience,
    scheduledAt: String(notification.scheduledAt ?? ""),
  };
}

export function NotificationFormModal({
  open,
  notification,
  onClose,
  onSave,
}: {
  open: boolean;
  notification: AppNotification | null;
  onClose: () => void;
  onSave: (draft: NotificationDraft, action: "draft" | "send") => void;
}) {
  const [draft, setDraft] = useState<NotificationDraft>(() => draftFromNotification(notification));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(draftFromNotification(notification));
      setError(null);
    }
  }, [open, notification]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function validate(): boolean {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return false;
    }
    if (!draft.message.trim()) {
      setError("Message is required.");
      return false;
    }
    return true;
  }

  const sendLabel = draft.scheduledAt ? "Schedule" : "Send now";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-foreground">{notification ? "Edit notification" : "Compose notification"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {/* Live preview */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{draft.title || "Notification title"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{draft.message || "Notification message will appear here."}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Title</label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Weekend fare boost is live"
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Message</label>
              <textarea
                value={draft.message}
                onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                rows={3}
                placeholder="Earn 20% more on every trip this weekend."
                className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <AdvertImageField
              label="Image (optional)"
              value={draft.imageUrl}
              onChange={(v) => setDraft((d) => ({ ...d, imageUrl: v }))}
              aspectHint="Small square/thumbnail works best"
            />

            <div>
              <label className="text-xs font-semibold text-foreground">Tap action / link (optional)</label>
              <input
                type="text"
                value={draft.actionLink}
                onChange={(e) => setDraft((d) => ({ ...d, actionLink: e.target.value }))}
                placeholder="https://... or an in-app screen"
                className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Audience</label>
                <select
                  value={draft.audience}
                  onChange={(e) => setDraft((d) => ({ ...d, audience: e.target.value as NotificationAudience }))}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
                >
                  {AUDIENCE_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">Schedule for later (optional)</label>
                <input
                  type="datetime-local"
                  value={draft.scheduledAt}
                  onChange={(e) => setDraft((d) => ({ ...d, scheduledAt: e.target.value }))}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate()) onSave(draft, "draft");
            }}
            className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => {
              if (validate()) onSave(draft, "send");
            }}
            className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
