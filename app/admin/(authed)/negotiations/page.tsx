import { Suspense } from "react";
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
        subtitle="Clean agreed prices between riders and drivers — rider offer, final fare, and who was involved."
      />

      <NegotiationsStatsCards />

      <Suspense fallback={null}>
        <NegotiationsConsole />
      </Suspense>
    </div>
  );
}
