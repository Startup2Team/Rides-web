"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "../i18n/context";

function isLinkActive(
  href: string,
  pathname: string,
  activeHash: string | null,
): boolean {
  if (href === "/") {
    return pathname === "/" && activeHash === null;
  }
  if (href.startsWith("/#")) {
    return pathname === "/" && activeHash === href.slice(2);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navLinks = [
  { labelKey: "home", href: "/" },
  { labelKey: "features", href: "/#features" },
  { labelKey: "howItWorks", href: "/#how-it-works" },
  { labelKey: "drivers", href: "/drivers" },
  { labelKey: "about", href: "/about" },
  { labelKey: "contact", href: "/contact" },
] as const;

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
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({ left: 0, width: 0, ready: false });

  const [activeHash, setActiveHash] = useState<string | null>(null);
  const visibleSectionsRef = useRef<Set<string>>(new Set());

  // Glass needs something behind it to frost. Sitting at the top of the page
  // there's nothing, so the pill stays light; once content slides underneath it
  // firms up to keep the links legible.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash(null);
      return;
    }

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
        let lastVisible: string | null = null;
        for (const id of sectionIds) {
          if (visibleSectionsRef.current.has(id)) lastVisible = id;
        }
        setActiveHash(lastVisible);
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    // The header is a transparent gutter the pill floats inside, so it can't
    // swallow clicks on the page behind it — only the pill and sheet opt back in.
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <div
        aria-hidden
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`pointer-events-auto relative z-10 mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border pl-4 pr-2 backdrop-blur-3xl backdrop-saturate-150 transition-[background-color,box-shadow,border-color] duration-300 sm:h-16 sm:pl-6 sm:pr-3 ${
          scrolled || mobileOpen
            ? "border-glass-border bg-glass-strong shadow-lg shadow-foreground/10"
            : "border-glass-border bg-glass shadow-md shadow-foreground/5"
        }`}
      >
        {/* Inner rim — the lit top edge that sells the surface as glass rather
            than a flat translucent bar. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-glass-highlight"
        />

        <Link href="/" className="group relative flex items-center">
          {/* One typeface throughout, three brand colours: blue R, pink id,
              green es. All clear the 3:1 large-text bar at this size. */}
          <span className="text-xl font-black tracking-[-0.04em] sm:text-2xl">
            <span className="text-primary">R</span>
            <span className="text-[#e55189]">id</span>
            <span className="text-emerald-600">es</span>
          </span>
        </Link>

        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 lg:flex"
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
                aria-current={isActive ? "page" : undefined}
                className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}

          {/* Same measured left/width as before, grown from a 2px underline into
              a pill that slides between links. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 rounded-full bg-primary/10 ring-1 ring-inset ring-primary/20 transition-[left,width,opacity] duration-300 ease-out motion-reduce:transition-none"
            style={{
              left: indicator.left,
              width: indicator.width,
              opacity: indicator.ready ? 1 : 0,
            }}
          />
        </nav>

        <div className="relative flex items-center gap-2">
          <LanguageSwitcher />

          <Link
            href="/#download"
            onClick={(e) => handleNavClick(e, "/#download")}
            className="hidden h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] hover:bg-foreground active:scale-[0.98] sm:inline-flex"
          >
            {t("download")}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen((v) => !v)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-glass-border bg-glass-strong text-foreground transition-colors hover:bg-surface lg:hidden"
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

      {/* The sheet is its own floating card now — it clears the pill instead of
          hanging off it, so both keep their fully-rounded silhouette. */}
      <div
        id="mobile-nav-panel"
        className={`pointer-events-auto relative z-10 mx-auto mt-2 grid max-w-7xl overflow-hidden rounded-3xl border backdrop-blur-3xl backdrop-saturate-150 transition-[grid-template-rows,opacity,background-color,border-color] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          mobileOpen
            ? "grid-rows-[1fr] border-glass-border bg-glass-strong opacity-100 shadow-xl shadow-foreground/10"
            : "pointer-events-none grid-rows-[0fr] border-transparent bg-transparent opacity-0"
        }`}
      >
        <div className="min-h-0">
          <nav
            className="flex flex-col gap-1 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
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
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex min-h-11 items-center rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                      : "text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {t(link.labelKey)}
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
              className="mt-2 flex h-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 sm:hidden"
            >
              {t("download")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
