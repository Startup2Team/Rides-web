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
  targetDriverId?: string;
  scheduledAt: string;
};

const AUDIENCE_OPTIONS: { id: NotificationAudience; label: string }[] = [
  { id: "both", label: "All Customers & Drivers" },
  { id: "customers", label: "Customers only" },
  { id: "drivers", label: "All Drivers" },
  { id: "driver_moto", label: "Moto Bike riders only" },
  { id: "driver_cab", label: "Cab Taxi drivers only" },
  { id: "driver_hilux", label: "Light Hilux drivers only" },
  { id: "driver_fuso", label: "Heavy Fuso drivers only" },
  { id: "driver_rifani", label: "Rifani drivers only" },
  { id: "single_driver", label: "Specific single driver" },
];

function draftFromNotification(notification: AppNotification | null): NotificationDraft {
  if (!notification) {
    return { title: "", message: "", imageUrl: null, actionLink: "", audience: "both", targetDriverId: "", scheduledAt: "" };
  }
  return {
    title: notification.title,
    message: notification.message,
    imageUrl: notification.imageUrl ?? null,
    actionLink: notification.actionLink ?? "",
    audience: notification.audience,
    targetDriverId: notification.targetDriverId ?? "",
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
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = (action: "draft" | "send") => {
    setError(null);
    if (!draft.title.trim() || !draft.message.trim()) {
      setError("Please fill out both the title and message.");
      return;
    }
    if (draft.audience === "single_driver" && !draft.targetDriverId?.trim()) {
      setError("Please enter the target Driver ID or User ID.");
      return;
    }
    onSave(draft, action);
  };

  const sendLabel = draft.scheduledAt ? "Schedule" : "Send now";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {notification ? "Edit campaign" : "New campaign"}
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              {notification ? "Update notification" : "Compose broadcast"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          ) : null}

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

            {draft.audience === "single_driver" && (
              <div>
                <label className="text-xs font-semibold text-foreground">Target Driver ID / User ID</label>
                <input
                  type="text"
                  value={draft.targetDriverId || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, targetDriverId: e.target.value }))}
                  placeholder="Enter driver profile ID or user ID"
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("send")}
            className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {sendLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
