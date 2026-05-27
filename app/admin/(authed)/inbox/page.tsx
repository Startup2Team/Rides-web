import { AdminPageHeader, StatCard } from "../_components";
import { InboxConsole } from "./inbox-console";

export const metadata = {
  title: "Admin · Inbox",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "New Messages", value: "3", hint: "awaiting reply" },
  { label: "Replied (7d)", value: "24", hint: "+6 vs last week" },
  { label: "Avg Reply Time", value: "2h 18m", hint: "first response" },
  { label: "Spam Filtered", value: "12", hint: "auto-detected" },
];

export default function AdminInboxPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Contact inbox"
        subtitle="Messages from the public contact form — partnerships, driver applications, press, and general inquiries."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <InboxConsole />
    </div>
  );
}
