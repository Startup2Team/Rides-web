import { AdminPageHeader } from "../_components";
import { SettingsConsole } from "./settings-console";

export const metadata = {
  title: "Admin · Settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Platform settings"
        subtitle="Configure commission, negotiation rules, fares, regions, and integrations."
      />

      <SettingsConsole />
    </div>
  );
}
