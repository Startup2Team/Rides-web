import { AdminPageHeader } from "../_components";
import { SupportConsole } from "./support-console";

export const metadata = {
  title: "Admin · Support",
  robots: { index: false, follow: false },
};

export default function AdminSupportPage() {
  return (
    <div className="space-y-4 flex flex-col h-full flex-1 overflow-hidden">
      <AdminPageHeader
        eyebrow=""
        title="Support"
        subtitle="Listen to our community, resolve issues, and build trust."
      />
      <div className="flex-1 min-h-0">
        <SupportConsole />
      </div>
    </div>
  );
}
