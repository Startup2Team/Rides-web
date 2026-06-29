/**
 * Phone screen content for the hero iPhone 16 Pro mockups.
 * Rider screen: "where do you want to go" booking flow.
 * Driver screen: incoming ride request with accept/decline.
 *
 * Both screens fill the inner screen area (absolute inset-0) and render
 * iOS status bar at top, content beneath the Dynamic Island, and a CTA
 * at the bottom.
 */

function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className="relative z-20 flex items-center justify-between px-4 pt-[6px] text-foreground">
      <span className="text-[8px] font-semibold tracking-tight">{time}</span>
      <div className="flex items-center gap-1 text-[7px] font-semibold tracking-tight">
        {/* Signal dots */}
        <svg viewBox="0 0 16 8" className="h-1.5 w-3 fill-current" aria-hidden>
          <rect x="0" y="5" width="2.5" height="3" rx="0.5" />
          <rect x="3.5" y="3.5" width="2.5" height="4.5" rx="0.5" />
          <rect x="7" y="2" width="2.5" height="6" rx="0.5" />
          <rect x="10.5" y="0" width="2.5" height="8" rx="0.5" />
        </svg>
        {/* Battery */}
        <span>100</span>
        <svg viewBox="0 0 16 8" className="h-2 w-3.5 fill-current" aria-hidden>
          <rect x="0.5" y="0.5" width="13" height="7" rx="1.5" fillOpacity="0" stroke="currentColor" strokeWidth="0.5" />
          <rect x="2" y="2" width="10" height="4" rx="0.5" />
          <rect x="14.2" y="3" width="1" height="2" rx="0.3" />
        </svg>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* RIDER SCREEN                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

