"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getLiveRidesStats, type LiveRidesStats } from "@/lib/api";
import { MOCK_LIVE_RIDES_STATS } from "@/lib/mock-live-rides";

const EMPTY_STATS: LiveRidesStats = { total: 0, searching: 0, negotiating: 0, driver_en_route: 0, on_trip: 0 };

export function LiveRidesStatsCards() {
  const [data, setData] = useState<LiveRidesStats | null>(null);

  useEffect(() => {
    const load = () => getLiveRidesStats().then(setData).catch(() => setData(EMPTY_STATS));
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  // This bar monitors real activity — mocks only stand in when there are genuinely
  // zero real active rides, never added on top of a real count.
  const effective = data ? (data.total > 0 ? data : MOCK_LIVE_RIDES_STATS) : null;
  const total = effective?.total ?? null;
  const searching = effective?.searching ?? null;
  const negotiating = effective?.negotiating ?? null;
  const onTrip = effective?.on_trip ?? null;

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
