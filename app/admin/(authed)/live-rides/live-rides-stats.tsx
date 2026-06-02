"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getLiveRidesStats, type LiveRidesStats } from "@/lib/api";

export function LiveRidesStatsCards() {
  const [data, setData] = useState<LiveRidesStats | null>(null);

  useEffect(() => {
    const load = () => getLiveRidesStats().then(setData).catch(() => null);
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Active Rides", value: data ? String(data.total) : "—", hint: "in progress now" },
    { label: "Searching", value: data ? String(data.searching) : "—", hint: "matching drivers" },
    { label: "Negotiating", value: data ? String(data.negotiating) : "—", hint: "fare in chat" },
    { label: "On Trip", value: data ? String(data.on_trip) : "—", hint: "passengers onboard" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
