"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DateSubtitle, Greeting } from "../_greeting";
import { PeriodFilter, periodLabel, periodToDays, readCustomRange, readPeriod } from "../_period-filter";
import { LiveMapWidget } from "../live-map-widget";
import { RideTrendWidget, DriverStatusWidget } from "../dashboard-side-widgets";
import { ActivityFeed, AlertsPanel } from "../dashboard-feed-widgets";
import { RecentMessagesWidget } from "../recent-messages-widget";
import {
  getDashboard,
  getAnalyticsOverviewData,
  getLiveRidesStats,
  getLiveRides,
  getDriversOverview,
  getTicketsStats,
  getInboxStats,
  getNegotiationsStats,
  type DashboardSnapshot,
  type AnalyticsOverview,
  type LiveRidesStats,
  type Ride,
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

const LIVE_STATUS_LABEL: Record<string, string> = {
  SEARCHING: "Searching",
  NEGOTIATING: "Negotiating",
  DRIVER_EN_ROUTE: "Driver en route",
  ON_TRIP: "On trip",
  ACCEPTED: "Accepted",
  PENDING: "Pending",
};

const TRANSPORT_LABEL: Record<string, string> = {
  MOTO_BIKE: "Moto",
  CAB_TAXI: "Cab",
  LIGHT_HILUX: "Hilux",
  HEAVY_FUSO: "Fuso",
  TUK_TUK: "Tuk Tuk",
};

function LivePipeline({ stats, loading }: { stats: LiveRidesStats | null; loading: boolean }) {
  const rows = stats
    ? [
        { label: "Searching", value: stats.searching },
        { label: "Negotiating", value: stats.negotiating },
        { label: "Driver en route", value: stats.driver_en_route },
        { label: "On trip", value: stats.on_trip },
      ]
    : [];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Live ride pipeline</h2>
        <Link href="/admin/live-rides" className="text-xs font-medium text-primary hover:underline">
          Live console
        </Link>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {loading ? "…" : `${stats?.total ?? 0} active rides right now`}
      </p>
      <ul className="mt-4 flex-1 space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
            ))
          : rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold tabular-nums text-foreground">{row.value}</span>
              </li>
            ))}
      </ul>
    </div>
  );
}

