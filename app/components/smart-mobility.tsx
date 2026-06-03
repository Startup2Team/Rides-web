"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ── Platform feature list ────────────────────────────────────────────────────

type Feature = { title: string; description: string; icon: ReactNode };

const platformFeatures: Feature[] = [
  {
    title: "Live tracking",
    description:
      "Driver GPS streams to the platform in real time. You watch the trip approach and complete on a live map.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Demand heatmaps",
    description:
      "Pickup density updates by area so drivers route toward the next rider. Fewer empty cabs, shorter waits for you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    title: "15-second matching",
    description:
      "Your request fans out to every nearby driver at once. The first to accept gets the trip — usually in under 15 seconds.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M9 2h6" />
        <path d="M12 2v2" />
      </svg>
    ),
  },
  {
    title: "Fair-fare engine",
    description:
      "Suggested fare up front, in-app negotiation, then pay with MoMo, Airtel, or cash. No surge pricing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

// ── Count-up hook ────────────────────────────────────────────────────────────
// Smoothly counts from 0 → target once the target element enters the viewport.

function useCountUp<T extends HTMLElement = HTMLElement>(target: number, durationMs = 1200) {
  const elementRef = useRef<T | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  const setRef = (node: T | null) => {
    elementRef.current = node;
  };

  useEffect(() => {
    if (!elementRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          // Ease-out cubic — fast then slows, feels like a counter
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(target * eased));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.35 },
    );
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [target, durationMs]);

  return [setRef, value] as const;
}

// ── Stylised SVG map (replaces /maps/map.png) ────────────────────────────────

function StylisedMap() {
  return (
    <svg
      viewBox="0 0 400 320"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Map base */}
      <rect width="400" height="320" fill="#efe7d8" />
      {/* Subtle district tints */}
      <path d="M 260 0 L 400 0 L 400 110 L 290 130 Z" fill="#e5dccb" opacity="0.55" />
      <path d="M 0 230 L 110 270 L 70 320 L 0 320 Z" fill="#e5dccb" opacity="0.5" />
      <path d="M 0 0 L 100 0 L 80 80 L 0 100 Z" fill="#e8e0cf" opacity="0.45" />

      {/* Highway — heavier double-stroke */}
      <path d="M 260 0 Q 240 110 280 200 T 320 320" stroke="#c8d2db" strokeWidth="12" fill="none" />
      <path d="M 260 0 Q 240 110 280 200 T 320 320" stroke="white" strokeWidth="10" fill="none" />

      {/* Street network — horizontal-ish */}
      <path d="M 0 60 Q 140 30 400 70" stroke="white" strokeWidth="3.5" fill="none" />
      <path d="M 0 110 Q 100 80 220 115" stroke="white" strokeWidth="3" fill="none" />
      <path d="M 60 195 Q 160 165 400 190" stroke="white" strokeWidth="3" fill="none" />
      <path d="M 80 250 Q 200 220 400 240" stroke="white" strokeWidth="3" fill="none" />

      {/* Street network — vertical-ish */}
      <path d="M 110 0 Q 130 90 100 220 T 140 320" stroke="white" strokeWidth="3" fill="none" />
      <path d="M 200 0 Q 170 70 160 150 T 130 320" stroke="white" strokeWidth="3" fill="none" />
      <path d="M 350 0 Q 320 100 340 220 T 370 320" stroke="white" strokeWidth="3" fill="none" />

      {/* Street labels (sparse — just enough to feel like a real map) */}
      <text x="20" y="58" fontSize="7" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 124 ST</text>
      <text x="22" y="108" fontSize="7" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 122 ST</text>
      <text x="170" y="68" fontSize="7" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 27 AVE</text>
      <text x="118" y="193" fontSize="7" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 86 ST</text>
      <text x="220" y="248" fontSize="7" fill="#9a9486" fontFamily="sans-serif" fontWeight="600" transform="rotate(2 220 248)">KG 20 AVE</text>
    </svg>
  );
}

