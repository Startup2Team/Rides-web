"use client";

import Link from "next/link";
import { RidesLogo } from "./rides-logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/70 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <RidesLogo
            size={56}
            priority
            className="h-12 w-12 shrink-0 sm:h-[72px] sm:w-[72px]"
          />
          <span className="text-base font-semibold tracking-[-0.02em] text-foreground sm:text-lg">
            Rides
          </span>
        </Link>

        {/* Coming Soon badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Coming Soon
        </span>
      </div>
    </header>
  );
}
