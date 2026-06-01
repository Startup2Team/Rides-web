import type { ReactNode } from "react";
import Link from "next/link";
import { DateSubtitle, Greeting } from "./_greeting";
import { PeriodFilter } from "./_period-filter";
import { DashboardKpis } from "./dashboard-kpis";

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

function LiveMapWidget() {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Live Operations Map
          </h2>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold text-foreground">
            247 active rides
          </div>
          <div className="text-[10px] text-muted-foreground">
            Updated just now
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src="/maps/map.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />

        <svg
          viewBox="0 0 400 225"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <radialGradient id="heat-prim" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#007AFF" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#007AFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-amb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="355" cy="65" r="50" fill="url(#heat-prim)" />
          <circle cx="60" cy="185" r="45" fill="url(#heat-amb)" />
          <circle cx="190" cy="180" r="38" fill="url(#heat-prim)" opacity="0.8" />

          <path
            d="M 40 180 Q 130 150 200 165 T 360 130"
            stroke="#007AFF"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 80 60 Q 180 90 280 75 T 380 100"
            stroke="#007AFF"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.65"
          />
        </svg>

        {[
          { top: "42%", left: "22%" },
          { top: "65%", left: "65%" },
          { top: "18%", left: "38%" },
          { top: "32%", left: "72%" },
          { top: "50%", left: "15%" },
          { top: "70%", left: "50%" },
          { top: "85%", left: "65%" },
        ].map((p, i) => (
          <div key={`a${i}`} className="absolute z-10" style={p}>
            <div className="relative">
              <span className="absolute -inset-2 animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative block h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
            </div>
          </div>
        ))}
        {[
          { top: "28%", left: "52%" },
          { top: "55%", left: "78%" },
          { top: "78%", left: "30%" },
          { top: "22%", left: "12%" },
          { top: "38%", left: "88%" },
          { top: "60%", left: "18%" },
          { top: "48%", left: "42%" },
          { top: "72%", left: "88%" },
          { top: "88%", left: "25%" },
          { top: "25%", left: "68%" },
        ].map((p, i) => (
          <div key={`i${i}`} className="absolute z-10" style={p}>
            <span className="block h-2.5 w-2.5 rounded-full bg-foreground/85 ring-[3px] ring-card shadow-sm" />
          </div>
        ))}

        <div className="absolute bottom-3 left-3 z-20 rounded-xl border border-border bg-card/85 px-3 py-2 shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Online drivers
              </div>
              <div className="text-base font-bold text-foreground">89</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hot zones
              </div>
              <div className="flex items-center gap-1 text-base font-bold text-foreground">
                3
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueWidget() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Revenue Today
        </h2>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          Live
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          4,250,000 RWF
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-0.5 font-semibold text-primary">
            ↑ 18%
          </span>
          <span className="text-muted-foreground">vs yesterday</span>
        </div>

        <div className="relative mt-4 flex-1">
          <div className="absolute right-2 top-0 z-10 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-md">
            <div className="text-[8px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Peak
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold text-foreground">
                17:00
              </span>
              <span className="text-[11px] font-bold text-primary">520K</span>
            </div>
          </div>
          <svg
            viewBox="0 0 200 80"
            preserveAspectRatio="none"
            aria-hidden
            className="h-full w-full"
          >
            <path
              d="M0 65 Q 20 55 40 50 T 80 35 T 120 30 T 160 18 T 200 10 L 200 80 L 0 80 Z"
              fill="rgba(0,200,83,0.15)"
            />
            <path
              d="M0 65 Q 20 55 40 50 T 80 35 T 120 30 T 160 18 T 200 10"
              stroke="#007AFF"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M0 72 Q 20 68 40 65 T 80 55 T 120 50 T 160 45 T 200 40"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="1.25"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="3 3"
            />
            <line
              x1="160"
              x2="160"
              y1="0"
              y2="80"
              stroke="rgba(0,200,83,0.4)"
              strokeWidth="0.75"
              strokeDasharray="2 2"
            />
            <circle cx="160" cy="18" r="3" fill="#007AFF" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-3 rounded-full bg-primary" />
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-3 bg-muted-foreground/50" />
            Yesterday
          </span>
        </div>
      </div>
    </div>
  );
}

