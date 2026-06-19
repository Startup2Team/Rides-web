import Image from "next/image";
import Link from "next/link";

/* ───────────────────────────────────────────────────────────────────────── */
/* DATA                                                                       */
/* ───────────────────────────────────────────────────────────────────────── */

const BENEFITS = [
  {
    title: "Daily payouts",
    detail:
      "Paid every working day, straight to your mobile money. No weekly batches, no minimum threshold.",
  },
  {
    title: "Driver-first economics",
    detail:
      "Transparent fares with no hidden cuts. You see what you'll earn before you accept the trip.",
  },
  {
    title: "Real human support",
    detail:
      "A live team in Kigali on call 24/7. When something goes wrong, someone actually answers.",
  },
  {
    title: "Built in Rwanda",
    detail:
      "Local team, local routes, local payment rails. We understand how Rwanda moves.",
  },
];

const HOW_TO_APPLY = [
  {
    n: 1,
    title: "Download the app",
    detail:
      "Get the Rides Driver app from the App Store or Google Play.",
  },
  {
    n: 2,
    title: "Submit your details",
    detail:
      "The app walks you through it. Specific requirements for your vehicle appear during this step.",
  },
  {
    n: 3,
    title: "Start earning",
    detail:
      "We review and approve you, usually within 24 to 48 hours. Then you're live.",
  },
];


/* ───────────────────────────────────────────────────────────────────────── */
/* HERO ILLUSTRATION                                                          */
/* ───────────────────────────────────────────────────────────────────────── */

function DriversHeroArt() {
  return (
    <div className="relative w-full max-w-[520px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 55%, rgb(16 185 129 / 0.16), transparent 70%)",
        }}
      />
      <Image
        src="/images/drivers-fleet-africa.png"
        alt="3D illustration of Africa with the four Rides vehicles — moto, cab, hilux and fuso — positioned around a central destination pin"
        width={1040}
        height={1040}
        priority
        sizes="(max-width: 1024px) 100vw, 520px"
        className="h-auto w-full object-contain"
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */
/* PAGE                                                                       */
/* ───────────────────────────────────────────────────────────────────────── */

