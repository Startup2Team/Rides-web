"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getDashboard, getAnalyticsOverviewData, type DashboardSnapshot, type AnalyticsOverview } from "@/lib/api";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
      {children}
    </svg>
  );
}

type TrendDir = "up" | "down" | "flat";

function TrendPill({ direction, value }: { direction: TrendDir; value: string }) {
  const tone =
    direction === "up"
      ? "bg-primary/10 text-primary"
      : direction === "down"
      ? "bg-red-50 text-red-600"
      : "bg-muted text-muted-foreground";
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tone}`}>
      <span>{arrow}</span>
      <span>{value}</span>
    </span>
  );
}

function LivePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {label}
    </span>
  );
}

type Kpi = {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { direction: TrendDir; value: string };
  badge?: string;
  period?: string;
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
          {kpi.icon}
        </span>
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {kpi.label}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</span>
        {kpi.trend ? <TrendPill {...kpi.trend} /> : null}
        {kpi.badge ? <LivePill label={kpi.badge} /> : null}
      </div>
      {kpi.period ? (
        <p className="mt-1.5 text-[10px] font-medium text-muted-foreground">{kpi.period}</p>
      ) : null}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-muted" />
        <div className="h-2.5 w-24 rounded bg-muted" />
      </div>
      <div className="mt-4 h-7 w-16 rounded bg-muted" />
      <div className="mt-1.5 h-2 w-12 rounded bg-muted" />
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function buildKpis(snap: DashboardSnapshot, analytics: AnalyticsOverview): Kpi[] {
  return [
    {
      label: "Active Drivers",
      value: String(analytics.active_drivers),
      icon: <Icon><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></Icon>,
    },
    {
      label: "Drivers Online",
      value: String(snap.onlineDrivers),
      icon: <Icon><path d="M5 12a7 7 0 0 1 14 0M2 12a10 10 0 0 1 20 0M8 12a4 4 0 0 1 8 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></Icon>,
      badge: "Live",
    },
    {
      label: "Active Rides",
      value: String(snap.liveRides),
      icon: <Icon><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></Icon>,
      badge: "Live",
    },
    {
      label: "Rides Today",
      value: fmt(analytics.total_rides_today),
      icon: <Icon><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></Icon>,
    },
    {
      label: "Revenue Today",
      value: `${fmt(analytics.total_revenue_today)} RWF`,
      icon: <Icon><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon>,
    },
    {
      label: "Open Tickets",
      value: String(snap.openTickets),
      icon: <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>,
    },
    {
      label: "Pending KYC",
      value: String(snap.pendingVerifications),
      icon: <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></Icon>,
    },
    {
      label: "Open Incidents",
      value: String(snap.openIncidents),
      icon: <Icon><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>,
    },
  ];
}

export function DashboardKpis() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getAnalyticsOverviewData()])
      .then(([snap, anl]) => {
        setSnapshot(snap);
        setAnalytics(anl);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <KpiSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!snapshot || !analytics) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Could not load dashboard data. Make sure the backend is running.
      </div>
    );
  }

  const kpis = buildKpis(snapshot, analytics);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
