import { AdminPageHeader, StatCard } from "../_components";
import { ReportsConsole } from "./reports-console";

export const metadata = {
  title: "Admin · Reports",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Generated This Month", value: "284", hint: "+18 vs last month" },
  { label: "Scheduled", value: "4", hint: "running automatically" },
  { label: "Exported (7d)", value: "47", hint: "PDF · CSV · Excel" },
  { label: "Avg Generation Time", value: "8s", hint: "across templates" },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Reports & exports"
        subtitle="Generate, schedule, and download operational reports across every part of the platform."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <ReportsConsole />
    </div>
  );
}
