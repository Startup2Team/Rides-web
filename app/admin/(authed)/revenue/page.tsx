import { AdminPageHeader } from "../_components";
import { RevenueConsole } from "./revenue-console";

export const metadata = {
  title: "Admin · Revenue",
  robots: { index: false, follow: false },
};

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Revenue & financials"
        subtitle="Track platform earnings, commission take, and driver payout flow."
      />

      <RevenueConsole />
    </div>
  );
}
