"use client";

import { useAuth } from "@/context/auth-context";
import { SuperAdminDashboard } from "./dashboards/super-admin-dashboard";
import { AnalyticsDashboard } from "./dashboards/analytics-dashboard";

/**
 * Picks the home dashboard by role. More role-specific homes are added here one by one.
 */
export function DashboardHome() {
  const { roleName, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  switch (roleName) {
    case "Analytics Staff":
      return <AnalyticsDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
}
