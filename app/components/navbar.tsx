"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { RidesLogo } from "./rides-logo";

function isLinkActive(
  href: string,
  pathname: string,
  activeHash: string | null,
): boolean {
  if (href === "/") {
    // Home is active when on home AND no section is currently in view.
    return pathname === "/" && activeHash === null;
  }
  if (href.startsWith("/#")) {
    return pathname === "/" && activeHash === href.slice(2);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Drivers", href: "/drivers" },
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

  // Sliding underline indicator for the desktop nav.
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({ left: 0, width: 0, ready: false });

  // Scroll-spy: track which homepage section is currently in view so the
  // Features / How It Works nav items light up while scrolling.
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const visibleSectionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash(null);
      return;
    }

    // Observe ALL homepage sections, not just the ones in the nav. That way
    // when the user scrolls into a non-nav section (download / faq), the
    // underline disappears instead of snapping back to Home.
    const sectionIds = ["features", "how-it-works", "download", "faq"];

    const sectionEls = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length === 0) return;
    visibleSectionsRef.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visibleSectionsRef.current.add(e.target.id);
          else visibleSectionsRef.current.delete(e.target.id);
        });
        // Pick the last visible section in document order (deepest scrolled into).
        let lastVisible: string | null = null;
        for (const id of sectionIds) {
          if (visibleSectionsRef.current.has(id)) lastVisible = id;
        }
        setActiveHash(lastVisible);
      },
      // Detection band: a 15%-tall strip just under the navbar.
      // A section "activates" when its top crosses into that strip.
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Measure the active link and reposition the underline.
  const repositionIndicator = () => {
    const active = navLinks.find((l) =>
      isLinkActive(l.href, pathname, activeHash),
    );
    const navEl = navRef.current;
    const linkEl = active ? linkRefs.current.get(active.href) : null;
    if (!active || !navEl || !linkEl) {
      setIndicator((prev) => ({ ...prev, ready: false }));
      return;
    }
    const navBox = navEl.getBoundingClientRect();
    const linkBox = linkEl.getBoundingClientRect();
    setIndicator({
      left: linkBox.left - navBox.left,
      width: linkBox.width,
      ready: true,
    });
  };

  useLayoutEffect(repositionIndicator, [pathname, activeHash]);

  useEffect(() => {
    window.addEventListener("resize", repositionIndicator);
    return () => window.removeEventListener("resize", repositionIndicator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, activeHash]);

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

        <nav
          ref={navRef}
          className="relative hidden items-center gap-8 pb-1 lg:flex"
        >
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href, pathname, activeHash);
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  if (el) linkRefs.current.set(link.href, el);
                  else linkRefs.current.delete(link.href);
                }}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Sliding underline — animates between active links */}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-0.5 h-[2px] rounded-full bg-primary transition-[left,width,opacity] duration-300 ease-out"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.ready ? 1 : 0,
            }}
          />
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#download"
            onClick={(e) => handleNavClick(e, "/#download")}
            className="hidden h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
          >
            Download App
          </Link>

          {/* Hamburger that morphs into an X */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen((v) => !v)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-surface lg:hidden"
          >
            <span className="relative block h-3.5 w-5">
              <span
                aria-hidden
                className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ease-out ${
                  mobileOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />
              <span
                aria-hidden
                className={`absolute left-0 top-[6px] h-[2px] w-5 rounded-full bg-current transition-opacity duration-200 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                aria-hidden
                className={`absolute left-0 top-[12px] h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ease-out ${
                  mobileOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Backdrop — dims the page below the navbar, tap to close */}
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden sm:top-20 ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Animated drawer — grid-rows trick lets us transition auto height */}
      <div
        id="mobile-nav-panel"
        className={`relative z-50 grid overflow-hidden bg-card transition-[grid-template-rows,border-color] duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "grid-rows-[1fr] border-t border-border"
            : "grid-rows-[0fr] border-t-0 border-transparent"
        }`}
      >
        <div className="min-h-0">
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6"
            aria-hidden={!mobileOpen}
          >
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href, pathname, activeHash);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  tabIndex={mobileOpen ? 0 : -1}
                  className={`relative flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                    />
                  ) : null}
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
              tabIndex={mobileOpen ? 0 : -1}
              className="mt-3 flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 sm:hidden"
            >
              Download App
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
