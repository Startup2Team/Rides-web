import Link from "next/link";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Fleet", href: "/#fleet" },
      { label: "Safety", href: "/#safety" },
      { label: "Get the app", href: "/#get-app" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Drive with us", href: "/drivers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="rides" style={{ borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
      <div className="rides-container py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center">
              <img src="/ridelogo.png" alt="Rides" className="h-9 w-9 shrink-0 object-contain" />
              <span className="text-xl font-black tracking-[-0.04em] text-foreground">
                id<span className="text-emerald-500">es</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              Move the way Rwanda moves — one app for every kind of journey.
            </p>
            <p className="mt-2 text-xs italic text-muted-foreground/60">
              &ldquo;Driven by People, Powered by Choice.&rdquo;
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

          {/* link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="rides-label" style={{ fontSize: "0.66rem" }}>{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm transition-colors" style={{ color: "var(--muted)" }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-4 border-t pt-7 sm:flex-row sm:items-center" style={{ borderColor: "var(--line)" }}>
          <p className="rides-label" style={{ fontSize: "0.66rem" }}>© {year} Rides · Kigali, Rwanda</p>
          <p className="rides-label" style={{ fontSize: "0.66rem" }}>Driven by people, powered by choice</p>
        </div>
      </div>
    </footer>
  );
}

