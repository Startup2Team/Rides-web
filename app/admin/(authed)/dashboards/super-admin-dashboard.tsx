"use client";

import { DateSubtitle, Greeting } from "../_greeting";
import { PeriodFilter } from "../_period-filter";
import { DashboardKpis } from "../dashboard-kpis";
import { RevenueWidget } from "../revenue-widget";
import { RideTrendWidget, DriverStatusWidget, TopDriversWidget } from "../dashboard-side-widgets";
import { ActivityFeed, AlertsPanel } from "../dashboard-feed-widgets";
import { LiveMapWidget } from "../live-map-widget";
import { RecentMessagesWidget } from "../recent-messages-widget";
import { MonetizationGrid } from "../monetization-widgets";

import { useAuth } from "@/context/auth-context";
import { hasPermission } from "@/lib/admin-permissions";

/** Dynamic operations dashboard (Super Admin and any backend-created custom roles). */
export function SuperAdminDashboard() {
  const { permissions } = useAuth();

  const showKpis = hasPermission(permissions, "/admin");
  const showMap = hasPermission(permissions, "/admin/live-rides") || hasPermission(permissions, "/admin/heatmaps");
  const showRevenue = hasPermission(permissions, "/admin/revenue");
  const showTrend = hasPermission(permissions, "/admin/analytics");
  const showDriverStatus = hasPermission(permissions, "/admin/drivers");
  const showTopDrivers = hasPermission(permissions, "/admin/drivers") || hasPermission(permissions, "/admin/analytics");
  const showActivity = hasPermission(permissions, "/admin");
  const showAlerts = hasPermission(permissions, "/admin/safety-center") || hasPermission(permissions, "/admin/support");
  const showInbox = hasPermission(permissions, "/admin/inbox");

  const hasMapOrRevenue = showMap || showRevenue;
  const hasMiddleRow = showTrend || showDriverStatus || showTopDrivers;
  const hasFeedRow = showActivity || showAlerts;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Greeting />
          <DateSubtitle />
        </div>
        <PeriodFilter />
      </div>

      {showKpis && <DashboardKpis />}

      {hasMapOrRevenue && (
        <div className="grid gap-4 lg:grid-cols-12">
          {showMap && (
            <div className={showRevenue ? "lg:col-span-8" : "lg:col-span-12"}>
              <LiveMapWidget />
            </div>
          )}
          {showRevenue && (
            <div className={showMap ? "lg:col-span-4" : "lg:col-span-12"}>
              <RevenueWidget />
            </div>
          )}
        </div>
      )}

      {hasMiddleRow && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showTrend && <RideTrendWidget />}
          {showDriverStatus && <DriverStatusWidget />}
          {showTopDrivers && <TopDriversWidget />}
        </div>
      )}

      <MonetizationGrid />

      {hasFeedRow && (
        <div className="grid gap-4 lg:grid-cols-12">
          {showActivity && (
            <div className={showAlerts ? "lg:col-span-7" : "lg:col-span-12"}>
              <ActivityFeed />
            </div>
          )}
          {showAlerts && (
            <div className={showActivity ? "lg:col-span-5" : "lg:col-span-12"}>
              <AlertsPanel />
            </div>
          )}
        </div>
      )}

      {showInbox && <RecentMessagesWidget />}
    </div>
  );
}
