import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#00A040] px-8 py-16 text-center shadow-2xl shadow-primary/30 sm:px-12 lg:px-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-black/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/80">
              Get Started
            </p>
            <h2 className="mt-4 text-balance text-4xl font-bold tracking-[-0.02em] text-primary-foreground sm:text-5xl lg:text-6xl">
              Ready to ride?
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-primary-foreground/90 lg:text-lg">
              Download Taravelis and book your first ride in seconds. Negotiate
              fares, track drivers live, and pay via Mobile Money.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/download"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-3 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-7 w-7"
                  aria-hidden
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74.79 0 2.25-.92 3.78-.78 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">
                    Download on the
                  </div>
                  <div className="text-base font-semibold leading-tight">
                    App Store
                  </div>
                </div>
              </Link>

              <Link
                href="/download"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-3 text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-7 w-7"
                  aria-hidden
                >
                  <path d="M3 2.5C2.4 2.7 2 3.2 2 3.9v16.2c0 .7.4 1.2 1 1.4l10.8-9.5L3 2.5zm12.5 7.6 3.5 2c.9.5.9 1.9 0 2.5l-3.5 2L13.2 12l2.3-2zM3.6 22l10.7-9.5 2 1.8L4.3 22.3l-.7-.3zm0-19.9.6-.3L16.3 9.7l-2 1.8L3.6 2.1z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80">
                    Get it on
                  </div>
                  <div className="text-base font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
