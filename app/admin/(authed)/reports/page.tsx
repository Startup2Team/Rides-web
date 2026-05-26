import { AdminPageHeader, Card, StatCard } from "../_components";

export const metadata = {
  title: "Admin · Reports",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Generated This Month", value: "284", hint: "+18 vs last month" },
  { label: "Scheduled", value: "12", hint: "running automatically" },
  { label: "Exported (7d)", value: "47", hint: "CSV · Excel · PDF" },
  { label: "Total Storage", value: "1.2 GB", hint: "of report archives" },
];

const recentReports = [
  {
    name: "Daily Operations Report",
    date: "26 May 2026",
    format: "PDF",
    size: "1.4 MB",
  },
  {
    name: "Driver Performance — Q2 Week 22",
    date: "25 May 2026",
    format: "Excel",
    size: "880 KB",
  },
  {
    name: "Revenue Breakdown — May",
    date: "24 May 2026",
    format: "PDF",
    size: "2.1 MB",
  },
  {
    name: "Negotiation Statistics — May",
    date: "24 May 2026",
    format: "CSV",
    size: "420 KB",
  },
  {
    name: "Ride Completion Rate — Q2",
    date: "20 May 2026",
    format: "PDF",
    size: "1.7 MB",
  },
];

const templates = [
  {
    name: "Daily Report",
    description: "Operations snapshot — rides, revenue, drivers.",
    frequency: "Daily · 23:59",
  },
  {
    name: "Driver Performance Report",
    description: "Acceptance, completion, rating per driver.",
    frequency: "Weekly · Monday",
  },
  {
    name: "Revenue Report",
    description: "Earnings, commission, payouts by category.",
    frequency: "Monthly · 1st",
  },
  {
    name: "Negotiation Statistics",
    description: "Round counts, outcomes, fare differentials.",
    frequency: "Weekly · Sunday",
  },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Reports & exports"
        subtitle="Generate, schedule, and download operational reports."
        action={
          <button className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30">
            + New report
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Report templates">
          <ul className="divide-y divide-border">
            {templates.map((t) => (
              <li key={t.name} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-inset ring-primary/20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold tracking-tight text-foreground">
                    {t.name}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {t.frequency}
                  </p>
                </div>
                <button className="shrink-0 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-surface">
                  Generate
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Recent reports">
          <ul className="divide-y divide-border">
            {recentReports.map((r) => (
              <li
                key={r.name}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <span className="text-[9px] font-bold">{r.format}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {r.name}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {r.date} · {r.size}
                  </p>
                </div>
                <button className="shrink-0 text-xs font-medium text-primary hover:underline">
                  Download
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
