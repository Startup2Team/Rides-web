import { AdminPageHeader } from "../_components";
import { AnalyticsConsole } from "./analytics-console";

export const metadata = {
  title: "Admin · Analytics",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Platform analytics"
        subtitle="Operational health and behavior trends across riders, drivers, and trips."
      />

      <AnalyticsConsole />
    </div>
  );
}
