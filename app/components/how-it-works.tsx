"use client";

import { useEffect, useState } from "react";
import { CarIcon, FusoIcon, HiluxIcon, MotoIcon, MotoDetailedIcon } from "./vehicle-icons";

const STEPS = [
  { id: "step-1", num: "01" },
  { id: "step-2", num: "02" },
  { id: "step-3", num: "03" },
  { id: "step-4", num: "04" },
  { id: "step-5", num: "05" },
] as const;

function Step01() {
  return (
    <div
      id="step-1"
      data-step="0"
      className="flex scroll-mt-[8rem] flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24"
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-52 sm:w-60">
          <span
            aria-hidden
            className="absolute left-[-3px] top-16 h-6 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute left-[-3px] top-28 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute left-[-3px] top-40 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute right-[-3px] top-24 h-14 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-900 to-zinc-700"
          />

          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-1 shadow-2xl shadow-primary/20 ring-1 ring-inset ring-white/10">
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] bg-black p-[3px]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-card">
                {/* Dynamic Island (16 Pro spec) */}
                <div className="absolute left-1/2 top-2.5 z-20 flex h-[20px] w-[58px] -translate-x-1/2 items-center justify-between rounded-full bg-black px-[6px]">
                  <span className="h-1 w-1 rounded-full bg-zinc-800" />
                  <span className="h-[4px] w-[4px] rounded-full bg-zinc-700 ring-1 ring-inset ring-zinc-600" />
                </div>

                {/* Status bar — iOS style */}
                <div className="absolute inset-x-0 top-[14px] z-10 grid grid-cols-[1fr_66px_1fr] items-center px-4 text-foreground">
                  <span className="flex items-center justify-end gap-1 pr-2 leading-none">
                    <span className="text-[10px] font-semibold tracking-tight tabular-nums leading-none">
                      9:41
                    </span>
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-[9px] w-[9px]" aria-hidden>
                      <path d="M13.78 2.22a.75.75 0 0 1 .17.82l-4.5 10.5a.75.75 0 0 1-1.4-.05L6.6 9.4l-3.7-1.45a.75.75 0 0 1-.05-1.4l10.1-4.32a.75.75 0 0 1 .83.17z" />
                    </svg>
                  </span>
                  <div />
                  <div className="flex items-center justify-start gap-1 pl-2">
                    {/* Signal — 4 stepped bars */}
                    <svg viewBox="0 0 20 12" fill="currentColor" className="h-[10px]" aria-hidden>
                      <rect x="0" y="8" width="3.6" height="4" rx="0.9" />
                      <rect x="5.5" y="5.5" width="3.6" height="6.5" rx="0.9" />
                      <rect x="11" y="2.5" width="3.6" height="9.5" rx="0.9" />
                      <rect x="16.5" y="0" width="3.6" height="12" rx="0.9" />
                    </svg>
                    {/* 5G */}
                    <span className="text-[9px] font-bold leading-none tracking-[-0.02em]">5G</span>
                    {/* Battery */}
                    <span aria-hidden className="relative ml-0.5 flex items-center">
                      <span className="flex h-[11px] w-[22px] items-center justify-center rounded-[3px] bg-foreground px-[1.5px]">
                        <span className="text-[7px] font-bold leading-none tabular-nums text-card">92</span>
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
                      <rect width="200" height="280" fill="#efe7d8" />
                      <path d="M 130 0 L 200 0 L 200 60 L 145 75 Z" fill="#e5dccb" opacity="0.6" />
                      <path d="M 0 200 L 50 230 L 30 280 L 0 280 Z" fill="#e5dccb" opacity="0.5" />
                      <path d="M 130 0 Q 120 100, 150 180 T 170 280" stroke="#c8d2db" strokeWidth="10" fill="none" />
                      <path d="M 130 0 Q 120 100, 150 180 T 170 280" stroke="white" strokeWidth="9" fill="none" />
                      <path d="M 0 50 Q 80 30, 200 60" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M 0 95 Q 50 70, 130 100" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M 30 180 Q 90 150, 200 175" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M 50 230 Q 110 200, 200 220" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M 60 0 Q 70 80, 50 200 T 80 280" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M 120 0 Q 100 60, 90 130 T 70 280" stroke="white" strokeWidth="3" fill="none" />
                      <path d="M 180 0 Q 160 90, 175 200 T 200 280" stroke="white" strokeWidth="3" fill="none" />
                      <text x="22" y="48" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 124 STREET</text>
                      <text x="20" y="93" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 122 STREET</text>
                      <text x="100" y="62" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 27 AVENUE</text>
                      <text x="100" y="135" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600" transform="rotate(80 100 135)">KG 96 STREET</text>
                      <text x="58" y="178" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600">KG 86 STREET</text>
                      <text x="155" y="200" fontSize="6" fill="#9a9486" fontFamily="sans-serif" fontWeight="600" transform="rotate(78 155 200)">KG 20 AVENUE</text>
                    </svg>

                    {/* Motorcycle marker */}
                    <div className="absolute left-[36%] top-[40%]">
                      <span className="flex h-8 w-8 items-center justify-center">
                        <MotoDetailedIcon className="h-7 w-7 text-zinc-900" />
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 01
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Book in <span className="text-primary">seconds.</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Open the app, pick a moto, cab, hilux, or fuso, tap a destination.
          Nearby drivers see your request instantly.
        </p>

      </div>
    </div>
  );
}

