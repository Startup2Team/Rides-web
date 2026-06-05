import Link from "next/link";
import type { ComponentType } from "react";
import { RidesLogo } from "./rides-logo";
import { CarIcon, FusoIcon, HiluxIcon, MotoIcon } from "./vehicle-icons";
import { HeroOrbit } from "./hero-orbit";

type Vehicle = { name: string; Icon: ComponentType<{ className?: string }> };

const vehicles: Vehicle[] = [
  { name: "Moto", Icon: MotoIcon },
  { name: "Cab", Icon: CarIcon },
  { name: "Hilux", Icon: HiluxIcon },
  { name: "Fuso", Icon: FusoIcon },
];

const stats: { label: string; value: string }[] = [
  { value: "4", label: "Vehicle types" },
  { value: "24/7", label: "Live dispatch" },
  { value: "MoMo + Airtel", label: "Pay your way" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[5fr_7fr] lg:gap-12">
        {/* ── Left: copy column ── */}
        <div className="max-w-xl">
          <h1
            className="hero-rise text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "0ms" }}
          >
            Move around Rwanda,{" "}
            <span className="text-primary">your way.</span>
          </h1>

          <p
            className="hero-rise mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg"
            style={{ animationDelay: "60ms" }}
          >
            Book a moto, cab, hilux pickup, or fuso truck in one app. Fair
            pricing every time, pay with mobile money.
          </p>

          {/* Vehicle chip row — the multi-modal pitch, visible at every size */}
          <ul
            className="hero-rise mt-6 flex flex-wrap gap-2"
            style={{ animationDelay: "120ms" }}
          >
            {vehicles.map((v) => (
              <li
                key={v.name}
                className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 ring-1 ring-inset ring-border"
              >
                <v.Icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold tracking-tight text-foreground">
                  {v.name}
                </span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div
            className="hero-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/#download"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Download App
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              See how it works
            </Link>
          </div>

          <p
            className="hero-rise mt-3 text-[11px] text-muted-foreground"
            style={{ animationDelay: "240ms" }}
          >
            Free · Available on iOS & Android
          </p>

          {/* Stat row replaces the placeholder trust strip */}
          <dl
            className="hero-rise mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 sm:gap-6"
            style={{ animationDelay: "300ms" }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="mt-1 text-sm font-bold tracking-tight text-foreground sm:text-base">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Right: visual column ── */}
        <div
          className="hero-rise relative flex items-center justify-center"
          style={{ animationDelay: "200ms" }}
        >
          {/* Orbit rings — speed up on cursor movement, freeze on hover */}
          <HeroOrbit className="absolute inset-0 m-auto h-72 w-72 text-primary/25 sm:h-[26rem] sm:w-[26rem] lg:h-[34rem] lg:w-[34rem]" />

          {/* Soft radial wash behind the logo for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 m-auto h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(0,122,255,0.18),_transparent_60%)] blur-2xl sm:h-[26rem] sm:w-[26rem] lg:h-[34rem] lg:w-[34rem]"
          />

          <div className="relative z-10">
            <RidesLogo
              size={460}
              priority
              className="h-48 w-48 drop-shadow-2xl sm:h-72 sm:w-72 lg:h-96 lg:w-96"
              alt="Rides — Real-time smart mobility platform"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
