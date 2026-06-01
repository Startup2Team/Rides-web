import Link from "next/link";
import { RidesLogo } from "./rides-logo";

const trustedBy = ["Brand One", "Brand Two", "Brand Three", "Brand Four"];

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[5fr_7fr] lg:gap-12">
        <div className="max-w-xl">
          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Travel <span className="text-primary">anywhere</span>, ride with
            peace of mind.
          </h1>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Rides connects travelers with trusted drivers across the
            country. Safe rides, transparent pricing, anytime you need it.
          </p>

          <Link
            href="/#download"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Download App
          </Link>

          <div className="mt-12 border-t border-border pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Trusted by travelers across the country
            </p>
            <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              {trustedBy.map((name, i) => (
                <li key={name} className="flex items-center gap-2">
                  <span
                    className={`h-8 w-8 rounded-full ring-1 ring-inset ring-border ${
                      ["bg-primary/15", "bg-foreground/10", "bg-primary/10", "bg-foreground/[0.07]"][i]
                    }`}
                  />
                  <span className="text-sm font-semibold tracking-tight text-foreground/80">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <svg
            viewBox="0 0 320 320"
            aria-hidden
            className="pointer-events-none absolute inset-0 m-auto h-72 w-72 text-primary/25 sm:h-[26rem] sm:w-[26rem] lg:h-[34rem] lg:w-[34rem]"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <ellipse
                key={i}
                cx="160"
                cy="160"
                rx="140"
                ry="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                transform={`rotate(${i * 7.5} 160 160)`}
              />
            ))}
          </svg>

          <div className="relative z-10">
            <RidesLogo
              size={460}
              priority
              className="h-56 w-56 drop-shadow-2xl sm:h-80 sm:w-80 lg:h-[460px] lg:w-[460px]"
              alt="Rides — Real-time smart mobility platform"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
