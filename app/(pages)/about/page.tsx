import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Rides",
  description:
    "Building the future of mobility in Africa — safe, transparent, and connected.",
};

const pillars = [
  {
    title: "Our mission",
    description:
      "Make every ride feel safe, fair, and effortless — for riders and drivers alike.",
  },
  {
    title: "Our approach",
    description:
      "Real-time intelligence, transparent fares, and tools that put people first.",
  },
  {
    title: "Our home",
    description:
      "Built in Rwanda, designed for the cities and routes of Africa.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              About
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
              Building the future of mobility in{" "}
              <span className="text-primary">Africa</span>
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Rides connects riders and drivers through real-time
              intelligence — making everyday travel safer, more transparent, and
              more connected.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
