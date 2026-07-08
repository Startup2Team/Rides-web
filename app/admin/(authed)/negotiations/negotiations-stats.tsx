"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getNegotiationsStats, type NegotiationsStats } from "@/lib/api";
import { MOCK_NEGOTIATIONS, MOCK_NEGOTIATIONS_STATS } from "@/lib/mock-negotiations";

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

  const avgAgreed =
    data && data.agreed_today > 0
      ? Math.round(
          MOCK_NEGOTIATIONS.filter((n) => n.agreed_fare != null).reduce(
            (s, n) => s + (n.agreed_fare ?? 0),
            0,
          ) / MOCK_NEGOTIATIONS.filter((n) => n.agreed_fare != null).length,
        )
      : null;

  const stats = [
    {
      label: "Agreed today",
      value: data ? String(data.agreed_today) : "—",
      hint: successRate !== null ? `${successRate}% of negotiations` : "both parties accepted",
    },
    {
      label: "Avg agreed",
      value: avgAgreed !== null ? `${avgAgreed.toLocaleString()} RWF` : "—",
      hint: "final locked fare",
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
