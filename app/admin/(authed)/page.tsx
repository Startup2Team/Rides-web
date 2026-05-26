import type { ReactNode } from "react";

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
      className="h-4 w-4"
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
  arrowUp: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
      <path d="M7 14l5-5 5 5z" />
    </svg>
  ),
  arrowDown: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
      <path d="M7 10l5 5 5-5z" />
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
      <path d="M10 7l5 5-5 5z" />
    </svg>
  ),
};

type Trend = { direction: "up" | "down" | "flat"; value: string };

type Kpi = {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: Trend;
  badge?: { tone: "live" | "alert" | "info"; label: string };
  period?: string;
};

const kpis: Kpi[] = [
  {
    label: "Active Drivers",
    value: "142",
    icon: icons.drivers,
    trend: { direction: "up", value: "8%" },
    period: "vs last week",
  },
  {
    label: "Drivers Online",
    value: "89",
    icon: icons.signal,
    badge: { tone: "live", label: "Live" },
  },
  {
    label: "Active Rides",
    value: "247",
    icon: icons.route,
    trend: { direction: "up", value: "12%" },
    period: "vs yesterday",
  },
  {
    label: "Completed Today",
    value: "1,283",
    icon: icons.check,
    trend: { direction: "up", value: "5%" },
    period: "vs yesterday",
  },
  {
    label: "Cancelled Today",
    value: "47",
    icon: icons.cancel,
    trend: { direction: "down", value: "2%" },
    period: "vs yesterday",
  },
  {
    label: "Revenue Today",
    value: "4.2M RWF",
    icon: icons.money,
    trend: { direction: "up", value: "18%" },
    period: "vs yesterday",
  },
  {
    label: "Negotiations",
    value: "312",
    icon: icons.chat,
    trend: { direction: "up", value: "22%" },
    period: "vs yesterday",
  },
  {
    label: "Acceptance Rate",
    value: "87%",
    icon: icons.percent,
    trend: { direction: "flat", value: "0%" },
    period: "stable",
  },
  {
    label: "Live Requests",
    value: "12",
    icon: icons.bell,
    badge: { tone: "alert", label: "Urgent" },
  },
  {
    label: "Heatmap Index",
    value: "78",
    icon: icons.flame,
    badge: { tone: "info", label: "High" },
    period: "of 100",
  },
];

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {kpi.label}
        </p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          {kpi.icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        {kpi.value}
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[11px]">
        {kpi.trend ? (
          <>
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                kpi.trend.direction === "up"
                  ? "text-primary"
                  : kpi.trend.direction === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
              }`}
            >
              {kpi.trend.direction === "up" && icons.arrowUp}
              {kpi.trend.direction === "down" && icons.arrowDown}
              {kpi.trend.direction === "flat" && icons.arrowRight}
              {kpi.trend.value}
            </span>
            {kpi.period && (
              <span className="text-muted-foreground">{kpi.period}</span>
            )}
          </>
        ) : kpi.badge ? (
          <span className="flex items-center gap-1.5">
            <span
              className={`relative flex h-1.5 w-1.5 ${
                kpi.badge.tone === "live"
                  ? "text-primary"
                  : kpi.badge.tone === "alert"
                  ? "text-amber-500"
                  : "text-primary"
              }`}
            >
              {kpi.badge.tone === "live" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
              )}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            <span
              className={`font-semibold ${
                kpi.badge.tone === "alert"
                  ? "text-amber-600"
                  : kpi.badge.tone === "info"
                  ? "text-primary"
                  : "text-primary"
              }`}
            >
              {kpi.badge.label}
            </span>
            {kpi.period && (
              <span className="text-muted-foreground">{kpi.period}</span>
            )}
          </span>
        ) : null}
      </div>
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
        <span className="text-[10px] font-medium text-muted-foreground">
          247 active rides
        </span>
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
              <stop offset="0%" stopColor="#00C853" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#00C853" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
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
            stroke="#00C853"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M 80 60 Q 180 90 280 75 T 380 100"
            stroke="#00C853"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.65"
          />
        </svg>

        <div className="absolute z-10" style={{ top: "42%", left: "22%" }}>
          <div className="relative">
            <span className="absolute -inset-2 animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative block h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
          </div>
        </div>
        <div className="absolute z-10" style={{ top: "65%", left: "65%" }}>
          <div className="relative">
            <span className="absolute -inset-2 animate-ping rounded-full bg-primary opacity-40" />
            <span className="relative block h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
          </div>
        </div>
        <div className="absolute z-10" style={{ top: "28%", left: "52%" }}>
          <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
        </div>
        <div className="absolute z-10" style={{ top: "55%", left: "78%" }}>
          <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
        </div>
        <div className="absolute z-10" style={{ top: "78%", left: "30%" }}>
          <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
        </div>

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
            {icons.arrowUp}
            18%
          </span>
          <span className="text-muted-foreground">vs yesterday</span>
        </div>

        <div className="mt-4 flex-1">
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
              stroke="#00C853"
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
            <circle cx="160" cy="18" r="3" fill="#00C853" stroke="white" strokeWidth="1.5" />
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

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Ride Trend
        </h2>
        <span className="text-[10px] font-medium text-muted-foreground">
          7 days
        </span>
      </div>
      <div className="p-4">
        <div className="flex h-32 items-end justify-between gap-2">
          {data.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-muted"
                style={{ height: `${(d.x / max) * 100}%` }}
              />
              <div
                className="-mt-1 w-full rounded-b bg-primary"
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
            <span className="font-bold text-foreground">89</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-muted-foreground">On trip</span>
            </span>
            <span className="font-bold text-foreground">34</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="text-muted-foreground">Offline</span>
            </span>
            <span className="font-bold text-foreground">19</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopDriversWidget() {
  const drivers = [
    { name: "Aiden M.", rides: 28, w: "90%" },
    { name: "Beni K.", rides: 24, w: "78%" },
    { name: "Claude R.", rides: 21, w: "68%" },
    { name: "Diane U.", rides: 18, w: "58%" },
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
              <span className="text-[10px] font-bold">
                {d.name.charAt(0)}
              </span>
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

type Activity = {
  type: "ride" | "driver" | "complete";
  text: string;
  time: string;
};

const activities: Activity[] = [
  {
    type: "ride",
    text: "New ride request near Kimironko Market",
    time: "Just now",
  },
  {
    type: "complete",
    text: "Aiden M. completed trip to Kigali Heights",
    time: "2m",
  },
  {
    type: "driver",
    text: "Diane U. came online — Cab Taxi",
    time: "5m",
  },
  {
    type: "ride",
    text: "Negotiation agreed: 3,800 RWF (Nyamirambo route)",
    time: "8m",
  },
  {
    type: "complete",
    text: "Beni K. completed trip — 4.9 ★ rating received",
    time: "12m",
  },
  {
    type: "driver",
    text: "Claude R. submitted documents for verification",
    time: "21m",
  },
];

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
        <a
          href="#"
          className="text-[11px] font-medium text-muted-foreground hover:text-primary"
        >
          View all
        </a>
      </div>
      <ul className="divide-y divide-border">
        {activities.map((a, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                a.type === "ride"
                  ? "bg-primary/15 text-primary"
                  : a.type === "complete"
                  ? "bg-primary/15 text-primary"
                  : "bg-amber-400/15 text-amber-600"
              }`}
            >
              {a.type === "ride" && (
                <Icon>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" fill="currentColor" />
                </Icon>
              )}
              {a.type === "complete" && (
                <Icon>
                  <polyline points="20 6 9 17 4 12" />
                </Icon>
              )}
              {a.type === "driver" && (
                <Icon>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </Icon>
              )}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-foreground">
              {a.text}
            </p>
            <span className="shrink-0 text-[11px] text-muted-foreground">
              {a.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Alert = {
  tone: "danger" | "warn" | "info";
  title: string;
  detail: string;
  time: string;
};

const alerts: Alert[] = [
  {
    tone: "danger",
    title: "Emergency: SOS triggered",
    detail: "Ride #4821 · Aiden M. · Kimironko area",
    time: "3m",
  },
  {
    tone: "warn",
    title: "Driver complaint",
    detail: "Rider reported unsafe driving · Trip #4815",
    time: "14m",
  },
  {
    tone: "warn",
    title: "Possible fraud detected",
    detail: "Unusual cancellation pattern · 3 accounts",
    time: "32m",
  },
  {
    tone: "info",
    title: "Payment gateway latency",
    detail: "MoMo API responding above threshold",
    time: "1h",
  },
];

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
        <a
          href="#"
          className="text-[11px] font-medium text-muted-foreground hover:text-primary"
        >
          View all
        </a>
      </div>
      <ul className="divide-y divide-border">
        {alerts.map((a, i) => (
          <li key={i} className="px-4 py-3">
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
                <Icon>
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </Icon>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold tracking-tight text-foreground">
                  {a.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {a.detail}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {a.time}
              </span>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Executive Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
            Welcome back, Aiden 👋
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening on the platform today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            Today
            <span className="text-primary/70">×</span>
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            Week
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            Month
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            Custom
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

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
