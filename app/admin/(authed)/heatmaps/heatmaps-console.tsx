"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../_components";
import { ZoneDetailModal, type Zone } from "./zone-detail-modal";

type Layer = "demand" | "supply" | "surge";
type TimeRange = "now" | "hour" | "today" | "week";
type VehicleFilter = "all" | "Moto Bike" | "Cab Taxi" | "Light Hilux" | "Heavy Fuso";

const baseZones: Zone[] = [
  {
    id: "z1",
    name: "Kimironko Market",
    district: "Gasabo",
    position: { x: 62, y: 32 },
    radius: 60,
    demand: 92,
    supply: 38,
    drivers: 12,
    trips24h: 487,
    avgFare: 3400,
    surge: 1.6,
    topRoutes: [
      { destination: "Kigali Heights", share: 28 },
      { destination: "Kacyiru", share: 22 },
      { destination: "Town", share: 18 },
      { destination: "Nyarutarama", share: 12 },
    ],
    hourlyDemand: [
      8, 5, 3, 2, 2, 4, 18, 42, 65, 48, 38, 44, 56, 52, 48, 44, 58, 78, 92, 84,
      62, 38, 22, 14,
    ],
    vehicleSplit: [
      { vehicle: "Moto Bike", pct: 52, color: "bg-primary" },
      { vehicle: "Cab Taxi", pct: 36, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 8, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 4, color: "bg-foreground" },
    ],
  },
  {
    id: "z2",
    name: "Convention Centre",
    district: "Gasabo",
    position: { x: 50, y: 28 },
    radius: 50,
    demand: 85,
    supply: 62,
    drivers: 18,
    trips24h: 312,
    avgFare: 4800,
    surge: 1.3,
    topRoutes: [
      { destination: "Airport", share: 32 },
      { destination: "Kacyiru", share: 24 },
      { destination: "Nyamirambo", share: 18 },
      { destination: "Kigali Heights", share: 14 },
    ],
    hourlyDemand: [
      4, 2, 2, 2, 2, 4, 12, 28, 42, 54, 62, 68, 72, 68, 64, 58, 72, 82, 85, 76,
      52, 28, 14, 8,
    ],
    vehicleSplit: [
      { vehicle: "Cab Taxi", pct: 64, color: "bg-sky-500" },
      { vehicle: "Moto Bike", pct: 24, color: "bg-primary" },
      { vehicle: "Light Hilux", pct: 8, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 4, color: "bg-foreground" },
    ],
  },
  {
    id: "z3",
    name: "Nyabugogo Station",
    district: "Nyarugenge",
    position: { x: 30, y: 50 },
    radius: 55,
    demand: 78,
    supply: 52,
    drivers: 14,
    trips24h: 422,
    avgFare: 2900,
    surge: 1.2,
    topRoutes: [
      { destination: "Town", share: 34 },
      { destination: "Kimironko", share: 22 },
      { destination: "Remera", share: 16 },
      { destination: "Gisozi", share: 12 },
    ],
    hourlyDemand: [
      12, 6, 4, 4, 8, 22, 48, 68, 78, 62, 52, 56, 64, 58, 54, 56, 68, 74, 72,
      58, 42, 24, 14, 10,
    ],
    vehicleSplit: [
      { vehicle: "Moto Bike", pct: 42, color: "bg-primary" },
      { vehicle: "Cab Taxi", pct: 38, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 14, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 6, color: "bg-foreground" },
    ],
  },
  {
    id: "z4",
    name: "Kigali Heights",
    district: "Gasabo",
    position: { x: 55, y: 35 },
    radius: 45,
    demand: 61,
    supply: 78,
    drivers: 22,
    trips24h: 268,
    avgFare: 4200,
    surge: 1.0,
    topRoutes: [
      { destination: "Kimironko", share: 28 },
      { destination: "Airport", share: 22 },
      { destination: "Remera", share: 18 },
      { destination: "Town", share: 16 },
    ],
    hourlyDemand: [
      4, 2, 2, 2, 2, 4, 14, 32, 48, 52, 48, 52, 56, 48, 42, 44, 54, 61, 58, 48,
      32, 18, 10, 6,
    ],
    vehicleSplit: [
      { vehicle: "Cab Taxi", pct: 58, color: "bg-sky-500" },
      { vehicle: "Moto Bike", pct: 28, color: "bg-primary" },
      { vehicle: "Light Hilux", pct: 10, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 4, color: "bg-foreground" },
    ],
  },
  {
    id: "z5",
    name: "Remera",
    district: "Gasabo",
    position: { x: 70, y: 45 },
    radius: 40,
    demand: 54,
    supply: 72,
    drivers: 16,
    trips24h: 218,
    avgFare: 3100,
    surge: 1.0,
    topRoutes: [
      { destination: "Kacyiru", share: 28 },
      { destination: "Kabuga", share: 22 },
      { destination: "Town", share: 18 },
      { destination: "Kimironko", share: 14 },
    ],
    hourlyDemand: [
      6, 3, 2, 2, 4, 8, 22, 38, 48, 42, 38, 42, 46, 44, 40, 38, 46, 54, 50, 42,
      28, 14, 8, 4,
    ],
    vehicleSplit: [
      { vehicle: "Moto Bike", pct: 48, color: "bg-primary" },
      { vehicle: "Cab Taxi", pct: 38, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 10, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 4, color: "bg-foreground" },
    ],
  },
  {
    id: "z6",
    name: "Nyamirambo",
    district: "Nyarugenge",
    position: { x: 32, y: 62 },
    radius: 38,
    demand: 48,
    supply: 30,
    drivers: 7,
    trips24h: 156,
    avgFare: 2400,
    surge: 1.2,
    topRoutes: [
      { destination: "Town", share: 34 },
      { destination: "Nyabugogo", share: 24 },
      { destination: "Kicukiro", share: 14 },
      { destination: "Kacyiru", share: 12 },
    ],
    hourlyDemand: [
      10, 5, 4, 4, 6, 14, 30, 44, 38, 32, 28, 30, 34, 32, 30, 32, 38, 44, 48,
      42, 32, 22, 14, 8,
    ],
    vehicleSplit: [
      { vehicle: "Moto Bike", pct: 64, color: "bg-primary" },
      { vehicle: "Cab Taxi", pct: 28, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 6, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 2, color: "bg-foreground" },
    ],
  },
  {
    id: "z7",
    name: "Gikondo Industrial",
    district: "Kicukiro",
    position: { x: 45, y: 70 },
    radius: 42,
    demand: 38,
    supply: 22,
    drivers: 6,
    trips24h: 98,
    avgFare: 8200,
    surge: 1.4,
    topRoutes: [
      { destination: "Nyabugogo", share: 32 },
      { destination: "Town", share: 18 },
      { destination: "Airport", share: 16 },
      { destination: "Remera", share: 12 },
    ],
    hourlyDemand: [
      2, 1, 1, 1, 2, 4, 12, 22, 28, 32, 36, 38, 34, 32, 30, 32, 28, 22, 18, 14,
      8, 5, 3, 2,
    ],
    vehicleSplit: [
      { vehicle: "Heavy Fuso", pct: 48, color: "bg-foreground" },
      { vehicle: "Light Hilux", pct: 36, color: "bg-amber-500" },
      { vehicle: "Cab Taxi", pct: 12, color: "bg-sky-500" },
      { vehicle: "Moto Bike", pct: 4, color: "bg-primary" },
    ],
  },
  {
    id: "z8",
    name: "Kicukiro Centre",
    district: "Kicukiro",
    position: { x: 55, y: 75 },
    radius: 36,
    demand: 42,
    supply: 58,
    drivers: 13,
    trips24h: 184,
    avgFare: 2200,
    surge: 1.0,
    topRoutes: [
      { destination: "Town", share: 28 },
      { destination: "Gikondo", share: 22 },
      { destination: "Niboye", share: 18 },
      { destination: "Remera", share: 14 },
    ],
    hourlyDemand: [
      4, 2, 1, 1, 2, 8, 22, 32, 36, 32, 28, 30, 34, 32, 28, 30, 36, 42, 38, 32,
      22, 14, 8, 4,
    ],
    vehicleSplit: [
      { vehicle: "Moto Bike", pct: 54, color: "bg-primary" },
      { vehicle: "Cab Taxi", pct: 36, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 8, color: "bg-amber-500" },
      { vehicle: "Heavy Fuso", pct: 2, color: "bg-foreground" },
    ],
  },
];

