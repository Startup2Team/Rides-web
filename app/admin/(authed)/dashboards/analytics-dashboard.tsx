"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DateSubtitle, Greeting } from "../_greeting";
import {
  getAnalyticsOverviewData,
  getRidesDaily,
  type AnalyticsOverview,
  type DailyRidePoint,
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";

function QuickLink({
  href,
  title,
  description,
  stat,
}: {
  href: string;
  title: string;
  description: string;
  stat?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {stat ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {stat}
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <span className="mt-4 text-xs font-semibold text-primary group-hover:underline">Open →</span>
    </Link>
  );
}

function MiniTrend({ days }: { days: DailyRidePoint[] }) {
  if (!days.length) {
    return (
      <p className="text-xs text-muted-foreground">No ride trend data for this period yet.</p>
    );
  }
  const sorted = [...days].sort((a, b) => a.day.localeCompare(b.day)).slice(-14);
  const max = Math.max(...sorted.map((d) => d.completed), 1);
  return (
    <div className="flex h-24 items-end gap-1">
      {sorted.map((d) => (
        <div
          key={d.day}
          className="flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
          style={{ height: `${Math.max(8, (d.completed / max) * 100)}%` }}
          title={`${d.day}: ${d.completed} completed`}
        />
      ))}
    </div>
  );
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [rides, setRides] = useState<DailyRidePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getAnalyticsOverviewData(), getRidesDaily(30)])
      .then(([o, r]) => {
        if (cancelled) return;
        setOverview(o);
        setRides(r);
      })
      .catch(() => {
        if (!cancelled) {
          setOverview(null);
          setRides([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Analytics Staff
          </p>
          <Greeting />
          <DateSubtitle />
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Read-only insights for {user?.name ?? "your team"}. Explore trends, export reports, and
            review demand heatmaps — no operational actions on this account.
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          View only
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Rides today",
            value: loading ? "…" : String(overview?.total_rides_today ?? "—"),
          },
          {
            label: "Active rides",
            value: loading ? "…" : String(overview?.active_rides ?? "—"),
          },
          {
            label: "Active drivers",
            value: loading ? "…" : String(overview?.active_drivers ?? "—"),
          },
          {
            label: "Revenue today",
            value: loading
              ? "…"
              : overview?.total_revenue_today != null
                ? `${(overview.total_revenue_today / 1_000_000).toFixed(1)}M RWF`
                : "—",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuickLink
          href="/admin/analytics"
          title="Platform analytics"
          description="Rides funnel, vehicle mix, driver performance, and satisfaction scores."
          stat="Insights"
        />
        <QuickLink
          href="/admin/reports"
          title="Reports"
          description="Generate and schedule CSV/PDF exports for leadership and finance."
          stat="Export"
        />
        <QuickLink
          href="/admin/heatmaps"
          title="Heatmaps"
          description="Demand zones and activity patterns across Kigali."
          stat="Maps"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Completed rides — last 14 days</h2>
          <Link href="/admin/analytics" className="text-xs font-medium text-primary hover:underline">
            Full analytics
          </Link>
        </div>
        <div className="mt-4">
          <MiniTrend days={rides} />
        </div>
      </div>
    </div>
  );
}
