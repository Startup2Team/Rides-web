import type { ReactNode } from "react";
import { CarIcon, FusoIcon, HiluxIcon, MotoIcon } from "./vehicle-icons";

// ── Shared claymorphism filter / gradient defs ────────────────────────────────

function ClayDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fafafa" />
        <stop offset="0.55" stopColor="#e5e5e5" />
        <stop offset="1" stopColor="#b9b9b9" />
      </linearGradient>
      <radialGradient id={`${id}-hi`} cx="0.35" cy="0.3" r="0.55">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9a9a9a" />
        <stop offset="1" stopColor="#666666" />
      </linearGradient>
      <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000" floodOpacity="0.18" />
      </filter>
    </defs>
  );
}

// ── Illustrations ────────────────────────────────────────────────────────────

function LiveTrackingArt() {
  const id = "art-lt";
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
      <ClayDefs id={id} />
      {/* Ground pulse ovals */}
      <ellipse cx="120" cy="186" rx="80" ry="14" fill="none" stroke="#c4c4c4" strokeWidth="1" opacity="0.55" />
      <ellipse cx="120" cy="186" rx="52" ry="9" fill="none" stroke="#a8a8a8" strokeWidth="1" opacity="0.65" />
      {/* Dotted route */}
      <path d="M 22 220 Q 80 178 130 195 T 220 152" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" opacity="0.6" />
      {/* Pin */}
      <g filter={`url(#${id}-soft)`}>
        <path d="M120 50 C 92 50 70 72 70 100 C 70 142 120 192 120 192 C 120 192 170 142 170 100 C 170 72 148 50 120 50 Z" fill={`url(#${id}-base)`} />
        <path d="M120 50 C 92 50 70 72 70 100 C 70 142 120 192 120 192 C 120 192 170 142 170 100 C 170 72 148 50 120 50 Z" fill={`url(#${id}-hi)`} opacity="0.55" />
        <circle cx="120" cy="100" r="20" fill={`url(#${id}-rim)`} />
        <circle cx="120" cy="100" r="20" fill={`url(#${id}-hi)`} opacity="0.55" />
      </g>
    </svg>
  );
}

function NegotiateArt() {
  const id = "art-ng";
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
      <ClayDefs id={id} />
      {/* Back coin */}
      <g filter={`url(#${id}-soft)`} transform="translate(56 64) rotate(-14 60 60)">
        <ellipse cx="60" cy="60" rx="55" ry="55" fill={`url(#${id}-base)`} />
        <ellipse cx="60" cy="60" rx="55" ry="55" fill={`url(#${id}-hi)`} opacity="0.6" />
        <ellipse cx="60" cy="60" rx="38" ry="38" fill="none" stroke="#9a9a9a" strokeWidth="2" opacity="0.55" />
      </g>
      {/* Front coin */}
      <g filter={`url(#${id}-soft)`} transform="translate(104 100) rotate(10 60 60)">
        <ellipse cx="60" cy="60" rx="60" ry="60" fill={`url(#${id}-base)`} />
        <ellipse cx="60" cy="60" rx="60" ry="60" fill={`url(#${id}-hi)`} opacity="0.7" />
        <text x="60" y="72" textAnchor="middle" fontSize="34" fontWeight="800" fill="#7a7a7a">₣</text>
      </g>
    </svg>
  );
}

function PayArt() {
  const id = "art-pay";
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full" aria-hidden>
      <ClayDefs id={id} />
      <g filter={`url(#${id}-soft)`} transform="translate(80 32) rotate(-5 40 88)">
        <rect x="0" y="0" width="80" height="176" rx="16" fill={`url(#${id}-base)`} />
        <rect x="0" y="0" width="80" height="176" rx="16" fill={`url(#${id}-hi)`} opacity="0.55" />
        <rect x="6" y="14" width="68" height="148" rx="8" fill="#d4d4d4" />
        <rect x="14" y="22" width="50" height="3" rx="1.5" fill="#a0a0a0" opacity="0.7" />
        <rect x="14" y="36" width="50" height="6" rx="3" fill="#8c8c8c" />
        <rect x="14" y="48" width="36" height="4" rx="2" fill="#a8a8a8" />
        <circle cx="40" cy="92" r="22" fill="#ffffff" />
        <circle cx="40" cy="92" r="22" fill={`url(#${id}-hi)`} opacity="0.7" />
        <text x="40" y="100" textAnchor="middle" fontSize="20" fontWeight="800" fill="#7a7a7a">$</text>
        <rect x="14" y="128" width="50" height="20" rx="10" fill="#9c9c9c" />
        <text x="39" y="142" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fafafa">PAY</text>
      </g>
    </svg>
  );
}

