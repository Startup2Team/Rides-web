import { Suspense } from "react";
import { AuthProvider } from "@/context/auth-context";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

export default function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-background">
        <Suspense fallback={<div className="w-64 shrink-0 bg-card border-r border-border" />}>
          <AdminSidebar />
        </Suspense>

        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <AdminTopbar />
          <main className="flex-1 p-6 lg:p-10">
            <Suspense>{children}</Suspense>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
