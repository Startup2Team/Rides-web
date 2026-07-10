import Link from "next/link";
import { AdminPageHeader } from "../_components";
import { AnalyticsConsole } from "./analytics-console";

export const metadata = {
  title: "Admin · Analytics",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Platform analytics"
        subtitle="Historical trends across the whole platform — filter by period and vehicle. Live demand lives on Heatmaps; individual riders and drivers on their profile pages."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Read-only
            </span>
            <Link
              href="/admin/reports"
              className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.04] hover:text-primary"
            >
              Export reports →
            </Link>
          </div>
        }
      />

      <AnalyticsConsole />
    </div>
  );
}
