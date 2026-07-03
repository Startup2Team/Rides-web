import Link from "next/link";
import Reveal from "./reveal";

export default function CTA() {
  return (
    <section id="get-app" className="rides-section">
      <div className="rides-container">
        <Reveal>
          <div className="grid items-center gap-10 rounded-xl border p-8 sm:p-12 lg:grid-cols-12 lg:gap-8" style={{ borderColor: "var(--line)", background: "var(--paper-2)" }}>
            <div className="lg:col-span-7">
              <span className="rides-label">Get the app</span>
              <h2 className="rides-h2 mt-5 max-w-[15ch]">Your next ride is one tap away.</h2>
              <p className="rides-lead mt-5 max-w-md">
                Download Rides for iOS or Android and move across the city on your terms —
                fair fares, live tracking, every trip.
              </p>
            </div>

            <div className="lg:col-span-5 lg:justify-self-end">
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <StoreButton store="App Store" sub="Download on the" />
                <StoreButton store="Google Play" sub="Get it on" />
              </div>
              <Link href="/drivers" className="rides-link mt-6 inline-flex">
                Or become a rider
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StoreButton({ store, sub }: { store: string; sub: string }) {
  return (
    <a
      href="#"
      className="rides-btn rides-btn-dark min-w-[180px] !justify-start !py-3.5"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 016 6h-2a4 4 0 00-4-4V6z" opacity="0" />
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 8.5l5 3.5-5 3.5z" />
      </svg>
      <span className="text-left leading-tight">
        <span className="block text-[0.62rem] font-normal opacity-70">{sub}</span>
        <span className="block text-sm font-semibold">{store}</span>
      </span>
    </a>
  );
}
