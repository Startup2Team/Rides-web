import { AdminPageHeader } from "../_components";
import { ReportsStatsCards } from "./reports-stats";
import { ReportsConsole } from "./reports-console";

export const metadata = {
  title: "Admin · Reports",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Reports & exports"
        subtitle="Generate, schedule, and download operational reports across every part of the platform."
      />

      <ReportsStatsCards />

      <ReportsConsole />
    </div>
  );
}
