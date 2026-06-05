"use client";

import { useState, type ReactNode } from "react";

type Item = {
  q: string;
  a: ReactNode;
};

const items: Item[] = [
  {
    q: "What is Taravelis?",
    a: "Taravelis is a ride-hailing platform for Kigali. We connect you with motos, cabs, hilux pickups, and fuso trucks for whatever you need — daily commutes, errands, parcel runs, or moving day.",
  },
  {
    q: "How do I book a ride?",
    a: "Download the app, sign in with your phone number, choose your vehicle type, set your pickup and destination, and confirm. A nearby driver accepts in seconds and you'll see them on the map heading to you.",
  },
  {
    q: "What vehicle types are available?",
    a: "Four: motos for quick solo trips, cabs for comfort, hilux pickups for bulky or rough-road jobs, and fuso trucks for full hauls. Pick what fits the trip and the price scales accordingly.",
  },
  {
    q: "How are fares calculated?",
    a: "You see the fare before you book — distance, vehicle type, and time of day. For drivers and customers, fares can also be negotiated up-front through the app. No surge pricing, no hidden fees.",
  },
  {
    q: "How do I pay?",
    a: "Pay in-app with MTN Mobile Money or Airtel Money. Cash is also accepted directly to the driver if you prefer.",
  },
  {
    q: "Are drivers verified?",
    a: "Every driver submits ID, vehicle insurance, and a vehicle authorization document. Our admin team reviews and approves each application before a driver can take any rides.",
  },
  {
    q: "What if I need to cancel?",
    a: "You can cancel any time before the driver arrives. Repeated cancellations after a driver is en route trigger a short cooldown — we do this to keep things fair for drivers.",
  },
  {
    q: "How do I become a driver?",
    a: "Tap \"Drivers\" in the nav and start the application. You'll need a valid licence, vehicle insurance, and an inspection certificate. Approval usually takes 24–48 hours.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              FAQ
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Everything you need to know about riding, driving, paying, and
              staying safe with Taravelis. Still not finding it?{" "}
              <a
                href="/contact"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Send us a message
              </a>
              .
            </p>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map((it, i) => {
                const open = openIndex === i;
                return (
                  <li key={it.q}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none sm:px-6"
                    >
                      <span className="flex-1 text-sm font-semibold text-foreground sm:text-base">
                        {it.q}
                      </span>
                      <ChevronIcon open={open} />
                    </button>
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      hidden={!open}
                      className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6"
                    >
                      {it.a}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
