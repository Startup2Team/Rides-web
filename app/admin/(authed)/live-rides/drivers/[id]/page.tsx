"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { getDriver, getLiveMap, type LiveMapDriver } from "@/lib/api";
import { isMockDriverId, MOCK_DRIVERS } from "@/lib/mock-drivers";
import { MOCK_LIVE_MAP_DRIVERS, MOCK_ONLINE_DRIVERS, nearestKigaliPlace } from "@/lib/mock-live-rides";
import { formatTransportType } from "@/lib/drivers";
import { Avatar, StatusPill } from "../../../_components";

type DriverIdentity = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  approvalStatus: string | null;
  licenseNumber: string | null;
};

function identityFromMock(id: keyof typeof MOCK_DRIVERS): DriverIdentity {
  const d = MOCK_DRIVERS[id];
  return {
    id: d.id,
    name: d.full_name?.trim() || d.phone || "Driver",
    phone: d.phone ?? "—",
    vehicle: formatTransportType(d.transport_type),
    plate: d.vehicle_plate ?? "—",
    approvalStatus: d.approval_status ?? null,
    licenseNumber: d.license_number ?? null,
  };
}

function CurrentPositionMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      const icon = L.divIcon({
        html: `<span style="position:relative;display:inline-block;width:16px;height:16px;">
                 <span style="position:absolute;inset:-6px;border-radius:50%;background:#007AFF;opacity:.35;animation:driverPagePulse 1.8s ease-out infinite;"></span>
                 <span style="position:relative;display:block;width:16px;height:16px;border-radius:50%;background:#007AFF;box-shadow:0 0 0 2px #fff;"></span>
               </span>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([lat, lng], { icon }).addTo(map);
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
  }, [lat, lng]);

  return (
    <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-border">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      <style>{`
        @keyframes driverPagePulse {
          0% { transform: scale(.8); opacity: .55; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function DriverActivityPage() {
  const { id } = useParams() as { id: string };

  const [identity, setIdentity] = useState<DriverIdentity | null>(null);
  const [position, setPosition] = useState<LiveMapDriver | null>(null);
  const [positionIsLive, setPositionIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const identityPromise: Promise<DriverIdentity | null> = isMockDriverId(id)
      ? Promise.resolve(identityFromMock(id))
      : getDriver(id)
          .then((d) => ({
            id: d.id,
            name: d.full_name?.trim() || d.phone || "Driver",
            phone: d.phone ?? "—",
            vehicle: formatTransportType(d.transport_type),
            plate: d.vehicle_plate ?? "—",
            approvalStatus: d.approval_status ?? null,
            licenseNumber: d.license_number ?? null,
          }))
          .catch(() => {
            const fallback = MOCK_ONLINE_DRIVERS.find((d) => d.id === id);
            return fallback
              ? {
                  id: fallback.id,
                  name: fallback.name,
                  phone: fallback.phone,
                  vehicle: formatTransportType(fallback.transportType),
                  plate: fallback.plate,
                  approvalStatus: null,
                  licenseNumber: null,
                }
              : null;
          });

    const positionPromise = getLiveMap()
      .then((res) => res.drivers ?? [])
      .catch(() => [] as LiveMapDriver[]);

    Promise.all([identityPromise, positionPromise]).then(([ident, drivers]) => {
      if (cancelled) return;
      if (!ident) {
        setError("Driver not found.");
        setLoading(false);
        return;
      }
      setIdentity(ident);
      const real = drivers.find((d) => d.id === id) ?? null;
      const mockPos = MOCK_LIVE_MAP_DRIVERS.find((d) => d.id === id) ?? null;
      setPosition(real ?? mockPos);
      setPositionIsLive(real != null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading driver activity…</p>
      </div>
    );
  }

  if (error || !identity) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <p className="text-sm font-semibold text-red-600">Error loading driver</p>
        <p className="mt-1 text-xs text-muted-foreground">{error || "Driver not found."}</p>
        <Link
          href="/admin/live-rides"
          className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground"
        >
          ← Back to Live Rides
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Avatar name={identity.name} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Driver Activity</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{identity.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{identity.phone}</span>
              <span aria-hidden>·</span>
              <span>{identity.vehicle} · {identity.plate}</span>
              {identity.approvalStatus ? (
                <>
                  <span aria-hidden>·</span>
                  <StatusPill status={identity.approvalStatus} tone={identity.approvalStatus.toUpperCase() === "APPROVED" ? "success" : "neutral"} />
                </>
              ) : null}
            </div>
          </div>
        </div>
        <Link
          href="/admin/live-rides"
          className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-surface"
        >
          ← Back to Live Rides
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Waiting location</h2>
          {position ? (
            <span className="text-[11px] font-medium text-muted-foreground">
              {positionIsLive ? "Live GPS" : "Demo position"}
            </span>
          ) : null}
        </div>
        {position ? (
          <div className="mt-4 space-y-3">
            <CurrentPositionMap lat={position.lat} lng={position.lng} />
            <p className="text-sm font-medium text-foreground">
              {nearestKigaliPlace(position.lat, position.lng)}, Kigali
            </p>
            <p className="text-[11px] text-muted-foreground">
              Waiting for a ride · {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            </p>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
            No current position available — this driver may be offline or on a trip.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Ride history</h2>
        <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          Not available yet — the admin API doesn&apos;t currently support fetching a specific
          driver&apos;s past rides (only rides can be searched/filtered by status and vehicle type,
          not by driver). This needs a backend change before it can show real data here.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Location history</h2>
        <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
          Not available — the backend only stores each driver&apos;s single current position
          (it gets overwritten on every update) and keeps no movement trail. Showing a real
          location history here would need a new log table and a change to how the mobile app
          reports position.
        </p>
      </div>
    </div>
  );
}