function Step02() {
  return (
    <div
      id="step-2"
      data-step="1"
      className="flex scroll-mt-[8rem] flex-col items-center gap-10 lg:flex-row-reverse lg:justify-center lg:gap-16 xl:gap-24"
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-52 sm:w-60">
          {/* Side buttons */}
          <span aria-hidden className="absolute left-[-3px] top-16 h-6 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700" />
          <span aria-hidden className="absolute left-[-3px] top-28 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700" />
          <span aria-hidden className="absolute left-[-3px] top-40 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700" />
          <span aria-hidden className="absolute right-[-3px] top-24 h-14 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-900 to-zinc-700" />

          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-1 shadow-2xl shadow-primary/20 ring-1 ring-inset ring-white/10">
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] bg-black p-[3px]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-card">
                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-2.5 z-20 flex h-[20px] w-[58px] -translate-x-1/2 items-center justify-between rounded-full bg-black px-[6px]">
                  <span className="h-1 w-1 rounded-full bg-zinc-800" />
                  <span className="h-[4px] w-[4px] rounded-full bg-zinc-700 ring-1 ring-inset ring-zinc-600" />
                </div>

                {/* Status bar (light theme) */}
                <div className="absolute inset-x-0 top-[14px] z-10 grid grid-cols-[1fr_66px_1fr] items-center px-4 text-foreground">
                  <span className="flex items-center justify-end gap-1 pr-2 leading-none">
                    <span className="text-[10px] font-semibold tracking-tight tabular-nums leading-none">
                      13:44
                    </span>
                  </span>
                  <div />
                  <div className="flex items-center justify-start gap-1 pl-2">
                    <svg viewBox="0 0 20 12" fill="currentColor" className="h-[10px]" aria-hidden>
                      <rect x="0" y="8" width="3.6" height="4" rx="0.9" />
                      <rect x="5.5" y="5.5" width="3.6" height="6.5" rx="0.9" />
                      <rect x="11" y="2.5" width="3.6" height="9.5" rx="0.9" />
                      <rect x="16.5" y="0" width="3.6" height="12" rx="0.9" opacity="0.4" />
                    </svg>
                    <svg viewBox="0 0 18 14" fill="none" className="h-[11px]" aria-hidden>
                      <path d="M1.5 5.5 C 4 2.5, 6 1, 9 1 C 12 1, 14 2.5, 16.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M4.5 8.5 C 6 7, 7.5 6.5, 9 6.5 C 10.5 6.5, 12 7, 13.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <circle cx="9" cy="11" r="1.3" fill="currentColor" />
                    </svg>
                    {/* Charging battery */}
                    <span aria-hidden className="relative ml-0.5 flex items-center">
                      <span className="flex h-[11px] w-[22px] items-center justify-start rounded-[3px] border border-foreground/40 p-[1px]">
                        <span className="h-full w-[60%] rounded-[1.5px] bg-emerald-500" />
                      </span>
                      <span className="ml-[1px] h-[4px] w-[1.5px] rounded-r-[1px] bg-foreground/40" />
                      <svg viewBox="0 0 24 24" fill="currentColor" className="absolute left-1/2 top-1/2 h-[8px] w-[6px] -translate-x-1/2 -translate-y-1/2 text-foreground" aria-hidden>
                        <path d="M13 2 L 4 14 L 11 14 L 9 22 L 20 10 L 13 10 Z" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Center content: pulsing rings + moto */}
                <div className="absolute inset-0 flex flex-col px-4 pt-14 pb-4">
                  <div className="relative flex flex-1 items-center justify-center">
                    {/* Pulse rings */}
                    <span aria-hidden className="absolute h-56 w-56 rounded-full border border-primary/15" />
                    <span aria-hidden className="absolute h-40 w-40 rounded-full border border-primary/25" />
                    <span aria-hidden className="absolute h-28 w-28 rounded-full border border-primary/40" />
                    {/* Center disc */}
                    <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_rgba(0,122,255,0.35)]">
                      <MotoDetailedIcon className="h-10 w-10 text-white" />
                    </span>
                  </div>

                  {/* Heading */}
                  <div className="text-center">
                    <p className="text-[13px] font-bold tracking-tight text-foreground">
                      Finding your driver
                    </p>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      Connecting you with nearby moto riders
                    </p>
                  </div>

                  {/* Location card */}
                  <div className="mt-3 rounded-2xl bg-surface px-2.5 py-2 ring-1 ring-inset ring-border">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span className="truncate text-[9px] font-medium text-foreground">
                        KG 98 Street, Kigali
                      </span>
                    </div>
                    <div className="my-1.5 h-px bg-border" />
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                      <span className="truncate text-[9px] font-medium text-foreground">
                        Kimironko, Kigali, Rwanda
                      </span>
                    </div>
                  </div>

                  {/* Cancel button */}
                  <div className="mt-3 flex h-9 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-foreground ring-1 ring-inset ring-border">
                    Cancel Search
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 02
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          First to accept, <span className="text-primary">yours.</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Your request goes out to every nearby driver at once. The first one
          to accept gets the trip — and you watch them head your way on the
          map.
        </p>
      </div>
    </div>
  );
}

