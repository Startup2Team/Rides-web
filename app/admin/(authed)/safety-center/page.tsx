import { AdminPageHeader, StatCard } from "../_components";
import { IncidentsConsole } from "./incidents-console";

export const metadata = {
  title: "Admin · Safety Center",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Open Incidents", value: "4", hint: "needs response", tone: "alert" as const },
  { label: "SOS Today", value: "2", hint: "alerts triggered", tone: "alert" as const },
  { label: "Resolved (7d)", value: "27", hint: "fully closed" },
  { label: "Avg Response", value: "4m 12s", hint: "to acknowledgement" },
];

export default function AdminSafetyCenterPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Safety Center"
        subtitle="Monitor SOS alerts, incidents, and trust signals — respond before issues escalate."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <IncidentsConsole />
    </div>
  );
}
