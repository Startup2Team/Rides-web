import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PrintButton } from "../_components/print-button";

export const metadata: Metadata = {
  title: "Terms of Service · Rides",
  description:
    "The rules for using Rides — for riders, drivers, and businesses across Rwanda.",
};

const LAST_UPDATED = "3 June 2026";

const SECTIONS = [
  { id: "summary", label: "In plain language" },
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Your account" },
  { id: "rider-service", label: "Using Rides as a rider" },
  { id: "driver-service", label: "Using Rides as a driver" },
  { id: "payments", label: "Payments & fees" },
  { id: "cancellations", label: "Cancellations & no-shows" },
  { id: "conduct", label: "Acceptable conduct" },
  { id: "safety", label: "Safety & incidents" },
  { id: "ip", label: "Intellectual property" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "indemnity", label: "Indemnity" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing law & disputes" },
  { id: "changes", label: "Changes to these terms" },
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

export default function TermsPage() {
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
                Terms of Service
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
              <strong className="font-semibold">Draft.</strong> These terms
              describe how Rides intends to operate, but they have not yet been
              reviewed by counsel. Final wording will be approved before public
              launch.
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
              Rides is a ride-hailing service operated by Amoria Global Ltd. in
              Kigali, Rwanda. By using Rides you agree to these rules. They
              cover how the service works, what you owe, what we owe you, and
              what happens if something goes wrong.
            </p>
            <p>
              We tried to write them in plain English. Where the law requires
              specific wording, we kept it short. If anything is unclear, write
              to{" "}
              <a href="mailto:legal@rides.rw" className="font-semibold text-primary hover:underline">
                legal@rides.rw
              </a>
              .
            </p>
          </Section>

          <Section id="acceptance" title="Acceptance of terms">
            <p>
              By creating an account, booking a ride, or driving on Rides, you
              accept these Terms and our{" "}
              <Link href="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              . If you do not agree, please do not use Rides.
            </p>
          </Section>

          <Section id="eligibility" title="Eligibility">
            <ul className="ml-4 list-disc space-y-2">
              <li>You must be at least 18 years old to use Rides.</li>
              <li>
                You must have the legal capacity to enter into a binding
                contract in Rwanda.
              </li>
              <li>
                Drivers must additionally meet the driver requirements set out
                in &ldquo;Using Rides as a driver&rdquo;.
              </li>
            </ul>
          </Section>

          <Section id="account" title="Your account">
            <p>
              You are responsible for keeping your account secure. Use a strong
              password, do not share your login, and enable two-factor
              authentication when offered. Tell us right away if you suspect
              someone else has accessed your account.
            </p>
            <p>
              One account per person. We may suspend or close accounts that are
              shared, duplicated, or created with false information.
            </p>
          </Section>

          <Section id="rider-service" title="Using Rides as a rider">
            <p>
              When you book a ride, we match you with a nearby driver who has
              accepted your request. The driver is an independent service
              provider — Rides is the platform that connects you.
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Be at the pickup point on time and ready.</li>
              <li>
                Treat your driver and their vehicle with respect. No smoking,
                no eating without permission, no damage.
              </li>
              <li>
                Wear a seatbelt where one is fitted. For moto rides, accept
                the helmet provided.
              </li>
              <li>
                Pay the fare shown when the ride ends. If the route changes
                significantly during the trip, the final fare may differ from
                the estimate.
              </li>
            </ul>
          </Section>

          <Section id="driver-service" title="Using Rides as a driver">
            <p>To drive on Rides you must:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Be at least 21 years old.</li>
              <li>
                Hold a valid Rwandan driver&apos;s licence for the vehicle
                category you operate (A for moto, B for cab, C for heavy
                goods).
              </li>
              <li>
                Submit and keep current: licence, vehicle insurance, and Rwanda
                Police vehicle authorization.
              </li>
              <li>
                Pass our identity and document checks. Approval is at our
                discretion.
              </li>
              <li>
                Carry a smartphone capable of running the driver app and have
                enough mobile data to stay online.
              </li>
            </ul>
            <p>
              You are an independent contractor. You decide when to be online
              and which rides to accept. Rides does not employ you and does not
              guarantee a minimum income.
            </p>
          </Section>

          <Section id="payments" title="Payments & fees">
            <ul className="ml-4 list-disc space-y-2">
              <li>
                Fares are charged through MTN Mobile Money or Airtel Money.
                Cash is accepted only where the driver displays the cash badge.
              </li>
              <li>
                Rides may charge a service fee on each ride. The fee is shown
                before you confirm the booking.
              </li>
              <li>
                Drivers receive their earnings net of the service fee, paid out
                on the schedule we publish in the driver app.
              </li>
              <li>
                Surge pricing may apply during periods of high demand. We will
                tell you the surge multiplier before you confirm.
              </li>
              <li>
                Refunds for disputed fares are reviewed within 7 business
                days. Email{" "}
                <a href="mailto:support@rides.rw" className="font-semibold text-primary hover:underline">
                  support@rides.rw
                </a>{" "}
                with your ride reference.
              </li>
            </ul>
          </Section>

          <Section id="cancellations" title="Cancellations & no-shows">
            <p>
              You can cancel a ride free of charge within 2 minutes of booking.
              After that, a cancellation fee may apply to compensate the driver
              for the trip to your pickup point. If you do not show up within
              5 minutes of the driver&apos;s arrival, the ride is treated as a
              no-show and a fee may be charged.
            </p>
          </Section>

          <Section id="conduct" title="Acceptable conduct">
            <p>
              The following are not allowed on Rides — for riders or drivers:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Violence, threats, harassment, or discrimination of any kind.</li>
              <li>Carrying or transporting illegal goods.</li>
              <li>Being under the influence of alcohol or drugs while driving.</li>
              <li>Soliciting business off-platform to avoid the service fee.</li>
              <li>Tampering with the app, location data, or fare calculation.</li>
              <li>
                Using Rides for any purpose forbidden by Rwandan law.
              </li>
            </ul>
            <p>
              We may suspend or permanently remove accounts that breach these
              rules.
            </p>
          </Section>

          <Section id="safety" title="Safety & incidents">
            <p>
              The driver app and rider app both include an SOS button that
              alerts our safety team. If you are in immediate danger, contact
              the Rwanda National Police on 112 first, then us. We cooperate
              fully with lawful investigations.
            </p>
          </Section>

          <Section id="ip" title="Intellectual property">
            <p>
              The Rides name, logo, app, and platform are owned by Amoria Global
              Ltd. and protected by Rwandan and international intellectual
              property laws. You may not copy, reverse engineer, or use the
              brand without written permission.
            </p>
          </Section>

          <Section id="disclaimers" title="Disclaimers">
            <p>
              Rides is provided &ldquo;as is&rdquo;. While we work hard to keep
              the platform safe and reliable, we cannot guarantee that it will
              be uninterrupted or error-free. Rides is a technology platform —
              we do not operate the vehicles ourselves. The driver is the
              service provider responsible for the ride itself.
            </p>
          </Section>

          <Section id="liability" title="Limitation of liability">
            <p>
              To the maximum extent allowed by Rwandan law, Rides&apos; total
              liability for any claim arising from your use of the platform is
              limited to the greater of (a) the fees you paid us in the 12
              months before the claim, or (b) RWF 100,000. We are not liable for
              indirect, incidental, or consequential losses.
            </p>
            <p>
              Nothing in these Terms limits liability that cannot be limited by
              law — including death or personal injury caused by negligence,
              and fraud.
            </p>
          </Section>

          <Section id="indemnity" title="Indemnity">
            <p>
              You agree to indemnify Rides against any third-party claim arising
              from your breach of these Terms or your unlawful use of the
              platform.
            </p>
          </Section>

          <Section id="termination" title="Termination">
            <p>
              You can close your account at any time from Account settings.
              We may suspend or close your account if you breach these Terms or
              if we are required to by law. We will tell you why, unless the
              law prevents us.
            </p>
          </Section>

          <Section id="governing-law" title="Governing law & disputes">
            <p>
              These Terms are governed by the laws of Rwanda. Any dispute that
              cannot be resolved by negotiation will be settled in the courts
              of Kigali. Before bringing a claim, please email{" "}
              <a href="mailto:legal@rides.rw" className="font-semibold text-primary hover:underline">
                legal@rides.rw
              </a>{" "}
              — we resolve almost everything informally.
            </p>
          </Section>

          <Section id="changes" title="Changes to these terms">
            <p>
              We may update these Terms from time to time. The &ldquo;last
              updated&rdquo; date at the top tells you when we last changed
              them. For material changes we notify you in the app at least 14
              days before the change takes effect.
            </p>
          </Section>

          <Section id="contact" title="Contact us">
            <p>
              Legal:{" "}
              <a href="mailto:legal@rides.rw" className="font-semibold text-primary hover:underline">
                legal@rides.rw
              </a>{" "}
              · Support:{" "}
              <a href="mailto:support@rides.rw" className="font-semibold text-primary hover:underline">
                support@rides.rw
              </a>{" "}
              · Privacy:{" "}
              <a href="mailto:privacy@rides.rw" className="font-semibold text-primary hover:underline">
                privacy@rides.rw
              </a>
            </p>
            <p>
              See also our{" "}
              <Link href="/privacy" className="font-semibold text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>
        </article>
      </section>
    </main>
  );
}
