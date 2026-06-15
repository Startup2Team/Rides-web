"use client";

import Link from "next/link";
import { RidesLogo } from "./rides-logo";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#riders", label: "For riders" },
  { href: "/#safety", label: "Safety" },
  { href: "/drivers", label: "Drive with us" },
];

export default function Navbar() {
  return (
    <header
      className="rides sticky top-0 z-50 w-full"
      style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid var(--line)", backdropFilter: "blur(14px) saturate(150%)", WebkitBackdropFilter: "blur(14px) saturate(150%)" }}
    >
      <div className="rides-container flex h-16 items-center justify-between sm:h-[72px]">
        {/* Logo + wordmark */}
        <Link href="/" className="group flex items-center gap-2.5" style={{ color: "var(--ink)" }}>
          <RidesLogo size={32} priority className="h-8 w-8 shrink-0 transition-transform duration-300 group-hover:rotate-[-8deg]" />
          <span className="text-lg font-semibold tracking-[-0.03em]">Rides</span>
        </Link>

        {/* Center nav (desktop) — mono editorial labels */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.82rem] font-medium tracking-tight transition-colors"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="hidden text-[0.82rem] font-medium transition-colors sm:inline-flex"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Sign in
          </Link>
          <Link href="/#get-app" className="rides-btn rides-btn-primary !px-4 !py-2.5 text-sm">
            Get the app
          </Link>
        </div>
      </div>
    </header>
  );
}
