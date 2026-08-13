type Item = {
  q: string;
  a: string;
};

const items: Item[] = [
  {
    q: "What is Rides?",
    a: "Rides is one app for every way you move. A moto when you're late. A cab when it matters. A hilux for the rough road. A fuso for moving day. You choose the vehicle, you see the fare before you book, and you follow the driver the whole way.",
  },
  {
    q: "How do I book a ride?",
    a: "Sign in with your phone number, pick your vehicle, set your pickup and destination, and confirm. A nearby driver accepts in seconds — then you watch them come to you on the map.",
  },
  {
    q: "What vehicle types are available?",
    a: "Four. Motos for a quick solo run. Cabs when you want comfort. Hilux pickups for bulky loads and rough roads. Fuso trucks for a full haul. The price scales with what you pick, so you never pay for more vehicle than the trip needs.",
  },
  {
    q: "How are fares calculated?",
    a: "Distance, vehicle type, and time of day — and you see the number before you book. Fares can also be negotiated up front in the app, by riders and drivers alike. No surge pricing. No hidden fees.",
  },
  {
    q: "How do I pay?",
    a: "MTN Mobile Money or Airtel Money, straight from the app. Prefer cash? Pay the driver directly — the same fare either way.",
  },
  {
    q: "Are drivers verified?",
    a: "Every driver submits their ID, vehicle insurance, and a vehicle authorization document before they can take a single trip. Our team reviews and approves each application by hand — nobody signs up automatically.",
  },
  {
    q: "What if I need to cancel?",
    a: "Cancel any time before your driver arrives. Cancel repeatedly once a driver is already on the way and you will hit a short cooldown — that one is for the drivers, who turn down other trips to reach you.",
  },
  {
    q: "How do I become a driver?",
    a: "Tap Drivers in the menu and start your application. You will need a valid licence, vehicle insurance, and an inspection certificate. Approval usually takes 24–48 hours.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />
              FAQ
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-muted-foreground sm:text-4xl lg:text-[3.25rem]">
              Frequently asked questions
            </h2>
            <p className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Everything you need to know about riding, driving, paying, and
              staying safe with Rides. Still not finding it?{" "}
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
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item) => (
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
        </div>
      </div>
    </section>
  );
}
