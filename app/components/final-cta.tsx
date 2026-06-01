import Link from "next/link";
import { CarIcon, FusoIcon, HiluxIcon, MotoDetailedIcon, MotoIcon } from "./vehicle-icons";

function StarRow() {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-300">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
          className="h-3.5 w-3.5"
        >
          <path d="M12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function FinalCTA() {
  return (
    <section id="download" className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#1F88FF] to-[#0056B3] shadow-2xl shadow-primary/40 ring-1 ring-inset ring-white/10">
          {/* Mesh + glow backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-1/3 top-1/2 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-24 h-[26rem] w-[26rem] rounded-full bg-black/25 blur-3xl"
          />

          {/* Subtle grid overlay */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
          >
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>

          {/* Diagonal sweep highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-32 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-14 lg:py-12">
            {/* Left: copy */}
            <div className="text-center text-white lg:text-left">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/85">
                <span className="h-px w-8 bg-white/50" />
                Get the app
              </p>
              <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                Your ride.{" "}
                <span className="text-white/90 underline decoration-white/30 decoration-[6px] underline-offset-[10px]">
                  Your price.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
                Across a thousand hills, every ride begins with a fair
                conversation.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/download"
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-zinc-950 px-5 py-3.5 text-white shadow-xl shadow-black/30 ring-1 ring-inset ring-white/10 transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
                  <svg viewBox="0 0 24 24" fill="currentColor" className="relative h-7 w-7" aria-hidden>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74.79 0 2.25-.92 3.78-.78 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <div className="relative text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      Download on the
                    </div>
                    <div className="text-base font-semibold leading-tight">
                      App Store
                    </div>
                  </div>
                </Link>

                <Link
                  href="/download"
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-zinc-950 px-5 py-3.5 text-white shadow-xl shadow-black/30 ring-1 ring-inset ring-white/10 transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
                  <svg viewBox="0 0 24 24" className="relative h-7 w-7" aria-hidden>
                    <defs>
                      <linearGradient id="gp-blue" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#1FBCD2" />
                        <stop offset="1" stopColor="#0F8FB5" />
                      </linearGradient>
                      <linearGradient id="gp-green" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#00E676" />
                        <stop offset="1" stopColor="#00A040" />
                      </linearGradient>
                      <linearGradient id="gp-red" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#FF3D44" />
                        <stop offset="1" stopColor="#C81E2A" />
                      </linearGradient>
                      <linearGradient id="gp-yellow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#FFEB3B" />
                        <stop offset="1" stopColor="#FF9F00" />
                      </linearGradient>
                    </defs>
                    {/* Back wing (blue) */}
                    <path
                      d="M3.3 1.7c-.2.2-.3.5-.3.8v19c0 .3.1.6.3.8L13.4 12 3.3 1.7z"
                      fill="url(#gp-blue)"
                    />
                    {/* Top wing (green) */}
                    <path
                      d="M17 8.4 4.4 1.2C4.2 1.1 4 1 3.8 1c-.2 0-.4 0-.5.1L13.4 12 17 8.4z"
                      fill="url(#gp-green)"
                    />
                    {/* Bottom wing (red) */}
                    <path
                      d="M3.3 22.9c.1.1.3.1.5.1.2 0 .4-.1.6-.2L17 15.6 13.4 12 3.3 22.9z"
                      fill="url(#gp-red)"
                    />
                    {/* Tip (yellow) */}
                    <path
                      d="M20.8 10.9 17 8.4 13.4 12 17 15.6l3.8-2.5c.7-.4.7-1.7 0-2.2z"
                      fill="url(#gp-yellow)"
                    />
                  </svg>
                  <div className="relative text-left">
                    <div className="text-[10px] uppercase tracking-wider opacity-80">
                      Get it on
                    </div>
                    <div className="text-base font-semibold leading-tight">
                      Google Play
                    </div>
                  </div>
                </Link>
              </div>

            </div>

            {/* Right: Book a Ride phone mockup — iPhone 16 Pro */}
            <div className="relative mx-auto hidden w-full max-w-[16rem] lg:block">
              <div
                aria-hidden
                className="absolute -inset-x-8 -inset-y-12 rounded-full bg-white/10 blur-2xl"
              />

              <div className="relative rounded-[3.25rem] bg-gradient-to-b from-[#3a3a3c] via-[#1c1c1e] to-[#0a0a0a] p-[4px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.06)_inset] ring-1 ring-inset ring-white/[0.08]">
                {/* Side buttons — iPhone 16 Pro layout (inside the rotated frame so they tilt with it) */}
                {/* Left: Action button · Volume up · Volume down */}
                <span aria-hidden className="absolute left-[-2px] top-[5.5rem] z-10 h-6 w-[2px] rounded-l-sm bg-[#0a0a0a]" />
                <span aria-hidden className="absolute left-[-2px] top-[8rem] z-10 h-11 w-[2px] rounded-l-sm bg-[#0a0a0a]" />
                <span aria-hidden className="absolute left-[-2px] top-[12.25rem] z-10 h-11 w-[2px] rounded-l-sm bg-[#0a0a0a]" />
                {/* Right: Power · Camera Control (new on 16 Pro) */}
                <span aria-hidden className="absolute right-[-2px] top-[7rem] z-10 h-13 w-[2px] rounded-r-sm bg-[#0a0a0a]" style={{ height: "3.25rem" }} />
                <span aria-hidden className="absolute right-[-2px] top-[14rem] z-10 h-7 w-[2px] rounded-r-sm bg-[#0a0a0a]" />
                {/* Inner titanium highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-[1px] rounded-[3.2rem] ring-1 ring-inset ring-white/[0.04]"
                />
                <div className="relative aspect-[9/19.5] overflow-hidden rounded-[3rem] bg-black p-[3px]">
                  <div className="relative h-full w-full overflow-hidden rounded-[2.85rem] bg-card">
                    {/* Dynamic Island (16 Pro spec — slimmer to leave room for status icons) */}
                    <div className="absolute left-1/2 top-2.5 z-20 flex h-[20px] w-[62px] -translate-x-1/2 items-center justify-between rounded-full bg-black px-[6px]">
                      <span className="h-1 w-1 rounded-full bg-zinc-800" />
                      <span className="h-[4px] w-[4px] rounded-full bg-zinc-700 ring-1 ring-inset ring-zinc-600" />
                    </div>

                    {/* Status bar — iOS style (3-col grid so time + icons hug the Dynamic Island) */}
                    <div className="absolute inset-x-0 top-[15px] z-10 grid grid-cols-[1fr_70px_1fr] items-center text-foreground">
                      <span className="flex items-center justify-end gap-1 pr-2 leading-none">
                        <span className="text-[11px] font-semibold tracking-tight tabular-nums leading-none">
                          9:41
                        </span>
                        {/* Location services indicator */}
                        <svg
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="h-[9px] w-[9px]"
                          aria-hidden
                        >
                          <path d="M13.78 2.22a.75.75 0 0 1 .17.82l-4.5 10.5a.75.75 0 0 1-1.4-.05L6.6 9.4l-3.7-1.45a.75.75 0 0 1-.05-1.4l10.1-4.32a.75.75 0 0 1 .83.17z" />
                        </svg>
                      </span>
                      <div />
                      <div className="flex items-center justify-start gap-[5px] pl-2">
                        {/* Signal — 4 stepped bars */}
                        <svg viewBox="0 0 18 11" fill="currentColor" className="h-[11px]" aria-hidden>
                          <rect x="0" y="8" width="2.8" height="3" rx="0.7" />
                          <rect x="4.5" y="5.5" width="2.8" height="5.5" rx="0.7" />
                          <rect x="9" y="2.5" width="2.8" height="8.5" rx="0.7" />
                          <rect x="13.5" y="0" width="2.8" height="11" rx="0.7" />
                        </svg>
                        {/* 5G network indicator */}
                        <span className="text-[10px] font-bold leading-none tracking-[-0.02em]">
                          5G
                        </span>
                        {/* Battery — pill with percentage number inside */}
                        <span aria-hidden className="relative ml-0.5 flex items-center">
                          <span className="flex h-[11px] w-[22px] items-center justify-center rounded-[3px] bg-foreground px-[1.5px]">
                            <span className="text-[7px] font-bold leading-none tabular-nums text-card">
                              92
                            </span>
                          </span>
                          <span className="ml-[1px] h-[4px] w-[1.5px] rounded-r-[1px] bg-foreground" />
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex flex-col pt-9">
                      {/* Top header: location pill + bell */}
                      <div className="flex items-center gap-1.5 px-2.5 py-2">
                        <div className="flex flex-1 items-center gap-1.5 rounded-full bg-white px-2 py-1.5 shadow-sm ring-1 ring-border">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5 text-primary" aria-hidden>
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <div className="min-w-0 flex-1 text-center">
                            <div className="text-[6px] font-semibold uppercase tracking-[0.12em] text-muted-foreground leading-none">
                              Current Location
                            </div>
                            <div className="text-[9px] font-bold leading-none text-foreground mt-0.5">
                              Kigali, Rwanda
                            </div>
                          </div>
                        </div>
                        <button type="button" aria-label="Notifications" className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-border">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-foreground" aria-hidden>
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                          </svg>
                          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
                        </button>
                      </div>

                      {/* Map area */}
                      <div className="relative flex-1 overflow-hidden bg-[#efe7d8]">
                        {/* Stylised street network */}
                        <svg
                          viewBox="0 0 200 280"
                          preserveAspectRatio="xMidYMid slice"
                          className="absolute inset-0 h-full w-full"
                          aria-hidden
                        >
                          {/* Background tints */}
                          <rect width="200" height="280" fill="#efe7d8" />
                          <path d="M 130 0 L 200 0 L 200 60 L 145 75 Z" fill="#e5dccb" opacity="0.6" />
                          <path d="M 0 200 L 50 230 L 30 280 L 0 280 Z" fill="#e5dccb" opacity="0.5" />
                          {/* Highway */}
                          <path d="M 130 0 Q 120 100, 150 180 T 170 280" stroke="#c8d2db" strokeWidth="10" fill="none" />
                          <path d="M 130 0 Q 120 100, 150 180 T 170 280" stroke="white" strokeWidth="9" fill="none" />
                          {/* Street network — horizontal-ish */}
                          <path d="M 0 50 Q 80 30, 200 60" stroke="white" strokeWidth="3" fill="none" />
                          <path d="M 0 95 Q 50 70, 130 100" stroke="white" strokeWidth="3" fill="none" />
                          <path d="M 30 180 Q 90 150, 200 175" stroke="white" strokeWidth="3" fill="none" />
                          <path d="M 50 230 Q 110 200, 200 220" stroke="white" strokeWidth="3" fill="none" />
                          {/* Street network — vertical-ish */}
                          <path d="M 60 0 Q 70 80, 50 200 T 80 280" stroke="white" strokeWidth="3" fill="none" />
                          <path d="M 120 0 Q 100 60, 90 130 T 70 280" stroke="white" strokeWidth="3" fill="none" />
                          <path d="M 180 0 Q 160 90, 175 200 T 200 280" stroke="white" strokeWidth="3" fill="none" />
                          {/* Street labels */}
                          <text x="22" y="48" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 124 STREET</text>
                          <text x="20" y="93" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 122 STREET</text>
                          <text x="100" y="62" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 27 AVENUE</text>
                          <text x="100" y="135" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600" transform="rotate(80 100 135)">KG 96 STREET</text>
                          <text x="58" y="178" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 86 STREET</text>
                          <text x="155" y="200" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600" transform="rotate(78 155 200)">KG 20 AVENUE</text>
                        </svg>

                        {/* Motorcycle marker */}
                        <div className="absolute left-[36%] top-[40%]">
                          <span className="flex h-9 w-9 items-center justify-center">
                            <MotoDetailedIcon className="h-8 w-8 text-zinc-900" />
                          </span>
                          <div className="mt-0.5 flex justify-center">
                            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[7px] font-bold leading-none text-primary-foreground shadow">
                              1 min
                            </span>
                          </div>
                        </div>

                        {/* Right floating controls */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                          <button type="button" aria-label="Map layers" className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-border">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-primary" aria-hidden>
                              <polygon points="12 2 2 7 12 12 22 7 12 2" />
                              <polyline points="2 17 12 22 22 17" />
                              <polyline points="2 12 12 17 22 12" />
                            </svg>
                          </button>
                          <button type="button" aria-label="My location" className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-border">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-primary" aria-hidden>
                              <circle cx="12" cy="12" r="9" />
                              <circle cx="12" cy="12" r="3" fill="currentColor" />
                              <line x1="12" y1="1" x2="12" y2="4" />
                              <line x1="12" y1="20" x2="12" y2="23" />
                              <line x1="1" y1="12" x2="4" y2="12" />
                              <line x1="20" y1="12" x2="23" y2="12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Bottom sheet */}
                      <div className="relative -mt-2 rounded-t-[28px] bg-card px-4 pb-3.5 pt-2">
                        {/* Drag handle */}
                        <div className="mx-auto h-[5px] w-10 rounded-full bg-zinc-300" />

                        {/* Greeting */}
                        <div className="mt-3">
                          <div className="text-[14px] font-bold leading-tight tracking-tight text-foreground">
                            Hi
                          </div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            Where to today?
                          </div>
                        </div>

                        {/* Vehicle section label */}
                        <div className="mt-4 text-[7px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                          Select your ride
                        </div>

                        {/* Vehicle chips */}
                        <div className="mt-2 grid grid-cols-4 gap-1.5">
                          {[
                            { name: "Moto", active: true, IconComp: MotoIcon },
                            { name: "Cab", active: false, IconComp: CarIcon },
                            { name: "Hilux", active: false, IconComp: HiluxIcon },
                            { name: "Fuso", active: false, IconComp: FusoIcon },
                          ].map((v) => (
                            <div
                              key={v.name}
                              className={`flex flex-col items-center justify-center rounded-lg px-1 py-1.5 ${
                                v.active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-surface text-foreground ring-1 ring-inset ring-border"
                              }`}
                            >
                              <v.IconComp className="h-4 w-4" />
                              <span className="mt-0.5 text-[7px] font-semibold leading-none">
                                {v.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Continue button */}
                        <div className="mt-3 flex h-9 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md shadow-primary/30">
                          Continue with Moto
                        </div>

                        {/* Tab bar */}
                        <div className="mt-3 flex items-center justify-around rounded-full bg-surface px-2 py-1 ring-1 ring-border">
                          <div className="flex flex-col items-center gap-0.5 rounded-full bg-card px-3 py-1 text-primary shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                              <path d="M3 6l9-3 9 3v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
                              <line x1="9" y1="3" x2="9" y2="21" />
                              <line x1="15" y1="3" x2="15" y2="21" />
                            </svg>
                            <span className="text-[6px] font-bold leading-none">Home</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="text-[6px] font-bold leading-none">Rides</span>
                          </div>
                          <div className="flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                              <circle cx="12" cy="8" r="4" />
                              <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
                            </svg>
                            <span className="text-[6px] font-bold leading-none">Profile</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
