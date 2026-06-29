"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const EFFECTIVE_DATE = "June 11, 2026";
const COMPANY = "TRAVELIS Rwanda Ltd";
const CONTACT_EMAIL = "info@rides.rw";
const WEBSITE = "www.rides.rw";

// ── Types ────────────────────────────────────────────────────────────────────

type PolicyItem =
  | { kind: "text"; value: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "sub"; title: string; bullets: string[] };

interface Section {
  id: string;
  num: string;
  title: string;
  content: PolicyItem[];
}

// ── Content ──────────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: "introduction",
    num: "",
    title: "Introduction",
    content: [
      {
        kind: "text",
        value: `This Privacy Policy is designed to help you understand how ${COMPANY} and its related subsidiaries and affiliates, including ${WEBSITE} ("we", "us" or "our") collects, uses, shares, and protects your personal data when you use our mobile application, website, and related services. We value your privacy, and we will not share your personal information with third parties except as described in this Privacy Policy without your consent.`,
      },
      {
        kind: "text",
        value:
          "By using our platforms, you agree to the practices described in this policy. If you do not agree, please do not use our websites, mobile applications, or provide us with your information.",
      },
    ],
  },
  {
    id: "coverage",
    num: "",
    title: "What This Policy Covers",
    content: [
      {
        kind: "text",
        value: "This Privacy Policy applies to our collection, use and sharing of your personal information:",
      },
      {
        kind: "bullets",
        items: [
          `When you visit our website at ${WEBSITE} and its related sites and mobile applications`,
          "When you receive our communications or participate in our online or offline activities or events",
          "When you fill out an application for admission or subscription to our mobile applications",
          "Information we obtain from third parties such as resellers, database vendors, content publishers and suppliers",
        ],
      },
      {
        kind: "text",
        value: `This Privacy Policy applies only to information gathered on and through the Site or mobile application and does not apply to any other websites not owned or operated by ${COMPANY}.`,
      },
    ],
  },
  {
    id: "who-we-are",
    num: "1",
    title: "Who We Are",
    content: [
      {
        kind: "text",
        value: `${COMPANY} is a technology company operating a ride-hailing and logistics platform as well as other technology-based solutions and applications in Rwanda.`,
      },
      {
        kind: "text",
        value: "We act as a data controller for personal data collected through the platform.",
      },
    ],
  },
  {
    id: "legal-framework",
    num: "2",
    title: "Legal Framework",
    content: [
      { kind: "text", value: "We comply with:" },
      {
        kind: "bullets",
        items: [
          "Rwanda Law No. 058/2021 relating to the protection of personal data and privacy",
          "General Data Protection Regulation (GDPR) where applicable",
          "Other applicable transport and digital service regulations",
        ],
      },
    ],
  },
  {
    id: "information-we-collect",
    num: "3",
    title: "Information We Collect",
    content: [
      {
        kind: "sub",
        title: "3.1  Personal Information",
        bullets: [
          "Full name",
          "Phone number and Mobile money number",
          "Email address",
          "Profile photo",
          "National ID or passport (for drivers)",
          "Address details",
        ],
      },
      {
        kind: "sub",
        title: "3.2  Location Data",
        bullets: [
          "Real-time GPS location while accessing the mobile application",
          "Pickup and drop-off locations",
          "Route history (for safety and service improvement)",
        ],
      },
      {
        kind: "sub",
        title: "3.3  Ride Information",
        bullets: [
          "Trip history",
          "Payment details (processed via third-party providers)",
          "Ratings and feedback",
        ],
      },
      {
        kind: "sub",
        title: "3.4  Device and Technical Data",
        bullets: [
          "Device type and operating system",
          "IP address",
          "App usage data and crash logs",
        ],
      },
      {
        kind: "sub",
        title: "3.5  Driver-Specific Data",
        bullets: [
          "Driving licence details and photo",
          "Vehicle registration document(s) and photo(s)",
          "Insurance certificate(s) and photo(s)",
          "Momo code number and mobile money phone number",
          "Background verification data (if applicable)",
          "Transportation service permit details and photo (if applicable)",
          "Picture(s) of the vehicle(s)",
        ],
      },
      {
        kind: "sub",
        title: "3.6  Feedback and Correspondence",
        bullets: [
          "Information you provide when requesting support, responding to surveys, or corresponding with us",
        ],
      },
      {
        kind: "sub",
        title: "3.7  Information From Third Parties",
        bullets: [
          "Additional information from third-party sources such as service providers, vendors, social media sites, and advertising agencies to provide you with more relevant information about our services",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    num: "4",
    title: "How We Use Your Data",
    content: [
      {
        kind: "bullets",
        items: [
          "Connect riders and drivers",
          "Provide, maintain and improve the Site and mobile applications",
          "Process and complete trips",
          "Process payments and payouts",
          "Improve platform safety and performance",
          "Provide customer support",
          "Detect fraud and prevent misuse",
          "Comply with legal obligations",
          "Send important service updates",
          "Better understand your needs and interests, and personalise your experience",
          "Process applications submitted through the Site and mobile applications",
          "Perform website analytics and database management services",
          "Manage and serve interest-based advertising on our platforms and trusted third-party sites",
          "Investigate or prevent violations of the law or your agreements with us",
          "Protect the rights, privacy, safety or property of you, us, or others",
        ],
      },
      {
        kind: "text",
        value: "We do not sell personal data.",
      },
    ],
  },
  {
    id: "legal-basis",
    num: "5",
    title: "Legal Basis for Processing",
    content: [
      { kind: "text", value: "We process data based on:" },
      {
        kind: "bullets",
        items: [
          "Contract necessity — to provide ride and payment services",
          "Legal obligations — tax and transport compliance",
          "Legitimate interest — fraud prevention, safety, and analytics",
          "Consent — marketing communications and optional features",
        ],
      },
    ],
  },
  {
    id: "data-sharing",
    num: "6",
    title: "Data Sharing",
    content: [
      {
        kind: "text",
        value:
          "We do not share your personal information with third parties without your consent, except in the following circumstances:",
      },
      {
        kind: "sub",
        title: "Drivers, Riders & Service Providers",
        bullets: [
          "Name and pickup/drop-off location",
          "Trip status and contact information (masked where possible)",
          "Payment details including MomoPay code and mobile money numbers",
        ],
      },
      {
        kind: "sub",
        title: `${COMPANY} Affiliates`,
        bullets: [
          `We may share your information with ${COMPANY}'s affiliates and related organisations for use consistent with this Privacy Policy`,
        ],
      },
      {
        kind: "sub",
        title: "Business Partners",
        bullets: [
          "Partners who offer a service to you jointly with us — a list is available upon request",
        ],
      },
      {
        kind: "sub",
        title: "Legal, Safety & Compliance",
        bullets: [
          "Government or law enforcement officials for fraud prevention and legal compliance",
          "Where permitted by law in connection with a legal investigation",
          "To protect, investigate, and deter against fraudulent, harmful, or illegal activity",
        ],
      },
      {
        kind: "sub",
        title: "Business Transfers",
        bullets: [
          "In connection with a merger, acquisition, reorganisation, or sale of assets, or in the event of bankruptcy",
        ],
      },
    ],
  },
  {
    id: "data-retention",
    num: "7",
    title: "Data Retention",
    content: [
      {
        kind: "bullets",
        items: [
          "Account data: retained while your account is active",
          "Trip history: up to 5 years (legal and tax compliance)",
          "Location data: limited retention for safety and dispute resolution",
          "Marketing data: until consent is withdrawn",
        ],
      },
    ],
  },
  {
    id: "data-security",
    num: "8",
    title: "Data Security",
    content: [
      { kind: "text", value: "We implement strong security measures including:" },
      {
        kind: "bullets",
        items: [
          "Encryption of sensitive data",
          "Secure servers and cloud infrastructure",
          "Access controls and authentication systems",
          "Regular security audits",
        ],
      },
      {
        kind: "text",
        value:
          "However, no system is 100% secure, and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "your-rights",
    num: "9",
    title: "Your Rights (Rwanda + GDPR)",
    content: [
      {
        kind: "text",
        value:
          "Rwandan Law N°058/2021 of 13/10/2021 relating to the Protection of Personal Data and Privacy gives you the following rights:",
      },
      {
        kind: "bullets",
        items: [
          "Access — Request information about our processing and access your personal information",
          "Correct — Update or correct inaccuracies in your personal information",
          "Delete — Request deletion of your personal information",
          "Transfer — Receive a machine-readable copy of your personal information",
          "Restrict — Restrict the processing of your personal information",
          "Object — Object to our reliance on legitimate interests as the basis of our processing",
        ],
      },
      { kind: "text", value: `To exercise your rights, contact us at: ${CONTACT_EMAIL}` },
    ],
  },
  {
    id: "location-data",
    num: "10",
    title: "Location Data",
    content: [
      { kind: "text", value: "We use GPS location to:" },
      {
        kind: "bullets",
        items: [
          "Match riders with nearby drivers",
          "Track trip progress",
          "Improve safety and navigation",
        ],
      },
      {
        kind: "text",
        value:
          "You can disable location access in your device settings, but core services may not function properly.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    num: "11",
    title: "Children's Privacy",
    content: [
      {
        kind: "text",
        value:
          "The Site is not intended for use by anyone under the age of 18, nor do we knowingly collect or solicit personal information from anyone under the age of 18. If you are under 18, you should not attempt to use the Site or send any information about yourself to us.",
      },
    ],
  },
  {
    id: "international-transfers",
    num: "12",
    title: "International Data Transfers",
    content: [
      {
        kind: "text",
        value:
          "Your data may be stored or processed on servers outside Rwanda. When this occurs, we ensure appropriate safeguards in line with GDPR standards.",
      },
    ],
  },
  {
    id: "third-party-services",
    num: "13",
    title: "Third-Party Services",
    content: [
      { kind: "text", value: "We may use third-party providers for:" },
      {
        kind: "bullets",
        items: ["Payments", "Maps and navigation", "Analytics", "Messaging services", "Hosting services"],
      },
      {
        kind: "text",
        value: "These providers have their own privacy policies, which we encourage you to review.",
      },
    ],
  },
  {
    id: "cookie-policy",
    num: "14",
    title: "Cookie Policy",
    content: [
      {
        kind: "text",
        value:
          "Cookies are small data files placed on your device when you visit a website. We use several different kinds of cookies:",
      },
      {
        kind: "bullets",
        items: [
          "Strictly necessary cookies — required for the Site to function and cannot be switched off",
          "Performance cookies — allow us to count visits and traffic sources to measure and improve performance",
          "Functional cookies — enable enhanced functionality and personalisation",
          "Third-party cookies — from analytics providers (e.g. Google Analytics) for demographic information and usage insights",
        ],
      },
      {
        kind: "text",
        value:
          'We may also use web beacons (sometimes called “tracking pixels” or “clear gifs”) — tiny graphic files that enable us to recognise when someone has visited our Site. If you sign up to receive our emails, we may use cookies in conjunction with those emails.',
      },
      {
        kind: "text",
        value: "Most browsers let you remove or reject cookies. To do this, follow the instructions in your browser settings.",
      },
    ],
  },
  {
    id: "other-information",
    num: "15",
    title: "Other Important Information",
    content: [
      {
        kind: "sub",
        title: "Third-Party Sites and Services",
        bullets: [
          "The Site may contain links to other websites operated by third parties",
          "We are not responsible for their actions or privacy practices",
          "We encourage you to read their privacy policies to learn more",
        ],
      },
      {
        kind: "sub",
        title: "Security",
        bullets: [
          "We take organisational, technical, and physical measures to protect your personal information",
          "Security risk is inherent in all internet and information technologies",
          "We cannot guarantee the absolute security of your personal information",
        ],
      },
    ],
  },
  {
    id: "changes",
    num: "16",
    title: "Changes to This Policy",
    content: [
      {
        kind: "bullets",
        items: [
          "We may update this Privacy Policy from time to time",
          "Users will be notified of significant changes via the app or email",
          "Continued use of the app means acceptance of updates",
        ],
      },
    ],
  },
  {
    id: "contact",
    num: "17",
    title: "Contact Us",
    content: [
      { kind: "text", value: "If you have questions or requests regarding your data:" },
      {
        kind: "bullets",
        items: [
          `Company: ${COMPANY}`,
          `Email: ${CONTACT_EMAIL}`,
          "Location: Kigali, Rwanda",
        ],
      },
    ],
  },
];

// ── Commitments strip ────────────────────────────────────────────────────────

const COMMITMENTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "We never sell your data",
    body: "Your personal information is never sold to advertisers or third parties.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    title: "GDPR & Rwanda Law N°058/2021",
    body: "We comply with both local Rwandan data law and EU GDPR standards.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "You control your data",
    body: "Access, correct, delete, or export your data at any time on request.",
  },
];

// ── Section content renderer ─────────────────────────────────────────────────

function SectionContent({ content }: { content: PolicyItem[] }) {
  return (
    <div className="space-y-5">
      {content.map((item, i) => {
        if (item.kind === "text") {
          return (
            <p key={i} className="text-[15px] leading-[1.8] text-muted-foreground">
              {item.value}
            </p>
          );
        }
        if (item.kind === "bullets") {
          return (
            <ul key={i} className="space-y-2.5">
              {item.items.map((b, bi) => (
                <li key={bi} className="flex gap-3">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-[15px] leading-[1.8] text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (item.kind === "sub") {
          return (
            <div key={i} className="space-y-2.5 rounded-xl border border-border bg-surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/60">
                {item.title}
              </p>
              <ul className="space-y-2">
                {item.bullets.map((b, bi) => (
                  <li key={bi} className="flex gap-3">
                    <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    <span className="text-[14px] leading-[1.75] text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ── Sticky TOC ───────────────────────────────────────────────────────────────

function TableOfContents({ activeId }: { activeId: string | null }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Contents
        </p>
        <nav>
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-primary/8 font-semibold text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.num ? (
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.num}
                      </span>
                    ) : (
                      <span className="h-5 w-5 shrink-0" />
                    )}
                    <span className="truncate leading-tight">{s.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

// ── Active section tracker ───────────────────────────────────────────────────

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  const sectionIds = SECTIONS.map((s) => s.id);
  const activeId = useActiveSection(sectionIds);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setHeroVisible(true); ob.disconnect(); } },
      { threshold: 0.1 },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <main className="flex-1 overflow-x-hidden bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Soft gradient backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        {/* Top sweep line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div
          ref={heroRef}
          className={`relative mx-auto max-w-4xl px-6 py-16 transition-all duration-700 ease-out sm:px-10 sm:py-24 ${
            heroVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-foreground">Privacy Policy</span>
          </nav>

          {/* Badges */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-[11px] font-semibold text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              GDPR Aligned
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Rwanda Law N°058/2021
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
              Effective {EFFECTIVE_DATE}
            </span>
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base font-medium text-muted-foreground">
            {COMPANY}
          </p>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-muted-foreground">
            This policy describes how we collect, use, share, and protect your
            personal data when you use the Rides app, website, and related services.
          </p>
        </div>
      </section>

      {/* ── Commitments strip ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {COMMITMENTS.map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {c.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="mt-1 text-[13px] leading-[1.6] text-muted-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid gap-12 xl:grid-cols-[220px_1fr]">

          {/* TOC sidebar */}
          <TableOfContents activeId={activeId} />

          {/* Sections */}
          <div className="min-w-0 space-y-16">
            {SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-28">
                {/* Section header */}
                <div className="mb-6 flex items-start gap-4">
                  {section.num && (
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {section.num}
                    </span>
                  )}
                  <h2
                    className={`text-balance font-bold tracking-[-0.02em] text-foreground ${
                      section.num
                        ? "text-2xl sm:text-3xl"
                        : "text-xl sm:text-2xl text-muted-foreground"
                    }`}
                  >
                    {section.title}
                  </h2>
                </div>

                <div className={section.num ? "" : "pl-0"}>
                  <SectionContent content={section.content} />
                </div>

                <div className="mt-10 h-px bg-border" />
              </article>
            ))}

            {/* Contact card */}
            <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Questions about your data?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Our data protection team is here to help. Reach us directly for any
                    privacy concerns, data requests, or questions about this policy.
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-foreground active:translate-y-0"
                  >
                    {CONTACT_EMAIL}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <p className="pb-4 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} {COMPANY} · Kigali, Rwanda
              <span className="mx-2">·</span>
              Last updated {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
