import { AdminPageHeader } from "../_components";
import { CampaignsConsole } from "./campaigns-console";

export const metadata = {
  title: "Admin · Campaigns",
  robots: { index: false, follow: false },
};

export default function AdminCampaignsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Monetization"
        title="Campaign management"
        subtitle="Run targeted promotions: World-Cup pushes, weekend boosts, first-purchase discounts, vehicle-specific deals. Campaigns only affect future purchases."
      />
      <CampaignsConsole />
    </div>
  );
}
