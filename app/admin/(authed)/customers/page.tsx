import { AdminPageHeader, StatCard } from "../_components";
import { CustomersTable } from "./customers-table";

export const metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Customers", value: "8,412", hint: "+128 this week" },
  { label: "Active This Week", value: "3,184", hint: "took ≥ 1 trip" },
  { label: "VIP Members", value: "342", hint: "4% of base" },
  { label: "Flagged Accounts", value: "18", hint: "needs review" },
];

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Customer accounts"
        subtitle="Search, segment, and manage riders across the platform."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <CustomersTable />
    </div>
  );
}
