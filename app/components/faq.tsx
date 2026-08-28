"use client";

import { useSection, useTranslations } from "../i18n/context";

export default function FAQ() {
  const t = useTranslations("faq");
  const { items } = useSection("faq");

  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: intro */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />
              {t("eyebrow")}
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-muted-foreground sm:text-4xl lg:text-[3.25rem]">
              {t("heading")}
            </h2>
            <p className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("introPrefix")}{" "}
              <a
                href="/contact"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("introLinkLabel")}
              </a>
              .
            </p>
          </div>

          {/* Right: accordion */}
          <div className="lg:col-span-7">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((item) => (
                <li key={item.q}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-semibold text-foreground transition-colors hover:text-primary sm:text-lg [&::-webkit-details-marker]:hidden">
                      <span>{item.q}</span>
                      <span
                        aria-hidden
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-open:rotate-45"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </span>
                    </summary>
                    <p className="pb-6 pr-12 text-pretty text-sm leading-[1.6] text-muted-foreground sm:text-[15px]">
                      {item.a}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
