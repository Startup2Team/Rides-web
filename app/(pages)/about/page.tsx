"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

// ── Data ─────────────────────────────────────────────────────────────────────

const ABOUT_BULLETS = [
  {
    title: "Built in Kigali, for Kigali first",
    body: "We design for the hills, the moto traffic, and the rhythm of MoMo payments before we design for anywhere else.",
  },
  {
    title: "Transparent fares, both sides",
    body: "Riders see the price up front. Drivers see exactly what they earn — no opaque cuts, no hidden markups.",
  },
  {
    title: "Safety built into every screen",
    body: "Real-name accounts, document checks, SOS one tap from anywhere, and a 24/7 desk staffed in Kigali.",
  },
  {
    title: "Driver-first economics",
    body: "We negotiate with the drivers, not against them. The pay-out schedule is something they actually like.",
  },
];

const WHY_RIDES = [
  "Pickup matched in seconds, not minutes — locally hosted matching engine",
  "Negotiation tools so the fare reflects the trip, not a guess",
  "MTN MoMo & Airtel Money built in — no cards, no friction",
  "Driver dashboard with daily earnings, route history, and payouts",
];

const APPROACH = [
  {
    title: "Listen to drivers first",
    body: "Every release ships through driver feedback before it reaches the public app.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z" />
      </svg>
    ),
  },
  {
    title: "Measure the right things",
    body: "We optimise for time-to-pickup and driver retention — not GMV vanity metrics.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Ship transparency by default",
    body: "Every fare formula, every fee, every change — written down where users can see it.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

const GROWTH = [
  "Live in 12 cities across Rwanda — and counting",
  "Onboarded our 5,200th driver in the last quarter",
  "Crossed 180k delivered rides since launch",
  "94% of drivers active in month 1 are still active in month 6",
];

const CHART = [
  { label: "Q1", value: 22 },
  { label: "Q2", value: 38 },
  { label: "Q3", value: 56 },
  { label: "Q4", value: 71 },
  { label: "Q1", value: 84 },
];

// ── Reveal on scroll ─────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVisible(true);
          ob.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return { ref, visible };
}

