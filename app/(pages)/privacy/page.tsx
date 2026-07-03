"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

const EFFECTIVE_DATE = "June 11, 2026";
const COMPANY = "TRAVELIS Rwanda Ltd";
const CONTACT_EMAIL = "info@rides.rw";
const WEBSITE = "www.rides.rw";

// ── Types ────────────────────────────────────────────────────────────────────

type PolicyItem =
  | { kind: "text"; value: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "sub"; title: string; bullets: string[] };

interface Section {
  id: string;
  num: string;
  title: string;
  content: PolicyItem[];
}

// ── Section Icon SVGs ────────────────────────────────────────────────────────
// Each section gets a meaningful icon + accent color to visually communicate purpose

interface SectionVisual {
  icon: ReactNode;
  color: string; // tailwind-compatible accent
  bgClass: string;
  textClass: string;
}

const SECTION_ICONS: Record<string, SectionVisual> = {
  introduction: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M4 21v-2a4 4 0 0 1 3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M8 3.13a4 4 0 0 0 0 7.75" />
        <line x1="8" y1="14" x2="16" y2="14" />
      </svg>
    ),
    color: "blue",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  coverage: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
    color: "violet",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  "who-we-are": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
        <path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" />
        <path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M16 14h.01" />
      </svg>
    ),
    color: "slate",
    bgClass: "bg-slate-100 dark:bg-slate-800/40",
    textClass: "text-slate-600 dark:text-slate-400",
  },
  "legal-framework": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <line x1="12" y1="3" x2="12" y2="15" /><path d="m5 12 7 3 7-3" />
        <path d="M5 6l7 3 7-3" /><line x1="12" y1="21" x2="12" y2="21.01" />
        <circle cx="5" cy="6" r="1" /><circle cx="19" cy="6" r="1" />
      </svg>
    ),
    color: "amber",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  "information-we-collect": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        <path d="M12 10v6" /><path d="m9 13 3-3 3 3" />
      </svg>
    ),
    color: "indigo",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/30",
    textClass: "text-indigo-600 dark:text-indigo-400",
  },
  "how-we-use": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    color: "cyan",
    bgClass: "bg-cyan-50 dark:bg-cyan-950/30",
    textClass: "text-cyan-600 dark:text-cyan-400",
  },
  "legal-basis": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
    color: "teal",
    bgClass: "bg-teal-50 dark:bg-teal-950/30",
    textClass: "text-teal-600 dark:text-teal-400",
  },
  "data-sharing": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    color: "orange",
    bgClass: "bg-orange-50 dark:bg-orange-950/30",
    textClass: "text-orange-600 dark:text-orange-400",
  },
  "data-retention": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: "rose",
    bgClass: "bg-rose-50 dark:bg-rose-950/30",
    textClass: "text-rose-600 dark:text-rose-400",
  },
  "data-security": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    color: "emerald",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  "your-rights": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    color: "blue",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  "location-data": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    color: "red",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-500 dark:text-red-400",
  },
  "childrens-privacy": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" /><path d="M12 16h.01" />
      </svg>
    ),
    color: "pink",
    bgClass: "bg-pink-50 dark:bg-pink-950/30",
    textClass: "text-pink-600 dark:text-pink-400",
  },
  "international-transfers": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: "sky",
    bgClass: "bg-sky-50 dark:bg-sky-950/30",
    textClass: "text-sky-600 dark:text-sky-400",
  },
  "third-party-services": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="7" width="6" height="10" rx="1" /><rect x="16" y="7" width="6" height="10" rx="1" />
        <path d="M8 12h8" /><path d="M12 8v8" />
      </svg>
    ),
    color: "fuchsia",
    bgClass: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
    textClass: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  "cookie-policy": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
        <path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" />
        <path d="M11 17v.01" /><path d="M7 14v.01" />
      </svg>
    ),
    color: "yellow",
    bgClass: "bg-yellow-50 dark:bg-yellow-950/30",
    textClass: "text-yellow-600 dark:text-yellow-500",
  },
  "other-information": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    color: "zinc",
    bgClass: "bg-zinc-100 dark:bg-zinc-800/40",
    textClass: "text-zinc-500 dark:text-zinc-400",
  },
  changes: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    color: "lime",
    bgClass: "bg-lime-50 dark:bg-lime-950/30",
    textClass: "text-lime-600 dark:text-lime-500",
  },
  contact: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: "emerald",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
};

