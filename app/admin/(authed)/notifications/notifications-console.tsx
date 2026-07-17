"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader, Card, StatCard, StatusPill } from "../_components";
import { NotificationFormModal, type NotificationDraft } from "./notification-form-modal";
import { useAuth } from "@/context/auth-context";
import {
  listNotifications,
  saveNotification,
  removeNotification,
  type AppNotification,
  type NotificationAudience,
} from "@/lib/notification-store";

const AUDIENCE_LABEL: Record<NotificationAudience, string> = {
  both: "Customers & Drivers",
  customers: "Customers",
  drivers: "Drivers",
};

const STATUS_TONE: Record<AppNotification["status"], "success" | "warn" | "neutral"> = {
  sent: "success",
  scheduled: "warn",
  draft: "neutral",
};

function formatDateTime(value: number | string | null): string {
  if (!value) return "—";
  const d = typeof value === "number" ? new Date(value) : new Date(value);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function NotificationsConsole() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppNotification | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  const stats = useMemo(() => {
    const sent = notifications.filter((n) => n.status === "sent").length;
    const scheduled = notifications.filter((n) => n.status === "scheduled").length;
    const drafts = notifications.filter((n) => n.status === "draft").length;
    return { sent, scheduled, drafts, total: notifications.length };
  }, [notifications]);

  async function handleSave(draft: NotificationDraft, action: "draft" | "send") {
    const now = Date.now();
    const isFutureSchedule = draft.scheduledAt && new Date(draft.scheduledAt).getTime() > now;

    const status: AppNotification["status"] =
      action === "draft" ? "draft" : isFutureSchedule ? "scheduled" : "sent";

    try {
      await saveNotification({
        title: draft.title,
        message: draft.message,
        imageUrl: draft.imageUrl,
        actionLink: draft.actionLink,
        audience: draft.audience,
        status,
        scheduledAt: draft.scheduledAt || null,
        sentAt: status === "sent" ? now : null,
      });

      setFormOpen(false);
      setEditing(null);
      await refresh();
      showToast(status === "sent" ? "Notification sent" : status === "scheduled" ? "Notification scheduled" : "Draft saved");
    } catch (err) {
      showToast("Failed to save notification");
    }
  }

  async function handleSendNow(notification: AppNotification) {
    try {
      await saveNotification({
        title: notification.title,
        message: notification.message,
        imageUrl: notification.imageUrl,
        actionLink: notification.actionLink,
        audience: notification.audience,
        status: "sent",
        scheduledAt: null,
        sentAt: Date.now(),
      });
      await refresh();
      showToast("Notification sent");
    } catch (err) {
      showToast("Failed to send notification");
    }
  }

  async function handleDelete(id: string) {
    try {
      await removeNotification(id);
      await refresh();
      showToast("Notification removed");
    } catch (err) {
      showToast("Failed to remove notification");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Notifications"
        subtitle="Compose and manage announcements sent to customers and drivers."
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            + Compose notification
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Sent" value={String(stats.sent)} tone="primary" />
        <StatCard label="Scheduled" value={String(stats.scheduled)} />
        <StatCard label="Drafts" value={String(stats.drafts)} />
      </div>

      <Card title="History">
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Loading notification campaigns...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
            <button type="button" onClick={() => setFormOpen(true)} className="mt-3 text-xs font-semibold text-primary hover:underline">
              Compose your first notification
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {n.imageUrl ? (
                    <img src={n.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{n.title}</p>
                      <StatusPill status={n.status} tone={STATUS_TONE[n.status]} />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {AUDIENCE_LABEL[n.audience]} ·{" "}
                      {n.status === "sent"
                        ? `Sent ${formatDateTime(n.sentAt)}`
                        : n.status === "scheduled"
                          ? `Scheduled for ${formatDateTime(n.scheduledAt)}`
                          : `Saved ${formatDateTime(n.createdAt)}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {n.status !== "sent" ? (
                    <button
                      type="button"
                      onClick={() => handleSendNow(n)}
                      className="h-8 rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
                    >
                      Send now
                    </button>
                  ) : null}
                  {n.status !== "sent" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(n);
                        setFormOpen(true);
                      }}
                      className="h-8 rounded-lg border border-border px-3 text-xs font-medium hover:bg-surface"
                    >
                      Edit
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    className="h-8 rounded-lg border border-border px-3 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <NotificationFormModal
        open={formOpen}
        notification={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
