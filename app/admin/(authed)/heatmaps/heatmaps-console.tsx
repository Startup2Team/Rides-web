"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../_components";
import { ZoneDetailModal, type Zone } from "./zone-detail-modal";
import { getHeatmapZones, getActivityHeatmap, type HeatZone, type ActivityCell } from "@/lib/api";

// ── Kigali coordinate → static map (%) projection ────────────────────────
// Bounds derived from known Kigali landmark positions on the map image.
const KIGALI = { minLat: -2.030, maxLat: -1.890, minLng: 30.003, maxLng: 30.166 };

function toMapPos(lat: number, lng: number) {
  const x = ((lng - KIGALI.minLng) / (KIGALI.maxLng - KIGALI.minLng)) * 100;
  const y = ((KIGALI.maxLat - lat) / (KIGALI.maxLat - KIGALI.minLat)) * 100;
  return { x: Math.max(3, Math.min(97, Math.round(x))), y: Math.max(3, Math.min(97, Math.round(y))) };
}

// ── Approximate Kigali neighbourhood lookup ───────────────────────────────
const KNOWN_ZONES: Record<string, { name: string; district: string }> = {
  "-1.94,30.10": { name: "Kimironko", district: "Gasabo" },
  "-1.95,30.06": { name: "Convention Centre", district: "Gasabo" },
  "-1.96,30.05": { name: "Nyabugogo", district: "Nyarugenge" },
  "-1.94,30.07": { name: "Kigali Heights", district: "Gasabo" },
  "-1.95,30.10": { name: "Remera", district: "Gasabo" },
  "-1.97,30.05": { name: "Nyamirambo", district: "Nyarugenge" },
  "-1.97,30.07": { name: "Gikondo", district: "Kicukiro" },
  "-1.98,30.08": { name: "Kicukiro Centre", district: "Kicukiro" },
  "-1.95,30.08": { name: "Kacyiru", district: "Gasabo" },
  "-1.96,30.09": { name: "Kibagabaga", district: "Gasabo" },
  "-1.99,30.06": { name: "Gatenga", district: "Kicukiro" },
  "-1.96,30.07": { name: "Town Centre", district: "Nyarugenge" },
};

function getZoneLabel(lat: number, lng: number): { name: string; district: string } {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (KNOWN_ZONES[key]) return KNOWN_ZONES[key];
  const district = lat > -1.96 ? "Gasabo" : lat > -1.98 ? "Nyarugenge" : "Kicukiro";
  return { name: `${district} Area`, district };
}

// ── API → Zone mapper ─────────────────────────────────────────────────────
function toZone(z: HeatZone, index: number, maxDemand: number): Zone {
  const { name, district } = getZoneLabel(z.lat, z.lng);
  const demand = maxDemand > 0 ? Math.round((z.demand / maxDemand) * 100) : 0;
  return {
    id: `z-${z.lat.toFixed(2)}-${z.lng.toFixed(2)}`,
    name,
    district,
    position: toMapPos(z.lat, z.lng),
    radius: 40 + Math.round((demand / 100) * 30),
    demand,
    supply: 0,
    drivers: 0,
    trips24h: z.trips,
    avgFare: Math.round(z.avg_fare),
    surge: 1.0,
    topRoutes: [],
    hourlyDemand: [],
    vehicleSplit: [],
  };
}

// ── Types ─────────────────────────────────────────────────────────────────
type Layer = "demand" | "supply" | "surge";
type TimeRange = "now" | "hour" | "today" | "week";

const layerLabels: Record<Layer, string> = {
  demand: "Demand", supply: "Supply", surge: "Surge",
};
const timeLabels: Record<TimeRange, string> = {
  now: "Now", hour: "Last hour", today: "Today", week: "This week",
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
  return tone === "danger" ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
    : tone === "warn" ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100"
    : "bg-primary/15 text-primary";
}
function toneBg(tone: "danger" | "warn" | "success") {
  return tone === "danger" ? "bg-red-500" : tone === "warn" ? "bg-amber-500" : "bg-primary";
}
function toneGradient(tone: "danger" | "warn" | "success") {
  return tone === "danger" ? "hot-red" : tone === "warn" ? "hot-amber" : "hot-green";
}
function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

