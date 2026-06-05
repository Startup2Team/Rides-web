"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LAST_UPDATED = "3 June 2026";

const SECTIONS = [
  { id: "summary",       label: "In plain language",       icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4v4l3 3" },
  { id: "who-we-are",    label: "Who we are",              icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 4a3 3 0 0 1 0 6" },
  { id: "what-we-collect", label: "Information we collect", icon: "M4 7h16M4 12h16M4 17h10" },
  { id: "how-we-use",    label: "How we use it",           icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { id: "how-we-share",  label: "How we share it",         icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" },
  { id: "retention",     label: "How long we keep it",     icon: "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v6l4 2" },
  { id: "your-rights",   label: "Your rights",             icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { id: "security",      label: "Security",                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  { id: "cookies",       label: "Cookies",                 icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" },
  { id: "children",      label: "Children",                icon: "M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2zM4 20a8 8 0 0 1 16 0" },
  { id: "international", label: "International transfers", icon: "M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12zm9-9c-1 2.5-1.5 5.5 0 9s1 6.5 0 9M3 12h18" },
  { id: "changes",       label: "Changes to this policy",  icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { id: "contact",       label: "Contact us",              icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
];

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function SectionIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}

export default function PrivacyPage() {
  const active = useActiveSection(SECTIONS.map((s) => s.id));

  return (
    <main className="relative flex-1 overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute left-1/2 top-0 h-80 w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Legal · Privacy
          </span>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-balance text-5xl font-black tracking-[-0.03em] text-foreground sm:text-6xl">
                Privacy{" "}
                <span className="text-primary">Policy.</span>
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                How Rides collects, uses, and protects your information across
                the rider app, driver app, and admin tools.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Last updated ·{" "}
                <time dateTime="2026-06-03" className="font-medium text-foreground">
                  {LAST_UPDATED}
                </time>
              </p>
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="print:hidden inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
          </div>

          {/* Draft banner */}
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <strong className="font-semibold">Draft document.</strong>{" "}
              This policy reflects current data flows but has not yet been
              reviewed by counsel. Final wording will be approved before public
              launch.
            </span>
          </div>

          {/* Quick section chips */}
          <div className="mt-8 flex flex-wrap gap-2 print:hidden">
            {SECTIONS.slice(0, 6).map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                {s.label}
              </a>
            ))}
            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              +{SECTIONS.length - 6} more
            </span>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14 lg:py-20 print:block">

        {/* Sticky TOC */}
        <aside className="hidden lg:block print:hidden">
          <nav
            aria-label="On this page"
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"
          >
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              On this page
            </p>
            <ul className="space-y-0.5">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                          isActive ? "bg-primary" : "bg-border group-hover:bg-muted-foreground"
                        }`}
                      />
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Sections */}
        <article className="space-y-8 print:space-y-6">
          {/* Summary */}
          <PolicySection id="summary" icon={SECTIONS[0].icon} title="In plain language" highlight>
            <p>
              Rides is a Rwandan ride-hailing platform. We collect the data we
              need to match riders with drivers, complete payments, keep the
              service safe, and meet our legal obligations.{" "}
              <strong className="font-semibold text-foreground">
                We do not sell your data.
              </strong>{" "}
              We do not use it for advertising on other platforms.
            </p>
            <p>
              If something below is unclear, write to us at{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>{" "}
              and we will answer in plain language.
            </p>
          </PolicySection>

          {/* Who we are */}
          <PolicySection id="who-we-are" icon={SECTIONS[1].icon} title="Who we are">
            <p>
              Rides (operated by{" "}
              <strong className="font-semibold text-foreground">
                Amoria Global Ltd.
              </strong>
              , registered in Kigali, Rwanda) is the controller of the personal
              data described in this policy. Our registered office is in
              Kimironko, Kigali. If you contact us about your data, our Data
              Protection Officer will respond.
            </p>
          </PolicySection>

          {/* What we collect */}
          <PolicySection id="what-we-collect" icon={SECTIONS[2].icon} title="Information we collect">
            <p>
              We collect the categories of information below. We never ask for
              more than we need.
            </p>
            <DataTable
              rows={[
                { label: "Account information", desc: "Name, phone number, email, password (hashed), and your role (rider or driver)." },
                { label: "Driver verification", desc: "Driver's licence, vehicle plate, insurance certificate, and Rwanda Police authorization. Stored encrypted." },
                { label: "Location data", desc: "Your device location when you have the app open and, for drivers, when you are online." },
                { label: "Ride records", desc: "Pickup, drop-off, route, fare, driver/rider ratings, and any negotiation messages." },
                { label: "Payment information", desc: "MTN MoMo or Airtel Money phone number. We do not store full card details." },
                { label: "Device & usage", desc: "Device model, OS version, language, app version, crash logs, and basic interaction analytics." },
                { label: "Support & safety", desc: "Messages you send us, incident reports, SOS triggers, and any evidence shared during a safety review." },
              ]}
            />
          </PolicySection>

          {/* How we use */}
          <PolicySection id="how-we-use" icon={SECTIONS[3].icon} title="How we use information">
            <BulletList
              items={[
                "To create your account and verify your identity.",
                "To match riders with nearby drivers and provide navigation.",
                "To process payments through MTN MoMo or Airtel Money and generate receipts.",
                "To keep the platform safe — investigating fraud, reviewing incidents, and reaching out during an SOS.",
                "To send service messages by SMS (via Africa's Talking) and in-app notifications.",
                "To improve the app — fix bugs, measure performance, design new features.",
                "To comply with Rwandan law and respond to lawful requests.",
              ]}
            />
          </PolicySection>

          {/* How we share */}
          <PolicySection id="how-we-share" icon={SECTIONS[4].icon} title="How we share information">
            <p>
              We share data only with the parties below, and only the minimum
              they need to do their job.
            </p>
            <DataTable
              rows={[
                { label: "Drivers and riders", desc: "A driver sees the rider's pickup location and first name during a ride; a rider sees the driver's name, vehicle, and live location." },
                { label: "Payment partners", desc: "MTN Rwanda and Airtel Rwanda receive what they need to settle a transaction." },
                { label: "Infrastructure providers", desc: "Hosting, maps, SMS delivery, and crash reporting — bound by contract to use data only for our purposes." },
                { label: "Authorities", desc: "Only where required by Rwandan law or to protect someone's safety." },
              ]}
            />
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              We do not sell your personal data. Ever.
            </div>
          </PolicySection>

          {/* Retention */}
          <PolicySection id="retention" icon={SECTIONS[5].icon} title="How long we keep it">
            <p>
              We keep data only as long as we need it. Ride history is kept for
              5 years for tax and dispute reasons. Account data is kept while
              your account is active and deleted within 90 days of account
              closure, except where law requires longer retention.
            </p>
          </PolicySection>

          {/* Your rights */}
          <PolicySection id="your-rights" icon={SECTIONS[6].icon} title="Your rights">
            <p>You can ask us to:</p>
            <BulletList
              items={[
                "Show you a copy of the data we hold about you.",
                "Correct information that is wrong or incomplete.",
                "Delete your account (subject to retention obligations such as tax records).",
                "Export your ride history in a portable format (JSON or CSV).",
                "Stop processing your data for a specific purpose.",
              ]}
            />
            <p>
              Email{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>{" "}
              and we will respond within 30 days.
            </p>
          </PolicySection>

          {/* Security */}
          <PolicySection id="security" icon={SECTIONS[7].icon} title="Security">
            <p>
              We encrypt data in transit (TLS 1.2+) and at rest. Driver
              documents are stored in encrypted object storage with
              time-limited signed URLs. Admin access requires two-factor
              authentication. We monitor for unauthorized access and notify
              affected users if a breach affects them.
            </p>
          </PolicySection>

          {/* Cookies */}
          <PolicySection id="cookies" icon={SECTIONS[8].icon} title="Cookies & similar technologies">
            <p>
              On the web (rides.rw and the admin dashboard), we use a small
              number of strictly necessary cookies to keep you signed in and
              remember your preferences. We do not use third-party advertising
              cookies. We do not run cross-site tracking.
            </p>
          </PolicySection>

          {/* Children */}
          <PolicySection id="children" icon={SECTIONS[9].icon} title="Children">
            <p>
              Rides is not for anyone under 18. We do not knowingly collect
              data from children. If you believe a child has signed up, write
              to{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>{" "}
              and we will close the account.
            </p>
          </PolicySection>

          {/* International */}
          <PolicySection id="international" icon={SECTIONS[10].icon} title="International transfers">
            <p>
              Most data stays on servers in the African region. Some service
              providers (for crash reporting and email delivery) operate from
              other regions; in those cases we use providers with adequate data
              protection standards.
            </p>
          </PolicySection>

          {/* Changes */}
          <PolicySection id="changes" icon={SECTIONS[11].icon} title="Changes to this policy">
            <p>
              When we update this policy, we change the &ldquo;last
              updated&rdquo; date at the top and notify you in the app for any
              material change. Continued use of Rides after a change means you
              accept it.
            </p>
          </PolicySection>

          {/* Contact */}
          <PolicySection id="contact" icon={SECTIONS[12].icon} title="Contact us">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="mailto:privacy@rides.rw"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Privacy enquiries</p>
                  <p className="text-sm font-semibold text-foreground">privacy@rides.rw</p>
                </div>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Also read our{" "}
              <Link href="/terms" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              for the rules of using Rides.
            </p>
          </PolicySection>
        </article>
      </div>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PolicySection({
  id,
  icon,
  title,
  highlight,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 rounded-2xl border p-6 sm:p-7 transition-all ${
        highlight
          ? "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            highlight ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
          }`}
        >
          <SectionIcon path={icon} />
        </span>
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DataTable({ rows }: { rows: { label: string; desc: string }[] }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-border">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4 ${
            i !== rows.length - 1 ? "border-b border-border" : ""
          } ${i % 2 === 0 ? "bg-surface/40" : ""}`}
        >
          <span className="text-xs font-semibold text-foreground">{row.label}</span>
          <span className="text-xs leading-relaxed text-muted-foreground">{row.desc}</span>
        </div>
      ))}
    </div>
  );
}
