"use client";

import { DateSubtitle, Greeting } from "../_greeting";
import { PeriodFilter } from "../_period-filter";
import { DashboardKpis } from "../dashboard-kpis";
import { RevenueWidget } from "../revenue-widget";
import { RideTrendWidget, DriverStatusWidget, TopDriversWidget } from "../dashboard-side-widgets";
import { ActivityFeed, AlertsPanel } from "../dashboard-feed-widgets";
import { LiveMapWidget } from "../live-map-widget";
import { RecentMessagesWidget } from "../recent-messages-widget";

/** Full operations dashboard (Super Admin and roles that share the same home). */
export function SuperAdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Greeting />
          <DateSubtitle />
        </div>
        <PeriodFilter />
      </div>

      <DashboardKpis />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <LiveMapWidget />
        </div>
        <div className="lg:col-span-4">
          <RevenueWidget />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RideTrendWidget />
        <DriverStatusWidget />
        <TopDriversWidget />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-5">
          <AlertsPanel />
        </div>
      </div>

      <RecentMessagesWidget />
    </div>
  );
}
