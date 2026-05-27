import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export default function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminTopbar />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
