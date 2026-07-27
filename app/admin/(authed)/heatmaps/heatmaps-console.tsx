"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../_components";
import { ZoneDetailModal, type Zone } from "./zone-detail-modal";
import { LiveDemandMap } from "./live-demand-map";
import { getLiveDemandHeatmap, type LiveDemandHeatZone } from "@/lib/api";
import type { LiveDemandCluster } from "@/lib/live-demand-heatmap";

const KIGALI = { minLat: -2.030, maxLat: -1.890, minLng: 30.003, maxLng: 30.166 };
const PAGE_SIZE = 8;

function toMapPos(lat: number, lng: number) {
  const x = ((lng - KIGALI.minLng) / (KIGALI.maxLng - KIGALI.minLng)) * 100;
  const y = ((KIGALI.maxLat - lat) / (KIGALI.maxLat - KIGALI.minLat)) * 100;
  return { x: Math.max(3, Math.min(97, Math.round(x))), y: Math.max(3, Math.min(97, Math.round(y))) };
}

const KNOWN_DISTRICTS: Record<string, string> = {
  "-1.94,30.10": "Gasabo",
  "-1.95,30.06": "Gasabo",
  "-1.96,30.05": "Nyarugenge",
  "-1.94,30.07": "Gasabo",
  "-1.95,30.10": "Gasabo",
  "-1.97,30.05": "Nyarugenge",
  "-1.97,30.07": "Kicukiro",
  "-1.98,30.08": "Kicukiro",
  "-1.95,30.08": "Gasabo",
};

function districtFor(lat: number, lng: number): string {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (KNOWN_DISTRICTS[key]) return KNOWN_DISTRICTS[key];
  if (lat > -1.96) return "Gasabo";
  if (lat > -1.98) return "Nyarugenge";
  return "Kicukiro";
}

function toLiveZone(z: LiveDemandHeatZone, maxDemand: number): Zone {
  const demand = maxDemand > 0 ? Math.round((z.demand / maxDemand) * 100) : 0;
  const shortName = z.pickupLabel.replace(/,?\s*Kigali.*$/i, "").trim() || z.pickupLabel;
  return {
    id: `live-${z.lat.toFixed(3)}-${z.lng.toFixed(3)}`,
    name: shortName,
    district: districtFor(z.lat, z.lng),
    position: toMapPos(z.lat, z.lng),
    radius: 44 + Math.round((demand / 100) * 36),
    demand,
    supply: 0,
    drivers: 0,
    trips24h: z.waitingRiders,
    avgFare: Math.round(z.avg_fare),
    surge: 1.0,
    isLive: true,
    waitingRiders: z.waitingRiders,
    pickupLabel: z.pickupLabel,
    topRoutes: [],
    hourlyDemand: [],
    vehicleSplit: [],
  };
}

function heatZonesToClusters(zones: LiveDemandHeatZone[]): LiveDemandCluster[] {
  return zones.map((z) => ({
    lat: z.lat,
    lng: z.lng,
    riderCount: z.waitingRiders,
    pickupLabel: z.pickupLabel,
    rideIds: [],
    avgFare: z.avg_fare,
  }));
}

function waitingTone(count: number) {
  if (count >= 4) return "danger";
  if (count >= 2) return "warn";
  return "success";
}

function tonePillStyle(tone: "danger" | "warn" | "success") {
  return tone === "danger"
    ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100"
    : tone === "warn"
      ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100"
      : "bg-primary/15 text-primary";
}

function toneDot(tone: "danger" | "warn" | "success") {
  return tone === "danger" ? "bg-red-500" : tone === "warn" ? "bg-amber-500" : "bg-primary";
}

export function HeatmapsConsole() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [liveClusters, setLiveClusters] = useState<LiveDemandCluster[]>([]);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<Date | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadLive = () => {
      getLiveDemandHeatmap()
        .then((raw) => {
          if (cancelled) return;
          const list = Array.isArray(raw) ? raw : [];
          if (list.length === 0) {
            setZones([]);
            setLiveClusters([]);
            setLiveUpdatedAt(new Date());
            return;
          }
          const maxDemand = Math.max(...list.map((z) => z.demand), 1);
          setZones(list.map((z) => toLiveZone(z, maxDemand)));
          setLiveClusters(heatZonesToClusters(list));
          setLiveUpdatedAt(new Date());
        })
        .catch(() => {
          if (!cancelled) {
            setZones([]);
            setLiveClusters([]);
          }
        });
    };

    loadLive();
    const id = setInterval(loadLive, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const sortedZones = useMemo(
    () =>
      [...zones].sort(
        (a, b) => (b.waitingRiders ?? b.trips24h) - (a.waitingRiders ?? a.trips24h),
      ),
    [zones],
  );

  const totalPages = Math.max(1, Math.ceil(sortedZones.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sortedZones.length);
  const paginated = sortedZones.slice(start, end);

  const opening = openingId ? zones.find((z) => z.id === openingId) ?? null : null;
  const totalWaiting = sortedZones.reduce(
    (sum, z) => sum + (z.waitingRiders ?? z.trips24h),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-foreground">Live rider demand</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Waiting customers grouped by pickup in Kigali — refreshes every 15s
          </p>
        </div>
        {liveUpdatedAt ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Updated{" "}
            {liveUpdatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            · {totalWaiting} rider{totalWaiting === 1 ? "" : "s"} waiting
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_min(22rem,32%)] xl:items-start">
        <Card title="Live demand map" bodyClass="overflow-hidden rounded-b-2xl">
          <LiveDemandMap
            clusters={liveClusters}
            onClusterClick={(cluster) => {
              const match = zones.find(
                (z) =>
                  z.id ===
                  `live-${cluster.lat.toFixed(3)}-${cluster.lng.toFixed(3)}`,
              );
              if (match) setOpeningId(match.id);
            }}
          />
        </Card>

        <div className="xl:sticky xl:top-4">
        <Card
          title="Hot pickup zones"
          action={
            sortedZones.length > 0 ? (
              <span className="text-[10px] font-medium text-muted-foreground">
                {sortedZones.length} zone{sortedZones.length === 1 ? "" : "s"}
              </span>
            ) : null
          }
        >
          {sortedZones.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No riders waiting right now — zones appear when customers request rides.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {paginated.map((z) => {
                  const waiting = z.waitingRiders ?? z.trips24h;
                  const tone = waitingTone(waiting);
                  return (
                    <li key={z.id}>
                      <button
                        type="button"
                        onClick={() => setOpeningId(z.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
                      >
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneDot(tone)}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                            {z.name}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {z.district} · {waiting} rider{waiting === 1 ? "" : "s"} waiting
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tonePillStyle(tone)}`}
                        >
                          {waiting} waiting
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {sortedZones.length > PAGE_SIZE ? (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
                  <p className="text-xs text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {start + 1}–{end}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-foreground">{sortedZones.length}</span>{" "}
                    zones
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, safePage - 1))}
                      disabled={safePage === 1}
                      className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Page{" "}
                      <span className="font-semibold text-foreground">{safePage}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalPages}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                      disabled={safePage === totalPages}
                      className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Card>
        </div>
      </div>

      <ZoneDetailModal zone={opening} onClose={() => setOpeningId(null)} />
    </div>
  );
}
