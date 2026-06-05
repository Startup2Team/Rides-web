import type { ReactNode } from "react";
import Link from "next/link";
import { DateSubtitle, Greeting } from "./_greeting";
import { PeriodFilter } from "./_period-filter";
import { DashboardKpis } from "./dashboard-kpis";
import { RevenueWidget } from "./revenue-widget";
import { RideTrendWidget, DriverStatusWidget, TopDriversWidget } from "./dashboard-side-widgets";
import { ActivityFeed, AlertsPanel } from "./dashboard-feed-widgets";
import { LiveMapWidget } from "./live-map-widget";
import { RecentMessagesWidget } from "./recent-messages-widget";

export const metadata = {
  title: "Admin · Dashboard",
  robots: { index: false, follow: false },
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons = {
  drivers: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Icon>
  ),
  signal: (
    <Icon>
      <path d="M5 12a7 7 0 0 1 14 0M2 12a10 10 0 0 1 20 0M8 12a4 4 0 0 1 8 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </Icon>
  ),
  route: (
    <Icon>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </Icon>
  ),
  check: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </Icon>
  ),
  cancel: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </Icon>
  ),
  money: (
    <Icon>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Icon>
  ),
  chat: (
    <Icon>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  ),
  percent: (
    <Icon>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </Icon>
  ),
  bell: (
    <Icon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  ),
  flame: (
    <Icon>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Icon>
  ),
};

type TrendDir = "up" | "down" | "flat";
type BadgeTone = "live" | "alert" | "info";
type Kpi = {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { direction: TrendDir; value: string };
  badge?: { tone: BadgeTone; label: string };
  period?: string;
  spark: number[];
};

const kpis: Kpi[] = [
  {
    label: "Active Drivers",
    value: "142",
    icon: icons.drivers,
    trend: { direction: "up", value: "8%" },
    period: "vs last week",
    spark: [120, 128, 132, 135, 138, 140, 142],
  },
  {
    label: "Drivers Online",
    value: "89",
    icon: icons.signal,
    badge: { tone: "live", label: "Live" },
    period: "of 142 active",
    spark: [82, 84, 85, 87, 88, 87, 89],
  },
  {
    label: "Active Rides",
    value: "247",
    icon: icons.route,
    trend: { direction: "up", value: "12%" },
    period: "vs yesterday",
    spark: [200, 210, 218, 225, 232, 240, 247],
  },
  {
    label: "Completed Today",
    value: "1,283",
    icon: icons.check,
    trend: { direction: "up", value: "5%" },
    period: "vs yesterday",
    spark: [1100, 1150, 1200, 1230, 1250, 1270, 1283],
  },
  {
    label: "Cancelled Today",
    value: "47",
    icon: icons.cancel,
    trend: { direction: "down", value: "2%" },
    period: "vs yesterday",
    spark: [55, 53, 52, 50, 49, 48, 47],
  },
  {
    label: "Revenue Today",
    value: "4.2M RWF",
    icon: icons.money,
    trend: { direction: "up", value: "18%" },
    period: "vs yesterday",
    spark: [2.5, 2.8, 3.0, 3.3, 3.7, 4.0, 4.2],
  },
  {
    label: "Negotiations",
    value: "312",
    icon: icons.chat,
    trend: { direction: "up", value: "22%" },
    period: "vs yesterday",
    spark: [240, 255, 268, 280, 292, 305, 312],
  },
  {
    label: "Acceptance Rate",
    value: "87%",
    icon: icons.percent,
    trend: { direction: "flat", value: "0%" },
    period: "stable",
    spark: [86, 87, 86, 88, 87, 86, 87],
  },
  {
    label: "Live Requests",
    value: "12",
    icon: icons.bell,
    badge: { tone: "alert", label: "Urgent" },
    period: "in queue now",
    spark: [5, 7, 8, 10, 11, 12, 12],
  },
  {
    label: "Heatmap Index",
    value: "78",
    icon: icons.flame,
    badge: { tone: "info", label: "High" },
    period: "of 100",
    spark: [65, 68, 72, 75, 76, 77, 78],
  },
];

function Sparkline({
  data,
  tone,
}: {
  data: number[];
  tone: "up" | "down" | "flat" | "alert" | "live" | "info";
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 24;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;

  const stroke =
    tone === "down"
      ? "#ef4444"
      : tone === "flat"
      ? "#9ca3af"
      : tone === "alert"
      ? "#f59e0b"
      : "#007AFF";
  const fill =
    tone === "down"
      ? "rgba(239,68,68,0.1)"
      : tone === "flat"
      ? "rgba(156,163,175,0.08)"
      : tone === "alert"
      ? "rgba(245,158,11,0.12)"
      : "rgba(0,200,83,0.12)";
  const lastPoint = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      className="block h-7 w-full"
    >
      <path d={area} fill={fill} />
      <path d={line} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="2" fill={stroke} />
    </svg>
  );
}

function TrendPill({ direction, value }: { direction: TrendDir; value: string }) {
  const tone =
    direction === "up"
      ? "bg-primary/10 text-primary"
      : direction === "down"
      ? "bg-red-50 text-red-600"
      : "bg-muted text-muted-foreground";
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tone}`}
    >
      <span>{arrow}</span>
      <span>{value}</span>
    </span>
  );
}

function LivePill({ tone, label }: { tone: BadgeTone; label: string }) {
  const styles =
    tone === "alert"
      ? "bg-amber-50 text-amber-700"
      : "bg-primary/10 text-primary";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${styles}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {tone === "live" ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
        ) : null}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {label}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const sparkTone: "up" | "down" | "flat" | "alert" | "live" | "info" = kpi.trend
    ? kpi.trend.direction
    : kpi.badge
    ? kpi.badge.tone
    : "up";

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
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {kpi.value}
        </span>
        {kpi.trend ? <TrendPill {...kpi.trend} /> : null}
        {kpi.badge ? <LivePill {...kpi.badge} /> : null}
      </div>

      <div className="mt-3">
        <Sparkline data={kpi.spark} tone={sparkTone} />
      </div>

      {kpi.period ? (
        <p className="mt-1.5 text-[10px] font-medium text-muted-foreground">
          {kpi.period}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Greeting />
          <DateSubtitle />
        </div>
        <PeriodFilter />
      </div>

      <DashboardKpis />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <LiveMapWidget />
        </div>
        <div className="lg:col-span-4">
          <RevenueWidget />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RideTrendWidget />
        <DriverStatusWidget />
        <TopDriversWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-5">
          <AlertsPanel />
        </div>
      </div>

      <RecentMessagesWidget />
    </div>
  );
}
