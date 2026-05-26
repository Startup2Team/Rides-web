import { AdminPageHeader, Card, StatCard, StatusPill } from "../_components";

export const metadata = {
  title: "Admin · Safety Center",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Open Incidents", value: "4", hint: "across the network", tone: "alert" as const },
  { label: "SOS Today", value: "2", hint: "alerts triggered", tone: "alert" as const },
  { label: "Resolved (7d)", value: "27", hint: "fully closed" },
  { label: "Suspended Accounts", value: "3", hint: "under review" },
];

const incidents = [
  {
    time: "3m ago",
    type: "SOS Alert",
    description: "Ride #RID-4821 · Aiden M. · Kimironko area",
    severity: "Critical",
    tone: "danger" as const,
  },
  {
    time: "14m ago",
    type: "Driver complaint",
    description: "Rider reported unsafe driving · Trip #RID-4815",
    severity: "High",
    tone: "warn" as const,
  },
  {
    time: "32m ago",
    type: "Fraud signal",
    description: "Unusual cancellation pattern · 3 accounts",
    severity: "Medium",
    tone: "warn" as const,
  },
  {
    time: "1h ago",
    type: "Fake GPS",
    description: "Driver Eric N. flagged for GPS spoofing",
    severity: "High",
    tone: "warn" as const,
  },
  {
    time: "3h ago",
    type: "Lost item",
    description: "Rider Boris H. — phone left in vehicle",
    severity: "Low",
    tone: "neutral" as const,
  },
];

export default function AdminSafetyCenterPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Safety Center"
        subtitle="Monitor incidents, SOS alerts, and trust signals across the platform."
        action={
          <button className="inline-flex h-10 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700">
            View SOS history
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="Active incidents"
        action={
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">
            {incidents.length} open
          </span>
        }
      >
        <ul className="divide-y divide-border">
          {incidents.map((i, idx) => (
            <li key={idx} className="flex items-start gap-3 px-4 py-3">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  i.tone === "danger"
                    ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200"
                    : i.tone === "warn"
                    ? "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200"
                    : "bg-muted text-muted-foreground"
                }`}
              >
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
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {i.type}
                  </span>
                  <StatusPill status={i.severity} tone={i.tone} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {i.description}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {i.time}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-surface">
                  View
                </button>
                <button className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-red-700">
                  Escalate
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
