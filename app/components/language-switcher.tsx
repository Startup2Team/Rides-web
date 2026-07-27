"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n/context";
import type { Locale } from "../i18n/config";

/* ── Language metadata ───────────────────────────────────────────────────── */

const LANGUAGES: ReadonlyArray<{
  code: Locale;
  label: string;
  Flag: () => React.JSX.Element;
}> = [
  { code: "en", label: "English", Flag: FlagGB },
  { code: "fr", label: "Français", Flag: FlagFR },
  { code: "rw", label: "Kinyarwanda", Flag: FlagRW },
];

/* ── Component ───────────────────────────────────────────────────────────── */

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { locale: current, setLocale } = useLocale();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click-outside / Escape
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectLanguage(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  const active = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];
  const ActiveFlag = active.Flag;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Change language. Current language: ${active.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="block h-7 w-7 overflow-hidden rounded-full ring-1 ring-border">
          <ActiveFlag />
        </span>
      </button>

      <div
        role="menu"
        aria-label="Select language"
        className={`absolute right-0 top-full z-50 mt-2 min-w-[200px] origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-foreground/5 transition-all duration-200 ease-out ${
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <ul className="p-1.5">
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === current;
            const LangFlag = lang.Flag;
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => selectLanguage(lang.code)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  <span className="block h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
                    <LangFlag />
                  </span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {isActive ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
                      <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ── Flag SVGs (simplified, consistent 60×30 viewBox) ────────────────────── */

function FlagGB() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <clipPath id="flag-gb-clip">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#flag-gb-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0 L60 30 M60 0 L0 30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0 0 L60 30" stroke="#C8102E" strokeWidth="2.4" />
        <path d="M60 0 L0 30" stroke="#C8102E" strokeWidth="2.4" />
        <path d="M30 0 v30 M0 15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30 0 v30 M0 15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagFR() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <rect x="0" width="20" height="30" fill="#0055A4" />
      <rect x="20" width="20" height="30" fill="#FFFFFF" />
      <rect x="40" width="20" height="30" fill="#EF4135" />
    </svg>
  );
}

function FlagRW() {
  // Rwandan flag: blue band (top, ~50%), yellow (~25%), green (~25%), with a 24-ray sun in the top-right
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <rect width="60" height="15" fill="#00A1DE" />
      <rect width="60" height="7.5" y="15" fill="#E5BE01" />
      <rect width="60" height="7.5" y="22.5" fill="#20603D" />
      {/* Stylised sun in top-right */}
      <g transform="translate(46 8)">
        <circle r="2.4" fill="#E5BE01" />
        <g stroke="#E5BE01" strokeWidth="0.9" strokeLinecap="round">
          <line x1="0" y1="-4.5" x2="0" y2="-3.2" />
          <line x1="0" y1="3.2" x2="0" y2="4.5" />
          <line x1="-4.5" y1="0" x2="-3.2" y2="0" />
          <line x1="3.2" y1="0" x2="4.5" y2="0" />
          <line x1="-3.2" y1="-3.2" x2="-2.3" y2="-2.3" />
          <line x1="2.3" y1="2.3" x2="3.2" y2="3.2" />
          <line x1="3.2" y1="-3.2" x2="2.3" y2="-2.3" />
          <line x1="-2.3" y1="2.3" x2="-3.2" y2="3.2" />
        </g>
      </g>
    </svg>
  );
}
