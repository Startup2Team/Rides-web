import { AdminPageHeader } from "../_components";
import { SupportStatsCards } from "./support-stats";
import { SupportConsole } from "./support-console";

export const metadata = {
  title: "Admin · Support",
  robots: { index: false, follow: false },
};

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Customer support"
        subtitle="Handle support tickets from riders and drivers — reply, assign, and resolve."
      />
      <SupportStatsCards />
      <SupportConsole />
    </div>
  );
}
