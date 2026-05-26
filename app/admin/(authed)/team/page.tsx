import {
  AdminPageHeader,
  Avatar,
  Card,
  StatCard,
  StatusPill,
} from "../_components";

export const metadata = {
  title: "Admin · Admins & Roles",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Admins", value: "8", hint: "across all roles" },
  { label: "Active Now", value: "5", hint: "online in the last 5m" },
  { label: "Roles Defined", value: "5", hint: "Super Admin → Analytics" },
  { label: "Pending Invites", value: "1", hint: "awaiting acceptance" },
];

const admins = [
  {
    name: "Aiden Mugisha",
    email: "aiden@taravelis.com",
    role: "Super Admin",
    lastActive: "Just now",
    status: "Active",
    tone: "success" as const,
  },
  {
    name: "Beatrice Iradukunda",
    email: "beatrice@taravelis.com",
    role: "Operations Manager",
    lastActive: "12m ago",
    status: "Active",
    tone: "success" as const,
  },
  {
    name: "Cyril Habineza",
    email: "cyril@taravelis.com",
    role: "Finance Manager",
    lastActive: "1h ago",
    status: "Active",
    tone: "success" as const,
  },
  {
    name: "Diana Ntirenganya",
    email: "diana@taravelis.com",
    role: "Support Staff",
    lastActive: "3h ago",
    status: "Active",
    tone: "success" as const,
  },
  {
    name: "Eric Bizimana",
    email: "eric@taravelis.com",
    role: "Analytics Staff",
    lastActive: "Yesterday",
    status: "Active",
    tone: "success" as const,
  },
  {
    name: "Florence Mukasine",
    email: "florence@taravelis.com",
    role: "Support Staff",
    lastActive: "Pending",
    status: "Invited",
    tone: "warn" as const,
  },
];

const roles = [
  {
    name: "Super Admin",
    description: "Full access — operations, finance, settings, admins.",
    count: 1,
  },
  {
    name: "Operations Manager",
    description: "Rides, drivers, heatmaps, safety, support.",
    count: 2,
  },
  {
    name: "Finance Manager",
    description: "Revenue, commission, payouts, reports.",
    count: 1,
  },
  {
    name: "Support Staff",
    description: "Tickets, complaints, customer-driver disputes.",
    count: 3,
  },
  {
    name: "Analytics Staff",
    description: "Analytics, reports, exports (read-only).",
    count: 1,
  },
];

export default function AdminTeamPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Admins & roles"
        subtitle="Manage administrator access and role-based permissions."
        action={
          <button className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30">
            + Invite admin
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Admin team">
            <ul className="divide-y divide-border">
              {admins.map((a) => (
                <li
                  key={a.email}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface/50"
                >
                  <Avatar name={a.name} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight text-foreground">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {a.email}
                    </div>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {a.role}
                  </span>
                  <StatusPill status={a.status} tone={a.tone} />
                  <span className="hidden w-20 shrink-0 text-right text-[11px] text-muted-foreground md:inline">
                    {a.lastActive}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Roles">
          <ul className="divide-y divide-border">
            {roles.map((r) => (
              <li key={r.name} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-tight text-foreground">
                    {r.name}
                  </span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {r.count}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {r.description}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
