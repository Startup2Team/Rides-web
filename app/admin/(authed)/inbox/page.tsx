import { AdminPageHeader } from "../_components";
import { InboxStatsCards } from "./inbox-stats";
import { InboxConsole } from "./inbox-console";

export const metadata = {
  title: "Admin · Inbox",
  robots: { index: false, follow: false },
};

export default function AdminInboxPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Contact inbox"
        subtitle="Messages from the public contact form — partnerships, driver applications, press, and general inquiries."
      />
      <InboxStatsCards />
      <InboxConsole />
    </div>
  );
}
