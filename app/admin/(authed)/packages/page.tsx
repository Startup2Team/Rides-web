import { AdminPageHeader } from "../_components";
import { PackagesConsole } from "./packages-console";

export const metadata = {
  title: "Admin · Ride Packages",
  robots: { index: false, follow: false },
};

export default function AdminPackagesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Ride credit packages"
        subtitle="Manage the prepaid ride credit packages available for drivers to purchase, including pricing, validity, and promotional offers."
      />
      <PackagesConsole />
    </div>
  );
}
