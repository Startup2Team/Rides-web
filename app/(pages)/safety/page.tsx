import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety at Rides",
  description:
    "Verified drivers, masked calls, live tracking, and 24/7 support — safety built into every ride.",
};

const features = [
  {
    title: "Verified drivers",
    description:
      "Every driver is background-checked, license-verified, and vetted before their first trip.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Masked calls",
    description:
      "Communicate with your driver without sharing your phone number — all calls route through Rides.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    title: "Live trip tracking",
    description:
      "Share your live trip with friends and family. They'll see exactly where you are, every step.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "24/7 support",
    description:
      "A real human is one tap away, around the clock — for anything from lost items to emergencies.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z" />
      </svg>
    ),
  },
];

export default function SafetyPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Safety
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
              Every ride, <span className="text-primary">safer</span>
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Safety isn&apos;t a feature — it&apos;s the foundation. Here&apos;s
              how we protect riders and drivers on every trip.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {f.icon}
                </span>
                <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                  {f.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
