"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { DemandAlertToast } from "./demand-alert-toast";
import { RoleGuard } from "./role-guard";
import { useAuth } from "@/context/auth-context";
import { useSessionRenewal } from "@/lib/use-session-renewal";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { ready, user } = useAuth();

  // Keep an active admin signed in — the backend session is an idle timeout, and
  // without renewal a 15-minute token used to boot admins out mid-task.
  useSessionRenewal(ready && Boolean(user));

  // Close drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll + Esc to close while drawer is open on mobile.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AdminTopbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          <RoleGuard>{children}</RoleGuard>
        </main>
        <DemandAlertToast />
      </div>
    </div>
  );
}
