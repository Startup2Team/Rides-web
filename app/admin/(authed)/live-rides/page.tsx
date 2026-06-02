import { AdminPageHeader } from "../_components";
import { LiveRidesStatsCards } from "./live-rides-stats";
import { LiveRidesConsole } from "./live-rides-console";

export const metadata = {
  title: "Admin · Live Rides",
  robots: { index: false, follow: false },
};

export default function AdminLiveRidesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Live rides"
        subtitle="Real-time view of every in-progress trip across the network."
      />

      <LiveRidesStatsCards />

      <LiveRidesConsole />
    </div>
  );
}
