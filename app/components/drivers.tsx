import Link from "next/link";

const benefits = [
  {
    title: "Set your own fare",
    description: "Negotiate the price you want with each rider.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Flexible hours",
    description: "Toggle online whenever you're ready to drive.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Instant MoMo payouts",
    description: "Earnings sent to your mobile money in seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Smart heat map",
    description: "See real-time demand zones near you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const vehicleTypes = [
  {
    name: "Moto Bike",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M14 6h2l1 5-3 3M9 17l3-6L9 6" />
      </svg>
    ),
  },
  {
    name: "Cab Taxi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="16.5" cy="16.5" r="2.5" />
      </svg>
    ),
  },
  {
    name: "Heavy Fuso",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <rect x="1" y="9" width="13" height="8" rx="1" />
        <path d="M14 12h5l3 3v2h-8" />
        <circle cx="6" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
      </svg>
    ),
  },
  {
    name: "Light Hilux",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M2 17V12l3-4h7l2 3" />
        <path d="M14 11h6v6" />
        <path d="M2 17h18" />
        <circle cx="6" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
      </svg>
    ),
  },
];

function DriverPhone() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative w-52 sm:w-60">
        <span
          aria-hidden
          className="absolute left-[-3px] top-16 h-6 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
        />
        <span
          aria-hidden
          className="absolute left-[-3px] top-28 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
        />
        <span
          aria-hidden
          className="absolute left-[-3px] top-44 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
        />
        <span
          aria-hidden
          className="absolute right-[-3px] top-24 h-14 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-900 to-zinc-700"
        />

        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-1 shadow-2xl shadow-primary/20 ring-1 ring-inset ring-white/10">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] bg-black p-[3px]">
            <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-card">
              <div className="absolute left-1/2 top-2 z-10 flex h-6 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              </div>

              <div className="absolute inset-0 flex flex-col px-4 pb-4 pt-11">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-muted-foreground">
                      Driver
                    </div>
                    <div className="text-sm font-bold tracking-tight text-foreground">
                      Hi, Aiden
                    </div>
                  </div>
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 ring-1 ring-inset ring-primary/30">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary" aria-hidden>
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 20a7 7 0 0 1 14 0" />
                    </svg>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Online
                    </span>
                  </div>
                  <span className="flex h-5 w-9 items-center justify-end rounded-full bg-primary p-0.5">
                    <span className="h-4 w-4 rounded-full bg-card shadow-sm" />
                  </span>
                </div>

                <div className="mt-3 rounded-2xl border border-border bg-surface p-3">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Today's Earnings
                  </div>
                  <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                    12,500 RWF
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                    18% vs yesterday
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Demand Nearby
                  </div>
                  <div className="relative mt-1.5 h-16 overflow-hidden rounded-xl border border-border bg-surface-alt">
                    <svg viewBox="0 0 200 60" preserveAspectRatio="xMidYMid slice" aria-hidden className="absolute inset-0 h-full w-full">
                      <rect width="100%" height="100%" className="fill-surface-alt" />
                      <rect x="10" y="5" width="30" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="45" y="5" width="40" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="90" y="5" width="35" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="130" y="5" width="60" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="10" y="40" width="40" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="55" y="40" width="35" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="95" y="40" width="50" height="15" rx="2" className="fill-zinc-300" />
                      <rect x="150" y="40" width="40" height="15" rx="2" className="fill-zinc-300" />
                      <circle cx="60" cy="30" r="14" className="fill-primary/30" />
                      <circle cx="60" cy="30" r="8" className="fill-primary/50" />
                      <circle cx="140" cy="32" r="10" className="fill-primary/25" />
                      <circle cx="140" cy="32" r="5" className="fill-primary/40" />
                    </svg>
                    <span className="absolute bottom-1 right-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-primary-foreground">
                      2 zones hot
                    </span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                  <div className="rounded-xl border border-border bg-surface px-2 py-1.5 text-center">
                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground">
                      Rides
                    </div>
                    <div className="text-sm font-bold text-foreground">12</div>
                  </div>
                  <div className="rounded-xl border border-border bg-surface px-2 py-1.5 text-center">
                    <div className="text-[8px] uppercase tracking-wider text-muted-foreground">
                      Rating
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-sm font-bold text-foreground">
                      4.9
                      <svg viewBox="0 0 24 24" fill="#f59e0b" className="h-3 w-3" aria-hidden>
                        <path d="M12 2 L14.4 8.6 L21 9 L16 13.6 L17.5 20 L12 16.5 L6.5 20 L8 13.6 L3 9 L9.6 8.6 Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Drivers() {
  return (
    <section id="drivers" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            For Drivers
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            Drive on your{" "}
            <span className="text-primary">own terms</span>
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Set your fares. Choose your hours. Get paid instantly to your mobile
            money.
          </p>
        </div>

        <div className="mt-16 flex flex-col items-center gap-12 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24">
          <DriverPhone />

          <div className="max-w-lg">
            <ul className="space-y-5">
              {benefits.map((b) => (
                <li key={b.title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/20">
                    {b.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-base font-semibold tracking-tight text-foreground">
                      {b.title}
                    </div>
                    <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {b.description}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/drivers"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Become a Driver
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Drive any of these vehicle types
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {vehicleTypes.map((v) => (
              <div
                key={v.name}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {v.icon}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {v.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
