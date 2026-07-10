import { AdminPageHeader } from "../_components";
import { NegotiationsStatsCards } from "./negotiations-stats";
import { NegotiationsConsole } from "./negotiations-console";

export const metadata = {
  title: "Admin · Negotiations",
  robots: { index: false, follow: false },
};

export default function AdminNegotiationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Fare negotiations"
        subtitle="Audit every offer, counter-offer, and outcome across the platform."
      />

      <NegotiationsStatsCards />

      <NegotiationsConsole />
    </div>
  );
}
