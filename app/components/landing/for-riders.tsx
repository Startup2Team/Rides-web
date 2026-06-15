import Link from "next/link";
import Reveal from "./reveal";

const POINTS = [
  { n: "01", title: "Keep the fare", body: "Buy ride packages instead of paying per-trip commission. What you agree with the customer is what you earn." },
  { n: "02", title: "Earn bonuses", body: "Hit purchase milestones and free ride credits land in your account automatically." },
  { n: "03", title: "Flexible hours", body: "Go online whenever suits you. The dispatch engine finds you the closest requests in real time." },
  { n: "04", title: "Your time respected", body: "Fair cancellation rules and GPS-verified no-show handling protect you from wasted trips." },
];

export default function ForRiders() {
  return (
    <section id="riders" className="rides-section" style={{ background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" }}>
      <div className="rides-container grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="rides-num">03</span>
              <span className="rides-label" style={{ color: "rgba(255,255,255,0.6)" }}>For riders</span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="rides-h2 mt-6 max-w-[13ch]">Drive on your terms. Keep what you earn.</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="rides-lead mt-6 max-w-md" style={{ color: "rgba(255,255,255,0.66)" }}>
              Rides is built so drivers keep more and waste less — no per-trip cut, no
              dead time, no games.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <Link href="/drivers" className="rides-btn rides-btn-primary mt-9">
              Become a rider
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg sm:grid-cols-2" style={{ background: "rgba(255,255,255,0.12)" }}>
            {POINTS.map((p, i) => (
              <Reveal key={p.n} delay={i * 80} style={{ background: "var(--ink)" }}>
                <div className="h-full p-6">
                  <span className="rides-num">{p.n}</span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
