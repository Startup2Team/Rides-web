import { AdminPageHeader } from "../_components";
import { SafetyStatsCards } from "./safety-stats";
import { IncidentsConsole } from "./incidents-console";

export const metadata = {
  title: "Admin · Safety Center",
  robots: { index: false, follow: false },
};

export default function AdminSafetyCenterPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Safety Center"
        subtitle="Monitor SOS alerts, incidents, and trust signals — respond before issues escalate."
      />
      <SafetyStatsCards />
      <IncidentsConsole />
    </div>
  );
}