// ── Collect sub-section icons for visual data cards ──────────────────────────

const DATA_CATEGORY_VISUALS: Record<string, { icon: ReactNode; bgClass: string; textClass: string }> = {
  "3.1  Personal Information": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  "3.2  Location Data": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-500 dark:text-red-400",
  },
  "3.3  Ride Information": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      </svg>
    ),
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  "3.4  Device and Technical Data": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  "3.5  Driver-Specific Data": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  "3.6  Feedback and Correspondence": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    bgClass: "bg-cyan-50 dark:bg-cyan-950/30",
    textClass: "text-cyan-600 dark:text-cyan-400",
  },
  "3.7  Information From Third Parties": {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    bgClass: "bg-sky-50 dark:bg-sky-950/30",
    textClass: "text-sky-600 dark:text-sky-400",
  },
};

// ── Rights visual data ───────────────────────────────────────────────────────

const RIGHTS_VISUALS: { title: string; desc: string; icon: ReactNode; bgClass: string; textClass: string }[] = [
  {
    title: "Access",
    desc: "Request information about our processing and access your personal information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Correct",
    desc: "Update or correct inaccuracies in your personal information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Delete",
    desc: "Request deletion of your personal information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-500 dark:text-red-400",
  },
  {
    title: "Transfer",
    desc: "Receive a machine-readable copy of your personal information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  {
    title: "Restrict",
    desc: "Restrict the processing of your personal information",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    ),
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Object",
    desc: "Object to our reliance on legitimate interests as the basis of our processing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
      </svg>
    ),
    bgClass: "bg-rose-50 dark:bg-rose-950/30",
    textClass: "text-rose-500 dark:text-rose-400",
  },
];

// ── Security Pipeline Steps ──────────────────────────────────────────────────