const layerLabels: Record<Layer, string> = {
  demand: "Demand",
  supply: "Supply",
  surge: "Surge",
};

const timeLabels: Record<TimeRange, string> = {
  now: "Now",
  hour: "Last hour",
  today: "Today",
  week: "This week",
};

function demandTone(score: number) {
  if (score >= 80) return "danger";
  if (score >= 60) return "warn";
  return "success";
}

function gapTone(demand: number, supply: number) {
  const gap = demand - supply;
  if (gap > 30) return "danger";
  if (gap > 10) return "warn";
  return "success";
}

function tonePillStyle(tone: "danger" | "warn" | "success") {
  return tone === "danger"
    ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
    : tone === "warn"
      ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100"
      : "bg-primary/15 text-primary";
}

function toneBg(tone: "danger" | "warn" | "success") {
  return tone === "danger"
    ? "bg-red-500"
    : tone === "warn"
      ? "bg-amber-500"
      : "bg-primary";
}

function toneGradient(tone: "danger" | "warn" | "success") {
  return tone === "danger"
    ? "hot-red"
    : tone === "warn"
      ? "hot-amber"
      : "hot-green";
}

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function CitywideHourlyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const peakIdx = data.indexOf(max);
  return (
    <div>
      <div className="flex h-32 items-end gap-0.5">
        {data.map((v, i) => {
          const intensity = v / max;
          const isPeak = i === peakIdx;
          const color = isPeak
            ? "bg-amber-500"
            : intensity > 0.75
              ? "bg-primary"
              : intensity > 0.4
                ? "bg-primary/60"
                : "bg-primary/25";
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
            >
              <span
                className={`w-full rounded-t ${color}`}
                style={{ height: `${Math.max(2, intensity * 100)}%` }}
              />
              <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-foreground shadow-sm ring-1 ring-border group-hover:block">
                {i.toString().padStart(2, "0")}:00 · {v}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
}

export function HeatmapsConsole() {
  const [layer, setLayer] = useState<Layer>("demand");
  const [timeRange, setTimeRange] = useState<TimeRange>("now");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const zones = useMemo(() => {
    if (vehicleFilter === "all") return baseZones;
    return baseZones.map((z) => {
      const share = z.vehicleSplit.find((v) => v.vehicle === vehicleFilter)?.pct ?? 0;
      const scale = share / 100;
      return {
        ...z,
        demand: Math.round(z.demand * (0.4 + scale * 0.9)),
        supply: Math.round(z.supply * (0.4 + scale * 0.9)),
        trips24h: Math.round(z.trips24h * scale),
        drivers: Math.round(z.drivers * scale),
      };
    });
  }, [vehicleFilter]);

  const sortedZones = useMemo(() => {
    const key: keyof Zone =
      layer === "supply" ? "supply" : layer === "surge" ? "surge" : "demand";
    return [...zones].sort((a, b) => (b[key] as number) - (a[key] as number));
  }, [zones, layer]);

  const cityHourly = useMemo(() => {
    const sums = new Array(24).fill(0);
    for (const z of zones) {
      for (let i = 0; i < 24; i++) sums[i] += z.hourlyDemand[i];
    }
    return sums;
  }, [zones]);

  const cityPeakIdx = cityHourly.indexOf(Math.max(...cityHourly));
  const underservedCount = zones.filter((z) => z.demand - z.supply > 30).length;

  const opening = openingId ? zones.find((z) => z.id === openingId) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1.5">
          {(Object.keys(layerLabels) as Layer[]).map((l) => {
            const active = layer === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLayer(l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {layerLabels[l]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
          {(Object.keys(timeLabels) as TimeRange[]).map((r) => {
            const active = timeRange === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {timeLabels[r]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
          {(
            ["all", "Moto Bike", "Cab Taxi", "Light Hilux", "Heavy Fuso"] as VehicleFilter[]
          ).map((v) => {
            const active = vehicleFilter === v;
            const label = v === "all" ? "All vehicles" : v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVehicleFilter(v)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={`City ${layerLabels[layer].toLowerCase()} map`} bodyClass="" >
          <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:h-[420px]">
            <img
              src="/maps/map.png"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <radialGradient id="hot-red" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#ef4444" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hot-amber" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="hot-green" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#007AFF" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#007AFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
                </radialGradient>
              </defs>
              {zones.map((z) => {
                const score =
                  layer === "supply"
                    ? z.supply
                    : layer === "surge"
                      ? z.surge * 50
                      : z.demand;
                const tone =
                  layer === "supply"
                    ? gapTone(z.demand, z.supply)
                    : demandTone(score);
                return (
                  <circle
                    key={z.id}
                    cx={z.position.x}
                    cy={z.position.y}
                    r={z.radius / 8}
                    fill={`url(#${toneGradient(tone)})`}
                  />
                );
              })}
            </svg>

            {zones.map((z) => {
              const score =
                layer === "supply"
                  ? z.supply
                  : layer === "surge"
                    ? z.surge * 50
                    : z.demand;
              const tone =
                layer === "supply"
                  ? gapTone(z.demand, z.supply)
                  : demandTone(score);
              const isSelected = selectedId === z.id;
              return (
                <button
                  type="button"
                  key={z.id}
                  onClick={() => {
                    setSelectedId(z.id);
                    setOpeningId(z.id);
                  }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${z.position.y}%`, left: `${z.position.x}%` }}
                  aria-label={z.name}
                >
                  <span
                    className={`flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold shadow-sm ring-1 ring-border backdrop-blur transition-transform ${
                      isSelected ? "scale-110" : ""
                    }`}
                  >
                    <span className={`block h-2 w-2 rounded-full ${toneBg(tone)}`} />
                    <span className="text-foreground">{z.name}</span>
                  </span>
                </button>
              );
            })}

            <div className="absolute right-3 top-3 z-10 space-y-1 rounded-xl border border-border bg-card/85 px-3 py-2 text-[10px] backdrop-blur">
              <div className="flex items-center gap-1.5">
                <span className="block h-2 w-2 rounded-full bg-primary" />
                <span className="text-foreground">Healthy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="block h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-foreground">Rising</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="block h-2 w-2 rounded-full bg-red-500" />
                <span className="text-foreground">Critical</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title={`Top ${layerLabels[layer].toLowerCase()} zones`}>
          <ul className="divide-y divide-border">
            {sortedZones.slice(0, 8).map((z) => {
              const tone =
                layer === "supply"
                  ? gapTone(z.demand, z.supply)
                  : demandTone(
                      layer === "surge" ? z.surge * 50 : z.demand,
                    );
              const score =
                layer === "supply"
                  ? `${z.supply}/100`
                  : layer === "surge"
                    ? `× ${z.surge.toFixed(1)}`
                    : `${z.demand}/100`;
              return (
                <li key={z.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(z.id);
                      setOpeningId(z.id);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneBg(tone)}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                        {z.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {z.district} · {z.drivers} drivers · {z.trips24h} trips
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tonePillStyle(tone)}`}
                    >
                      {score}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="City demand · last 24h" bodyClass="p-4">
          <CitywideHourlyChart data={cityHourly} />
          <div className="mt-3 flex items-baseline justify-between text-[11px]">
            <span className="text-muted-foreground">Peak</span>
            <span className="font-bold text-foreground">
              {cityPeakIdx.toString().padStart(2, "0")}:00
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Trips requested per hour across all zones.
          </p>
        </Card>

        <Card title="Supply gap" bodyClass="p-4">
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {underservedCount}
          </p>
          <p className="text-[11px] text-muted-foreground">
            zones with demand &gt; supply by 30 pts
          </p>
          <ul className="mt-3 space-y-2 text-xs">
            {zones
              .filter((z) => z.demand - z.supply > 10)
              .slice(0, 4)
              .map((z) => {
                const gap = z.demand - z.supply;
                return (
                  <li key={z.id} className="flex items-center justify-between">
                    <span className="truncate text-foreground">{z.name}</span>
                    <span
                      className={`font-bold ${
                        gap > 30 ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      −{gap}
                    </span>
                  </li>
                );
              })}
            {zones.filter((z) => z.demand - z.supply > 10).length === 0 ? (
              <li className="text-muted-foreground">All zones balanced.</li>
            ) : null}
          </ul>
        </Card>

        <Card title="Average fare by zone" bodyClass="p-4">
          <ul className="space-y-2 text-xs">
            {[...zones]
              .sort((a, b) => b.avgFare - a.avgFare)
              .slice(0, 5)
              .map((z) => {
                const max = Math.max(...zones.map((x) => x.avgFare));
                const pct = (z.avgFare / max) * 100;
                return (
                  <li key={z.id}>
                    <div className="flex items-center justify-between">
                      <span className="truncate text-foreground">{z.name}</span>
                      <span className="font-semibold text-foreground">
                        {formatRWF(z.avgFare)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
          </ul>
        </Card>
      </div>

      <ZoneDetailModal
        zone={opening}
        onClose={() => setOpeningId(null)}
        onNotifyDrivers={(id) => {
          const z = zones.find((x) => x.id === id);
          setToast(
            z ? `Notification sent to drivers near ${z.name}` : "Notification sent",
          );
          setOpeningId(null);
        }}
        onViewLiveRides={(id) => {
          const z = zones.find((x) => x.id === id);
          setToast(z ? `Opening live rides in ${z.name}` : "Opening live rides");
          setOpeningId(null);
        }}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
