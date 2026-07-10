"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getHeatmapZones, getActivityHeatmap, type HeatZone, type ActivityCell } from "@/lib/api";

export function HeatmapStatsCards() {
  const [zones, setZones] = useState<HeatZone[] | null>(null);
  const [activity, setActivity] = useState<ActivityCell[] | null>(null);

  useEffect(() => {
    getHeatmapZones().then((d) => setZones(d ?? [])).catch(() => setZones([]));
    getActivityHeatmap().then((d) => setActivity(d ?? [])).catch(() => setActivity([]));
  }, []);

  const safeZones = Array.isArray(zones) ? zones : [];
  const safeActivity = Array.isArray(activity) ? activity : [];

  const hotZones = zones !== null ? safeZones.filter((z) => z.demand > 0).length : null;

  const peakHour = (() => {
    if (safeActivity.length === 0) return null;
    const byHour = new Array(24).fill(0);
    for (const c of safeActivity) byHour[c.hour] += c.count;
    const max = Math.max(...byHour);
    const idx = byHour.indexOf(max);
    return `${idx.toString().padStart(2, "0")}:00`;
  })();

  const totalTrips = zones !== null ? safeZones.reduce((s, z) => s + z.trips, 0) : null;

  const avgFare = (() => {
    if (safeZones.length === 0) return null;
    const withFare = safeZones.filter((z) => z.avg_fare > 0);
    if (withFare.length === 0) return null;
    return Math.round(withFare.reduce((s, z) => s + z.avg_fare, 0) / withFare.length);
  })();

  const stats = [
    { label: "Active Hot Zones", value: hotZones !== null ? String(hotZones) : "—", hint: "with ride data (7d)" },
    { label: "Peak Hour", value: peakHour ?? "—", hint: "city-wide (90d)" },
    { label: "Total Trips (7d)", value: totalTrips !== null ? totalTrips.toLocaleString() : "—", hint: "completed pickups" },
    { label: "Avg Fare", value: avgFare !== null ? `${avgFare.toLocaleString()} RWF` : "—", hint: "across all zones" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
