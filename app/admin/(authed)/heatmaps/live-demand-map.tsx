"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { LiveDemandCluster } from "@/lib/live-demand-heatmap";
import { clustersToHeatLayerData } from "@/lib/live-demand-heatmap";

const KIGALI_CENTER: [number, number] = [-1.9577, 30.0619];
const KIGALI_ZOOM = 12;

function countMarkerHtml(count: number): string {
  const label = count > 9 ? "9+" : String(count);
  return `
    <span style="display:flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 5px;border-radius:999px;background:#007AFF;color:#fff;font-size:10px;font-weight:700;box-shadow:0 0 0 2px #fff;">
      ${label}
    </span>
  `;
}

export function LiveDemandMap({
  clusters,
  onClusterClick,
}: {
  clusters: LiveDemandCluster[];
  onClusterClick?: (cluster: LiveDemandCluster) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const onClusterClickRef = useRef(onClusterClick);
  onClusterClickRef.current = onClusterClick;

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const L = (await import("leaflet")).default;
      await import("leaflet.heat");
      if (cancelled || !containerRef.current) return;
      LRef.current = L;

      const map = L.map(containerRef.current, {
        center: KIGALI_CENTER,
        zoom: KIGALI_ZOOM,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
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

  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !markersLayerRef.current) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersLayerRef.current.clearLayers();

    const heatData = clustersToHeatLayerData(clusters);
    if (heatData.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 32,
        blur: 24,
        maxZoom: 17,
        minOpacity: 0.3,
        gradient: { 0.25: "#007AFF", 0.55: "#7c3aed", 0.85: "#f59e0b", 1: "#ef4444" },
      });
      heatLayerRef.current.addTo(map);

      const points: [number, number][] = [];
      clusters.forEach((c) => {
        points.push([c.lat, c.lng]);
        const bindClick = (layer: { on: (event: string, fn: () => void) => void }) => {
          if (onClusterClickRef.current) {
            layer.on("click", () => onClusterClickRef.current?.(c));
          }
        };
        if (c.riderCount > 1) {
          const marker = L.marker([c.lat, c.lng], {
            icon: L.divIcon({
              html: countMarkerHtml(c.riderCount),
              className: "",
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          })
            .bindTooltip(`${c.riderCount} riders · ${c.pickupLabel}`, { direction: "top" });
          bindClick(marker);
          marker.addTo(markersLayerRef.current);
        } else {
          const marker = L.circleMarker([c.lat, c.lng], {
            radius: 6,
            color: "#fff",
            weight: 2,
            fillColor: "#007AFF",
            fillOpacity: 0.9,
          }).bindTooltip(c.pickupLabel, { direction: "top" });
          bindClick(marker);
          marker.addTo(markersLayerRef.current);
        }
      });

      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.25), { animate: false });
    } else {
      map.setView(KIGALI_CENTER, KIGALI_ZOOM);
    }
  }, [clusters]);

  return (
    <div className="relative min-h-[380px] h-[min(58vh,680px)] overflow-hidden sm:min-h-[440px] xl:min-h-[480px] xl:h-[min(68vh,760px)]">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {clusters.length === 0 ? (
        <div className="absolute inset-0 z-[400] flex items-center justify-center">
          <span className="rounded-xl border border-border bg-card/90 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            No riders waiting for pickup right now — heat zones appear when customers request rides.
          </span>
        </div>
      ) : (
        <div className="pointer-events-none absolute right-3 top-3 z-[400] rounded-xl border border-border bg-card/90 px-3 py-2 text-[10px] backdrop-blur">
          <p className="font-semibold text-foreground">Live rider demand</p>
          <p className="mt-0.5 text-muted-foreground">Brighter = more riders at same pickup</p>
        </div>
      )}
    </div>
  );
}
