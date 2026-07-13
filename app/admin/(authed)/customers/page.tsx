import { CustomersTable } from "./customers-table";

export const metadata = {
  title: "Admin · Customers",
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return <CustomersTable />;
}