// ── Photo placeholder ────────────────────────────────────────────────────────

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-accent ${className}`}>
      {(!ok || err) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary/40" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="px-2 text-[10px] leading-tight text-muted-foreground/60">
            <span className="text-primary/70">{src}</span>
          </p>
        </div>
      )}
      {!err && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${ok ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

// ── Circular photo with ring + dot accents (signature deck motif) ────────────

function CircularImage({
  src,
  alt,
  size = "lg",
  dotPosition = "bottom-left",
}: {
  src: string;
  alt: string;
  size?: "md" | "lg" | "xl";
  dotPosition?: "top-right" | "bottom-left" | "top-left" | "bottom-right";
}) {
  const sizeClass =
    size === "xl"
      ? "h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
      : size === "lg"
        ? "h-56 w-56 sm:h-64 sm:w-64 lg:h-72 lg:w-72"
        : "h-40 w-40 sm:h-48 sm:w-48";

  const dotClass = {
    "top-right": "-top-1 -right-2",
    "bottom-left": "-bottom-1 -left-2",
    "top-left": "-top-1 -left-2",
    "bottom-right": "-bottom-1 -right-2",
  }[dotPosition];

  return (
    <div className={`relative inline-block ${sizeClass}`}>
      {/* Outer ring accent — partial arc effect via thick border */}
      <div
        aria-hidden
        className="absolute -inset-3 rounded-full border-[6px] border-primary/15"
      />
      {/* Photo circle */}
      <div className="relative h-full w-full overflow-hidden rounded-full ring-[4px] ring-primary/30 ring-offset-2 ring-offset-background">
        <Photo src={src} alt={alt} className="h-full w-full rounded-full" />
      </div>
      {/* Small solid dot accent */}
      <div
        aria-hidden
        className={`absolute ${dotClass} h-7 w-7 rounded-full bg-primary shadow-md shadow-primary/40 sm:h-9 sm:w-9`}
      />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r5 = useReveal();
  const r6 = useReveal();
  const r7 = useReveal();
  const r8 = useReveal();

  return (
    <main className="flex-1 overflow-x-hidden bg-background">

      {/* ── 1. COVER HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-background">

        {/* ONE giant blue circle bleeding off the right edge — gives a clean curved D shape */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[35%] top-1/2 hidden aspect-square h-[180%] -translate-y-1/2 rounded-full bg-primary lg:block"
        />
        {/* Mobile fallback: shorter blue arc at the bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary lg:hidden"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:py-28">
          {/* Left — copy */}
          <div className="relative z-10">
            <p className="font-serif text-2xl italic tracking-tight text-foreground/80 sm:text-3xl">
              Maximize your
            </p>
            <h1 className="mt-1 text-balance text-5xl font-black uppercase leading-[0.95] tracking-[-0.025em] text-primary sm:text-6xl lg:text-7xl">
              Mobility
            </h1>
            <p className="mt-1 text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              Potential.
            </p>
            <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Rides is a Rwandan-built ride-hailing platform pairing real-time
              matching with transparent fares and driver-first economics —
              across a thousand hills and every street between them.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-primary hover:underline"
            >
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
              Visit rides.rw
            </Link>
          </div>

          {/* Right — centered circular photo on top of the blue region */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="relative h-72 w-72 sm:h-80 sm:w-80 lg:h-[22rem] lg:w-[22rem]">
              {/* Thin white ring separating photo from blue area */}
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full border-[2px] border-white/70 lg:border-white"
              />
              {/* Photo */}
              <div className="relative h-full w-full overflow-hidden rounded-full ring-[6px] ring-white shadow-2xl shadow-primary/40">
                <Photo
                  src="/images/about-hero.jpg"
                  alt="Rides — about the team"
                  className="h-full w-full"
                />
              </div>
              {/* Subtle comma/swoosh accent — bottom-left of photo */}
              <svg
                aria-hidden
                viewBox="0 0 40 40"
                className="absolute -bottom-2 -left-4 h-10 w-10 text-white lg:text-white/80"
              >
                <path
                  d="M30 5 Q 5 5 5 25 Q 5 35 15 35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WELCOME ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          ref={r1.ref}
          className={`mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-28 ${
            r1.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Two overlapping circular photos */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              {/* Curved blue background accent */}
              <div
                aria-hidden
                className="absolute -left-6 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/10"
              />
              <div className="absolute right-0 top-0">
                <CircularImage
                  src="/images/about-welcome-1.jpg"
                  alt="Rides team at work"
                  size="lg"
                  dotPosition="top-right"
                />
              </div>
              <div className="absolute -bottom-4 left-2 sm:left-4">
                <CircularImage
                  src="/images/about-welcome-2.jpg"
                  alt="Rides driver in Kigali"
                  size="md"
                  dotPosition="bottom-right"
                />
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <p className="font-serif text-xl italic text-primary sm:text-2xl">Welcome to our</p>
            <h2 className="mt-1 text-5xl font-black uppercase leading-[0.95] tracking-[-0.025em] text-primary sm:text-6xl">
              Rides
            </h2>
            <div className="my-5 h-1 w-16 rounded-full bg-primary" />
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              We started Rides with a simple frustration: riders paying too
              much, drivers earning too little, and neither knowing exactly
              why. The math behind the fare was a black box, and the trust
              between the two sides of the ride was thinner than it should be.
            </p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              We built Rides to put that math in the open. Every trip shows
              the route, the distance, the time, and the share that goes to
              the driver. Safety is one tap away. None of this is novel — what
              is new is how seriously we take it.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT US ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-surface/40">
        <div
          ref={r2.ref}
          className={`mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-28 ${
            r2.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex justify-center lg:justify-start">
            <CircularImage
              src="/images/about-us.jpg"
              alt="Our city — Kigali"
              size="xl"
              dotPosition="top-left"
            />
          </div>
          <div>
            <h2 className="text-5xl font-black uppercase tracking-[-0.025em] text-primary sm:text-6xl">
              About us
            </h2>
            <div className="my-5 h-1 w-16 rounded-full bg-primary" />
            <ul className="space-y-5">
              {ABOUT_BULLETS.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <span className="mt-1.5 flex h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />
                  <div>
                    <p className="text-sm font-bold text-foreground sm:text-base">
                      {b.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {b.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 4. WHY CHOOSE RIDES (blue panel) ──────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        {/* Big curved accent on right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-white/5"
        />
        <div
          ref={r3.ref}
          className={`relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-28 ${
            r3.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-56 w-56 overflow-hidden rounded-full ring-[6px] ring-white/30 ring-offset-4 ring-offset-primary sm:h-64 sm:w-64 lg:h-72 lg:w-72">
              <Photo
                src="/images/about-why.jpg"
                alt="Why choose Rides"
                className="h-full w-full"
              />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase tracking-[-0.025em] sm:text-5xl">
              Why choose Rides
            </h2>
            <div className="my-5 h-1 w-16 rounded-full bg-white/70" />
            <ul className="space-y-3">
              {WHY_RIDES.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm sm:text-[15px]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. OUR APPROACH (blue side band) ──────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          ref={r5.ref}
          className={`relative grid transition-all duration-700 ease-out lg:grid-cols-[18rem_1fr] ${
            r5.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Left blue band with rotated label */}
          <div className="relative flex items-center justify-center bg-primary p-10 text-primary-foreground lg:min-h-[24rem]">
            <div className="lg:[writing-mode:vertical-rl] lg:rotate-180">
              <p className="font-serif text-2xl italic">our</p>
              <h2 className="text-5xl font-black uppercase tracking-[-0.02em] lg:mt-2">
                Approach
              </h2>
            </div>
          </div>

          {/* Right values list */}
          <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 lg:py-20">
            <ul className="space-y-7">
              {APPROACH.map((a) => (
                <li key={a.title} className="flex items-start gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                    {a.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {a.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                      {a.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. BY THE NUMBERS (chart) ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          ref={r6.ref}
          className={`mx-auto max-w-7xl px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:py-28 ${
            r6.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Heading on blue panel */}
          <div className="rounded-3xl bg-primary px-8 py-10 text-center text-primary-foreground sm:px-12">
            <h2 className="text-3xl font-black uppercase tracking-[-0.025em] sm:text-4xl">
              By the numbers
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              Every quarter, more drivers earning more fairly, more riders
              moving more easily. Steady, transparent, real.
            </p>
          </div>

          {/* Chart */}
          <div className="mt-12 rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="flex h-56 items-end gap-4 sm:gap-8 sm:h-64">
              {CHART.map((c, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-1000 ease-out ${
                        i === CHART.length - 1
                          ? "bg-primary"
                          : i === CHART.length - 2
                            ? "bg-primary/70"
                            : "bg-foreground"
                      }`}
                      style={{
                        height: r6.visible ? `${c.value}%` : "0%",
                        transitionDelay: `${i * 100}ms`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <p className="text-xs text-muted-foreground">
                Rides delivered per quarter (in thousands) — illustrative.
              </p>
              <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-foreground" /> Past
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Current
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. OUR GROWTH ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-surface/40">
        <div
          ref={r7.ref}
          className={`mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-28 ${
            r7.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div>
            <h2 className="text-4xl font-black uppercase tracking-[-0.025em] text-foreground sm:text-5xl">
              Our <span className="text-primary">growth</span>
            </h2>
            <div className="my-5 h-1 w-16 rounded-full bg-primary" />
            <ul className="space-y-3">
              {GROWTH.map((g, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <p className="text-sm leading-relaxed text-foreground sm:text-[15px]">
                    {g}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end">
            <CircularImage
              src="/images/about-growth.jpg"
              alt="Rides growth"
              size="xl"
              dotPosition="bottom-right"
            />
          </div>
        </div>
      </section>

      {/* ── 9. GET IN TOUCH ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          ref={r8.ref}
          className={`mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:py-28 ${
            r8.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex justify-center lg:justify-start">
            <CircularImage
              src="/images/about-contact.jpg"
              alt="Get in touch"
              size="xl"
              dotPosition="top-right"
            />
          </div>

          <div>
            <h2 className="text-5xl font-black uppercase tracking-[-0.025em] text-foreground sm:text-6xl">
              Thank <span className="text-primary">you</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              We are easy to reach. Whether you ride, drive, partner, or just
              want to ask — we will answer.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <a href="tel:+250789534491" className="text-sm font-semibold text-foreground hover:text-primary sm:text-base">
                  +250 789 534 491
                </a>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <a href="mailto:hello@rides.rw" className="text-sm font-semibold text-foreground hover:text-primary sm:text-base">
                  hello@rides.rw
                </a>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <a href="https://rides.rw" className="text-sm font-semibold text-foreground hover:text-primary sm:text-base">
                  rides.rw
                </a>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  Kimironko, Kigali · Rwanda
                </span>
              </li>
            </ul>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Book a ride
              </Link>
              <Link
                href="/drivers"
                className="inline-flex h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
              >
                Drive with us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
