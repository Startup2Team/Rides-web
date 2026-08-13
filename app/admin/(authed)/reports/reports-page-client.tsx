"use client";

import { Suspense } from "react";
import { AdminPageHeader } from "../_components";
import { ReportsConsole } from "./reports-console";

function ReportsFallback() {
  return (
    <div className="flex justify-center py-24">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}

export default function AdminReportsPageClient() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Reports"
      />

      <Suspense fallback={<ReportsFallback />}>
        <ReportsConsole />
      </Suspense>
    </div>
  );
}
