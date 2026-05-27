import { AdminPageHeader, StatCard } from "../_components";
import { TeamConsole } from "./team-console";

export const metadata = {
  title: "Admin · Admins & Roles",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Admins", value: "6", hint: "across 5 roles" },
  { label: "Active Now", value: "4", hint: "online in last 5m" },
  { label: "Roles Defined", value: "5", hint: "Super Admin → Analytics" },
  { label: "Pending Invites", value: "1", hint: "awaiting acceptance" },
];

export default function AdminTeamPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Admins & roles"
        subtitle="Invite admins, assign roles, and control which sidebar pages each role can access."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <TeamConsole />
    </div>
  );
}
