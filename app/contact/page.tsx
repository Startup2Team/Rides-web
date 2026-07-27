import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { ContactHeading } from "./contact-heading";

export const metadata: Metadata = {
  title: "Contact Rides",
  description:
    "Get in touch with the Rides team — riders, drivers, partners, and press.",
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function InfoRow({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-foreground/80 ring-1 ring-inset ring-foreground/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sub ? (
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-12 sm:gap-12 sm:px-6 sm:py-16 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2 lg:gap-20 lg:py-24">
        {/* ── Left: heading + contact info ── */}
        <div className="relative">
          <ContactHeading />

          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-5">
            <InfoRow icon={<PhoneIcon />} label="+250 789 534 491" />
            <InfoRow icon={<PinIcon />} label="Kimironko, Kigali" />
          </div>
        </div>

        {/* ── Right: minimal form ── */}
        <div className="relative">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
