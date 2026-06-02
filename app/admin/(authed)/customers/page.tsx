import { AdminPageHeader } from "../_components";
import { CustomerStats } from "./customer-stats";
import { CustomersTable } from "./customers-table";

export const metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Customer accounts"
        subtitle="Search, segment, and manage riders across the platform."
      />

      <CustomerStats />

      <CustomersTable />
    </div>
  );
}
