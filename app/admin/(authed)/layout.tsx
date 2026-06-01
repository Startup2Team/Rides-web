import { Suspense } from "react";
import { AuthProvider } from "@/context/auth-context";
import { AdminShell } from "./admin-shell";

export default function AdminAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-background" />
        }
      >
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AuthProvider>
  );
}
