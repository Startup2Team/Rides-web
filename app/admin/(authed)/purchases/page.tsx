import { AdminPageHeader } from "../_components";
import { PurchasesConsole } from "./purchases-console";

export const metadata = {
  title: "Admin · Purchases",
  robots: { index: false, follow: false },
};

export default function AdminPurchasesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Monetization"
        title="Purchase monitoring"
        subtitle="Every package purchase across the platform — paid, pending, failed. Each row is an immutable snapshot of the offer at the moment of payment."
      />
      <PurchasesConsole />
    </div>
  );
}
