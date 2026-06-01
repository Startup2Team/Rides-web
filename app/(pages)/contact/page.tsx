import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Rides",
  description:
    "Get in touch with the Rides team — riders, drivers, partners, and press.",
};

const channels = [
  {
    label: "General",
    value: "hello@rides.com",
    href: "mailto:hello@rides.com",
    hint: "For anything that doesn't fit elsewhere",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 7L2 7" />
      </svg>
    ),
  },
  {
    label: "Support",
    value: "support@rides.com",
    href: "mailto:support@rides.com",
    hint: "Rider and driver issues",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    value: "+250 788 000 000",
    href: "https://wa.me/250788000000",
    hint: "Fastest reply during business hours",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+250 788 000 000",
    href: "tel:+250788000000",
    hint: "Mon–Sat · 08:00–20:00 CAT",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
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
              Whether you&apos;re a rider, driver, partner, or just curious —
              pick a category below and we&apos;ll route your message to the
              right team.
            </p>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-5 lg:gap-12">
            <div className="space-y-3 lg:col-span-2">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {c.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {c.label}
                    </p>
                    <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
                      {c.value}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {c.hint}
                    </p>
                  </div>
                </a>
              ))}

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Office
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  Kigali Heights, KG 7 Ave
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Kacyiru, Gasabo · Kigali, Rwanda
                </p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
