"use client";

import { useEffect, useState } from "react";
import { getReportsStats, type ReportsStats } from "@/lib/api";
import { MOCK_REPORTS_STATS } from "@/lib/mock-reports";

export function ReportsStatsCards({ readyCount }: { readyCount: number }) {
  const [data, setData] = useState<ReportsStats | null>(null);

  useEffect(() => {
    getReportsStats()
      .then(setData)
      .catch(() => setData(MOCK_REPORTS_STATS));
  }, []);

  const stats = [
    {
      label: "Ready to download",
      value: String(readyCount),
      hint: "in your export history",
      tone: "primary" as const,
    },
    {
      label: "Exported this month",
      value: data ? String(data.total_this_month) : "—",
      hint: "files generated",
      tone: "default" as const,
    },
    {
      label: "Scheduled deliveries",
      value: data ? String(data.scheduled) : "0",
      hint: "recurring email exports",
      tone: "default" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md hover:shadow-primary/5"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {s.label}
          </p>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              s.tone === "primary" ? "text-primary" : "text-foreground"
            }`}
          >
            {s.value}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">{s.hint}</p>
        </div>
      ))}
    </div>
  );
}
