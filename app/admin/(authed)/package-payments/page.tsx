import { AdminPageHeader } from "../_components";
import { PackagePaymentsConsole } from "./package-payments-console";

export const metadata = {
  title: "Admin · Package Payments",
  robots: { index: false, follow: false },
};

export default function AdminPackagePaymentsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Monetization"
        title="Package payments"
        subtitle="Review driver manual payment claims. Confirm the proof of payment, then approve to grant ride credits — or reject with a reason the driver sees before resubmitting."
      />
      <PackagePaymentsConsole />
    </div>
  );
}
