"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/auth-context";
import { getLiveDemandHeatmap } from "@/lib/api";
import {
  evaluateDemandAlerts,
  filterAlertsByCooldown,
  isDemandAlertsEnabled,
  setDemandAlertsEnabled as persistDemandAlertsEnabled,
  type DemandAlertCandidate,
} from "@/lib/demand-alerts";
import { hasPermission } from "@/lib/admin-permissions";

export type AdminNotification = {
  id: string;
  tone: "danger" | "warn" | "info";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  href: string;
  source: "system" | "demand";
};

type AdminNotificationsContextValue = {
  notifications: AdminNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  latestToast: AdminNotification | null;
  dismissToast: () => void;
  demandAlertsEnabled: boolean;
  setDemandAlertsEnabled: (enabled: boolean) => void;
};

const POLL_MS = 30_000;

const SEED_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "n1",
    tone: "danger",
    title: "SOS triggered on ride #4821",
    detail: "Aiden M. · Kimironko area",
    time: "Just now",
    unread: true,
    href: "/admin/safety-center",
    source: "system",
  },
  {
    id: "n2",
    tone: "warn",
    title: "Driver complaint received",
    detail: "Unsafe driving · Trip #4815",
    time: "14m ago",
    unread: true,
    href: "/admin/support",
    source: "system",
  },
  {
    id: "n3",
    tone: "warn",
    title: "Possible fraud detected",
    detail: "Unusual cancellation pattern · 3 accounts",
    time: "32m ago",
    unread: true,
    href: "/admin/safety-center",
    source: "system",
  },
  {
    id: "n4",
    tone: "info",
    title: "Payment gateway latency",
    detail: "MoMo API responding above threshold",
    time: "1h ago",
    unread: false,
    href: "/admin/settings",
    source: "system",
  },
  {
    id: "n5",
    tone: "info",
    title: "New driver application",
    detail: "Florence I. submitted documents",
    time: "2h ago",
    unread: false,
    href: "/admin/drivers",
    source: "system",
  },
];

const AdminNotificationsContext = createContext<AdminNotificationsContextValue>({
  notifications: SEED_NOTIFICATIONS,
  unreadCount: 0,
  markAllRead: () => {},
  markRead: () => {},
  latestToast: null,
  dismissToast: () => {},
  demandAlertsEnabled: true,
  setDemandAlertsEnabled: () => {},
});

function candidateToNotification(c: DemandAlertCandidate): AdminNotification {
  return {
    id: c.id,
    tone: c.tone,
    title: c.title,
    detail: c.detail,
    time: "Just now",
    unread: true,
    href: c.href,
    source: "demand",
  };
}

function maybeBrowserNotify(n: AdminNotification) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden) return;

  try {
    new Notification(n.title, {
      body: n.detail,
      tag: n.id,
    });
  } catch {
    /* ignore — some browsers block without user gesture */
  }
}

export function AdminNotificationsProvider({ children }: { children: ReactNode }) {
  const { permissions, ready } = useAuth();
  const canMonitorDemand = ready && hasPermission(permissions, "/admin/heatmaps");

  const [notifications, setNotifications] = useState<AdminNotification[]>(SEED_NOTIFICATIONS);
  const [latestToast, setLatestToast] = useState<AdminNotification | null>(null);
  const [demandAlertsEnabled, setDemandAlertsEnabledState] = useState(true);

  const lastFiredAtRef = useRef(new Map<string, number>());

  useEffect(() => {
    setDemandAlertsEnabledState(isDemandAlertsEnabled());
  }, []);

  const setDemandAlertsEnabled = useCallback((enabled: boolean) => {
    persistDemandAlertsEnabled(enabled);
    setDemandAlertsEnabledState(enabled);
  }, []);

  const pushDemandAlerts = useCallback((candidates: DemandAlertCandidate[]) => {
    if (candidates.length === 0) return;

    const now = Date.now();
    const toAdd = candidates.map((c) => {
      lastFiredAtRef.current.set(c.cooldownKey, now);
      return candidateToNotification(c);
    });

    setNotifications((prev) => [...toAdd, ...prev].slice(0, 30));
    setLatestToast(toAdd[0] ?? null);
    if (toAdd[0]) maybeBrowserNotify(toAdd[0]);
  }, []);

  useEffect(() => {
    if (!canMonitorDemand || !demandAlertsEnabled) return;

    let cancelled = false;

    const poll = () => {
      getLiveDemandHeatmap()
        .then((zones) => {
          if (cancelled) return;
          const list = Array.isArray(zones) ? zones : [];
          const candidates = filterAlertsByCooldown(
            evaluateDemandAlerts(list),
            lastFiredAtRef.current,
          );
          pushDemandAlerts(candidates);
        })
        .catch(() => {});
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [canMonitorDemand, demandAlertsEnabled, pushDemandAlerts]);

  useEffect(() => {
    if (!latestToast) return;
    const t = setTimeout(() => setLatestToast(null), 8_000);
    return () => clearTimeout(t);
  }, [latestToast]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  }, []);

  const dismissToast = useCallback(() => setLatestToast(null), []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      latestToast,
      dismissToast,
      demandAlertsEnabled,
      setDemandAlertsEnabled,
    }),
    [
      notifications,
      unreadCount,
      markAllRead,
      markRead,
      latestToast,
      dismissToast,
      demandAlertsEnabled,
      setDemandAlertsEnabled,
    ],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(AdminNotificationsContext);
}
