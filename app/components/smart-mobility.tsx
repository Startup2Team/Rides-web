const platformFeatures = [
  {
    title: "Real-Time Ride Tracking",
    description:
      "Track rides and deliveries live with accurate location updates, route monitoring, and estimated arrival times.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Demand Heatmaps",
    description:
      "Visualize busy areas and high-demand zones instantly to improve driver allocation and ride efficiency.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    title: "Smart Driver Allocation",
    description:
      "Automatically match customers with the best nearby drivers based on availability, ratings, and proximity.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <path d="M8 6h7.5M8 8l8 8M18 8.5v7" />
      </svg>
    ),
  },
  {
    title: "Operational Intelligence",
    description:
      "Monitor platform performance, ride activity, and logistics operations through intelligent real-time analytics.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="3" y1="20" x2="21" y2="20" />
      </svg>
    ),
  },
];

function LiveOpsDashboard() {
  return (
    <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Live Operations
          </span>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
            Today
          </span>
          <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
            Week
          </span>
          <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
            Month
          </span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">
          12:34
        </span>
      </div>

      <img
        src="/maps/map.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      <svg
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="heat-primary-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#007AFF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-warm-light" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="355" cy="95" r="60" fill="url(#heat-primary-light)" />
        <circle cx="60" cy="285" r="50" fill="url(#heat-warm-light)" />
        <circle cx="195" cy="285" r="45" fill="url(#heat-primary-light)" opacity="0.85" />

        <path
          d="M 40 270 Q 130 230 200 240 T 360 200"
          stroke="#007AFF"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M 80 90 Q 180 130 280 110 T 380 150"
          stroke="#007AFF"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.65"
        />
      </svg>

      <div className="absolute z-10" style={{ top: "40%", left: "22%" }}>
        <div className="relative">
          <span className="absolute -inset-2 animate-ping rounded-full bg-primary opacity-40" />
          <span className="relative block h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
        </div>
      </div>
      <div className="absolute z-10" style={{ top: "62%", left: "65%" }}>
        <div className="relative">
          <span className="absolute -inset-2 animate-ping rounded-full bg-primary opacity-40" />
          <span className="relative block h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
        </div>
      </div>
      <div className="absolute z-10" style={{ top: "26%", left: "52%" }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
      </div>
      <div className="absolute z-10" style={{ top: "55%", left: "78%" }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
      </div>
      <div className="absolute z-10" style={{ top: "75%", left: "30%" }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
      </div>

      <div className="absolute left-4 top-14 z-30 w-40 rounded-2xl border border-border bg-card/85 p-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Rides
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-foreground">
                247
              </span>
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
                  <path d="M7 14l5-5 5 5z" />
                </svg>
                12%
              </span>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 100 30" className="mt-2 h-7 w-full" aria-hidden>
          <path
            d="M0 25 Q 18 22 30 18 T 60 10 T 100 6 L 100 30 L 0 30 Z"
            fill="rgba(0,200,83,0.15)"
          />
          <path
            d="M0 25 Q 18 22 30 18 T 60 10 T 100 6"
            stroke="#007AFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute bottom-4 right-4 z-30 w-44 rounded-2xl border border-border bg-card/85 p-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Online Drivers
            </div>
            <div className="mt-1 text-xl font-bold tracking-tight text-foreground">
              89
            </div>
          </div>
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
            Live
          </span>
        </div>
        <svg viewBox="0 0 100 30" className="mt-2 h-7 w-full" aria-hidden>
          <path
            d="M0 22 Q 20 12 40 16 T 80 6 L 100 8 L 100 30 L 0 30 Z"
            fill="rgba(0,200,83,0.15)"
          />
          <path
            d="M0 22 Q 20 12 40 16 T 80 6 L 100 8"
            stroke="#007AFF"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="absolute right-4 top-14 z-30 rounded-xl border border-border bg-card/85 px-3 py-2 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hot Zone
            </div>
            <div className="text-xs font-bold text-foreground">3 active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartMobility() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The Platform
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            Built for <span className="text-primary">Real-Time</span> Movement
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Monitor rides, deliveries, drivers, and demand zones live through
            intelligent tracking and operational technology.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <LiveOpsDashboard />
          </div>

          <div className="lg:col-span-5">
            <ul className="space-y-3">
              {platformFeatures.map((f) => (
                <li
                  key={f.title}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {f.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
