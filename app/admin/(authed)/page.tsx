import { DashboardHome } from "./dashboard-home";

export const metadata = {
  title: "Admin · Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <DashboardHome />;
}