export default function DriversPage() {
  return (
    <main className="flex-1">
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden py-16 sm:min-h-[calc(100svh-5rem)] lg:py-20">
        {/* Soft tinted background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 50%, rgb(16 185 129 / 0.08), transparent 65%), radial-gradient(ellipse 50% 40% at 75% 50%, rgb(0 122 255 / 0.06), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {/* ── Left: stylized illustration ── */}
          <div className="order-2 flex items-center justify-center lg:order-1">
            <DriversHeroArt />
          </div>

          {/* ── Right: copy + downloads ── */}
          <div className="order-1 text-center lg:order-2 lg:text-left">
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-muted-foreground sm:text-5xl lg:text-[3.75rem]">
              Drive on your terms, earn on your terms.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-[1.0625rem]">
              Bring your moto, cab, hilux, or fuso. Download the Rides Driver
              app and start earning today.
            </p>

          {/* App Store + Play Store buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="#download"
              aria-label="Download on the App Store"
              className="inline-flex h-[3.25rem] items-center gap-2.5 rounded-2xl bg-foreground px-5 text-background transition-all hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-current">
                <path d="M17.05 12.5c-.03-2.94 2.4-4.36 2.51-4.43-1.37-2-3.5-2.27-4.25-2.3-1.81-.18-3.53 1.07-4.45 1.07-.93 0-2.34-1.04-3.85-1.01-1.98.03-3.81 1.15-4.83 2.92-2.06 3.58-.53 8.86 1.48 11.76 1 1.42 2.18 3.01 3.74 2.95 1.5-.06 2.07-.97 3.89-.97s2.34.97 3.93.94c1.62-.03 2.65-1.45 3.65-2.88 1.15-1.65 1.62-3.25 1.65-3.33-.04-.02-3.16-1.21-3.19-4.72z M14.45 4.07c.83-1 1.39-2.4 1.23-3.78-1.19.05-2.63.79-3.48 1.79-.77.89-1.44 2.31-1.26 3.67 1.32.1 2.68-.67 3.51-1.68z" />
              </svg>
              <span className="flex flex-col leading-none">
                <span className="text-[9.5px] tracking-[0.04em] opacity-70">Download on the</span>
                <span className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">App Store</span>
              </span>
            </Link>
            <Link
              href="#download"
              aria-label="Get it on Google Play"
              className="inline-flex h-[3.25rem] items-center gap-2.5 rounded-2xl bg-foreground px-5 text-background transition-all hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6">
                <defs>
                  <linearGradient id="gp-drivers-a" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#00d4ff" />
                    <stop offset="1" stopColor="#0066ff" />
                  </linearGradient>
                  <linearGradient id="gp-drivers-b" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#ff3b30" />
                    <stop offset="1" stopColor="#ffcc00" />
                  </linearGradient>
                </defs>
                <path d="M3.6 1.8 14 12 3.6 22.2c-.4-.3-.6-.8-.6-1.4V3.2c0-.6.2-1.1.6-1.4z" fill="url(#gp-drivers-a)" />
                <path d="M14 12 3.6 1.8c.3-.2.7-.3 1.1-.2L17.1 8 14 12z" fill="#00f078" />
                <path d="M14 12l3.1 4L4.7 22.4c-.4.1-.8 0-1.1-.2L14 12z" fill="url(#gp-drivers-b)" />
                <path d="m17.1 8 4 2.3c.9.5.9 1.9 0 2.4L17.1 16 14 12l3.1-4z" fill="#ffce00" />
              </svg>
              <span className="flex flex-col leading-none">
                <span className="text-[9.5px] tracking-[0.04em] opacity-70">Get it on</span>
                <span className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">Google Play</span>
              </span>
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
            Read what we offer below before applying.
          </p>
          </div>
        </div>
      </section>

      {/* ── 2. WHY DRIVE WITH RIDES + HOW TO APPLY ───────────────────────── */}
      <section id="requirements" className="relative py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-border" />
              Why drive with Rides
              <span className="h-px w-8 bg-border" />
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-muted-foreground sm:text-4xl lg:text-[3.25rem]">
              Built around the people doing the driving.
            </h2>
          </div>

          {/* Benefits card — single unified white card, 2x2 grid */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:mt-20">
            <div className="grid sm:grid-cols-2">
              {BENEFITS.map((b, i) => (
                <div
                  key={b.title}
                  className={`p-7 sm:p-8 lg:p-10 ${
                    /* horizontal divider on small screens, vertical on sm+ */
                    i > 0 ? "border-t border-border sm:border-t-0" : ""
                  } ${i >= 2 ? "sm:border-t sm:border-border" : ""} ${
                    i % 2 === 1 ? "sm:border-l sm:border-border" : ""
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                    </svg>
                  </span>
                  <h3 className="mt-4 text-lg font-bold tracking-tight text-muted-foreground sm:text-xl">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {b.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* How to apply — 3-step strip */}
          <div className="mt-16 lg:mt-20">
            <div className="text-center">
              <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-px w-8 bg-border" />
                How to get started
                <span className="h-px w-8 bg-border" />
              </div>
              <h3 className="mt-5 text-balance text-2xl font-bold leading-tight tracking-[-0.02em] text-muted-foreground sm:text-3xl">
                Three steps. Most drivers are live within 48 hours.
              </h3>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
              {HOW_TO_APPLY.map((s) => (
                <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
                    {s.n}
                  </span>
                  <h4 className="mt-4 text-base font-bold text-foreground">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Eligibility one-liner */}
            <p className="mx-auto mt-10 max-w-xl text-balance text-center text-sm leading-relaxed text-muted-foreground">
              You will need a valid driver&apos;s licence, a working vehicle,
              a mobile money account, and government ID. The specifics for
              your vehicle are shared in-app during application.
            </p>

            {/* Final CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#download"
                aria-label="Download on the App Store"
                className="inline-flex h-[3.25rem] items-center gap-2.5 rounded-2xl bg-foreground px-5 text-background transition-all hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 fill-current">
                  <path d="M17.05 12.5c-.03-2.94 2.4-4.36 2.51-4.43-1.37-2-3.5-2.27-4.25-2.3-1.81-.18-3.53 1.07-4.45 1.07-.93 0-2.34-1.04-3.85-1.01-1.98.03-3.81 1.15-4.83 2.92-2.06 3.58-.53 8.86 1.48 11.76 1 1.42 2.18 3.01 3.74 2.95 1.5-.06 2.07-.97 3.89-.97s2.34.97 3.93.94c1.62-.03 2.65-1.45 3.65-2.88 1.15-1.65 1.62-3.25 1.65-3.33-.04-.02-3.16-1.21-3.19-4.72z M14.45 4.07c.83-1 1.39-2.4 1.23-3.78-1.19.05-2.63.79-3.48 1.79-.77.89-1.44 2.31-1.26 3.67 1.32.1 2.68-.67 3.51-1.68z" />
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-[9.5px] tracking-[0.04em] opacity-70">Download on the</span>
                  <span className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">App Store</span>
                </span>
              </Link>
              <Link
                href="#download"
                aria-label="Get it on Google Play"
                className="inline-flex h-[3.25rem] items-center gap-2.5 rounded-2xl bg-foreground px-5 text-background transition-all hover:scale-[1.02] hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6">
                  <defs>
                    <linearGradient id="gp-drivers-bottom-a" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#00d4ff" />
                      <stop offset="1" stopColor="#0066ff" />
                    </linearGradient>
                    <linearGradient id="gp-drivers-bottom-b" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0" stopColor="#ff3b30" />
                      <stop offset="1" stopColor="#ffcc00" />
                    </linearGradient>
                  </defs>
                  <path d="M3.6 1.8 14 12 3.6 22.2c-.4-.3-.6-.8-.6-1.4V3.2c0-.6.2-1.1.6-1.4z" fill="url(#gp-drivers-bottom-a)" />
                  <path d="M14 12 3.6 1.8c.3-.2.7-.3 1.1-.2L17.1 8 14 12z" fill="#00f078" />
                  <path d="M14 12l3.1 4L4.7 22.4c-.4.1-.8 0-1.1-.2L14 12z" fill="url(#gp-drivers-bottom-b)" />
                  <path d="m17.1 8 4 2.3c.9.5.9 1.9 0 2.4L17.1 16 14 12l3.1-4z" fill="#ffce00" />
                </svg>
                <span className="flex flex-col leading-none">
                  <span className="text-[9.5px] tracking-[0.04em] opacity-70">Get it on</span>
                  <span className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">Google Play</span>
                </span>
              </Link>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Questions before you apply?{" "}
              <Link
                href="/contact?topic=driver"
                className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Talk to our team
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
