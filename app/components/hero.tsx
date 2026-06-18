import Link from "next/link";
import Reveal from "./landing/reveal";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="rides-container pb-16 pt-14 sm:pb-24 sm:pt-20">
        {/* editorial meta row */}
        <Reveal>
          <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: "var(--line)" }}>
            <span className="rides-label">Ride-hailing platform</span>
            <span className="rides-label hidden sm:inline">Kigali · Rwanda</span>
          </div>
        </Reveal>

        <div className="grid gap-12 pt-12 lg:grid-cols-12 lg:gap-8 lg:pt-16">
          {/* ── Left: headline ── */}
          <div className="lg:col-span-7">
            <Reveal delay={60}>
              <h1 className="rides-display max-w-[12ch]">
                Move the way Rwanda moves.
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="rides-lead mt-8 max-w-xl">
                One app for moto, cab, Hilux and Fuso. Agree your fare up front,
                follow every turn live, and arrive safely — across Kigali and beyond.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/#get-app" className="rides-btn rides-btn-primary">
                  Get the app
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link href="/drivers" className="rides-btn rides-btn-ghost">
                  Become a rider
                </Link>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <ul className="mt-12 grid max-w-lg grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-3" style={{ borderColor: "var(--line)", background: "var(--line)" }}>
                {[
                  ["Fares", "Agreed up front"],
                  ["Trips", "GPS-verified"],
                  ["Calls", "Free to your driver"],
                ].map(([k, v]) => (
                  <li key={k} className="p-4" style={{ background: "var(--paper)" }}>
                    <p className="rides-label" style={{ fontSize: "0.66rem" }}>{k}</p>
                    <p className="mt-1.5 text-sm font-medium" style={{ color: "var(--ink)" }}>{v}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* ── Right: device ── */}
          <div className="lg:col-span-5">
            <Reveal delay={180} className="relative flex justify-center lg:justify-end">
              <Frame>
                <PhoneMock />
              </Frame>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Bordered editorial cell with corner ticks. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* corner ticks */}
      {[
        "left-0 top-0 border-l border-t",
        "right-0 top-0 border-r border-t",
        "left-0 bottom-0 border-l border-b",
        "right-0 bottom-0 border-r border-b",
      ].map((pos) => (
        <span key={pos} aria-hidden className={`absolute h-4 w-4 ${pos}`} style={{ borderColor: "var(--ink)" }} />
      ))}
      <div className="p-6 sm:p-8">{children}</div>
      {/* floating ETA tag */}
      <div className="rides-float absolute -left-3 top-10 rounded-md border px-3 py-2 text-xs font-medium shadow-sm sm:-left-6" style={{ background: "var(--paper)", borderColor: "var(--line-2)", color: "var(--ink)" }}>
        <span className="rides-label mr-2" style={{ fontSize: "0.6rem" }}>Moto</span>2 min away
      </div>
    </div>
  );
}

/** Black device, light map, single blue route. */
function PhoneMock() {
  return (
    <div
      className="relative h-[440px] w-[238px] rounded-[2.4rem] p-2 sm:h-[500px] sm:w-[266px]"
      style={{ background: "#0a0a0a", boxShadow: "0 50px 90px -45px rgba(0,0,0,0.55)" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2rem]" style={{ background: "#f5f5f2" }}>
        <svg viewBox="0 0 266 500" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <rect width="266" height="500" fill="#f5f5f2" />
          {/* roads */}
          <g stroke="#e3e3de" strokeWidth="9" fill="none">
            <path d="M-20 120 H300" /><path d="M-20 300 H300" /><path d="M58 -20 V540" /><path d="M200 -20 V540" />
          </g>
          <rect x="86" y="150" width="96" height="116" rx="6" fill="#ececea" />
          {/* route (draws in on view) */}
          <path className="rides-route" d="M58 420 C 58 350, 132 350, 132 296 S 200 214, 200 120" stroke="#0a66ff" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* pickup pin (pulsing) */}
          <circle cx="58" cy="420" r="8" fill="#0a66ff" />
          <circle cx="58" cy="420" r="8" fill="none" stroke="#0a66ff" opacity="0.4">
            <animate attributeName="r" from="8" to="20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.45" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* destination */}
          <g transform="translate(200 120)">
            <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#0a0a0a" />
          </g>
        </svg>

        {/* notch */}
        <div className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full" style={{ background: "rgba(0,0,0,0.18)" }} />

        {/* ride card */}
        <div className="absolute inset-x-3 bottom-3 rounded-xl border bg-white p-3.5" style={{ borderColor: "var(--line-2)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white" style={{ background: "#0a0a0a" }}>JP</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: "var(--ink)" }}>Jean-Paul · Moto</p>
              <p className="text-xs" style={{ color: "var(--faint)" }}>RAD 247 B · ★ 4.9</p>
            </div>
            <span className="rounded-md px-2.5 py-1 text-xs font-semibold text-white" style={{ background: "#0a66ff" }}>2 min</span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--paper-2)" }}>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Agreed fare</span>
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>RWF 1,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
