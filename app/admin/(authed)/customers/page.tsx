import {
  AdminPageHeader,
  Avatar,
  Card,
  StatCard,
  StatusPill,
} from "../_components";

export const metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Customers", value: "8,412", hint: "+128 this week" },
  { label: "Active Today", value: "1,247", hint: "took at least one trip" },
  { label: "New Signups", value: "37", hint: "in last 24h" },
  { label: "Avg Trips / User", value: "4.2", hint: "per month" },
];

const customers = [
  {
    name: "Alice Mukamana",
    email: "alice.m@taravelis.io",
    joined: "Jan 2026",
    trips: 24,
    spend: "82,500 RWF",
    status: "Active",
    tone: "success",
  },
  {
    name: "Boris Habineza",
    email: "boris.h@taravelis.io",
    joined: "Mar 2026",
    trips: 8,
    spend: "31,200 RWF",
    status: "Active",
    tone: "success",
  },
  {
    name: "Christine N.",
    email: "christine.n@taravelis.io",
    joined: "Feb 2026",
    trips: 42,
    spend: "147,800 RWF",
    status: "VIP",
    tone: "info",
  },
  {
    name: "Daniel Iradukunda",
    email: "daniel.i@taravelis.io",
    joined: "Apr 2026",
    trips: 3,
    spend: "12,400 RWF",
    status: "Active",
    tone: "success",
  },
  {
    name: "Elise Twagiramungu",
    email: "elise.t@taravelis.io",
    joined: "Dec 2025",
    trips: 0,
    spend: "0 RWF",
    status: "Dormant",
    tone: "neutral",
  },
  {
    name: "Fabrice Bizimana",
    email: "fabrice.b@taravelis.io",
    joined: "May 2026",
    trips: 1,
    spend: "3,800 RWF",
    status: "Flagged",
    tone: "warn",
  },
] as const;

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Customer accounts"
        subtitle="Search, segment, and manage riders across the platform."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="Customer directory"
        action={
          <input
            type="search"
            placeholder="Search customers…"
            className="h-8 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-semibold">Customer</th>
                <th className="px-4 py-2.5 text-left font-semibold">Joined</th>
                <th className="px-4 py-2.5 text-right font-semibold">Trips</th>
                <th className="px-4 py-2.5 text-right font-semibold">
                  Total spend
                </th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} tone="neutral" />
                      <div className="min-w-0">
                        <div className="font-semibold tracking-tight text-foreground">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.joined}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {c.trips}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {c.spend}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status} tone={c.tone} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-primary hover:underline">
                      View
                    </button>
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
