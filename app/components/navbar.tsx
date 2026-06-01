"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RidesLogo } from "./rides-logo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Drivers", href: "/drivers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SCROLL_STASH_KEY = "rides-pending-scroll";

function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pending = sessionStorage.getItem(SCROLL_STASH_KEY);
    if (!pending) return;
    sessionStorage.removeItem(SCROLL_STASH_KEY);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!smoothScrollToId(pending)) {
          setTimeout(() => smoothScrollToId(pending), 200);
        } else {
          history.replaceState(null, "", `#${pending}`);
        }
      });
    });
  }, [pathname]);

  // Close mobile menu on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open + Esc to close.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    setMobileOpen(false);
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    e.preventDefault();
    const path = href.substring(0, hashIndex) || "/";
    const hash = href.substring(hashIndex + 1);

    if (pathname === path) {
      if (smoothScrollToId(hash)) {
        history.replaceState(null, "", `#${hash}`);
      }
      return;
    }

    sessionStorage.setItem(SCROLL_STASH_KEY, hash);
    router.push(path);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/70 backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
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

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#download"
            onClick={(e) => handleNavClick(e, "/#download")}
            className="hidden h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
          >
            Download App
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-surface lg:hidden"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-nav-panel"
          className="border-t border-border bg-card lg:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/#download"
              onClick={(e) => {
                setMobileOpen(false);
                handleNavClick(e, "/#download");
              }}
              className="mt-2 flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 sm:hidden"
            >
              Download App
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
