"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  getRecentActivity, getDashboardAlerts,
  type RecentActivity, type DashboardAlert,
} from "@/lib/api";

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 5) return "Just now";
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function shortName(n: string | undefined): string {
  if (!n) return "";
  const parts = n.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function shortId(id?: string | null): string {
  if (!id) return "";
  return id.slice(0, 8);
}

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

// ── Activity feed ────────────────────────────────────────────────────────────

type ActivityVisual = {
  icon: ReactNode;
  tone: "positive" | "neutral" | "warn";
  text: (a: RecentActivity) => string;
};

const ACTIVITY_MAP: Record<string, ActivityVisual> = {
  "ride.created": {
    tone: "positive",
    icon: <Icon><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" fill="currentColor" /></Icon>,
    text: () => "New ride request",
  },
  "ride.completed": {
    tone: "positive",
    icon: <Icon><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></Icon>,
    text: (a) => `${shortName(a.actorName) || "Driver"} completed a trip`,
  },
  "ride.cancelled": {
    tone: "warn",
    icon: <Icon><circle cx="12" cy="12" r="10" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></Icon>,
    text: () => "Ride cancelled",
  },
  "ride.negotiation_started": {
    tone: "neutral",
    icon: <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="13" y2="14" /></Icon>,
    text: () => "Fare negotiation started",
  },
  "driver.went_online": {
    tone: "positive",
    icon: <Icon><path d="M5 12a7 7 0 0 1 14 0" /><path d="M2 12a10 10 0 0 1 20 0" /><path d="M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></Icon>,
    text: (a) => `${shortName(a.actorName) || "A driver"} came online`,
  },
  "driver.went_offline": {
    tone: "neutral",
    icon: <Icon><path d="M5 12a7 7 0 0 1 14 0" /><path d="M2 12a10 10 0 0 1 20 0" /><line x1="2" y1="2" x2="22" y2="22" /></Icon>,
    text: (a) => `${shortName(a.actorName) || "A driver"} went offline`,
  },
  "driver.declined_request": {
    tone: "neutral",
    icon: <Icon><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></Icon>,
    text: (a) => `${shortName(a.actorName) || "A driver"} declined a request`,
  },
  "gps.anomaly_detected": {
    tone: "warn",
    icon: <Icon><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>,
    text: () => "GPS anomaly detected",
  },
  "driver.document_submitted": {
    tone: "neutral",
    icon: <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon>,
    text: (a) => `${shortName(a.actorName) || "A driver"} submitted documents`,
  },
};

const FALLBACK_VISUAL: ActivityVisual = {
  tone: "neutral",
  icon: <Icon><circle cx="12" cy="12" r="3" /></Icon>,
  text: (a) => a.type.replace(/[._]/g, " "),
};

function visualFor(type: string): ActivityVisual {
  return ACTIVITY_MAP[type] ?? FALLBACK_VISUAL;
}

export function ActivityFeed() {
  const [items, setItems] = useState<RecentActivity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getRecentActivity(8)
        .then((d) => !cancelled && setItems(d))
        .catch(() => !cancelled && setError(true))
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    const id = setInterval(load, 20_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent Activity</h2>
        </div>
        <Link href="/admin/audit" className="text-[11px] font-medium text-muted-foreground hover:text-primary">
          View all
        </Link>
      </div>
      {loading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="h-3 flex-1 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not load activity.
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-[11px] text-muted-foreground">
          No activity yet.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((a) => {
            const v = visualFor(a.type);
            return (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    v.tone === "positive"
                      ? "bg-primary/15 text-primary"
                      : v.tone === "warn"
                      ? "bg-amber-400/15 text-amber-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {v.icon}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">{v.text(a)}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(a.occurredAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Alerts panel ─────────────────────────────────────────────────────────────

function alertIcon(kind: DashboardAlert["kind"], title: string) {
  if (title.toLowerCase().includes("sos")) {
    return (
      <Icon>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        <line x1="12" y1="10" x2="12" y2="14" />
      </Icon>
    );
  }
  if (kind === "ticket") {
    return (
      <Icon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="14" x2="13" y2="14" />
      </Icon>
    );
  }
  return (
    <Icon>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}

function alertHref(a: DashboardAlert): string {
  if (a.kind === "incident") return `/admin/safety-center`;
  return `/admin/support`;
}

export function AlertsPanel() {
  const [items, setItems] = useState<DashboardAlert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getDashboardAlerts(6)
        .then((d) => !cancelled && setItems(d))
        .catch(() => !cancelled && setError(true))
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    const id = setInterval(load, 20_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const count = items?.length ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-2 w-2 rounded-full ${count > 0 ? "bg-red-500" : "bg-muted-foreground/40"}`} />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Alerts</h2>
          {count > 0 ? (
            <span className="ml-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600">
              {count}
            </span>
          ) : null}
        </div>
        <Link href="/admin/alerts" className="text-[11px] font-medium text-muted-foreground hover:text-primary">
          View all
        </Link>
      </div>
      {loading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="px-4 py-3 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                  <div className="h-5 w-20 rounded bg-muted" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not load alerts.
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-1 text-center">
          <p className="text-xs font-semibold text-foreground">All clear</p>
          <p className="text-[11px] text-muted-foreground">No open alerts.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((a) => (
            <li key={`${a.kind}:${a.id}`} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    a.tone === "danger"
                      ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200"
                      : a.tone === "warn"
                      ? "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200"
                      : "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                  }`}
                >
                  {alertIcon(a.kind, a.title)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                      {a.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {timeAgo(a.occurredAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {a.detail || (a.rideId ? `Ride #${shortId(a.rideId)}` : "—")}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      href={alertHref(a)}
                      className={
                        a.tone === "danger"
                          ? "rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-red-700"
                          : "rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-surface"
                      }
                    >
                      {a.tone === "danger" ? "Respond" : "View"}
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
