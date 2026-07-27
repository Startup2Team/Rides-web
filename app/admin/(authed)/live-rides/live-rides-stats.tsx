"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getLiveRidesStats, type LiveRidesStats } from "@/lib/api";

const EMPTY_STATS: LiveRidesStats = { total: 0, searching: 0, negotiating: 0, driver_en_route: 0, on_trip: 0 };

export function LiveRidesStatsCards() {
  const [data, setData] = useState<LiveRidesStats | null>(null);

  useEffect(() => {
    const load = () => getLiveRidesStats().then(setData).catch(() => setData(EMPTY_STATS));
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const total = data?.total ?? null;
  const searching = data?.searching ?? null;
  const negotiating = data?.negotiating ?? null;
  const onTrip = data?.on_trip ?? null;

  const stats = [
    { label: "Active Rides", value: total != null ? String(total) : "—", hint: "in progress now" },
    { label: "Searching", value: searching != null ? String(searching) : "—", hint: "matching drivers" },
    { label: "Negotiating", value: negotiating != null ? String(negotiating) : "—", hint: "fare in chat" },
    { label: "On Trip", value: onTrip != null ? String(onTrip) : "—", hint: "passengers onboard" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