function OpsKpis({
  snapshot,
  analytics,
  drivers,
  tickets,
  inbox,
  neg,
  periodText,
  loading,
}: {
  snapshot: DashboardSnapshot | null;
  analytics: AnalyticsOverview | null;
  drivers: { online: number; on_trip: number; pending: number } | null;
  tickets: { open: number; pending: number } | null;
  inbox: { new: number } | null;
  neg: { total_today: number } | null;
  periodText: string;
  loading: boolean;
}) {
  const kpis = [
    { label: "Active rides", value: snapshot?.liveRides, live: true },
    { label: "Drivers online", value: snapshot?.onlineDrivers, live: true },
    { label: `Rides (${periodText})`, value: snapshot?.ridesInPeriod },
    { label: "Active drivers", value: analytics?.active_drivers },
    { label: "On trip (drivers)", value: drivers?.on_trip },
    { label: "Pending KYC", value: snapshot?.pendingVerifications },
    { label: "Open tickets", value: tickets?.open },
    { label: "Inbox (new)", value: inbox?.new },
    { label: "Negotiations today", value: neg?.total_today },
    { label: "Open incidents", value: snapshot?.openIncidents },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/25"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {kpi.label}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {loading || kpi.value == null ? "…" : String(kpi.value)}
            </p>
            {kpi.live && !loading && kpi.value != null ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                Live
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveRidesList({ rides, loading }: { rides: Ride[]; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Active rides snapshot</h2>
        <Link href="/admin/live-rides" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      {loading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading…</p>
      ) : rides.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No live rides in progress.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {rides.map((ride) => (
            <li key={ride.id} className="py-3">
              <Link
                href={`/admin/live-rides?highlight=${ride.id}`}
                className="flex flex-wrap items-start justify-between gap-2 text-xs hover:opacity-80"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {TRANSPORT_LABEL[ride.transport_type] ?? ride.transport_type} ·{" "}
                    {LIVE_STATUS_LABEL[ride.status] ?? ride.status}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {ride.pickup_address} → {ride.destination_address}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {ride.customer?.name ?? ride.customer?.phone ?? "Customer"}
                    {ride.driver?.name || ride.driver?.phone
                      ? ` · ${ride.driver?.name ?? ride.driver?.phone}`
                      : ""}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {ride.id.slice(0, 8)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function OperationsDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const range = readCustomRange(searchParams);
  const isCustom = period === "custom" && range !== null;
  const days = periodToDays(period);
  const label = periodLabel(period, range);
  const fetchKey = isCustom ? `from=${range!.from}&to=${range!.to}` : `days=${days}`;

  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [liveStats, setLiveStats] = useState<LiveRidesStats | null>(null);
  const [drivers, setDrivers] = useState<{
    online: number;
    on_trip: number;
    pending: number;
  } | null>(null);
  const [tickets, setTickets] = useState<{ open: number; pending: number } | null>(null);
  const [inbox, setInbox] = useState<{ new: number } | null>(null);
  const [neg, setNeg] = useState<{ total_today: number } | null>(null);
  const [liveRides, setLiveRides] = useState<Ride[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const dashboardCall = isCustom
      ? getDashboard({ from: range!.from, to: range!.to })
      : getDashboard({ days });

    Promise.all([
      dashboardCall,
      getAnalyticsOverviewData(),
      getLiveRidesStats(),
      getDriversOverview(),
      getTicketsStats(),
      getInboxStats(),
      getNegotiationsStats(),
      getLiveRides({ limit: "6", offset: "0" }),
    ])
      .then(([snap, anl, stats, drv, tix, inboxRes, negRes, ridesRes]) => {
        if (cancelled) return;
        setSnapshot(snap);
        setAnalytics(anl);
        setLiveStats(stats);
        setDrivers({
          online: drv.online,
          on_trip: drv.on_trip,
          pending: drv.pending,
        });
        setTickets({ open: tix.open, pending: tix.pending });
        setInbox({ new: inboxRes.new });
        setNeg({ total_today: negRes.total_today });
        setLiveRides(ridesRes.rides ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setSnapshot(null);
          setAnalytics(null);
          setLiveStats(null);
          setDrivers(null);
          setTickets(null);
          setInbox(null);
          setNeg(null);
          setLiveRides([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Operations Manager
          </p>
          <Greeting />
          <DateSubtitle />
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Live fleet and ride control for {user?.name ?? "your team"}. Monitor the map, intervene
            on active trips, and route support work across drivers, safety, and inbox.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodFilter />
          <Link
            href="/admin/live-rides"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Open live rides
          </Link>
        </div>
      </div>

      <OpsKpis
        snapshot={snapshot}
        analytics={analytics}
        drivers={drivers}
        tickets={tickets}
        inbox={inbox}
        neg={neg}
        periodText={label}
        loading={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href="/admin/live-rides"
          title="Live rides"
          description="Watch and intervene on in-progress trips across the city."
          stat="Live"
        />
        <QuickLink
          href="/admin/drivers"
          title="Drivers"
          description="Verify KYC, manage availability, and review fleet status."
          stat="Fleet"
        />
        <QuickLink
          href="/admin/negotiations"
          title="Negotiations"
          description="Fare talks between riders and drivers that need attention."
          stat="Fares"
        />
        <QuickLink
          href="/admin/safety-center"
          title="Safety center"
          description="Incidents, GPS anomalies, and trust & safety workflows."
          stat="Safety"
        />
        <QuickLink
          href="/admin/customers"
          title="Customers"
          description="Rider accounts, ride history, and customer lookup."
          stat="Riders"
        />
        <QuickLink
          href="/admin/heatmaps"
          title="Heatmaps"
          description="Demand and supply patterns to position drivers."
          stat="Maps"
        />
        <QuickLink
          href="/admin/support"
          title="Support"
          description="Tickets from riders and drivers — assign and resolve."
          stat="Tickets"
        />
        <QuickLink
          href="/admin/inbox"
          title="Inbox"
          description="Contact form and outreach messages from the public site."
          stat="Inbox"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <LiveMapWidget />
        </div>
        <div className="lg:col-span-4">
          <LivePipeline stats={liveStats} loading={loading} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RideTrendWidget />
        <DriverStatusWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-5">
          <AlertsPanel />
        </div>
      </div>

      <LiveRidesList rides={liveRides} loading={loading} />

      <RecentMessagesWidget />
    </div>
  );
}
