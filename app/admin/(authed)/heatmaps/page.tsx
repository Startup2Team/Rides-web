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
        subtitle="Visualize where demand is hot, where supply runs short, and act before the gap widens."
      />

      <HeatmapStatsCards />

      <HeatmapsConsole />
    </div>
  );
}
