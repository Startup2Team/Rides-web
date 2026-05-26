import Link from "next/link";

const trustedBy = ["Brand One", "Brand Two", "Brand Three", "Brand Four"];

const sidebarItems = [
  "Home",
  "Features",
  "How It Works",
  "Drivers",
  "Safety",
  "About",
  "Contact",
];

const metrics = ["Active Rides", "Total Drivers", "Total Riders", "Trips Today"];

const topDrivers = [
  { name: "Driver One", w: "75%" },
  { name: "Driver Two", w: "60%" },
  { name: "Driver Three", w: "50%" },
];

const activityWidths = ["75%", "55%", "65%"];
const activityTimes = ["2m", "5m", "1h"];
const trendDeltas = ["2.1%", "4.3%", "1.7%", "0.9%"];
const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[5fr_7fr] lg:gap-12">
        <div className="max-w-xl">
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Travel <span className="text-primary">anywhere</span>, ride with
            peace of mind.
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Taravelis connects travelers with trusted drivers across the
            country. Safe rides, transparent pricing, anytime you need it.
          </p>

          <Link
            href="/download"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Download App
          </Link>

          <div className="mt-12 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Trusted by travelers across the country
            </p>
            <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              {trustedBy.map((name, i) => (
                <li key={name} className="flex items-center gap-2">
                  <span
                    className={`h-8 w-8 rounded-full ring-1 ring-inset ring-border ${
                      ["bg-primary/15", "bg-foreground/10", "bg-primary/10", "bg-foreground/[0.07]"][i]
                    }`}
                  />
                  <span className="text-sm font-semibold tracking-tight text-foreground/80">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative">
          <svg
            viewBox="0 0 320 320"
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 hidden h-96 w-96 text-primary/30 sm:block"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <ellipse
                key={i}
                cx="160"
                cy="160"
                rx="140"
                ry="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                transform={`rotate(${i * 7.5} 160 160)`}
              />
            ))}
          </svg>

          <div className="relative z-10 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr]">
              <aside className="border-r border-border bg-surface p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                    T
                  </span>
                  <span className="text-[11px] font-bold tracking-tight">
                    Taravelis
                  </span>
                </div>

                <div className="mt-3 rounded-md border border-border bg-card p-2">
                  <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Section
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold">Admin</div>
                </div>

                <nav className="mt-3 space-y-0.5">
                  {sidebarItems.map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-medium ${
                        i === 0
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          i === 0 ? "bg-primary" : "bg-muted-foreground/40"
                        }`}
                      />
                      {item}
                    </div>
                  ))}
                </nav>
              </aside>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[9px] text-muted-foreground">
                      Fri, 12th Sep
                    </div>
                    <div className="text-sm font-bold tracking-tight">
                      Hello, Aiden 👋
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold text-primary-foreground">
                      + New Ride
                    </span>
                    <span className="h-5 w-5 rounded-full bg-muted ring-1 ring-border" />
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">
                    Today
                    <span className="text-primary/70">×</span>
                  </span>
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[8px] font-medium text-muted-foreground">
                    This Week
                  </span>
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[8px] font-medium text-muted-foreground">
                    This Month
                  </span>
                  <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[8px] font-medium text-muted-foreground">
                    Select date
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {metrics.map((label, i) => (
                    <div
                      key={label}
                      className="rounded-md border border-border bg-surface p-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="truncate text-[8px] text-muted-foreground">
                          {label}
                        </div>
                        <span className="shrink-0 text-[7px] font-semibold text-primary">
                          ↑ {trendDeltas[i]}
                        </span>
                      </div>
                      <div
                        className={`mt-1.5 h-2 w-3/4 rounded-full ${
                          i === 0 ? "bg-primary/30" : "bg-muted"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <div className="col-span-2 rounded-md border border-border bg-surface p-2">
                    <div className="flex items-center justify-between">
                      <div className="h-1.5 w-12 rounded-full bg-muted" />
                      <div className="h-1.5 w-6 rounded-full bg-muted" />
                    </div>
                    <div className="mt-1.5 h-14 overflow-hidden">
                      <svg
                        viewBox="0 0 200 60"
                        preserveAspectRatio="none"
                        aria-hidden
                        className="h-full w-full"
                      >
                        <path
                          d="M0 50 Q 30 30 50 35 T 100 20 T 150 25 T 200 10 L 200 60 L 0 60 Z"
                          className="fill-primary/15"
                        />
                        <path
                          d="M0 50 Q 30 30 50 35 T 100 20 T 150 25 T 200 10"
                          className="stroke-primary"
                          strokeWidth="1.5"
                          fill="none"
                        />
                        <line
                          x1="150"
                          x2="150"
                          y1="0"
                          y2="60"
                          className="stroke-primary/40"
                          strokeWidth="0.75"
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx="150"
                          cy="25"
                          r="2.5"
                          className="fill-primary stroke-card"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <div className="mt-1 flex justify-between px-0.5">
                      {weekDays.map((d, i) => (
                        <span
                          key={i}
                          className={`text-[7px] ${
                            i === 5 ? "font-bold text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col rounded-md border border-border bg-surface p-2">
                    <div className="h-1.5 w-10 rounded-full bg-muted" />
                    <div className="mt-1 flex flex-1 items-center gap-2">
                      <svg
                        viewBox="0 0 40 40"
                        aria-hidden
                        className="h-12 w-12 shrink-0"
                      >
                        <circle
                          cx="20"
                          cy="20"
                          r="14"
                          fill="none"
                          strokeWidth="5"
                          className="stroke-muted"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="14"
                          fill="none"
                          strokeWidth="5"
                          strokeDasharray="60 100"
                          className="stroke-primary"
                          transform="rotate(-90 20 20)"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <div className="h-1.5 flex-1 rounded-full bg-muted" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                          <div className="h-1.5 w-3/4 rounded-full bg-muted" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <div className="rounded-md border border-border bg-surface p-2">
                    <div className="text-[9px] font-semibold">
                      Recent Activity
                    </div>
                    <ul className="mt-1.5 space-y-1.5">
                      {[0, 1, 2].map((i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-primary/15">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                          </span>
                          <span
                            className="h-1.5 rounded-full bg-muted"
                            style={{ width: activityWidths[i] }}
                          />
                          <span className="ml-auto text-[7px] font-medium text-muted-foreground/70">
                            {activityTimes[i]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-md border border-border bg-surface p-2">
                    <div className="text-[9px] font-semibold">Top Drivers</div>
                    <ul className="mt-1.5 space-y-1.5">
                      {topDrivers.map((d, i) => (
                        <li key={d.name} className="flex items-center gap-1.5">
                          <span className="w-2 text-[7px] font-bold text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="h-3 w-3 shrink-0 rounded bg-muted" />
                          <span
                            className="h-1.5 rounded-full bg-muted"
                            style={{ width: d.w }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-14 -left-10 z-20 hidden w-40 sm:block">
            <span
              aria-hidden
              className="absolute left-[-2px] top-14 h-5 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
            />
            <span
              aria-hidden
              className="absolute left-[-2px] top-[5.25rem] h-8 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
            />
            <span
              aria-hidden
              className="absolute left-[-2px] top-[7.75rem] h-8 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
            />
            <span
              aria-hidden
              className="absolute right-[-2px] top-24 h-10 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-900 to-zinc-700"
            />

            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-[3px] shadow-2xl shadow-primary/30 ring-1 ring-inset ring-white/10">
              <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.25rem] bg-black p-[2px]">
                <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-card to-surface-alt">
                  <div className="absolute left-1/2 top-1.5 z-10 flex h-3 w-12 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-1.5">
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-inset ring-white/15">
                      T
                    </span>
                    <span className="text-[11px] font-semibold tracking-tight text-foreground">
                      Taravelis
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
