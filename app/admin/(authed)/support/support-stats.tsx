"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getTicketsStats, type TicketsStats } from "@/lib/api";

export function SupportStatsCards() {
  const [data, setData] = useState<TicketsStats | null>(null);

  useEffect(() => {
    getTicketsStats().then(setData).catch(() => null);
  }, []);

  const stats = [
    { label: "Open Tickets", value: data ? String(data.open) : "—", hint: "awaiting response" },
    { label: "Pending", value: data ? String(data.pending) : "—", hint: "reply sent, awaiting customer" },
    { label: "Resolved Today", value: data ? String(data.resolved_today) : "—", hint: "fully closed" },
    { label: "Total Active", value: data ? String(data.open + data.pending) : "—", hint: "open + pending" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
