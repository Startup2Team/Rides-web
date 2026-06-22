"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { getLiveMap, type LiveMap, type LiveMapDriver } from "@/lib/api";

// Kigali center (rough)
const DEFAULT_CENTER: [number, number] = [-1.9577, 30.0619];
const DEFAULT_ZOOM = 12;

function driverIconHtml(d: LiveMapDriver): string {
  const color = d.onTrip ? "#f59e0b" : d.isOnline ? "#007AFF" : "rgba(0,0,0,0.55)";
  const ringActive = d.onTrip || d.isOnline;
  return `
    <span style="position:relative;display:inline-block;width:14px;height:14px;">
      ${ringActive
        ? `<span style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:.35;animation:taravelisPulse 1.8s ease-out infinite;"></span>`
        : ""}
      <span style="position:relative;display:block;width:14px;height:14px;border-radius:50%;background:${color};box-shadow:0 0 0 2px #fff;"></span>
    </span>
  `;
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, (Date.now() - t) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function LiveMapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driversLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const [data, setData] = useState<LiveMap | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  // Init the map once on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      // leaflet.heat patches L.heatLayer when imported — no need to bind a name
      await import("leaflet.heat");
      if (cancelled || !containerRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      driversLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch + auto-refresh data
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getLiveMap()
        .then((d) => !cancelled && (setData(d), setError(false)))
        .catch(() => !cancelled && setError(true));
    };
    load();
    const id = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Re-render labels every 30s so "Updated just now" stays fresh
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Apply data to map layers when data changes
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !data) return;

    const drivers = data.drivers ?? [];
    const heatPoints = data.heatPoints ?? [];

    // Drivers
    if (driversLayerRef.current) {
      driversLayerRef.current.clearLayers();
      drivers.forEach((d) => {
        const icon = L.divIcon({
          html: driverIconHtml(d),
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([d.lat, d.lng], { icon }).addTo(driversLayerRef.current);
      });
    }

    // Heat layer — recreate to avoid stale points
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    if (heatPoints.length > 0) {
      const maxWeight = Math.max(1, ...heatPoints.map((p) => p.weight));
      const heatData = heatPoints.map((p) => [p.lat, p.lng, p.weight / maxWeight]);
      // L.heatLayer exists at runtime via leaflet.heat
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 28,
        blur: 22,
        maxZoom: 17,
        minOpacity: 0.25,
        gradient: { 0.3: "#007AFF", 0.65: "#7c3aed", 0.9: "#f59e0b" },
      });
      heatLayerRef.current.addTo(map);
    }

    // Auto-fit to driver markers if there are any far from center
    if (drivers.length > 0) {
      const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng]));
      if (bounds.isValid()) {
        const current = map.getBounds();
        if (!current.contains(bounds)) {
          map.fitBounds(bounds.pad(0.2), { animate: false });
        }
      }
    }
  }, [data]);

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Live Operations Map
          </h2>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold text-foreground">
            {data ? `${data.activeRides.toLocaleString()} active rides` : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {error ? "Connection error" : data ? `Updated ${timeAgo(data.updatedAt)}` : "Loading…"}
            {tick >= 0 ? "" : ""}
          </div>
        </div>
      </div>

      <div className="relative aspect-[16/9]">
        <div ref={containerRef} className="absolute inset-0 z-0" />

        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-xl border border-border bg-card/85 px-3 py-2 shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Online drivers
              </div>
              <div className="text-base font-bold text-foreground">
                {data?.onlineDrivers ?? "—"}
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hot zones
              </div>
              <div className="flex items-center gap-1 text-base font-bold text-foreground">
                {data?.hotZones ?? "—"}
                {data && data.hotZones > 0 ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Pulse keyframe for driver markers */}
        <style>{`
          @keyframes taravelisPulse {
            0% { transform: scale(.8); opacity: .55; }
            70% { transform: scale(1.8); opacity: 0; }
            100% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
