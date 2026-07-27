import { AdminPageHeader } from "../_components";
import { HeatmapStatsCards } from "./heatmap-stats";
import { HeatmapsConsole } from "./heatmaps-console";

export const metadata = {
  title: "Admin · Heatmaps",
  robots: { index: false, follow: false },
};

export default function AdminHeatmapsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Demand heatmaps"
        subtitle="Where riders are waiting right now in Kigali — grouped by pickup. Hotter zones mean more customers at the same place."
      />

      <HeatmapStatsCards />

      <HeatmapsConsole />
    </div>
  );
}
