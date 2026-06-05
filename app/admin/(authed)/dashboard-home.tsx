"use client";

import { useAuth } from "@/context/auth-context";
import { SuperAdminDashboard } from "./dashboards/super-admin-dashboard";
import { AnalyticsDashboard } from "./dashboards/analytics-dashboard";
import { FinanceDashboard } from "./dashboards/finance-dashboard";
import { OperationsDashboard } from "./dashboards/operations-dashboard";
import { SupportDashboard } from "./dashboards/support-dashboard";

/**
 * Picks the home dashboard by role.
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
    case "Finance Manager":
      return <FinanceDashboard />;
    case "Operations Manager":
      return <OperationsDashboard />;
    case "Support Staff":
      return <SupportDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
}
