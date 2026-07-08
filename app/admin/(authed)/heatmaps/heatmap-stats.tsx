"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getLiveDemandHeatmap } from "@/lib/api";

export function HeatmapStatsCards() {
  const [waitingNow, setWaitingNow] = useState<number | null>(null);
  const [liveHotZones, setLiveHotZones] = useState<number | null>(null);
  const [hottestZone, setHottestZone] = useState<string | null>(null);
  const [hottestCount, setHottestCount] = useState<number | null>(null);

  useEffect(() => {
    const loadLive = () => {
      getLiveDemandHeatmap()
        .then((d) => {
          const list = Array.isArray(d) ? d : [];
          setLiveHotZones(list.length);
          setWaitingNow(list.reduce((sum, z) => sum + z.waitingRiders, 0));
          if (list.length === 0) {
            setHottestZone(null);
            setHottestCount(null);
            return;
          }
          const top = [...list].sort((a, b) => b.waitingRiders - a.waitingRiders)[0];
          const label = top.pickupLabel.replace(/,?\s*Kigali.*$/i, "").trim() || top.pickupLabel;
          setHottestZone(label);
          setHottestCount(top.waitingRiders);
        })
        .catch(() => {
          setLiveHotZones(0);
          setWaitingNow(0);
          setHottestZone(null);
          setHottestCount(null);
        });
    };
    loadLive();
    const id = setInterval(loadLive, 15_000);
    return () => clearInterval(id);
  }, []);

  const stats = [
    {
      label: "Riders waiting now",
      value: waitingNow !== null ? String(waitingNow) : "—",
      hint: "live pickup demand",
    },
    {
      label: "Hot zones",
      value: liveHotZones !== null ? String(liveHotZones) : "—",
      hint: "pickup clusters",
    },
    {
      label: "Busiest pickup",
      value: hottestZone ?? "—",
      hint:
        hottestCount !== null
          ? `${hottestCount} rider${hottestCount === 1 ? "" : "s"} waiting`
          : "right now",
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