function Step03() {
  return (
    <div
      id="step-3"
      data-step="2"
      className="flex scroll-mt-[8rem] flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24"
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-80 sm:w-96">
          <div className="relative flex aspect-[4/5] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight text-foreground">
                  Aiden
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Negotiating fare
                </div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-foreground">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-hidden p-4">
              <div className="rounded-xl border border-border bg-surface p-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1 truncate text-[10px] font-semibold text-foreground">
                    Kimironko Market
                  </div>
                </div>
                <div className="my-1 ml-[3px] h-2.5 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-2.5 w-2.5 shrink-0 text-foreground"
                    aria-hidden
                  >
                    <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z" />
                  </svg>
                  <div className="min-w-0 flex-1 truncate text-[10px] font-semibold text-foreground">
                    Kigali Heights
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                    5.2 km
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm shadow-primary/30">
                  <div className="text-base font-bold leading-none">4,500 RWF</div>
                  <div className="mt-1 text-[9px] opacity-80">Initial offer</div>
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[75%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-1.5 text-foreground">
                  <div className="text-base font-bold leading-none">3,000 RWF</div>
                  <div className="mt-1 text-[9px] text-muted-foreground">
                    Your offer
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm shadow-primary/30">
                  <div className="text-base font-bold leading-none">4,000 RWF</div>
                  <div className="mt-1 text-[9px] opacity-80">Counter offer</div>
                </div>
              </div>

              <div className="flex justify-center py-0.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-primary"
                    aria-hidden
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Masked call · 0:24
                </span>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-3.5 py-1.5 text-primary-foreground shadow-sm shadow-primary/30 ring-2 ring-primary/40">
                  <div className="text-base font-bold leading-none">3,800 RWF</div>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                    Final offer
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground"
              >
                Decline
              </button>
              <button
                type="button"
                className="flex-[1.5] rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30"
              >
                Accept 3,800 RWF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 03
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Agree on the <span className="text-primary">fare.</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          See the suggested price up front. Send a counter-offer if it doesn&apos;t
          feel right. Lock it in before the ride starts — no surge surprises.
        </p>
      </div>
    </div>
  );
}

function StarIcon({
  filled,
  className,
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 L14.4 8.6 L21 9 L16 13.6 L17.5 20 L12 16.5 L6.5 20 L8 13.6 L3 9 L9.6 8.6 Z" />
    </svg>
  );
}

function Step04() {
  return (
    <div
      id="step-4"
      data-step="3"
      className="flex scroll-mt-[8rem] flex-col items-center gap-10 lg:flex-row-reverse lg:justify-center lg:gap-16 xl:gap-24"
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-80 sm:w-96">
          <div className="relative aspect-[5/6] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10">
            <svg
              viewBox="0 0 200 240"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
              className="absolute inset-0 h-full w-full"
            >
              <rect width="100%" height="100%" className="fill-card" />

              <rect x="10" y="10" width="45" height="25" rx="2" className="fill-zinc-200" />
              <rect x="60" y="10" width="30" height="20" rx="2" className="fill-zinc-200" />
              <rect x="95" y="10" width="35" height="30" rx="2" className="fill-zinc-200" />
              <rect x="135" y="10" width="55" height="25" rx="2" className="fill-zinc-200" />

              <rect x="10" y="40" width="25" height="20" rx="2" className="fill-zinc-200" />
              <rect x="40" y="40" width="50" height="22" rx="2" className="fill-zinc-200" />
              <rect x="95" y="45" width="35" height="22" rx="2" className="fill-zinc-200" />
              <rect x="135" y="40" width="55" height="22" rx="2" className="fill-zinc-200" />

              <path
                d="M 78 75 Q 110 70 132 88 Q 138 110 116 118 L 84 112 Z"
                className="fill-primary/15"
              />

              <rect x="10" y="68" width="32" height="25" rx="2" className="fill-zinc-200" />
              <rect x="46" y="70" width="26" height="22" rx="2" className="fill-zinc-200" />
              <rect x="155" y="70" width="35" height="25" rx="2" className="fill-zinc-200" />

              <rect x="10" y="98" width="28" height="22" rx="2" className="fill-zinc-200" />
              <rect x="42" y="100" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="138" y="125" width="22" height="25" rx="2" className="fill-zinc-200" />
              <rect x="165" y="122" width="25" height="28" rx="2" className="fill-zinc-200" />

              <rect x="10" y="128" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="46" y="128" width="25" height="22" rx="2" className="fill-zinc-200" />
              <rect x="75" y="128" width="32" height="22" rx="2" className="fill-zinc-200" />

              <rect x="10" y="158" width="38" height="22" rx="2" className="fill-zinc-200" />
              <rect x="52" y="158" width="28" height="22" rx="2" className="fill-zinc-200" />
              <rect x="84" y="160" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="120" y="158" width="38" height="25" rx="2" className="fill-zinc-200" />
              <rect x="162" y="160" width="28" height="22" rx="2" className="fill-zinc-200" />

              <rect x="10" y="188" width="34" height="22" rx="2" className="fill-zinc-200" />
              <rect x="48" y="190" width="42" height="20" rx="2" className="fill-zinc-200" />
              <rect x="94" y="188" width="32" height="22" rx="2" className="fill-zinc-200" />
              <rect x="130" y="190" width="60" height="20" rx="2" className="fill-zinc-200" />

              <rect x="10" y="215" width="45" height="20" rx="2" className="fill-zinc-200" />
              <rect x="60" y="213" width="36" height="22" rx="2" className="fill-zinc-200" />
              <rect x="100" y="215" width="32" height="20" rx="2" className="fill-zinc-200" />
              <rect x="138" y="217" width="52" height="18" rx="2" className="fill-zinc-200" />

              <path
                d="M 50 200 Q 95 180 100 140 Q 105 90 150 70"
                className="stroke-primary/30"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 50 200 Q 95 180 100 140 Q 105 90 150 70"
                className="stroke-primary"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-x-3 top-3 z-20 flex items-center gap-2 rounded-2xl border border-border bg-card/85 p-2.5 shadow-lg backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <div className="flex-1 text-xs font-semibold text-foreground">
                Aiden is on the way
              </div>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                3 min
              </span>
            </div>

            <div
              className="absolute z-10"
              style={{ top: "44%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/40 ring-4 ring-card">
                <CarIcon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            <div
              className="absolute z-10"
              style={{ top: "23%", left: "72%", transform: "translate(-50%, -50%)" }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md ring-2 ring-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-primary"
                  aria-hidden
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 z-20 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/40">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary"
                  aria-hidden
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold tracking-tight text-foreground">
                  Aiden
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  RAB 123 D · Toyota Hilux
                </div>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 04
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Track the whole <span className="text-primary">trip.</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Watch your driver approach in real time. Share the live trip with
          anyone you trust so they can see you arrive safely.
        </p>
      </div>
    </div>
  );
}

function Step05() {
  return (
    <div
      id="step-5"
      data-step="4"
      className="flex scroll-mt-[8rem] flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16 xl:gap-24"
    >
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative w-52 sm:w-60">
          <span
            aria-hidden
            className="absolute left-[-3px] top-16 h-6 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute left-[-3px] top-28 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute left-[-3px] top-44 h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-900 to-zinc-700"
          />
          <span
            aria-hidden
            className="absolute right-[-3px] top-24 h-14 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-900 to-zinc-700"
          />

          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-1 shadow-2xl shadow-primary/20 ring-1 ring-inset ring-white/10">
            <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.7rem] bg-black p-[3px]">
              <div className="relative h-full w-full overflow-hidden rounded-[2.55rem] bg-card">
                <div className="absolute left-1/2 top-2 z-10 flex h-6 w-24 -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                </div>

                <div className="absolute inset-0 flex flex-col px-4 pb-4 pt-11">
                  <div className="flex flex-col items-center pt-2">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute h-20 w-20 rounded-full bg-primary/10" />
                      <span className="absolute h-16 w-16 rounded-full bg-primary/20" />
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                          aria-hidden
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    </div>
                    <h4 className="mt-3 text-base font-bold tracking-tight text-foreground">
                      Trip Completed
                    </h4>
                  </div>

                  <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-center">
                    <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Fare
                    </div>
                    <div className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                      3,800 RWF
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[9px] text-muted-foreground">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-2.5 w-2.5 text-primary"
                        aria-hidden
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Paid via Mobile Money
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                    <span>5.2 km</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>14 min</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>Aiden</span>
                  </div>

                  <div className="mt-4">
                    <div className="text-center text-xs font-semibold text-foreground">
                      Rate your trip
                    </div>
                    <div className="mt-2 flex justify-center gap-1.5 text-primary">
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon filled className="h-6 w-6" />
                      <StarIcon className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    <div className="flex h-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30">
                      Submit
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-8 bg-primary" />
          Step 05
        </p>
        <h3 className="mt-4 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
          Pay and <span className="text-primary">rate.</span>
        </h3>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          Wrap up with MoMo, Airtel, or cash to your driver. Rate the trip to
          help keep quality high for everyone.
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  // Track which step is closest to the viewport top while scrolling.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-step"));
            if (!Number.isNaN(idx)) setActiveStep(idx);
          }
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    const els = document.querySelectorAll<HTMLElement>("[data-step]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="relative py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Intro */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            From request to rating,{" "}
            <span className="text-primary">in 5 steps.</span>
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            Book, agree on a fair fare, ride, pay, rate. Every step on your
            terms.
          </p>
        </div>

        {/* Sticky step navigator — pinned just below the navbar while in section */}
        <div className="sticky top-20 z-30 mt-8 flex justify-center">
          <nav
            aria-label="Steps"
            className="flex gap-1 rounded-full border border-border bg-card/85 p-1.5 shadow-lg backdrop-blur-xl"
          >
            {STEPS.map((s, i) => {
              const isActive = activeStep === i;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-label={`Jump to step ${i + 1}`}
                  aria-current={isActive ? "step" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-colors sm:h-10 sm:w-10 sm:text-xs ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {s.num}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="mt-12 space-y-12 lg:space-y-16">
          <Step01 />
          <Step02 />
          <Step03 />
          <Step04 />
          <Step05 />
        </div>
      </div>
    </section>
  );
}
