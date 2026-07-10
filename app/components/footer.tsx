"use client";

import Link from "next/link";
import { useTranslations } from "../i18n/context";

const productLinks = [
  { labelKey: "features", href: "/#features" },
  { labelKey: "howItWorks", href: "/#how-it-works" },
  { labelKey: "drivers", href: "/drivers" },
  { labelKey: "download", href: "/#download" },
] as const;

const companyLinks = [
  { labelKey: "about", href: "/about" },
  { labelKey: "contact", href: "/contact" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const legalLinks = [
    { label: tf("privacyPolicy"), href: "/privacy" },
    { label: tf("termsOfService"), href: "/terms" },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <img src="/ridelogo.png" alt="Rides" className="h-9 w-9 shrink-0 object-contain" />
              <span className="text-xl font-black tracking-[-0.04em] text-foreground">
                id<span className="text-emerald-500">es</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {tf("tagline")}
            </p>
            <p className="mt-2 text-xs italic text-muted-foreground/60">
              {tf("quote")}
            </p>

            <div className="mt-6 flex items-center gap-2">
              <Link
                href="#"
                aria-label="Twitter"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" />
                </svg>
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56z" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                {tf("product")}
              </p>
              <ul className="mt-4 space-y-3">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                {tf("company")}
              </p>
              <ul className="mt-4 space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                {tf("legal")}
              </p>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} Rides. {tf("rightsReserved")}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {tf("privacy")}
            </Link>
            <span className="h-3 w-px bg-border" />
            <Link href="/terms" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {tf("terms")}
            </Link>
            <span className="h-3 w-px bg-border" />
            <Link href="/about" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              {t("about")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
