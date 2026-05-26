import {
  AdminPageHeader,
  Avatar,
  Card,
  StatCard,
  StatusPill,
} from "../_components";

export const metadata = {
  title: "Admin · Support",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Open Tickets", value: "18", hint: "awaiting response" },
  { label: "Resolved Today", value: "42", hint: "+8 from yesterday" },
  { label: "Avg Response", value: "1h 12m", hint: "first reply" },
  { label: "Customer CSAT", value: "92%", hint: "this week" },
];

const tickets = [
  {
    id: "#TKT-2841",
    subject: "Driver took wrong route to destination",
    from: "Alice M.",
    type: "Ride dispute",
    priority: "High",
    tone: "warn" as const,
    time: "8m",
  },
  {
    id: "#TKT-2840",
    subject: "Refund request — overcharged on negotiation",
    from: "Boris H.",
    type: "Refund",
    priority: "Medium",
    tone: "info" as const,
    time: "22m",
  },
  {
    id: "#TKT-2839",
    subject: "Phone left in vehicle (Toyota Hilux RAC-552)",
    from: "Christine N.",
    type: "Lost item",
    priority: "Low",
    tone: "neutral" as const,
    time: "1h",
  },
  {
    id: "#TKT-2838",
    subject: "Driver verification documents stuck in review",
    from: "Daniel I. (driver)",
    type: "Driver",
    priority: "Medium",
    tone: "info" as const,
    time: "2h",
  },
  {
    id: "#TKT-2837",
    subject: "MoMo payment failed but charged",
    from: "Elise T.",
    type: "Payment",
    priority: "High",
    tone: "warn" as const,
    time: "3h",
  },
];

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Customer support"
        subtitle="Handle support tickets from riders and drivers."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="Recent tickets"
        action={
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
              Open
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              Pending
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              Resolved
            </span>
          </div>
        }
      >
        <ul className="divide-y divide-border">
          {tickets.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-surface/50"
            >
              <Avatar name={t.from} tone="neutral" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    {t.id}
                  </span>
                  <StatusPill status={t.priority} tone={t.tone} />
                  <span className="text-[10px] text-muted-foreground">
                    · {t.type}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                  {t.subject}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  From {t.from}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {t.time} ago
                </span>
                <button className="rounded-lg bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                  Open
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
