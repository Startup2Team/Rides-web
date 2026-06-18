import Reveal from "./reveal";

const STEPS = [
  {
    n: "01",
    title: "Request a ride",
    body: "Set pickup and destination. Rides finds the nearest moto, cab or truck in seconds and shows who's coming.",
  },
  {
    n: "02",
    title: "Agree the fare",
    body: "See a fair upfront price or negotiate directly with the driver. No meters, no surge surprises — you confirm before you ride.",
  },
  {
    n: "03",
    title: "Track and arrive",
    body: "Follow every turn on the live map, call your driver for free if you need to, and pay by wallet or cash on arrival.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="rides-section">
      <div className="rides-container grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* header */}
        <div className="lg:col-span-4">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="rides-num">01</span>
              <span className="rides-label">For customers</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="rides-h2 mt-6 max-w-[14ch]">From tap to arrival in three steps.</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="rides-lead mt-6 max-w-sm">
              No haggling on the street, no guessing the price. Just a clear, tracked
              journey from the moment you tap.
            </p>
          </Reveal>
        </div>

        {/* steps */}
        <div className="lg:col-span-7 lg:col-start-6">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="grid grid-cols-[3rem_1fr] gap-5 border-t py-7 sm:grid-cols-[4rem_1fr]" style={{ borderColor: "var(--line)" }}>
                <span className="rides-num pt-1">{s.n}</span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl" style={{ color: "var(--ink)" }}>{s.title}</h3>
                  <p className="mt-2.5 leading-relaxed" style={{ color: "var(--muted)" }}>{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="rides-line" />
        </div>
      </div>
    </section>
  );
}
