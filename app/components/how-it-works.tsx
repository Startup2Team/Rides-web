import { CarIcon, FusoIcon, HiluxIcon, MotoIcon } from "./vehicle-icons";

const step01Features = [
  "Multiple vehicle types",
  "Real-time availability",
  "Instant route estimation",
  "Smart matching system",
];

function DriverPin({
  top,
  left,
  eta,
  matched,
}: {
  top: string;
  left: string;
  eta: string;
  matched?: boolean;
}) {
  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ top, left }}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-md ${
          matched
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground"
        }`}
      >
        <CarIcon className="h-3 w-3" />
        <span className="text-[10px] font-bold">{eta}</span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Step01() {
  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-64 sm:w-72">
          <span
            aria-hidden
            className="absolute left-[-3px] top-20 h-7 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute left-[-3px] top-32 h-12 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute left-[-3px] top-48 h-12 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute right-[-3px] top-28 h-16 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-900 to-zinc-700"
          />

          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-1 shadow-2xl shadow-primary/20 ring-1 ring-inset ring-white/10">
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] bg-black p-[3px]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-card">
                {/* Dynamic island */}
                <div className="absolute left-1/2 top-3 z-10 flex h-7 w-28 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                </div>

                <div className="absolute inset-0 flex flex-col px-5 pb-4 pt-14">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface ring-1 ring-inset ring-border">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-foreground" aria-hidden>
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </span>
                    <span className="text-base font-bold tracking-tight text-foreground">
                      Book a Ride
                    </span>
                    <span className="h-9 w-9" />
                  </div>

                  {/* Location fields */}
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-foreground">
                          Pickup
                        </div>
                        <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-muted" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-foreground" aria-hidden>
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                          <circle cx="12" cy="10" r="2.5" fill="currentColor" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold text-foreground">
                          Destination
                        </div>
                        <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-muted" />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div className="mt-5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Vehicle Type
                    </div>
                    <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                      {[
                        { name: "Moto\nBike", active: false, IconComp: MotoIcon },
                        { name: "Cab Taxi", active: true, IconComp: CarIcon },
                        { name: "Heavy\nFuso", active: false, IconComp: FusoIcon },
                        { name: "Light\nHilux", active: false, IconComp: HiluxIcon },
                      ].map((v) => (
                        <div
                          key={v.name}
                          className={`flex flex-col items-center justify-center rounded-xl border-[1.5px] px-1 py-2 ${
                            v.active
                              ? "border-primary bg-primary/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <v.IconComp
                            className={`h-5 w-5 ${
                              v.active ? "text-primary" : "text-foreground"
                            }`}
                          />
                          <div
                            className={`mt-1 whitespace-pre-line text-center text-[8px] font-semibold leading-tight ${
                              v.active ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {v.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fare card */}
                  <div className="mt-4 rounded-2xl border border-border bg-card p-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground">
                          Estimated Fare
                        </div>
                        <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                          3,000 RWF
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-medium text-muted-foreground">
                          ETA
                        </div>
                        <div className="mt-0.5 text-base font-bold tracking-tight text-foreground">
                          5 min
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirm */}
                  <div className="mt-auto pt-3">
                    <div className="flex h-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30">
                      Confirm Ride
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 01
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Request Your Ride in <span className="text-primary">Seconds</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Choose your destination, select your preferred transport type, and
          instantly connect with nearby drivers.
        </p>

        <ul className="mt-8 space-y-3">
          {step01Features.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30">
                <CheckIcon />
              </span>
              <span className="text-base font-medium text-foreground/80">
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Step02() {
  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row-reverse lg:justify-center lg:gap-16 xl:gap-24">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-80 sm:w-96">
          <div className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <svg
              viewBox="0 0 200 240"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
              className="absolute inset-0 h-full w-full"
            >
              <rect width="100%" height="100%" className="fill-card" />

              <rect x="8" y="5" width="35" height="18" rx="2" className="fill-zinc-200" />
              <rect x="48" y="5" width="40" height="22" rx="2" className="fill-zinc-200" />
              <rect x="93" y="5" width="30" height="18" rx="2" className="fill-zinc-200" />
              <rect x="128" y="5" width="28" height="22" rx="2" className="fill-zinc-200" />
              <rect x="160" y="5" width="34" height="20" rx="2" className="fill-zinc-200" />

              <rect x="8" y="32" width="28" height="28" rx="2" className="fill-zinc-200" />
              <rect x="42" y="35" width="45" height="22" rx="2" className="fill-zinc-200" />
              <rect x="92" y="32" width="30" height="30" rx="2" className="fill-zinc-200" />
              <rect x="127" y="32" width="28" height="25" rx="2" className="fill-zinc-200" />
              <rect x="160" y="30" width="34" height="32" rx="2" className="fill-zinc-200" />

              <path
                d="M 6 70 Q 35 66 55 78 Q 68 96 50 108 L 6 102 Z"
                className="fill-primary/15"
              />

              <rect x="68" y="68" width="28" height="28" rx="2" className="fill-zinc-200" />
              <rect x="100" y="70" width="22" height="22" rx="2" className="fill-zinc-200" />
              <rect x="126" y="68" width="30" height="28" rx="2" className="fill-zinc-200" />
              <rect x="160" y="70" width="34" height="26" rx="2" className="fill-zinc-200" />

              <rect x="6" y="115" width="26" height="22" rx="2" className="fill-zinc-200" />
              <rect x="38" y="110" width="30" height="28" rx="2" className="fill-zinc-200" />
              <rect x="160" y="105" width="34" height="28" rx="2" className="fill-zinc-200" />

              <rect x="6" y="142" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="44" y="144" width="22" height="22" rx="2" className="fill-zinc-200" />
              <rect x="72" y="142" width="28" height="25" rx="2" className="fill-zinc-200" />
              <rect x="105" y="142" width="25" height="25" rx="2" className="fill-zinc-200" />
              <rect x="135" y="144" width="22" height="22" rx="2" className="fill-zinc-200" />
              <rect x="162" y="142" width="32" height="25" rx="2" className="fill-zinc-200" />

              <rect x="6" y="172" width="32" height="25" rx="2" className="fill-zinc-200" />
              <rect x="44" y="174" width="25" height="22" rx="2" className="fill-zinc-200" />
              <rect x="74" y="172" width="30" height="28" rx="2" className="fill-zinc-200" />
              <rect x="110" y="174" width="38" height="22" rx="2" className="fill-zinc-200" />
              <rect x="152" y="172" width="22" height="25" rx="2" className="fill-zinc-200" />
              <rect x="178" y="172" width="16" height="25" rx="2" className="fill-zinc-200" />

              <rect x="6" y="205" width="30" height="22" rx="2" className="fill-zinc-200" />
              <rect x="42" y="205" width="35" height="25" rx="2" className="fill-zinc-200" />
              <rect x="82" y="207" width="28" height="22" rx="2" className="fill-zinc-200" />
              <rect x="115" y="205" width="25" height="28" rx="2" className="fill-zinc-200" />
              <rect x="145" y="208" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="180" y="205" width="14" height="28" rx="2" className="fill-zinc-200" />

              <path
                d="M 100 120 Q 130 105 150 80"
                className="stroke-primary"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
              <path
                d="M 100 120 Q 80 130 65 165"
                className="stroke-primary"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 3"
                strokeLinecap="round"
                opacity="0.7"
              />
              <path
                d="M 100 120 Q 80 110 60 80"
                className="stroke-primary"
                strokeWidth="2"
                fill="none"
                strokeDasharray="4 3"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>

            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] ring-1 ring-inset ring-primary/15"
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20"
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 ring-1 ring-inset ring-primary/30"
            />

            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-card">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
            </div>

            <DriverPin top="22%" left="72%" eta="3 min" matched />
            <DriverPin top="62%" left="22%" eta="5 min" />
            <DriverPin top="32%" left="22%" eta="7 min" />

            <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/40">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight text-foreground">
                  Aiden
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  3 min away
                </div>
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Matched
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 02
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Smart{" "}
          <span className="text-primary">Driver Allocation</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Our intelligent matching engine connects riders with the best nearby
          drivers based on distance, availability, and performance.
        </p>
      </div>
    </div>
  );
}

const step03Showcase = [
  {
    label: "Offer price",
    description: "Start the negotiation with a fair amount",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: "Counter offer",
    description: "Reply with your own price suggestion",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    label: "Final agreement",
    description: "Lock in the agreed fare instantly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: "Secure masked call",
    description: "Talk without sharing phone numbers",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
];

function Step03() {
  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-80 sm:w-96">
          <div className="relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight text-foreground">
                  Aiden
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Negotiating fare
                </div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-foreground">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-hidden p-4">
              <div className="rounded-xl border border-border bg-surface p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1 truncate text-[10px] font-semibold text-foreground">
                    Kimironko Market
                  </div>
                </div>
                <div className="my-1 ml-[3px] h-2.5 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-2.5 w-2.5 shrink-0 text-foreground"
                    aria-hidden
                  >
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" />
                  </svg>
                  <div className="min-w-0 flex-1 truncate text-[10px] font-semibold text-foreground">
                    Kigali Heights
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                    5.2 km
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm shadow-primary/30">
                  <div className="text-base font-bold leading-none">4,500 RWF</div>
                  <div className="mt-1 text-[9px] opacity-80">Initial offer</div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-1.5 text-foreground">
                  <div className="text-base font-bold leading-none">3,000 RWF</div>
                  <div className="mt-1 text-[9px] text-muted-foreground">
                    Your offer
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm shadow-primary/30">
                  <div className="text-base font-bold leading-none">4,000 RWF</div>
                  <div className="mt-1 text-[9px] opacity-80">Counter offer</div>
                </div>
              </div>

              <div className="flex justify-center py-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-primary"
                    aria-hidden
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Masked call · 0:24
                </span>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm shadow-primary/30 ring-2 ring-primary/40">
                  <div className="text-base font-bold leading-none">3,800 RWF</div>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                    Final offer
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground"
              >
                Decline
              </button>
              <button
                type="button"
                className="flex-[1.5] rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30"
              >
                Accept 3,800 RWF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 03
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Negotiate Fares{" "}
          <span className="text-primary">Transparently</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Discuss and agree on fair pricing directly within the platform through
          secure negotiation tools and masked communication.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {step03Showcase.map((item) => (
            <li
              key={item.label}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {item.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {item.label}
                </div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StarIcon({
  filled,
  className,
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 L14.4 8.6 L21 9 L16 13.6 L17.5 20 L12 16.5 L6.5 20 L8 13.6 L3 9 L9.6 8.6 Z" />
    </svg>
  );
}

function Step04() {
  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row-reverse lg:justify-center lg:gap-16 xl:gap-24">
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-80 sm:w-96">
          <div className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <svg
              viewBox="0 0 200 240"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
              className="absolute inset-0 h-full w-full"
            >
              <rect width="100%" height="100%" className="fill-card" />

              <rect x="10" y="10" width="45" height="25" rx="2" className="fill-zinc-200" />
              <rect x="60" y="10" width="30" height="20" rx="2" className="fill-zinc-200" />
              <rect x="95" y="10" width="35" height="30" rx="2" className="fill-zinc-200" />
              <rect x="135" y="10" width="55" height="25" rx="2" className="fill-zinc-200" />

              <rect x="10" y="40" width="25" height="20" rx="2" className="fill-zinc-200" />
              <rect x="40" y="40" width="50" height="22" rx="2" className="fill-zinc-200" />
              <rect x="95" y="45" width="35" height="22" rx="2" className="fill-zinc-200" />
              <rect x="135" y="40" width="55" height="22" rx="2" className="fill-zinc-200" />

              <path
                d="M 78 75 Q 110 70 132 88 Q 138 110 116 118 L 84 112 Z"
                className="fill-primary/15"
              />

              <rect x="10" y="68" width="32" height="25" rx="2" className="fill-zinc-200" />
              <rect x="46" y="70" width="26" height="22" rx="2" className="fill-zinc-200" />
              <rect x="155" y="70" width="35" height="25" rx="2" className="fill-zinc-200" />

              <rect x="10" y="98" width="28" height="22" rx="2" className="fill-zinc-200" />
              <rect x="42" y="100" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="138" y="125" width="22" height="25" rx="2" className="fill-zinc-200" />
              <rect x="165" y="122" width="25" height="28" rx="2" className="fill-zinc-200" />

              <rect x="10" y="128" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="46" y="128" width="25" height="22" rx="2" className="fill-zinc-200" />
              <rect x="75" y="128" width="32" height="22" rx="2" className="fill-zinc-200" />

              <rect x="10" y="158" width="38" height="22" rx="2" className="fill-zinc-200" />
              <rect x="52" y="158" width="28" height="22" rx="2" className="fill-zinc-200" />
              <rect x="84" y="160" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="120" y="158" width="38" height="25" rx="2" className="fill-zinc-200" />
              <rect x="162" y="160" width="28" height="22" rx="2" className="fill-zinc-200" />

              <rect x="10" y="188" width="34" height="22" rx="2" className="fill-zinc-200" />
              <rect x="48" y="190" width="42" height="20" rx="2" className="fill-zinc-200" />
              <rect x="94" y="188" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="130" y="190" width="60" height="20" rx="2" className="fill-zinc-200" />

              <rect x="10" y="215" width="45" height="20" rx="2" className="fill-zinc-200" />
              <rect x="60" y="213" width="36" height="22" rx="2" className="fill-zinc-200" />
              <rect x="100" y="215" width="32" height="20" rx="2" className="fill-zinc-200" />
              <rect x="138" y="217" width="52" height="18" rx="2" className="fill-zinc-200" />

              <path
                d="M 50 200 Q 95 180 100 140 Q 105 90 150 70"
                className="stroke-primary/30"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 50 200 Q 95 180 100 140 Q 105 90 150 70"
                className="stroke-primary"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-x-3 top-3 z-20 flex items-center gap-2 rounded-2xl border border-border bg-card/85 p-2.5 shadow-lg backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <div className="flex-1 text-xs font-semibold text-foreground">
                Aiden is on the way
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                3 min
              </span>
            </div>

            <div
              className="absolute z-10"
              style={{ top: "44%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 ring-4 ring-card">
                <CarIcon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            <div
              className="absolute z-10"
              style={{ top: "23%", left: "72%", transform: "translate(-50%, -50%)" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md ring-2 ring-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                  aria-hidden
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/40">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight text-foreground">
                  Aiden
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  RAB 123 D · Toyota Hilux
                </div>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 04
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Track Every Movement in{" "}
          <span className="text-primary">Real Time</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Monitor rides and deliveries live with intelligent GPS tracking,
          arrival updates, and route monitoring.
        </p>
      </div>
    </div>
  );
}

function Step05() {
  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24">
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
                  <div className="flex flex-col items-center pt-2">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute h-20 w-20 rounded-full bg-primary/10" />
                      <span className="absolute h-16 w-16 rounded-full bg-primary/20" />
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                          aria-hidden
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-bold tracking-tight text-foreground">
                      Trip Completed
                    </h4>
                  </div>

                  <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-center">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Fare
                    </div>
                    <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                      3,800 RWF
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-2.5 w-2.5 text-primary"
                        aria-hidden
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Paid via Mobile Money
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                    <span>5.2 km</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>14 min</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>Aiden</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-center text-xs font-semibold text-foreground">
                      Rate your trip
                    </div>
                    <div className="mt-2 flex justify-center gap-1.5 text-primary">
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    <div className="flex h-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                      Submit
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 05
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Complete Trips{" "}
          <span className="text-primary">Seamlessly</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Finalize rides securely, review trip summaries, and help maintain
          quality through ratings and feedback.
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            From booking to rating, in{" "}
            <span className="text-primary">5 simple steps</span>
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            A clear flow from request to rating, designed to feel effortless.
          </p>
        </div>

        <div className="mt-20 space-y-24 lg:space-y-32">
          <Step01 />
          <Step02 />
          <Step03 />
          <Step04 />
          <Step05 />
        </div>
      </div>
    </section>
  );
}
