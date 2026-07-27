"use client";

import { useEffect, useRef, useState } from "react";
import { useSection, useTranslations } from "../../i18n/context";

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

// ── Photo placeholder ────────────────────────────────────────────────────────

function Photo({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const showPlaceholder = err || (!ok && !priority);
  return (
    <div className={`relative overflow-hidden bg-accent ${className}`}>
      {showPlaceholder && (
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
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
          className={`h-full w-full object-cover ${
            priority
              ? "opacity-100"
              : `transition-opacity duration-500 ${ok ? "opacity-100" : "opacity-0"}`
          }`}
        />
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const t = useTranslations("about");
  const about = useSection("about");

  return (
    <main className="flex-1 overflow-x-hidden bg-background">

      {/* ── 1. COVER HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background">

        {/* Blue circle backing the photo — sized to hug the photo, not dominate the page */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[18%] top-1/2 hidden aspect-square h-[95%] -translate-y-1/2 rounded-full bg-primary lg:block"
        />
        {/* Mobile fallback: small soft arc at the bottom-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-primary/90 lg:hidden"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[7fr_5fr] lg:gap-14 lg:py-28">
          {/* Left — copy. One focal moment: the headline. */}
          <div className="relative z-10">
            <h1 className="text-balance text-[2rem] font-semibold leading-[1.05] tracking-[-0.022em] text-muted-foreground sm:text-[3.25rem] lg:text-[3.75rem]">
              {t("heroHeadline")}
            </h1>
            <p className="mt-8 max-w-lg text-pretty text-base leading-[1.5] text-muted-foreground lg:text-[1.0625rem]">
              {t("heroSub")}
            </p>
          </div>

          {/* Right — centered circular photo on top of the blue region */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="relative h-56 w-56 sm:h-80 sm:w-80 lg:h-[26rem] lg:w-[26rem]">
              {/* Thin white ring separating photo from blue area */}
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full border-[2px] border-white/70 lg:border-white"
              />
              {/* Photo */}
              <div className="relative h-full w-full overflow-hidden rounded-full ring-[6px] ring-white shadow-2xl shadow-primary/40">
                <Photo
                  src="/images/hero.png"
                  alt="Rides — about the team"
                  className="h-full w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. WELCOME ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          ref={r1.ref}
          className={`mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-28 ${
            r1.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Two overlapping circular photos */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative h-56 w-56 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              {/* Curved blue background accent */}
              <div
                aria-hidden
                className="absolute -left-6 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-primary/10 sm:h-72 sm:w-72"
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
            <h2 className="text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-muted-foreground sm:text-4xl lg:text-[3.25rem]">
              {t("welcomeHeading")}
            </h2>
            <p className="mt-5 text-pretty text-base leading-[1.55] text-muted-foreground lg:text-[1.0625rem]">
              {t("welcomeP1")}
            </p>
            <p className="mt-4 text-pretty text-base leading-[1.55] text-muted-foreground lg:text-[1.0625rem]">
              {t("welcomeP2")}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT US ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface/40">
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
            <h2 className="text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-muted-foreground sm:text-4xl lg:text-[3.25rem]">
              {t("standForHeading")}
            </h2>
            <ul className="mt-8 space-y-5">
              {about.bullets.map((b) => (
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

      {/* ── 4. FAQ ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          ref={r3.ref}
          className={`mx-auto max-w-3xl px-6 py-20 transition-all duration-700 ease-out sm:px-10 lg:py-28 ${
            r3.visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-muted-foreground sm:text-4xl lg:text-[3.25rem]">
            {t("faqHeading")}
          </h2>

          <ul className="mt-10 divide-y divide-border border-y border-border">
            {about.faqs.map((item) => (
              <li key={item.q}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-semibold text-foreground transition-colors hover:text-primary sm:text-lg [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-open:rotate-45"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-6 pr-12 text-pretty text-sm leading-[1.6] text-muted-foreground sm:text-[15px]">
                    {item.a}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

    </main>
  );
}
