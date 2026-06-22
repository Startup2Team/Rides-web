import { AdminPageHeader } from "../_components";
import { AuditLogsConsole } from "./audit-logs-console";

export const metadata = {
  title: "Admin · Audit Logs",
  robots: { index: false, follow: false },
};

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Monetization"
        title="Audit logs"
        subtitle="Every package change, campaign change, entitlement adjustment, and purchase reconciliation. Read-only. Filter by actor, action, or time."
      />
      <AuditLogsConsole />
    </div>
  );
}
