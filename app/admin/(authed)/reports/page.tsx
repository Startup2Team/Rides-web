import AdminReportsPageClient from "./reports-page-client";

export const metadata = {
  title: "Admin · Reports",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return <AdminReportsPageClient />;
}
