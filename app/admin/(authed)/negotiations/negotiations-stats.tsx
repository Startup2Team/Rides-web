"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getNegotiationsStats, type NegotiationsStats } from "@/lib/api";
import { MOCK_NEGOTIATIONS_STATS } from "@/lib/mock-negotiations";

export function NegotiationsStatsCards() {
  const [data, setData] = useState<NegotiationsStats | null>(null);

  useEffect(() => {
    getNegotiationsStats()
      .then((stats) => setData(stats.total_today > 0 ? stats : MOCK_NEGOTIATIONS_STATS))
      .catch(() => setData(MOCK_NEGOTIATIONS_STATS));
  }, []);

  const successRate =
    data && data.total_today > 0
      ? Math.round((data.agreed_today / data.total_today) * 100)
      : null;

  const stats = [
    { label: "Total Today", value: data ? String(data.total_today) : "—", hint: "negotiations started" },
    {
      label: "Agreed",
      value: data ? String(data.agreed_today) : "—",
      hint: successRate !== null ? `${successRate}% success rate` : "fare locked",
    },
    { label: "Failed", value: data ? String(data.failed_today) : "—", hint: "walked away" },
    {
      label: "Avg Rounds",
      value: data ? data.avg_rounds.toFixed(1) : "—",
      hint: "per negotiation",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