export function RiderScreen() {
  const vehicles = [
    { name: "Moto", eta: "2 min", price: "800", icon: "🛵" },
    { name: "Cab", eta: "4 min", price: "2,400", icon: "🚗" },
    { name: "Hilux", eta: "5 min", price: "4,500", icon: "🛻" },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <StatusBar />

      {/* Top: greeting + search — pushed below Dynamic Island */}
      <div className="px-3 pt-[28px]">
        <p className="text-[7px] uppercase tracking-[0.18em] text-zinc-400">
          Good morning
        </p>
        <h2 className="mt-0.5 text-[13px] font-bold leading-none text-zinc-900">
          Where to?
        </h2>

        {/* Search input */}
        <div className="mt-2 flex items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-zinc-50 px-2 py-[7px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-2.5 w-2.5 text-blue-500" aria-hidden>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[8px] text-zinc-500">Pick a destination</span>
        </div>
      </div>

      {/* Vehicles list */}
      <div className="mt-2.5 flex-1 px-3">
        <p className="text-[7px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Available now
        </p>
        <div className="mt-1.5 space-y-1">
          {vehicles.map((v, i) => (
            <div
              key={v.name}
              className={`flex items-center justify-between rounded-[10px] px-2 py-1.5 ${
                i === 0
                  ? "bg-blue-50 ring-1 ring-blue-500/40"
                  : "bg-zinc-50 ring-1 ring-zinc-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px]">
                  {v.icon}
                </div>
                <div>
                  <p className="text-[8px] font-semibold leading-tight text-zinc-900">
                    {v.name}
                  </p>
                  <p className="text-[6.5px] leading-tight text-zinc-500">
                    {v.eta} away
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[7.5px] font-bold leading-tight text-zinc-900">
                  RWF {v.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <button className="block w-full rounded-[10px] bg-blue-500 py-2 text-[9px] font-semibold tracking-tight text-white shadow-sm">
          Confirm ride
        </button>
        {/* Home indicator */}
        <div className="mx-auto mt-1.5 h-[3px] w-12 rounded-full bg-zinc-900" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* DRIVER SCREEN                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export function DriverScreen() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <StatusBar />

      {/* Map preview — top portion */}
      <div className="relative mt-1 mx-3 h-[80px] overflow-hidden rounded-[10px] bg-zinc-100">
        {/* Stylized map streets */}
        <svg viewBox="0 0 160 80" className="absolute inset-0 h-full w-full" aria-hidden>
          <g stroke="#d4d4d8" fill="none" strokeWidth="2" strokeLinecap="round">
            <path d="M -10 30 C 30 20 60 35 100 28 S 170 32 180 30" />
            <path d="M -10 55 C 40 60 80 50 120 55 S 170 60 180 55" />
            <path d="M 40 -10 L 50 90" />
            <path d="M 110 -10 L 100 90" />
            <path d="M 20 30 L 30 55" strokeWidth="1.2" />
            <path d="M 130 30 L 140 55" strokeWidth="1.2" />
          </g>
          {/* Pickup pin */}
          <circle cx="60" cy="32" r="4" fill="#3b82f6" />
          <circle cx="60" cy="32" r="2" fill="#fff" />
          {/* Destination pin */}
          <circle cx="120" cy="55" r="4" fill="#0f172a" />
          <circle cx="120" cy="55" r="2" fill="#fff" />
          {/* Route line */}
          <path
            d="M 60 32 L 80 35 L 90 50 L 120 55"
            stroke="#3b82f6"
            strokeWidth="1.8"
            strokeDasharray="3 2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* New request label */}
      <div className="mt-2 flex items-center justify-between px-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-1.5 py-[2px] text-[6.5px] font-bold uppercase tracking-[0.12em] text-blue-600">
          <span className="block h-1 w-1 rounded-full bg-blue-500" />
          New request
        </span>
        <span className="text-[6.5px] font-semibold text-zinc-500">12s</span>
      </div>

      {/* Rider + fare */}
      <div className="mt-2 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[8px] font-bold text-zinc-700">
              AM
            </div>
            <div>
              <p className="text-[9px] font-semibold leading-tight text-zinc-900">
                Aïsha M.
              </p>
              <p className="text-[6.5px] leading-tight text-zinc-500">
                ★ 4.92 · 1.2 km away
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[6px] uppercase tracking-[0.12em] text-zinc-400">
              Fare
            </p>
            <p className="text-[13px] font-bold leading-none text-zinc-900">
              RWF 2,400
            </p>
          </div>
        </div>
      </div>

      {/* Pickup / destination */}
      <div className="mx-3 mt-2 rounded-[10px] bg-zinc-50 p-2 ring-1 ring-zinc-100">
        <div className="flex items-start gap-1.5">
          <div className="mt-0.5 flex flex-col items-center">
            <span className="block h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="my-0.5 block h-3 w-px bg-zinc-300" />
            <span className="block h-1.5 w-1.5 rounded-full bg-zinc-900" />
          </div>
          <div className="flex-1">
            <p className="text-[6.5px] uppercase tracking-[0.12em] text-zinc-400">
              Pickup
            </p>
            <p className="text-[8px] font-semibold leading-tight text-zinc-900">
              Kimironko Market
            </p>
            <p className="mt-1.5 text-[6.5px] uppercase tracking-[0.12em] text-zinc-400">
              Drop-off
            </p>
            <p className="text-[8px] font-semibold leading-tight text-zinc-900">
              Kigali Convention
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-auto flex gap-1.5 px-3 pb-3">
        <button className="flex-1 rounded-[10px] border border-zinc-200 bg-white py-2 text-[9px] font-semibold text-zinc-700">
          Decline
        </button>
        <button className="flex-[1.4] rounded-[10px] bg-blue-500 py-2 text-[9px] font-semibold text-white shadow-sm">
          Accept · RWF 2,400
        </button>
      </div>

      {/* Home indicator */}
      <div className="mx-auto -mt-1 mb-2 h-[3px] w-12 rounded-full bg-zinc-900" />
    </div>
  );
}
