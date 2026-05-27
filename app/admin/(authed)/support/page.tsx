import { AdminPageHeader, StatCard } from "../_components";
import { SupportConsole } from "./support-console";

export const metadata = {
  title: "Admin · Support",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Open Tickets", value: "18", hint: "awaiting response" },
  { label: "Resolved Today", value: "42", hint: "+8 from yesterday" },
  { label: "Avg Response", value: "1h 12m", hint: "first reply" },
  { label: "Customer CSAT", value: "92%", hint: "this week" },
];

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Trust"
        title="Customer support"
        subtitle="Handle support tickets from riders and drivers — reply, assign, and resolve."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <SupportConsole />
    </div>
  );
}
