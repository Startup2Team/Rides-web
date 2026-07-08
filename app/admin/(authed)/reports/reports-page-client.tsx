"use client";

import { Suspense } from "react";
import Link from "next/link";
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
        subtitle="Generate reports for the whole system — select a type, define the period and filters, preview the data, then export a PDF that matches what you reviewed."
        action={
          <Link
            href="/admin/analytics"
            className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary"
          >
            View analytics →
          </Link>
        }
      />

      <Suspense fallback={<ReportsFallback />}>
        <ReportsConsole />
      </Suspense>
    </div>
  );
}
