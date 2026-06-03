import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PrintButton } from "../_components/print-button";

export const metadata: Metadata = {
  title: "Privacy Policy · Rides",
  description:
    "How Rides collects, uses, and protects your information across the rider app, driver app, and admin tools.",
};

const LAST_UPDATED = "3 June 2026";

const SECTIONS = [
  { id: "summary", label: "In plain language" },
  { id: "who-we-are", label: "Who we are" },
  { id: "what-we-collect", label: "Information we collect" },
  { id: "how-we-use", label: "How we use information" },
  { id: "how-we-share", label: "How we share information" },
  { id: "retention", label: "How long we keep it" },
  { id: "your-rights", label: "Your rights" },
  { id: "security", label: "Security" },
  { id: "cookies", label: "Cookies & similar tech" },
  { id: "children", label: "Children" },
  { id: "international", label: "International transfers" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="relative flex-1">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-b from-surface/40 to-transparent print:bg-none">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20 print:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Legal
              </p>
              <h1 className="mt-3 text-balance text-4xl font-bold tracking-[-0.025em] text-foreground sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Last updated · <time dateTime="2026-06-03">{LAST_UPDATED}</time>
              </p>
            </div>
            <PrintButton />
          </div>

          <div className="mt-6 inline-flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-900 sm:text-[13px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              <strong className="font-semibold">Draft.</strong> This document
              reflects the data flows of the Rides platform but has not yet
              been reviewed by counsel. Final wording will be approved before
              public launch.
            </span>
          </div>
        </div>
      </section>

      {/* ── Body with sticky TOC on desktop ──────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12 lg:py-20 print:block print:py-4">
        <aside className="hidden lg:block print:hidden">
          <nav
            aria-label="On this page"
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              On this page
            </p>
            <ul className="mt-3 space-y-1.5">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="space-y-10 lg:space-y-12">
          <Section id="summary" title="In plain language">
            <p>
              Rides is a Rwandan ride-hailing platform. We collect the data we need
              to match riders with drivers, complete payments, keep the service
              safe, and meet our legal obligations. We do not sell your data. We
              do not use it for advertising on other platforms.
            </p>
            <p>
              If something below is unclear, write to us at{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>{" "}
              and we will answer in plain language.
            </p>
          </Section>

          <Section id="who-we-are" title="Who we are">
            <p>
              Rides (operated by Amoria Global Ltd., registered in Kigali, Rwanda)
              is the controller of the personal data described in this policy.
              Our registered office is in Kimironko, Kigali. If you contact us
              about your data, our Data Protection Officer will respond.
            </p>
          </Section>

          <Section id="what-we-collect" title="Information we collect">
            <p>
              We collect the categories of information below. We never ask for
              more than we need.
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong className="text-foreground">Account information</strong> —
                name, phone number, email, password (hashed), and your role
                (rider or driver).
              </li>
              <li>
                <strong className="text-foreground">Driver verification</strong> —
                driver&apos;s licence, vehicle plate, insurance certificate, and
                Rwanda Police authorization. Stored encrypted; reviewed by our
                trust and safety team.
              </li>
              <li>
                <strong className="text-foreground">Location data</strong> — your
                device location when you have the app open and, for drivers, when
                you are online. This is required to match rides and to provide
                turn-by-turn navigation.
              </li>
              <li>
                <strong className="text-foreground">Ride records</strong> —
                pickup, drop-off, route, fare, driver/rider ratings, and any
                negotiation messages.
              </li>
              <li>
                <strong className="text-foreground">Payment information</strong> —
                MTN MoMo or Airtel Money phone number (or merchant code).
                We do not store full card details — payment partners handle that
                under their own privacy terms.
              </li>
              <li>
                <strong className="text-foreground">Device and usage</strong> —
                device model, OS version, language, app version, crash logs,
                and basic interaction analytics.
              </li>
              <li>
                <strong className="text-foreground">Support and safety</strong> —
                messages you send us, incident reports, SOS triggers, and any
                evidence shared with us during a safety review.
              </li>
            </ul>
          </Section>

          <Section id="how-we-use" title="How we use information">
            <ul className="ml-4 list-disc space-y-2">
              <li>To create your account and verify your identity.</li>
              <li>To match riders with nearby drivers and provide navigation.</li>
              <li>
                To process payments through MTN MoMo or Airtel Money and
                generate receipts.
              </li>
              <li>
                To keep the platform safe — investigating fraud, reviewing
                incidents, and reaching out during an SOS.
              </li>
              <li>
                To send service messages by SMS (delivered via Africa&apos;s
                Talking) and in-app notifications.
              </li>
              <li>To improve the app — fix bugs, measure performance, design new features.</li>
              <li>To comply with Rwandan law and respond to lawful requests.</li>
            </ul>
          </Section>

          <Section id="how-we-share" title="How we share information">
            <p>
              We share data only with the parties below, and only the minimum
              they need to do their job.
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong className="text-foreground">Drivers and riders</strong> —
                a driver sees the rider&apos;s pickup location and first name
                during a ride; a rider sees the driver&apos;s name, vehicle, and
                live location.
              </li>
              <li>
                <strong className="text-foreground">Payment partners</strong> —
                MTN Rwanda and Airtel Rwanda receive what they need to settle a
                transaction.
              </li>
              <li>
                <strong className="text-foreground">Infrastructure providers</strong> —
                hosting, maps, SMS delivery, and crash reporting. We bind them
                by contract to use the data only for our purposes.
              </li>
              <li>
                <strong className="text-foreground">Authorities</strong> — only
                where required by Rwandan law or to protect someone&apos;s
                safety.
              </li>
            </ul>
            <p>We do not sell your personal data. Ever.</p>
          </Section>

          <Section id="retention" title="How long we keep it">
            <p>
              We keep data only as long as we need it. Ride history is kept for
              5 years for tax and dispute reasons. Account data is kept while
              your account is active and deleted within 90 days of account
              closure, except where law requires longer retention.
            </p>
          </Section>

          <Section id="your-rights" title="Your rights">
            <p>You can ask us to:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Show you a copy of the data we hold about you.</li>
              <li>Correct information that is wrong or incomplete.</li>
              <li>
                Delete your account (subject to retention obligations such as
                tax records).
              </li>
              <li>
                Export your ride history in a portable format (JSON or CSV).
              </li>
              <li>Stop processing your data for a specific purpose.</li>
            </ul>
            <p>
              Email{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>{" "}
              and we will respond within 30 days.
            </p>
          </Section>

          <Section id="security" title="Security">
            <p>
              We encrypt data in transit (TLS 1.2+) and at rest. Driver documents
              are stored in encrypted object storage with time-limited signed
              URLs. Admin access requires two-factor authentication. We monitor
              for unauthorized access and notify affected users if a breach
              affects them.
            </p>
          </Section>

          <Section id="cookies" title="Cookies & similar technologies">
            <p>
              On the web (rides.rw and the admin dashboard), we use a small
              number of strictly necessary cookies to keep you signed in and
              remember your preferences. We do not use third-party advertising
              cookies. We do not run cross-site tracking.
            </p>
          </Section>

          <Section id="children" title="Children">
            <p>
              Rides is not for anyone under 18. We do not knowingly collect data
              from children. If you believe a child has signed up, write to{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>{" "}
              and we will close the account.
            </p>
          </Section>

          <Section id="international" title="International transfers">
            <p>
              Most data stays on servers in the African region. Some service
              providers (for crash reporting and email delivery) operate from
              other regions; in those cases we use providers with adequate data
              protection standards.
            </p>
          </Section>

          <Section id="changes" title="Changes to this policy">
            <p>
              When we update this policy, we change the &ldquo;last updated&rdquo;
              date at the top and notify you in the app for any material change.
              Continued use of Rides after a change means you accept it.
            </p>
          </Section>

          <Section id="contact" title="Contact us">
            <p>
              Questions, complaints, or requests:{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>
              .
            </p>
            <p>
              Read our{" "}
              <Link href="/terms" className="font-semibold text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              for the rules of using Rides.
            </p>
          </Section>
        </article>
      </section>
    </main>
  );
}
