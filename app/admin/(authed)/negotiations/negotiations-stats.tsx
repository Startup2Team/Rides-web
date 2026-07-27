"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getNegotiationsStats, type NegotiationsStats } from "@/lib/api";

export function NegotiationsStatsCards() {
  const [data, setData] = useState<NegotiationsStats | null>(null);

  useEffect(() => {
    getNegotiationsStats()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const successRate =
    data && data.total_today > 0
      ? Math.round((data.agreed_today / data.total_today) * 100)
      : null;

  const stats = [
    {
      label: "Agreed today",
      value: data ? String(data.agreed_today) : "—",
      hint: successRate !== null ? `${successRate}% of negotiations` : "both parties accepted",
    },
    {
      label: "Failed today",
      value: data ? String(data.failed_today) : "—",
      hint: "declined or expired",
    },
    {
      label: "Total today",
      value: data ? String(data.total_today) : "—",
      hint: "all negotiations started",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
