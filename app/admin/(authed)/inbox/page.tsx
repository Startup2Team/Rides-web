import { AdminPageHeader } from "../_components";
import { InboxConsole } from "./inbox-console";

export const metadata = {
  title: "Admin · Inbox",
  robots: { index: false, follow: false },
};

export default function AdminInboxPage() {
  return (
    <div className="space-y-4 flex flex-col h-full flex-1 overflow-hidden">
      <AdminPageHeader
        eyebrow=""
        title="Inbox"
        subtitle="Listen to our community, connect with care, and support our users on their journey."
      />
      <div className="flex-1 min-h-0">
        <InboxConsole />
      </div>
    </div>
  );
}