function MultiModalArt({ size = "lg" }: { size?: "lg" | "sm" }) {
  // Large variant — bigger tiles, more padding. Used in the hero card.
  const tile =
    size === "lg"
      ? "h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28"
      : "h-14 w-14 sm:h-16 sm:w-16";
  const gap = size === "lg" ? "gap-5 sm:gap-6" : "gap-3";
  const icon =
    size === "lg"
      ? "h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
      : "h-7 w-7 sm:h-8 sm:w-8";
  return (
    <div className={`grid grid-cols-2 ${gap} text-foreground/80`}>
      <ClayTile className={tile}>
        <MotoIcon className={icon} />
      </ClayTile>
      <ClayTile className={tile}>
        <CarIcon className={icon} />
      </ClayTile>
      <ClayTile className={tile}>
        <HiluxIcon className={icon} />
      </ClayTile>
      <ClayTile className={tile}>
        <FusoIcon className={icon} />
      </ClayTile>
    </div>
  );
}

function ClayTile({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(to bottom, #fafafa, #e1e1e1)",
        boxShadow:
          "0 12px 24px -10px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -2px 2px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </span>
  );
}

// ── Reusable atoms ───────────────────────────────────────────────────────────

function Badge({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]">
      <span className="h-px w-6 bg-muted-foreground/40" />
      {children}
    </p>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <section id="features" className="relative py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Intro */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Built for the trip
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-muted-foreground sm:text-4xl lg:text-5xl">
            Everything you need, on your terms
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Built around how Rwanda actually moves. Fair prices, the right
            vehicle, and full visibility from book to drop-off.
          </p>
        </div>

        {/* Bento grid */}
        <div className="features-bento mt-10">

          {/* LARGE — Multi-modal (tall left card, illustration anchored top, copy at bottom) */}
          <article
            data-area="large"
            className="group relative flex min-h-[22rem] flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-7 lg:min-h-[24rem] lg:p-8"
          >
            {/* Illustration anchored TOP — sits in the upper portion */}
            <div className="flex items-start justify-center pb-4">
              <div className="w-full max-w-[15rem]">
                <MultiModalArt size="lg" />
              </div>
            </div>
            {/* Spacer pushes copy to the bottom for that tall-breathing-room feel */}
            <div className="flex-1" />
            {/* Copy anchored BOTTOM */}
            <div>
              <Badge>Multi-modal</Badge>
              <h3 className="mt-3 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.5rem]">
                Pick your ride.
              </h3>
              <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                A moto for a quick run. A cab for comfort. A hilux for rough
                roads. A fuso for a full haul. One app, four ways to move.
              </p>
            </div>
          </article>

          {/* WIDE — Live tracking (top right, copy left, large illustration right) */}
          <article
            data-area="wide"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
          >
            <div className="grid h-full gap-6 sm:grid-cols-[1.1fr_1fr] sm:items-center">
              <div className="flex flex-col">
                <Badge>Real-time</Badge>
                <h3 className="mt-3 text-balance text-2xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-3xl lg:text-[2rem]">
                  Eyes on every trip.
                </h3>
                <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Follow your driver on the map as they approach. Share the
                  live trip with anyone you trust.
                </p>
              </div>
              {/* Illustration — sized to the wide-card row height */}
              <div className="relative mx-auto h-44 w-44 sm:h-48 sm:w-48 lg:h-52 lg:w-52">
                <LiveTrackingArt />
              </div>
            </div>
          </article>

          {/* SQ1 — Negotiate (small, horizontal layout matching reference) */}
          <article
            data-area="sq1"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="grid h-full grid-cols-[1fr_auto] items-center gap-3">
              <div className="flex flex-col">
                <Badge>Fair pricing</Badge>
                <h3 className="mt-3 text-balance text-xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-2xl">
                  Name your price.
                </h3>
                <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  See the suggested fare, send a counter-offer. No surge surprises.
                </p>
              </div>
              <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
                <NegotiateArt />
              </div>
            </div>
          </article>

          {/* SQ2 — Pay (small, horizontal layout matching reference) */}
          <article
            data-area="sq2"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="grid h-full grid-cols-[1fr_auto] items-center gap-3">
              <div className="flex flex-col">
                <Badge>Mobile money</Badge>
                <h3 className="mt-3 text-balance text-xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-2xl">
                  Pay your way.
                </h3>
                <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  MoMo, Airtel, or cash to your driver. Same flow either way.
                </p>
              </div>
              <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
                <PayArt />
              </div>
            </div>
          </article>
        </div>

      </div>
    </section>
  );
}