// ── City-wide hourly chart ────────────────────────────────────────────────
function CitywideHourlyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const peakIdx = data.indexOf(max);
  return (
    <div>
      <div className="flex h-32 items-end gap-0.5">
        {data.map((v, i) => {
          const intensity = v / max;
          const isPeak = i === peakIdx;
          const color = isPeak ? "bg-amber-500"
            : intensity > 0.75 ? "bg-primary"
            : intensity > 0.4 ? "bg-primary/60"
            : "bg-primary/25";
          return (
            <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <span className={`w-full rounded-t ${color}`} style={{ height: `${Math.max(2, intensity * 100)}%` }} />
              <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-foreground shadow-sm ring-1 ring-border group-hover:block">
                {i.toString().padStart(2, "0")}:00 · {v}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
      </div>
    </div>
  );
}

// ── Main console ──────────────────────────────────────────────────────────
export function HeatmapsConsole() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [activityData, setActivityData] = useState<ActivityCell[]>([]);
  const [layer, setLayer] = useState<Layer>("demand");
  const [timeRange, setTimeRange] = useState<TimeRange>("now");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getHeatmapZones()
      .then((raw) => {
        const list = Array.isArray(raw) ? raw : [];
        if (list.length === 0) { setZones([]); return; }
        const maxDemand = Math.max(...list.map((z) => z.demand), 1);
        setZones(list.map((z, i) => toZone(z, i, maxDemand)));
      })
      .catch(() => setZones([]));

    getActivityHeatmap()
      .then((data) => setActivityData(Array.isArray(data) ? data : []))
      .catch(() => setActivityData([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const sortedZones = useMemo(() => {
    const key: keyof Zone = layer === "supply" ? "supply" : layer === "surge" ? "surge" : "demand";
    return [...zones].sort((a, b) => (b[key] as number) - (a[key] as number));
  }, [zones, layer]);

  const cityHourly = useMemo(() => {
    const sums = new Array(24).fill(0);
    for (const c of (activityData ?? [])) sums[c.hour] += c.count;
    return sums;
  }, [activityData]);

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
              <button key={l} type="button" onClick={() => setLayer(l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                {layerLabels[l]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
          {(Object.keys(timeLabels) as TimeRange[]).map((r) => {
            const active = timeRange === r;
            return (
              <button key={r} type="button" onClick={() => setTimeRange(r)}
                className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {timeLabels[r]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={`City ${layerLabels[layer].toLowerCase()} map`} bodyClass="">
          <div className="relative aspect-[16/9] overflow-hidden lg:aspect-auto lg:h-[420px]">
            <img src="/maps/map.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
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
                const score = layer === "supply" ? z.supply : layer === "surge" ? z.surge * 50 : z.demand;
                const tone = layer === "supply" ? gapTone(z.demand, z.supply) : demandTone(score);
                return (
                  <circle key={z.id} cx={z.position.x} cy={z.position.y} r={z.radius / 8}
                    fill={`url(#${toneGradient(tone)})`} />
                );
              })}
            </svg>

            {zones.map((z) => {
              const score = layer === "supply" ? z.supply : layer === "surge" ? z.surge * 50 : z.demand;
              const tone = layer === "supply" ? gapTone(z.demand, z.supply) : demandTone(score);
              const isSelected = selectedId === z.id;
              return (
                <button type="button" key={z.id}
                  onClick={() => { setSelectedId(z.id); setOpeningId(z.id); }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${z.position.y}%`, left: `${z.position.x}%` }}
                  aria-label={z.name}>
                  <span className={`flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold shadow-sm ring-1 ring-border backdrop-blur transition-transform ${isSelected ? "scale-110" : ""}`}>
                    <span className={`block h-2 w-2 rounded-full ${toneBg(tone)}`} />
                    <span className="text-foreground">{z.name}</span>
                  </span>
                </button>
              );
            })}

            {zones.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-xl border border-border bg-card/85 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
                  No demand data yet — zones appear when rides are made
                </span>
              </div>
            ) : null}

            <div className="absolute right-3 top-3 z-10 space-y-1 rounded-xl border border-border bg-card/85 px-3 py-2 text-[10px] backdrop-blur">
              <div className="flex items-center gap-1.5"><span className="block h-2 w-2 rounded-full bg-primary" /><span className="text-foreground">Healthy</span></div>
              <div className="flex items-center gap-1.5"><span className="block h-2 w-2 rounded-full bg-amber-500" /><span className="text-foreground">Rising</span></div>
              <div className="flex items-center gap-1.5"><span className="block h-2 w-2 rounded-full bg-red-500" /><span className="text-foreground">Critical</span></div>
            </div>
          </div>
        </Card>

        <Card title={`Top ${layerLabels[layer].toLowerCase()} zones`}>
          {sortedZones.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No zone data available yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {sortedZones.slice(0, 8).map((z) => {
                const tone = layer === "supply" ? gapTone(z.demand, z.supply) : demandTone(layer === "surge" ? z.surge * 50 : z.demand);
                const score = layer === "supply" ? `${z.supply}/100` : layer === "surge" ? `×${z.surge.toFixed(1)}` : `${z.demand}/100`;
                return (
                  <li key={z.id}>
                    <button type="button"
                      onClick={() => { setSelectedId(z.id); setOpeningId(z.id); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneBg(tone)}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-foreground">{z.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{z.district} · {z.trips24h} trips (7d)</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tonePillStyle(tone)}`}>
                        {score}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="City demand · last 90 days" bodyClass="p-4">
          <CitywideHourlyChart data={cityHourly} />
          <div className="mt-3 flex items-baseline justify-between text-[11px]">
            <span className="text-muted-foreground">Peak</span>
            <span className="font-bold text-foreground">
              {activityData.length > 0 ? `${cityPeakIdx.toString().padStart(2, "0")}:00` : "—"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Rides requested per hour, Kigali time.</p>
        </Card>

        <Card title="Supply gap" bodyClass="p-4">
          <p className="text-3xl font-bold tracking-tight text-foreground">{underservedCount}</p>
          <p className="text-[11px] text-muted-foreground">zones with demand &gt; supply by 30 pts</p>
          <ul className="mt-3 space-y-2 text-xs">
            {zones.filter((z) => z.demand - z.supply > 10).slice(0, 4).map((z) => {
              const gap = z.demand - z.supply;
              return (
                <li key={z.id} className="flex items-center justify-between">
                  <span className="truncate text-foreground">{z.name}</span>
                  <span className={`font-bold ${gap > 30 ? "text-red-600" : "text-amber-600"}`}>−{gap}</span>
                </li>
              );
            })}
            {zones.filter((z) => z.demand - z.supply > 10).length === 0 ? (
              <li className="text-muted-foreground">No gap data available.</li>
            ) : null}
          </ul>
        </Card>

        <Card title="Average fare by zone" bodyClass="p-4">
          {zones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fare data available yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {[...zones].sort((a, b) => b.avgFare - a.avgFare).slice(0, 5).map((z) => {
                const maxFare = Math.max(...zones.map((x) => x.avgFare), 1);
                const pct = (z.avgFare / maxFare) * 100;
                return (
                  <li key={z.id}>
                    <div className="flex items-center justify-between">
                      <span className="truncate text-foreground">{z.name}</span>
                      <span className="font-semibold text-foreground">{z.avgFare > 0 ? formatRWF(z.avgFare) : "—"}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <ZoneDetailModal
        zone={opening}
        onClose={() => setOpeningId(null)}
        onNotifyDrivers={(id) => {
          const z = zones.find((x) => x.id === id);
          setToast(z ? `Notification sent to drivers near ${z.name}` : "Notification sent");
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
