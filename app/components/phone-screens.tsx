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
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <style>{`
        @keyframes splash-zoom {
          0%   { transform: scale(1);   opacity: 1; }
          60%  { transform: scale(1.5); opacity: 0; }
          61%  { transform: scale(1);   opacity: 0; }
          75%  { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        .splash-img {
          animation: splash-zoom 3.5s ease-in-out infinite;
          transform-origin: center center;
        }
        @media (prefers-reduced-motion: reduce) {
          .splash-img { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/drivers-fleet-africa.png"
        alt=""
        aria-hidden
        className="splash-img absolute inset-0 h-full w-full object-contain"
      />
      {/* Static branding text at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <span className="text-[15px] font-black tracking-[-0.04em] text-zinc-900">
          <span className="text-[#007aff]">R</span>id<span className="text-emerald-500">es</span>
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* DRIVER SCREEN                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export function DriverScreen() {
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Wallpaper */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('/images/wallpaper.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Date + time */}
      <div className="relative z-10 mt-8 flex flex-col items-center">
        <p className="text-[9px] font-medium text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
          Wednesday, 25 June
        </p>
        <p className="mt-0.5 text-[52px] font-light leading-none tracking-[-0.03em] text-white" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
          9:41
        </p>
      </div>

      {/* Notification card */}
      <div className="relative z-10 mx-2.5 mt-auto mb-2">
        <div
          className="rounded-2xl px-3 py-2.5"
          style={{ background: "rgba(20,20,30,0.52)", backdropFilter: "blur(20px)", border: "0.5px solid rgba(255,255,255,0.18)" }}
        >
          <div className="flex items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ridelogo-primary.png" alt="Rides" className="mt-0.5 h-6 w-6 shrink-0 rounded-[7px] object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-semibold text-white/70">Rides</span>
                <span className="text-[6.5px] text-white/45">just now</span>
              </div>
              <p className="mt-0.5 text-[8px] font-semibold leading-tight text-white">
                Your driver is here!
              </p>
              <p className="mt-0.5 text-[7px] leading-snug text-white/65">
                Jean is waiting outside. Make it quick!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom quick-action icons */}
      <div className="relative z-10 mb-4 flex items-center justify-between px-7">
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}>
          <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4" aria-hidden>
            <path d="M9.5 2h5a1 1 0 0 1 1 1v1H8.5V3a1 1 0 0 1 1-1z" />
            <path d="M8.5 4h7l1 5H7.5l1-5z" />
            <rect x="9.5" y="9" width="5" height="11" rx="2.5" />
          </svg>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
      </div>

      {/* Home indicator */}
      <div className="relative z-10 mb-1.5 flex justify-center">
        <div className="h-[3px] w-20 rounded-full bg-white/50" />
      </div>
    </div>
  );
}
