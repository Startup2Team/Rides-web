"use client";

import { useEffect, useRef, useState } from "react";
import { useSection } from "../../i18n/context";

// Palette comes from the site theme tokens: primary (blue) plays the accent
// role, foreground the dark-band role, accent the light panel role.

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

// ── Inline icon set ──────────────────────────────────────────────────────────

const ICON_PATHS: Record<string, React.ReactNode> = {
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  userCheck: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </>
  ),
  store: (
    <>
      <path d="M3 9l2-5h14l2 5" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 11.5 11 13.5 15 9.5" />
    </>
  ),
  move: (
    <>
      <polyline points="5 9 2 12 5 15" />
      <polyline points="9 5 12 2 15 5" />
      <polyline points="15 19 12 22 9 19" />
      <polyline points="19 9 22 12 19 15" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </>
  ),
  chart: (
    <>
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="6" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
};

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// ── Photo with graceful placeholder ──────────────────────────────────────────

function Photo({
  src,
  alt,
  className = "",
  priority = false,
  fit = "cover",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const showPlaceholder = err || (!ok && !priority);
  return (
    <div className={`relative overflow-hidden ${fit === "contain" ? "" : "bg-accent"} ${className}`}>
      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary/40" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="px-2 text-[10px] leading-tight text-muted-foreground/60">{src}</p>
        </div>
      )}
      {!err && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
          className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"} ${
            priority
              ? "opacity-100"
              : `transition-opacity duration-500 ${ok ? "opacity-100" : "opacity-0"}`
          }`}
        />
      )}
    </div>
  );
}

// ── Section building blocks ──────────────────────────────────────────────────

const VALUE_ICONS = ["user", "move", "userCheck", "chart", "bulb", "shieldCheck", "users", "star"];
const COMMIT_ICONS = ["users", "globe", "monitor", "store", "shieldCheck"];
const IMPACT_ICONS = ["users", "briefcase", "globe", "heart"];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const about = useSection("about");

  return (
    <main className="flex-1 overflow-x-hidden bg-background">

      {/* ── 1. HERO — story, photo + purpose card, vision & mission ────────── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_1.1fr_1fr] lg:gap-10 lg:py-24">

          {/* Left — narrative */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {about.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-muted-foreground sm:text-4xl lg:text-[2.35rem]">
              {about.heroHeadline}
            </h1>
            <p className="mt-6 text-pretty text-sm leading-[1.65] text-muted-foreground sm:text-[15px]">
              {about.heroP1}
            </p>
            <p className="mt-4 text-pretty text-sm leading-[1.65] text-muted-foreground sm:text-[15px]">
              {about.heroP2}
            </p>
            <p className="mt-6 text-sm font-bold text-foreground sm:text-[15px]">
              {about.beliefLead}
            </p>
            <p className="mt-1 text-pretty text-lg font-bold leading-snug text-primary sm:text-xl">
              {about.beliefHighlight}
            </p>
          </div>

          {/* Middle — purpose card above, fleet cutout below, no overlap */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="ml-auto mr-2 w-56 rounded-2xl bg-card p-5 shadow-xl shadow-foreground/15 sm:mr-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon name="users" className="h-5 w-5" />
                </span>
                <p className="text-sm font-bold text-foreground">{about.purposeTitle}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {about.purposeBody}
              </p>
            </div>
            <Photo
              src="/images/about-fleet.png"
              alt="Our full fleet: sedan, moto with driver and passenger, pickup, and cargo truck"
              className="mt-8 w-full scale-105 lg:scale-110"
              fit="contain"
              priority
            />
          </div>

          {/* Right — vision & mission */}
          <div className="space-y-10 lg:pl-4">
            <div className="border-b border-border pb-10">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon name="eye" className="h-6 w-6" />
                </span>
                <h2 className="text-xl font-bold text-muted-foreground sm:text-2xl">
                  {about.visionTitle}
                </h2>
              </div>
              <p className="mt-4 text-pretty text-sm leading-[1.65] text-muted-foreground sm:text-[15px]">
                {about.visionParts.map((part, i) =>
                  part.highlight ? (
                    <span key={i} className="font-bold text-primary">
                      {part.text}
                    </span>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon name="target" className="h-6 w-6" />
                </span>
                <h2 className="text-xl font-bold text-muted-foreground sm:text-2xl">
                  {about.missionTitle}
                </h2>
              </div>
              <p className="mt-4 text-pretty text-sm leading-[1.65] text-muted-foreground sm:text-[15px]">
                {about.missionBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. COMMITMENT BAND ─────────────────────────────────────────────── */}
      <section className="px-6 sm:px-10">
        <div
          ref={r1.ref}
          className={`mx-auto max-w-7xl rounded-3xl bg-primary px-8 py-10 shadow-lg shadow-primary/25 transition-all duration-700 ease-out sm:px-10 ${
            r1.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-12">
            <h2 className="max-w-[12rem] text-2xl font-bold leading-tight text-primary-foreground sm:text-[1.75rem]">
              {about.commitHeading}
            </h2>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {about.commitments.map((text, i) => (
                <li
                  key={text}
                  className="flex items-start gap-4 lg:flex-col lg:gap-4 lg:border-l lg:border-primary-foreground/20 lg:pl-6"
                >
                  <span className="text-primary-foreground">
                    <Icon name={COMMIT_ICONS[i] ?? "users"} className="h-8 w-8" />
                  </span>
                  <p className="text-sm leading-relaxed text-primary-foreground/85">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. CORE VALUES + LONG-TERM IMPACT ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          ref={r2.ref}
          className={`mx-auto grid max-w-7xl items-start gap-12 px-6 py-16 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14 lg:py-24 ${
            r2.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Values grid */}
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-muted-foreground sm:text-3xl">
              {about.valuesHeading}
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {about.values.map((v, i) => (
                <li key={v.title} className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={VALUE_ICONS[i] ?? "star"} className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground sm:text-base">
                      {i + 1}. {v.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {v.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact panel */}
          <aside className="rounded-3xl bg-accent p-7 sm:p-8">
            <h2 className="text-xl font-bold tracking-[-0.02em] text-muted-foreground sm:text-2xl">
              {about.impactHeading}
            </h2>
            <p className="mt-4 text-pretty text-sm leading-[1.65] text-muted-foreground">
              {about.impactBody}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {about.impactStats.map((s, i) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-card px-4 py-6 text-center shadow-sm"
                >
                  <span className="text-primary">
                    <Icon name={IMPACT_ICONS[i] ?? "star"} className="h-7 w-7" />
                  </span>
                  {s.value ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold leading-snug text-foreground">{s.label}</p>
                  )}
                </div>
              ))}
            </div>
            <h3 className="mt-7 text-lg font-bold text-muted-foreground">
              {about.promiseHeading}
            </h3>
            <p className="mt-3 text-pretty text-sm leading-[1.65] text-muted-foreground">
              {about.promiseBody}
            </p>
          </aside>
        </div>
      </section>

      {/* ── 4. MOTTO BAND ──────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 sm:px-10 lg:pb-24">
        <div
          ref={r3.ref}
          className={`mx-auto max-w-7xl overflow-hidden rounded-3xl transition-all duration-700 ease-out ${
            r3.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-2">
            {/* Community motto — navy */}
            <div className="flex items-center gap-5 bg-primary px-8 py-9 md:pr-16">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                <Icon name="users" className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
                  {about.communityMottoLabel}
                </p>
                <p className="mt-1 text-lg font-bold text-primary-foreground sm:text-xl">
                  {about.communityMotto}
                </p>
              </div>
            </div>
            {/* Organization motto — orange, with slanted seam on desktop */}
            <div className="relative flex items-center gap-5 bg-accent px-8 py-9 md:pl-14">
              <div
                aria-hidden
                className="absolute inset-y-0 -left-6 hidden w-12 -skew-x-12 bg-accent md:block"
              />
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon name="star" className="h-6 w-6" />
              </span>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {about.orgMottoLabel}
                </p>
                <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">
                  {about.orgMotto}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
