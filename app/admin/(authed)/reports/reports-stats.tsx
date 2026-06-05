"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getReportsStats, type ReportsStats } from "@/lib/api";

export function ReportsStatsCards() {
  const [data, setData] = useState<ReportsStats | null>(null);

  useEffect(() => {
    getReportsStats().then(setData).catch(() => null);
  }, []);

  const stats = [
    { label: "Generated This Month", value: data ? String(data.total_this_month) : "—", hint: "reports created" },
    { label: "Scheduled", value: data ? String(data.scheduled) : "—", hint: "running automatically" },
    { label: "Ready This Week", value: data ? String(data.ready_this_week) : "—", hint: "available for download" },
    { label: "Pending", value: data ? String(data.pending) : "—", hint: "generating now" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