// ── Live-ops dashboard mockup ────────────────────────────────────────────────

function LiveOpsDashboard() {
  const [activeRidesRef, activeRides] = useCountUp<HTMLSpanElement>(247);
  const [onlineDriversRef, onlineDrivers] = useCountUp<HTMLDivElement>(89);

  return (
    <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
      {/* Top header strip */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
            Live operations
          </span>
        </div>
        {/* Period chips — labelled aria-hidden because they're decorative */}
        <div aria-hidden className="hidden items-center gap-1 sm:flex">
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-semibold text-primary">
            Today
          </span>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-medium text-muted-foreground/70">
            Week
          </span>
          <span className="rounded-full px-2 py-0.5 text-[9px] font-medium text-muted-foreground/70">
            Month
          </span>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">Now</span>
      </div>

      {/* Stylised map background (no external image dependency) */}
      <StylisedMap />

      {/* Heatmap blobs + route lines — use currentColor + text-primary so the
          tone is driven by the theme token, not a hard-coded hex. */}
      <svg
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        className="absolute inset-0 h-full w-full text-primary"
      >
        <defs>
          <radialGradient id="heat-primary" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="60%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-warm" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="355" cy="95" r="60" fill="url(#heat-primary)" />
        <circle cx="60" cy="285" r="50" fill="url(#heat-warm)" />
        <circle cx="195" cy="285" r="45" fill="url(#heat-primary)" opacity="0.85" />

        <path
          d="M 40 270 Q 130 230 200 240 T 360 200"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M 80 90 Q 180 130 280 110 T 380 150"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.65"
        />
      </svg>

      {/* Online drivers (pulsing) */}
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
      {/* Offline drivers (static dots) */}
      <div className="absolute z-10" style={{ top: "26%", left: "52%" }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
      </div>
      <div className="absolute z-10" style={{ top: "55%", left: "78%" }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
      </div>
      <div className="absolute z-10" style={{ top: "75%", left: "30%" }}>
        <span className="block h-2.5 w-2.5 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
      </div>

      {/* Floating stat card: Active Rides */}
      <div className="absolute left-4 top-14 z-30 w-40 rounded-2xl border border-border bg-card/85 p-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active rides
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                ref={activeRidesRef}
                className="text-xl font-bold tracking-tight tabular-nums text-foreground"
              >
                {activeRides}
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
        <svg viewBox="0 0 100 30" className="mt-2 h-7 w-full text-primary" aria-hidden>
          <path
            d="M0 25 Q 18 22 30 18 T 60 10 T 100 6 L 100 30 L 0 30 Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M0 25 Q 18 22 30 18 T 60 10 T 100 6"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Floating stat card: Online Drivers */}
      <div className="absolute bottom-4 right-4 z-30 w-44 rounded-2xl border border-border bg-card/85 p-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Online drivers
            </div>
            <div
              ref={onlineDriversRef}
              className="mt-1 text-xl font-bold tracking-tight tabular-nums text-foreground"
            >
              {onlineDrivers}
            </div>
          </div>
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
            Live
          </span>
        </div>
        <svg viewBox="0 0 100 30" className="mt-2 h-7 w-full text-primary" aria-hidden>
          <path
            d="M0 22 Q 20 12 40 16 T 80 6 L 100 8 L 100 30 L 0 30 Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          <path
            d="M0 22 Q 20 12 40 16 T 80 6 L 100 8"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Floating hot-zone pill */}
      <div className="absolute right-4 top-14 z-30 rounded-xl border border-border bg-card/85 px-3 py-2 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <div>
            <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hot zones
            </div>
            <div className="text-xs font-bold text-foreground">3 active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SmartMobility() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The platform
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            Built for{" "}
            <span className="text-primary">real-time</span> movement.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Live tracking, demand heatmaps, 15-second matching, and a
            negotiation-friendly fare engine. All running underneath your ride.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
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