const SECURITY_STEPS = [
  {
    title: "Encryption",
    desc: "Sensitive data encrypted",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Secure Servers",
    desc: "Cloud infrastructure",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
  {
    title: "Access Control",
    desc: "Authentication systems",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Security Audits",
    desc: "Regular assessments",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

// ── Content ──────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "introduction",
    num: "",
    title: "Introduction",
    content: [
      {
        kind: "text",
        value: `This Privacy Policy is designed to help you understand how ${COMPANY} and its related subsidiaries and affiliates, including ${WEBSITE} ("we", "us" or "our") collects, uses, shares, and protects your personal data when you use our mobile application, website, and related services. We value your privacy, and we will not share your personal information with third parties except as described in this Privacy Policy without your consent.`,
      },
      {
        kind: "text",
        value:
          "By using our platforms, you agree to the practices described in this policy. If you do not agree, please do not use our websites, mobile applications, or provide us with your information.",
      },
    ],
  },
  {
    id: "coverage",
    num: "",
    title: "What This Policy Covers",
    content: [
      {
        kind: "text",
        value: "This Privacy Policy applies to our collection, use and sharing of your personal information:",
      },
      {
        kind: "bullets",
        items: [
          `When you visit our website at ${WEBSITE} and its related sites and mobile applications`,
          "When you receive our communications or participate in our online or offline activities or events",
          "When you fill out an application for admission or subscription to our mobile applications",
          "Information we obtain from third parties such as resellers, database vendors, content publishers and suppliers",
        ],
      },
      {
        kind: "text",
        value: `This Privacy Policy applies only to information gathered on and through the Site or mobile application and does not apply to any other websites not owned or operated by ${COMPANY}.`,
      },
    ],
  },
  {
    id: "who-we-are",
    num: "1",
    title: "Who We Are",
    content: [
      {
        kind: "text",
        value: `${COMPANY} is a technology company operating a ride-hailing and logistics platform as well as other technology-based solutions and applications in Rwanda.`,
      },
      {
        kind: "text",
        value: "We act as a data controller for personal data collected through the platform.",
      },
    ],
  },
  {
    id: "legal-framework",
    num: "2",
    title: "Legal Framework",
    content: [
      { kind: "text", value: "We comply with:" },
      {
        kind: "bullets",
        items: [
          "Rwanda Law No. 058/2021 relating to the protection of personal data and privacy",
          "General Data Protection Regulation (GDPR) where applicable",
          "Other applicable transport and digital service regulations",
        ],
      },
    ],
  },
  {
    id: "information-we-collect",
    num: "3",
    title: "Information We Collect",
    content: [
      {
        kind: "sub",
        title: "3.1  Personal Information",
        bullets: [
          "Full name",
          "Phone number and Mobile money number",
          "Email address",
          "Profile photo",
          "National ID or passport (for drivers)",
          "Address details",
        ],
      },
      {
        kind: "sub",
        title: "3.2  Location Data",
        bullets: [
          "Real-time GPS location while accessing the mobile application",
          "Pickup and drop-off locations",
          "Route history (for safety and service improvement)",
        ],
      },
      {
        kind: "sub",
        title: "3.3  Ride Information",
        bullets: [
          "Trip history",
          "Payment details (processed via third-party providers)",
          "Ratings and feedback",
        ],
      },
      {
        kind: "sub",
        title: "3.4  Device and Technical Data",
        bullets: [
          "Device type and operating system",
          "IP address",
          "App usage data and crash logs",
        ],
      },
      {
        kind: "sub",
        title: "3.5  Driver-Specific Data",
        bullets: [
          "Driving licence details and photo",
          "Vehicle registration document(s) and photo(s)",
          "Insurance certificate(s) and photo(s)",
          "Momo code number and mobile money phone number",
          "Background verification data (if applicable)",
          "Transportation service permit details and photo (if applicable)",
          "Picture(s) of the vehicle(s)",
        ],
      },
      {
        kind: "sub",
        title: "3.6  Feedback and Correspondence",
        bullets: [
          "Information you provide when requesting support, responding to surveys, or corresponding with us",
        ],
      },
      {
        kind: "sub",
        title: "3.7  Information From Third Parties",
        bullets: [
          "Additional information from third-party sources such as service providers, vendors, social media sites, and advertising agencies to provide you with more relevant information about our services",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    num: "4",
    title: "How We Use Your Data",
    content: [
      {
        kind: "bullets",
        items: [
          "Connect riders and drivers",
          "Provide, maintain and improve the Site and mobile applications",
          "Process and complete trips",
          "Process payments and payouts",
          "Improve platform safety and performance",
          "Provide customer support",
          "Detect fraud and prevent misuse",
          "Comply with legal obligations",
          "Send important service updates",
          "Better understand your needs and interests, and personalise your experience",
          "Process applications submitted through the Site and mobile applications",
          "Perform website analytics and database management services",
          "Manage and serve interest-based advertising on our platforms and trusted third-party sites",
          "Investigate or prevent violations of the law or your agreements with us",
          "Protect the rights, privacy, safety or property of you, us, or others",
        ],
      },
      {
        kind: "text",
        value: "We do not sell personal data.",
      },
    ],
  },
  {
    id: "legal-basis",
    num: "5",
    title: "Legal Basis for Processing",
    content: [
      { kind: "text", value: "We process data based on:" },
      {
        kind: "bullets",
        items: [
          "Contract necessity — to provide ride and payment services",
          "Legal obligations — tax and transport compliance",
          "Legitimate interest — fraud prevention, safety, and analytics",
          "Consent — marketing communications and optional features",
        ],
      },
    ],
  },
  {
    id: "data-sharing",
    num: "6",
    title: "Data Sharing",
    content: [
      {
        kind: "text",
        value:
          "We do not share your personal information with third parties without your consent, except in the following circumstances:",
      },
      {
        kind: "sub",
        title: "Drivers, Riders & Service Providers",
        bullets: [
          "Name and pickup/drop-off location",
          "Trip status and contact information (masked where possible)",
          "Payment details including MomoPay code and mobile money numbers",
        ],
      },
      {
        kind: "sub",
        title: `${COMPANY} Affiliates`,
        bullets: [
          `We may share your information with ${COMPANY}'s affiliates and related organisations for use consistent with this Privacy Policy`,
        ],
      },
      {
        kind: "sub",
        title: "Business Partners",
        bullets: [
          "Partners who offer a service to you jointly with us — a list is available upon request",
        ],
      },
      {
        kind: "sub",
        title: "Legal, Safety & Compliance",
        bullets: [
          "Government or law enforcement officials for fraud prevention and legal compliance",
          "Where permitted by law in connection with a legal investigation",
          "To protect, investigate, and deter against fraudulent, harmful, or illegal activity",
        ],
      },
      {
        kind: "sub",
        title: "Business Transfers",
        bullets: [
          "In connection with a merger, acquisition, reorganisation, or sale of assets, or in the event of bankruptcy",
        ],
      },
    ],
  },
  {
    id: "data-retention",
    num: "7",
    title: "Data Retention",
    content: [
      {
        kind: "bullets",
        items: [
          "Account data: retained while your account is active",
          "Trip history: up to 5 years (legal and tax compliance)",
          "Location data: limited retention for safety and dispute resolution",
          "Marketing data: until consent is withdrawn",
        ],
      },
    ],
  },
  {
    id: "data-security",
    num: "8",
    title: "Data Security",
    content: [
      { kind: "text", value: "We implement strong security measures including:" },
      {
        kind: "bullets",
        items: [
          "Encryption of sensitive data",
          "Secure servers and cloud infrastructure",
          "Access controls and authentication systems",
          "Regular security audits",
        ],
      },
      {
        kind: "text",
        value:
          "However, no system is 100% secure, and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "your-rights",
    num: "9",
    title: "Your Rights (Rwanda + GDPR)",
    content: [
      {
        kind: "text",
        value:
          "Rwandan Law N°058/2021 of 13/10/2021 relating to the Protection of Personal Data and Privacy gives you the following rights:",
      },
      {
        kind: "bullets",
        items: [
          "Access — Request information about our processing and access your personal information",
          "Correct — Update or correct inaccuracies in your personal information",
          "Delete — Request deletion of your personal information",
          "Transfer — Receive a machine-readable copy of your personal information",
          "Restrict — Restrict the processing of your personal information",
          "Object — Object to our reliance on legitimate interests as the basis of our processing",
        ],
      },
      { kind: "text", value: `To exercise your rights, contact us at: ${CONTACT_EMAIL}` },
    ],
  },
  {
    id: "location-data",
    num: "10",
    title: "Location Data",
    content: [
      { kind: "text", value: "We use GPS location to:" },
      {
        kind: "bullets",
        items: [
          "Match riders with nearby drivers",
          "Track trip progress",
          "Improve safety and navigation",
        ],
      },
      {
        kind: "text",
        value:
          "You can disable location access in your device settings, but core services may not function properly.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    num: "11",
    title: "Children's Privacy",
    content: [
      {
        kind: "text",
        value:
          "The Site is not intended for use by anyone under the age of 18, nor do we knowingly collect or solicit personal information from anyone under the age of 18. If you are under 18, you should not attempt to use the Site or send any information about yourself to us.",
      },
    ],
  },
  {
    id: "international-transfers",
    num: "12",
    title: "International Data Transfers",
    content: [
      {
        kind: "text",
        value:
          "Your data may be stored or processed on servers outside Rwanda. When this occurs, we ensure appropriate safeguards in line with GDPR standards.",
      },
    ],
  },
  {
    id: "third-party-services",
    num: "13",
    title: "Third-Party Services",
    content: [
      { kind: "text", value: "We may use third-party providers for:" },
      {
        kind: "bullets",
        items: ["Payments", "Maps and navigation", "Analytics", "Messaging services", "Hosting services"],
      },
      {
        kind: "text",
        value: "These providers have their own privacy policies, which we encourage you to review.",
      },
    ],
  },
  {
    id: "cookie-policy",
    num: "14",
    title: "Cookie Policy",
    content: [
      {
        kind: "text",
        value:
          "Cookies are small data files placed on your device when you visit a website. We use several different kinds of cookies:",
      },
      {
        kind: "bullets",
        items: [
          "Strictly necessary cookies — required for the Site to function and cannot be switched off",
          "Performance cookies — allow us to count visits and traffic sources to measure and improve performance",
          "Functional cookies — enable enhanced functionality and personalisation",
          "Third-party cookies — from analytics providers (e.g. Google Analytics) for demographic information and usage insights",
        ],
      },
      {
        kind: "text",
        value:
          'We may also use web beacons (sometimes called "tracking pixels" or "clear gifs") — tiny graphic files that enable us to recognise when someone has visited our Site. If you sign up to receive our emails, we may use cookies in conjunction with those emails.',
      },
      {
        kind: "text",
        value: "Most browsers let you remove or reject cookies. To do this, follow the instructions in your browser settings.",
      },
    ],
  },
  {
    id: "other-information",
    num: "15",
    title: "Other Important Information",
    content: [
      {
        kind: "sub",
        title: "Third-Party Sites and Services",
        bullets: [
          "The Site may contain links to other websites operated by third parties",
          "We are not responsible for their actions or privacy practices",
          "We encourage you to read their privacy policies to learn more",
        ],
      },
      {
        kind: "sub",
        title: "Security",
        bullets: [
          "We take organisational, technical, and physical measures to protect your personal information",
          "Security risk is inherent in all internet and information technologies",
          "We cannot guarantee the absolute security of your personal information",
        ],
      },
    ],
  },
  {
    id: "changes",
    num: "16",
    title: "Changes to This Policy",
    content: [
      {
        kind: "bullets",
        items: [
          "We may update this Privacy Policy from time to time",
          "Users will be notified of significant changes via the app or email",
          "Continued use of the app means acceptance of updates",
        ],
      },
    ],
  },
  {
    id: "contact",
    num: "17",
    title: "Contact Us",
    content: [
      { kind: "text", value: "If you have questions or requests regarding your data:" },
      {
        kind: "bullets",
        items: [
          `Company: ${COMPANY}`,
          `Email: ${CONTACT_EMAIL}`,
          "Location: Kigali, Rwanda",
        ],
      },
    ],
  },
];

// ── Commitments strip ────────────────────────────────────────────────────────

const COMMITMENTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "We never sell your data",
    body: "Your personal information is never sold to advertisers or third parties.",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    title: "GDPR & Rwanda Law N°058/2021",
    body: "We comply with both local Rwandan data law and EU GDPR standards.",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    textClass: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "You control your data",
    body: "Access, correct, delete, or export your data at any time on request.",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    textClass: "text-violet-600 dark:text-violet-400",
    borderHover: "hover:border-violet-300 dark:hover:border-violet-700",
  },
];

// ── Section content renderer ─────────────────────────────────────────────────

function SectionContent({ content, sectionId }: { content: PolicyItem[]; sectionId: string }) {
  // Special renderer for "Your Rights" section
  if (sectionId === "your-rights") {
    return <RightsSection content={content} />;
  }

  // Special renderer for "Data Security" section
  if (sectionId === "data-security") {
    return <SecuritySection content={content} />;
  }

  // Special renderer for "Contact Us" section
  if (sectionId === "contact") {
    return <ContactSection content={content} />;
  }

  return (
    <div className="space-y-5">
      {content.map((item, i) => {
        if (item.kind === "text") {
          return (
            <p key={i} className="text-[15px] leading-[1.8] text-muted-foreground">
              {item.value}
            </p>
          );
        }
        if (item.kind === "bullets") {
          return (
            <ul key={i} className="space-y-2.5">
              {item.items.map((b, bi) => (
                <li key={bi} className="flex gap-3">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-[15px] leading-[1.8] text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (item.kind === "sub") {
          const visual = DATA_CATEGORY_VISUALS[item.title];
          return (
            <div
              key={i}
              className="group space-y-2.5 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="flex items-center gap-3">
                {visual && (
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visual.bgClass} ${visual.textClass} transition-transform duration-300 group-hover:scale-110`}>
                    {visual.icon}
                  </div>
                )}
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-foreground/70">
                  {item.title}
                </p>
              </div>
              <ul className="space-y-2 pl-0">
                {item.bullets.map((b, bi) => (
                  <li key={bi} className="flex gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                    <span className="text-[14px] leading-[1.75] text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ── Rights Section — Visual Grid ─────────────────────────────────────────────

function RightsSection({ content }: { content: PolicyItem[] }) {
  // Extract intro and outro text
  const introText = content.find((c) => c.kind === "text");
  const outroItems = content.filter((c, i) => c.kind === "text" && i > 0);

  return (
    <div className="space-y-6">
      {introText && introText.kind === "text" && (
        <p className="text-[15px] leading-[1.8] text-muted-foreground">{introText.value}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RIGHTS_VISUALS.map((right) => (
          <div
            key={right.title}
            className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${right.bgClass} ${right.textClass} transition-transform duration-300 group-hover:scale-110`}>
              {right.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{right.title}</h4>
              <p className="mt-1 text-[13px] leading-[1.65] text-muted-foreground">{right.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {outroItems.map((item, i) =>
        item.kind === "text" ? (
          <p key={i} className="text-[15px] leading-[1.8] text-muted-foreground">{item.value}</p>
        ) : null,
      )}
    </div>
  );
}

// ── Security Section — Pipeline Flow ─────────────────────────────────────────

function SecuritySection({ content }: { content: PolicyItem[] }) {
  const introText = content.find((c) => c.kind === "text");
  const outroItems = content.filter((c, i) => c.kind === "text" && i > 0);

  return (
    <div className="space-y-6">
      {introText && introText.kind === "text" && (
        <p className="text-[15px] leading-[1.8] text-muted-foreground">{introText.value}</p>
      )}

      {/* Pipeline visualization */}
      <div className="relative">
        {/* Connecting dotted line (desktop only) */}
        <div className="absolute left-0 right-0 top-[2.75rem] hidden h-px border-t-2 border-dashed border-emerald-300/60 dark:border-emerald-700/40 sm:block" aria-hidden />

        <div className="grid gap-4 sm:grid-cols-4">
          {SECURITY_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="group relative flex flex-col items-center text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Step number badge */}
              <div className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                {i + 1}
              </div>
              <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-300 group-hover:shadow-lg group-hover:shadow-emerald-500/10 dark:group-hover:border-emerald-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {step.icon}
                </div>
              </div>
              <p className="mt-3 text-[13px] font-bold text-foreground">{step.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {outroItems.map((item, i) =>
        item.kind === "text" ? (
          <div key={i} className="mt-2 flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-800/30 dark:bg-amber-950/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-[13px] leading-[1.7] text-amber-800 dark:text-amber-300">{item.value}</p>
          </div>
        ) : null,
      )}
    </div>
  );
}

// ── Contact Section — CTA Card ───────────────────────────────────────────────

function ContactSection({ content }: { content: PolicyItem[] }) {
  const introText = content.find((c) => c.kind === "text");

  return (
    <div className="space-y-6">
      {introText && introText.kind === "text" && (
        <p className="text-[15px] leading-[1.8] text-muted-foreground">{introText.value}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.03] shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="space-y-4">
              {/* Company */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
                    <path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M16 10h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{COMPANY}</p>
                  <p className="text-xs text-muted-foreground">Data Controller</p>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 pl-[3.25rem]">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-primary/60">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-primary/60">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Kigali, Rwanda</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sticky TOC ───────────────────────────────────────────────────────────────

function TableOfContents({ activeId }: { activeId: string | null }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          Contents
        </p>
        <nav>
          <ul className="space-y-0">
            {SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              const visual = SECTION_ICONS[s.id];
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`flex items-center gap-2 border-l-2 py-[5px] pl-3 pr-2 text-[13px] leading-snug transition-all ${
                      isActive
                        ? "border-foreground font-semibold text-foreground"
                        : "border-transparent text-muted-foreground/60 hover:border-muted-foreground/25 hover:text-foreground/75"
                    }`}
                  >
                    {visual && (
                      <span className={`shrink-0 ${isActive ? visual.textClass : "text-muted-foreground/40"} transition-colors`}>
                        <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{visual.icon}</span>
                      </span>
                    )}
                    {s.num && (
                      <span className={`shrink-0 text-[11px] tabular-nums ${isActive ? "text-foreground/50" : "text-muted-foreground/35"}`}>
                        {s.num}.
                      </span>
                    )}
                    <span className="truncate">{s.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

// ── Active section tracker ───────────────────────────────────────────────────

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

// ── Privacy Shield Hero Component ────────────────────────────────────────────

function PrivacyShieldHero() {
  return (
    <div className="relative mx-auto w-full max-w-[480px] aspect-square flex items-center justify-center">
      <style>{`
        @keyframes shield-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0.15; }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .shield-pulse-ring {
          animation: shield-pulse 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .orbit-ring {
          animation: orbit-spin 30s linear infinite;
        }
        .orbit-ring-reverse {
          animation: orbit-spin 25s linear infinite reverse;
        }
        .float-icon {
          animation: float-gentle 5s ease-in-out infinite;
        }
      `}</style>

      {/* Outer glow rings */}
      <div className="absolute inset-[10%] rounded-full border border-primary/10 shield-pulse-ring" aria-hidden />
      <div className="absolute inset-[18%] rounded-full border border-primary/15 shield-pulse-ring" style={{ animationDelay: "1.3s" }} aria-hidden />
      <div className="absolute inset-[26%] rounded-full border border-primary/20 shield-pulse-ring" style={{ animationDelay: "2.6s" }} aria-hidden />

      {/* Orbiting ring with concept nodes */}
      <div className="absolute inset-[8%] orbit-ring" aria-hidden>
        {/* Encryption — top */}
        <div className="absolute left-1/2 -top-1 -translate-x-1/2 flex flex-col items-center gap-1 float-icon" style={{ animationDelay: "0s" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/10 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5.5 w-5.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">Encrypted</span>
        </div>

        {/* No Surveillance — right */}
        <div className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 flex flex-col items-center gap-1 float-icon" style={{ animationDelay: "1.2s" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/10 dark:border-blue-800/40 dark:bg-blue-950/60 dark:text-blue-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5.5 w-5.5">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">Private</span>
        </div>

        {/* Your Rights — bottom */}
        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 flex flex-col items-center gap-1 float-icon" style={{ animationDelay: "2.4s" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600 shadow-lg shadow-violet-500/10 dark:border-violet-800/40 dark:bg-violet-950/60 dark:text-violet-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5.5 w-5.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" />
            </svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600/80 dark:text-violet-400/80">Your Rights</span>
        </div>

        {/* Compliance — left */}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 flex flex-col items-center gap-1 float-icon" style={{ animationDelay: "3.6s" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-lg shadow-amber-500/10 dark:border-amber-800/40 dark:bg-amber-950/60 dark:text-amber-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5.5 w-5.5">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80">Compliant</span>
        </div>
      </div>

      {/* Center Shield */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-2xl shadow-primary/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" strokeWidth="2" />
          </svg>
        </div>
        <p className="mt-4 text-[13px] font-bold tracking-wide text-foreground/80">Your data, your control</p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-mono font-semibold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          GDPR · Law N°058/2021
        </span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const sectionIds = SECTIONS.map((s) => s.id);
  const activeId = useActiveSection(sectionIds);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setHeroVisible(true); ob.disconnect(); } },
      { threshold: 0.1 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <main className="flex-1 overflow-x-clip bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Layered backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />
        {/* Subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        {/* Primary glow from top center */}
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />
        {/* Top edge line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div
          ref={heroRef}
          className={`relative mx-auto max-w-7xl px-6 py-16 transition-all duration-700 ease-out sm:px-10 sm:py-20 lg:py-24 ${
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left column: Text Content */}
            <div className="max-w-2xl">
              {/* Breadcrumb */}
              <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0 opacity-40" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span className="font-medium text-foreground">Privacy Policy</span>
              </nav>

              {/* Category badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-3.5 py-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-primary" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-xs font-semibold tracking-wide text-primary">Privacy &amp; Data Protection</span>
              </div>

              {/* Headline */}
              <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
                Privacy Policy
              </h1>

              {/* Meta row */}
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium">{COMPANY}</span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span>Effective {EFFECTIVE_DATE}</span>
              </div>

              {/* Description */}
              <p className="mt-6 text-[15px] leading-[1.8] text-muted-foreground">
                This policy describes how we collect, use, share, and protect your
                personal data when you use the Rides app, website, and related services.
              </p>

              {/* Quick-action links */}
              <div className="mt-9 flex flex-wrap items-center gap-6 border-t border-border pt-8">
                <a
                  href="#your-rights"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  View your rights
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <a
                  href="#contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact us →
                </a>
                <a
                  href="#information-we-collect"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  What we collect →
                </a>
              </div>
            </div>

            {/* Right column: Privacy Shield Visual */}
            <div className="flex justify-center lg:justify-end">
              <PrivacyShieldHero />
            </div>
          </div>
        </div>
      </section>

      {/* ── Commitments strip ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
          <div className="grid gap-3 sm:grid-cols-3">
            {COMMITMENTS.map((c) => (
              <div
                key={c.title}
                className={`group flex gap-4 rounded-2xl border border-border/60 bg-background p-5 shadow-sm transition-all hover:-translate-y-0.5 ${c.borderHover} hover:shadow-md`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bgClass} ${c.textClass} transition-transform duration-300 group-hover:scale-110`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="mt-1 text-[13px] leading-[1.6] text-muted-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid gap-12 xl:grid-cols-[220px_1fr]">

          {/* TOC sidebar */}
          <TableOfContents activeId={activeId} />

          {/* Sections */}
          <div className="min-w-0 space-y-16">
            {SECTIONS.map((section) => {
              const visual = SECTION_ICONS[section.id];
              return (
                <article key={section.id} id={section.id} className="scroll-mt-28">
                  {/* Section header */}
                  <div className="mb-6 flex items-start gap-4">
                    {/* Section icon */}
                    {visual && (
                      <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${visual.bgClass} ${visual.textClass} shadow-sm`}>
                        {visual.icon}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {section.num && (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {section.num}
                        </span>
                      )}
                      <h2
                        className={`text-balance font-bold tracking-[-0.02em] text-foreground ${
                          section.num
                            ? "text-2xl sm:text-3xl"
                            : "text-xl sm:text-2xl text-muted-foreground"
                        }`}
                      >
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <div className={visual ? "pl-0 sm:pl-[3.75rem]" : ""}>
                    <SectionContent content={section.content} sectionId={section.id} />
                  </div>

                </article>
              );
            })}

            <p className="pb-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} {COMPANY} · Kigali, Rwanda
              <span className="mx-2">·</span>
              Last updated {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
