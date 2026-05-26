import {
  AdminPageHeader,
  Card,
  StatCard,
  StatusPill,
} from "../_components";

export const metadata = {
  title: "Admin · Negotiations",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Today", value: "312", hint: "+22% vs yesterday" },
  { label: "Agreed", value: "247", hint: "79% success" },
  { label: "Failed", value: "65", hint: "21% failed" },
  { label: "Avg Rounds", value: "3.4", hint: "per negotiation" },
];

const negotiations = [
  {
    id: "#NEG-1247",
    customer: "Alice M.",
    driver: "Aiden M.",
    initial: "3,000 RWF",
    final: "3,800 RWF",
    rounds: 4,
    status: "Agreed",
    tone: "success",
    time: "2m ago",
  },
  {
    id: "#NEG-1246",
    customer: "Boris H.",
    driver: "Beni K.",
    initial: "2,500 RWF",
    final: "—",
    rounds: 5,
    status: "Failed",
    tone: "danger",
    time: "8m ago",
  },
  {
    id: "#NEG-1245",
    customer: "Christine N.",
    driver: "Claude R.",
    initial: "5,000 RWF",
    final: "5,500 RWF",
    rounds: 2,
    status: "Agreed",
    tone: "success",
    time: "14m ago",
  },
  {
    id: "#NEG-1244",
    customer: "Daniel I.",
    driver: "Diane U.",
    initial: "1,800 RWF",
    final: "2,200 RWF",
    rounds: 3,
    status: "Agreed",
    tone: "success",
    time: "22m ago",
  },
  {
    id: "#NEG-1243",
    customer: "Elise T.",
    driver: "—",
    initial: "4,000 RWF",
    final: "—",
    rounds: 1,
    status: "In progress",
    tone: "warn",
    time: "31m ago",
  },
] as const;

export default function AdminNegotiationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Fare negotiations"
        subtitle="Audit and analyze fare negotiations across the platform."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Outcome split">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 40 40" aria-hidden className="h-20 w-20 shrink-0">
                <circle cx="20" cy="20" r="14" fill="none" strokeWidth="5" className="stroke-muted" />
                <circle cx="20" cy="20" r="14" fill="none" strokeWidth="5" strokeDasharray="69 100" className="stroke-primary" transform="rotate(-90 20 20)" strokeLinecap="round" />
                <circle cx="20" cy="20" r="14" fill="none" strokeWidth="5" strokeDasharray="18 100" strokeDashoffset="-69" className="stroke-red-400" transform="rotate(-90 20 20)" strokeLinecap="round" />
              </svg>
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Agreed
                  </span>
                  <span className="font-bold text-foreground">79%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Failed
                  </span>
                  <span className="font-bold text-foreground">21%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Avg fare difference">
          <div className="p-4">
            <p className="text-2xl font-bold tracking-tight text-foreground">+18%</p>
            <p className="text-[11px] text-muted-foreground">vs initial offer</p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-primary" style={{ width: "62%" }} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Customers settle on average 18% above their first offer.
            </p>
          </div>
        </Card>

        <Card title="Most negotiated routes">
          <ul className="divide-y divide-border text-xs">
            {[
              { route: "Kimironko → Heights", count: 42 },
              { route: "Kacyiru → Nyabugogo", count: 31 },
              { route: "Remera → Kabuga", count: 27 },
            ].map((r) => (
              <li key={r.route} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-foreground">{r.route}</span>
                <span className="font-bold text-foreground">{r.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Recent negotiations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-semibold">ID</th>
                <th className="px-4 py-2.5 text-left font-semibold">Customer</th>
                <th className="px-4 py-2.5 text-left font-semibold">Driver</th>
                <th className="px-4 py-2.5 text-right font-semibold">Initial</th>
                <th className="px-4 py-2.5 text-right font-semibold">Final</th>
                <th className="px-4 py-2.5 text-right font-semibold">Rounds</th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {negotiations.map((n) => (
                <tr key={n.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {n.id}
                  </td>
                  <td className="px-4 py-3 text-foreground">{n.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{n.driver}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {n.initial}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {n.final}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {n.rounds}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={n.status} tone={n.tone} />
                  </td>
                  <td className="px-4 py-3 text-right text-[11px] text-muted-foreground">
                    {n.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
