"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getIncidentsStats, type IncidentsStats } from "@/lib/api";

export function SafetyStatsCards() {
  const [data, setData] = useState<IncidentsStats | null>(null);

  useEffect(() => {
    getIncidentsStats().then(setData).catch(() => null);
  }, []);

  const stats = [
    { label: "Open Incidents", value: data ? String(data.open) : "—", hint: "needs response" },
    { label: "Acknowledged", value: data ? String(data.acknowledged) : "—", hint: "in progress" },
    { label: "Escalated", value: data ? String(data.escalated) : "—", hint: "high priority" },
    { label: "Resolved (7d)", value: data ? String(data.resolved_7d) : "—", hint: "fully closed" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