function RideTrendWidget() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const data = [
    { c: 120, x: 18 },
    { c: 145, x: 22 },
    { c: 168, x: 28 },
    { c: 152, x: 24 },
    { c: 198, x: 32 },
    { c: 220, x: 35 },
    { c: 185, x: 26 },
  ];
  const max = 260;

  const totalWeek = data.reduce((acc, d) => acc + d.c + d.x, 0);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Ride Trend
          </h2>
          <p className="text-[10px] text-muted-foreground">
            {totalWeek.toLocaleString()} rides this week
          </p>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">
          7 days
        </span>
      </div>
      <div className="p-4">
        <div className="flex h-32 items-end justify-between gap-2">
          {data.map((d, i) => (
            <div
              key={i}
              className="flex h-full flex-1 flex-col items-center justify-end gap-0.5"
            >
              <div
                className="w-full rounded-t bg-muted"
                style={{ height: `${(d.x / max) * 100}%` }}
              />
              <div
                className="w-full rounded-b-sm bg-primary"
                style={{ height: `${(d.c / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between px-1">
          {days.map((d, i) => (
            <span
              key={i}
              className={`text-[9px] ${
                i === 5
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-primary" />
            Completed
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-muted" />
            Cancelled
          </span>
        </div>
      </div>
    </div>
  );
}

function DriverStatusWidget() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Driver Status
        </h2>
        <span className="text-[10px] font-medium text-muted-foreground">
          Now
        </span>
      </div>
      <div className="flex items-center gap-4 p-4">
        <svg viewBox="0 0 40 40" aria-hidden className="h-20 w-20 shrink-0">
          <circle cx="20" cy="20" r="14" fill="none" strokeWidth="5" className="stroke-muted" />
          <circle
            cx="20"
            cy="20"
            r="14"
            fill="none"
            strokeWidth="5"
            strokeDasharray="58 100"
            className="stroke-primary"
            transform="rotate(-90 20 20)"
            strokeLinecap="round"
          />
          <circle
            cx="20"
            cy="20"
            r="14"
            fill="none"
            strokeWidth="5"
            strokeDasharray="22 100"
            strokeDashoffset="-58"
            className="stroke-amber-400"
            transform="rotate(-90 20 20)"
            strokeLinecap="round"
          />
        </svg>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Online</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-bold text-foreground">89</span>
              <span className="text-[10px] font-semibold text-primary">+5</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-muted-foreground">On trip</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-bold text-foreground">34</span>
              <span className="text-[10px] font-semibold text-primary">+3</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">Offline</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="font-bold text-foreground">19</span>
              <span className="text-[10px] font-semibold text-primary">−8</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopDriversWidget() {
  const drivers = [
    { name: "Aiden M.", rides: 28, w: "90%", online: true },
    { name: "Beni K.", rides: 24, w: "78%", online: true },
    { name: "Claude R.", rides: 21, w: "68%", online: false },
    { name: "Diane U.", rides: 18, w: "58%", online: true },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Top Drivers
        </h2>
        <span className="text-[10px] font-medium text-muted-foreground">
          Today
        </span>
      </div>
      <ul className="space-y-3 p-4">
        {drivers.map((d, i) => (
          <li key={d.name} className="flex items-center gap-3">
            <span className="w-3 text-[10px] font-bold text-muted-foreground">
              {i + 1}
            </span>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
              <span className="text-[10px] font-bold">
                {d.name.charAt(0)}
              </span>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                  d.online ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground">
                {d.name}
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: d.w }}
                />
              </div>
            </div>
            <span className="text-xs font-bold text-foreground">{d.rides}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ActivityKind =
  | "ride_request"
  | "ride_complete"
  | "driver_online"
  | "driver_document"
  | "negotiation";

type Activity = {
  kind: ActivityKind;
  text: string;
  time: string;
};

const activities: Activity[] = [
  {
    kind: "ride_request",
    text: "New ride request near Kimironko Market",
    time: "Just now",
  },
  {
    kind: "ride_complete",
    text: "Aiden M. completed trip to Kigali Heights",
    time: "2m",
  },
  {
    kind: "driver_online",
    text: "Diane U. came online — Cab Taxi",
    time: "5m",
  },
  {
    kind: "negotiation",
    text: "Negotiation agreed: 3,800 RWF (Nyamirambo route)",
    time: "8m",
  },
  {
    kind: "ride_complete",
    text: "Beni K. completed trip — 4.9 ★ rating received",
    time: "12m",
  },
  {
    kind: "driver_document",
    text: "Claude R. submitted documents for verification",
    time: "21m",
  },
];

const activityMeta: Record<
  ActivityKind,
  { icon: ReactNode; tone: "positive" | "neutral" }
> = {
  ride_request: {
    icon: (
      <ActivityFeedIcon>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" fill="currentColor" />
      </ActivityFeedIcon>
    ),
    tone: "positive",
  },
  ride_complete: {
    icon: (
      <ActivityFeedIcon>
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
      </ActivityFeedIcon>
    ),
    tone: "positive",
  },
  driver_online: {
    icon: (
      <ActivityFeedIcon>
        <path d="M5 12a7 7 0 0 1 14 0" />
        <path d="M2 12a10 10 0 0 1 20 0" />
        <path d="M8 12a4 4 0 0 1 8 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </ActivityFeedIcon>
    ),
    tone: "positive",
  },
  driver_document: {
    icon: (
      <ActivityFeedIcon>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </ActivityFeedIcon>
    ),
    tone: "neutral",
  },
  negotiation: {
    icon: (
      <ActivityFeedIcon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="14" x2="13" y2="14" />
      </ActivityFeedIcon>
    ),
    tone: "positive",
  },
};

function ActivityFeedIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function ActivityFeed() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Recent Activity
          </h2>
        </div>
        <Link
          href="/admin/live-rides"
          className="text-[11px] font-medium text-muted-foreground hover:text-primary"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {activities.map((a, i) => {
          const meta = activityMeta[a.kind];
          return (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  meta.tone === "positive"
                    ? "bg-primary/15 text-primary"
                    : "bg-amber-400/15 text-amber-600"
                }`}
              >
                {meta.icon}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                {a.text}
              </p>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {a.time}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type AlertKind = "sos" | "complaint" | "fraud" | "system";

type Alert = {
  kind: AlertKind;
  tone: "danger" | "warn";
  title: string;
  detail: string;
  time: string;
};

const alerts: Alert[] = [
  {
    kind: "sos",
    tone: "danger",
    title: "Emergency: SOS triggered",
    detail: "Ride #4821 · Aiden M. · Kimironko area",
    time: "3m",
  },
  {
    kind: "complaint",
    tone: "warn",
    title: "Driver complaint",
    detail: "Rider reported unsafe driving · Trip #4815",
    time: "14m",
  },
  {
    kind: "fraud",
    tone: "warn",
    title: "Possible fraud detected",
    detail: "Unusual cancellation pattern · 3 accounts",
    time: "32m",
  },
  {
    kind: "system",
    tone: "warn",
    title: "Payment gateway latency",
    detail: "MoMo API responding above threshold",
    time: "1h",
  },
];

const alertIcons: Record<AlertKind, ReactNode> = {
  sos: (
    <ActivityFeedIcon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <line x1="12" y1="10" x2="12" y2="14" />
    </ActivityFeedIcon>
  ),
  complaint: (
    <ActivityFeedIcon>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="9" y1="10" x2="15" y2="10" />
      <line x1="9" y1="14" x2="13" y2="14" />
    </ActivityFeedIcon>
  ),
  fraud: (
    <ActivityFeedIcon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </ActivityFeedIcon>
  ),
  system: (
    <ActivityFeedIcon>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </ActivityFeedIcon>
  ),
};

function AlertsPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-500" />
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Alerts
          </h2>
          <span className="ml-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600">
            {alerts.length}
          </span>
        </div>
        <Link
          href="/admin/safety-center"
          className="text-[11px] font-medium text-muted-foreground hover:text-primary"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {alerts.map((a, i) => (
          <li key={i} className="px-4 py-3">
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  a.tone === "danger"
                    ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200"
                    : "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200"
                }`}
              >
                {alertIcons[a.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                    {a.title}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {a.time}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {a.detail}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {a.kind === "sos" ? (
                    <button className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-red-700">
                      Respond
                    </button>
                  ) : (
                    <button className="rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-surface">
                      View
                    </button>
                  )}
                  <button className="text-[10px] font-medium text-muted-foreground hover:text-foreground">
                    {a.kind === "sos" ? "Dispatch" : "Resolve"}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Greeting name="Aiden" />
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
    </div>
  );
}
