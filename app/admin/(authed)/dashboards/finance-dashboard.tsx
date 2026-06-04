"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DateSubtitle, Greeting } from "../_greeting";
import {
  getRevenue,
  getRevenueKPIs,
  getRevenueSeries,
  getTransactions,
  type RevenueSeries,
  type Transaction,
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";

function formatLargeRWF(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M RWF`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K RWF`;
  return `${n.toLocaleString("en-US")} RWF`;
}

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

function RevenueTrend({ series }: { series: RevenueSeries | null }) {
  const points = useMemo(() => {
    if (!series?.current?.points?.length) return [];
    return series.current.points.slice(-14);
  }, [series]);

  if (!points.length) {
    return (
      <p className="text-xs text-muted-foreground">No revenue trend data for this period yet.</p>
    );
  }

  const max = Math.max(...points.map((p) => p.v), 1);
  return (
    <div className="flex h-24 items-end gap-1">
      {points.map((p) => (
        <div
          key={p.t}
          className="flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
          style={{ height: `${Math.max(8, (p.v / max) * 100)}%` }}
          title={`${p.t}: ${formatLargeRWF(p.v)}`}
        />
      ))}
    </div>
  );
}

const TRANSPORT_LABEL: Record<string, string> = {
  MOTO_BIKE: "Moto",
  CAB_TAXI: "Cab",
  LIGHT_HILUX: "Hilux",
  HEAVY_FUSO: "Fuso",
  TUK_TUK: "Tuk Tuk",
};

export function FinanceDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [monthGross, setMonthGross] = useState<number | null>(null);
  const [monthCommission, setMonthCommission] = useState<number | null>(null);
  const [monthPayouts, setMonthPayouts] = useState<number | null>(null);
  const [monthTrips, setMonthTrips] = useState<number | null>(null);
  const [monthGrossDelta, setMonthGrossDelta] = useState<number | null>(null);
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [todayRides, setTodayRides] = useState<number | null>(null);
  const [todayRevChange, setTodayRevChange] = useState<number | null>(null);
  const [series, setSeries] = useState<RevenueSeries | null>(null);
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getRevenue("month"),
      getRevenueKPIs("today"),
      getRevenueSeries({ days: 30 }),
      getTransactions({ limit: "5", offset: "0" }),
    ])
      .then(([month, today, revSeries, txRes]) => {
        if (cancelled) return;
        const m = month as unknown as Record<string, unknown>;
        setMonthGross((m.gross as number) ?? 0);
        setMonthCommission((m.commission as number) ?? 0);
        setMonthPayouts((m.payouts as number) ?? 0);
        setMonthTrips((m.trips as number) ?? 0);
        const deltas = (m.deltas ?? {}) as Record<string, number>;
        setMonthGrossDelta(deltas.gross ?? 0);

        const t = today as Record<string, unknown>;
        setTodayRevenue((t.revenue_total as number) ?? 0);
        setTodayRides((t.ride_count as number) ?? 0);
        setTodayRevChange((t.revenue_change_pct as number) ?? 0);

        setSeries(revSeries);
        setRecentTx(txRes.transactions ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setMonthGross(null);
          setMonthCommission(null);
          setMonthPayouts(null);
          setMonthTrips(null);
          setTodayRevenue(null);
          setTodayRides(null);
          setSeries(null);
          setRecentTx([]);
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
            Finance Manager
          </p>
          <Greeting />
          <DateSubtitle />
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Revenue, commissions, and payouts for {user?.name ?? "your team"}. Review transactions,
            run disbursements, and export reports from your allowed pages.
          </p>
        </div>
        <Link
          href="/admin/revenue"
          className="inline-flex w-fit items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          Open revenue console
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Gross revenue (month)",
            value: loading || monthGross == null ? "…" : formatLargeRWF(monthGross),
            hint:
              !loading && monthGrossDelta != null
                ? `${monthGrossDelta >= 0 ? "+" : ""}${Math.round(monthGrossDelta)}% vs prior period`
                : undefined,
          },
          {
            label: "Platform commission (month)",
            value: loading || monthCommission == null ? "…" : formatLargeRWF(monthCommission),
            hint: "15% of completed fares",
          },
          {
            label: "Driver payouts (month)",
            value: loading || monthPayouts == null ? "…" : formatLargeRWF(monthPayouts),
            hint: "Net after commission",
          },
          {
            label: "Completed trips (month)",
            value: loading || monthTrips == null ? "…" : String(monthTrips),
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
            {kpi.hint ? (
              <p className="mt-1 text-[11px] text-muted-foreground">{kpi.hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Today
          </p>
          <p className="mt-2 text-xl font-bold text-foreground">
            {loading || todayRevenue == null ? "…" : formatLargeRWF(todayRevenue)}
          </p>
          <p className="text-xs text-muted-foreground">
            {loading || todayRides == null ? "…" : `${todayRides} completed rides`}
            {!loading && todayRevChange != null ? (
              <span
                className={
                  todayRevChange >= 0 ? " text-primary font-medium" : " text-red-600 font-medium"
                }
              >
                {" "}
                · {todayRevChange >= 0 ? "+" : ""}
                {Math.round(todayRevChange)}% vs yesterday
              </span>
            ) : null}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Revenue trend
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Last 30 days (daily buckets)</p>
          {series && series.deltaPct !== 0 ? (
            <p className="mt-2 text-xs font-medium text-primary">
              {series.deltaPct >= 0 ? "+" : ""}
              {Math.round(series.deltaPct)}% vs previous window
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuickLink
          href="/admin/revenue"
          title="Revenue & payouts"
          description="Full ledger, period filters, vehicle mix, and batch disbursement to drivers."
          stat="Finance"
        />
        <QuickLink
          href="/admin/reports"
          title="Reports & exports"
          description="Schedule and download CSV/PDF reports for finance and leadership."
          stat="Export"
        />
        <QuickLink
          href="/admin/analytics"
          title="Revenue analytics"
          description="Breakdowns, vehicle mix, and platform KPIs that support financial planning."
          stat="Insights"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Revenue — last 14 buckets</h2>
          <Link href="/admin/revenue" className="text-xs font-medium text-primary hover:underline">
            Revenue console
          </Link>
        </div>
        <div className="mt-4">
          <RevenueTrend series={series} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Recent transactions</h2>
          <Link href="/admin/revenue" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="mt-4 text-xs text-muted-foreground">Loading…</p>
        ) : recentTx.length === 0 ? (
          <p className="mt-4 text-xs text-muted-foreground">No completed rides in the ledger yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recentTx.map((tx) => {
              const fare = tx.fare ?? 0;
              const label = TRANSPORT_LABEL[tx.transport_type] ?? tx.transport_type;
              const when = tx.completed_at
                ? new Date(tx.completed_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";
              return (
                <li
                  key={tx.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {label} · {formatLargeRWF(fare)}
                    </p>
                    <p className="text-muted-foreground">
                      {tx.customer?.name ?? tx.customer?.phone ?? "Customer"} →{" "}
                      {tx.driver?.name ?? tx.driver?.phone ?? "Driver"}
                    </p>
                  </div>
                  <span className="text-muted-foreground">{when}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
