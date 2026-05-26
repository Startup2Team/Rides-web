import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Taravelis",
  description:
    "Get in touch with the Taravelis team — riders, drivers, partners, and press.",
};

const channels = [
  {
    label: "General",
    value: "hello@taravelis.com",
    href: "mailto:hello@taravelis.com",
  },
  {
    label: "Support",
    value: "support@taravelis.com",
    href: "mailto:support@taravelis.com",
  },
  {
    label: "Phone",
    value: "+250 788 000 000",
    href: "tel:+250788000000",
  },
];

export default function ContactPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Contact
            </p>
            <h1 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
              We&apos;d love to{" "}
              <span className="text-primary">hear from you</span>
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
              Whether you&apos;re a rider, driver, partner, or just curious — we
              usually reply within one business day.
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-5 lg:gap-12">
            <div className="space-y-3 lg:col-span-2">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-1.5 text-base font-semibold tracking-tight text-foreground">
                    {c.value}
                  </p>
                </a>
              ))}
            </div>

            <form className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Name
                  </span>
                  <input
                    name="name"
                    type="text"
                    className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Message
                </span>
                <textarea
                  name="message"
                  rows={5}
                  className="mt-2 block w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <button
                type="button"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
