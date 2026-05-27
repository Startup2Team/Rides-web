import { AdminPageHeader, StatCard } from "../_components";
import { HeatmapsConsole } from "./heatmaps-console";

export const metadata = {
  title: "Admin · Heatmaps",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Active Hot Zones", value: "3", hint: "above 80% demand" },
  { label: "Peak Hour", value: "18:00", hint: "city-wide" },
  { label: "Demand Index", value: "78/100", hint: "currently elevated" },
  { label: "Underserved Areas", value: "2", hint: "supply gap > 30 pts" },
];

export default function AdminHeatmapsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Demand heatmaps"
        subtitle="Visualize where demand is hot, where supply runs short, and act before the gap widens."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <HeatmapsConsole />
    </div>
  );
}
