import { AdminPageHeader } from "../_components";
import { AuditConsole } from "./audit-console";

export const metadata = {
  title: "Admin · Audit Log",
  robots: { index: false, follow: false },
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Admin Audit Log"
        subtitle="Immutable audit trail of all administrative actions, settings changes, and account assists."
      />
      <AuditConsole />
    </div>
  );
}
