/**
 * Local persistence for admin-authored notifications. There is no push
 * delivery infrastructure yet (no FCM/Expo push integration anywhere in this
 * app) — so this is an admin console for composing, scheduling, and tracking
 * notification history against localStorage, same pattern as
 * report-store.ts / partner-store.ts. Ready to wire to a real push backend
 * later without changing the UI.
 */
import { MOCK_NOTIFICATIONS, type AppNotification } from "./mock-notifications";

export type { AppNotification, NotificationAudience, NotificationStatus } from "./mock-notifications";

const NOTIFICATIONS_KEY = "taravelis:notifications";

function readAll(): AppNotification[] {
  if (typeof window === "undefined") return MOCK_NOTIFICATIONS;
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
      return MOCK_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : MOCK_NOTIFICATIONS;
  } catch {
    return MOCK_NOTIFICATIONS;
  }
}

function writeAll(entries: AppNotification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(entries));
  } catch {
    // storage full/unavailable — non-fatal, edits just won't persist
  }
}

export function listNotifications(): AppNotification[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveNotification(notification: AppNotification) {
  const all = readAll().filter((n) => n.id !== notification.id);
  all.unshift(notification);
  writeAll(all);
}

export function removeNotification(id: string) {
  writeAll(readAll().filter((n) => n.id !== id));
}
