import Reveal from "./reveal";

const ITEMS = [
  { title: "Agreed fares", body: "Every price is confirmed before the trip. No surge, no meter creep, no end-of-ride surprises." },
  { title: "GPS-verified trips", body: "Pickups, arrivals and no-shows are checked against real location data — not just a tap." },
  { title: "Verified drivers", body: "Riders submit documents and are reviewed before they can accept a single trip." },
  { title: "Free in-app calling", body: "Reach your driver directly at no cost — coordinate pickup without sharing your number." },
  { title: "Anti-fraud built in", body: "Device checks and a cancellation-penalty system keep bad actors off the platform." },
  { title: "Always reachable", body: "24/7 dispatch and in-app support stay with the trip from request to arrival." },
];

export default function Safety() {
  return (
    <section id="safety" className="rides-section">
      <div className="rides-container">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="rides-num">04</span>
                <span className="rides-label">Safety &amp; trust</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="rides-h2 mt-6 max-w-[18ch]">Trust isn&apos;t a feature. It&apos;s the foundation.</h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 80}>
              <div className="border-t py-7" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--ink)" }}>{it.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{it.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
