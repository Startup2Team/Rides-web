import { AdminPageHeader } from "../_components";
import { EntitlementsConsole } from "./entitlements-console";

export const metadata = {
  title: "Admin · Entitlements",
  robots: { index: false, follow: false },
};

export default function AdminEntitlementsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Monetization"
        title="Entitlement support tools"
        subtitle="Search drivers by phone or plate, inspect ride balances per vehicle, and grant or revoke rides with an audited reason. Every adjustment writes an audit log entry."
      />
      <EntitlementsConsole />
    </div>
  );
}
