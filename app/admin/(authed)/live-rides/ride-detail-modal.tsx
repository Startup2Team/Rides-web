"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Avatar } from "../_components";

export type RideStatus =
  | "Searching"
  | "Negotiating"
  | "Driver arriving"
  | "On trip";

export type TimelineEvent = {
  time: string;
  event: string;
  kind: "system" | "negotiation" | "trip" | "alert";
};

export type NegotiationOffer = {
  from: "customer" | "driver";
  amount: number;
  time: string;
};

export type RideDetail = {
  id: string;
  customer: { name: string; phone: string };
  driver: {
    name: string;
    phone: string;
    vehicleType: string;
    plate: string;
    rating: number;
  } | null;
  pickup: string;
  /** Optional until the backend admin API starts returning ride coordinates (currently only mobile does). */
  pickupLat: number | null;
  pickupLng: number | null;
  destination: string;
  destLat: number | null;
  destLng: number | null;
  /** Driver's live position, if we have one (from the live-map endpoint, joined by driver id). */
  driverLat: number | null;
  driverLng: number | null;
  vehicleType: string;
  status: RideStatus;
  startedAt: string;
  eta: string | null;
  fare: number;
  paymentMethod: string;
  district: string;
  timeline: TimelineEvent[];
  negotiation: NegotiationOffer[];
};

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

const statusStyles: Record<RideStatus, string> = {
  Searching: "bg-muted text-muted-foreground",
  Negotiating: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  "Driver arriving":
    "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  "On trip": "bg-primary/15 text-primary",
};

function ContactCard({
  role,
  name,
  phone,
  rating,
  meta,
  emptyLabel,
}: {
  role: "Customer" | "Driver";
  name: string | null;
  phone?: string;
  rating?: number;
  meta?: string;
  emptyLabel?: string;
}) {
  if (!name) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/40 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {role}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {emptyLabel ?? "Not assigned yet"}
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {role}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Avatar name={name} tone={role === "Driver" ? "primary" : "neutral"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">
            {name}
          </p>
          {meta ? (
            <p className="truncate text-[11px] text-muted-foreground">{meta}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className={role === "Customer" || rating === undefined ? "col-span-2" : ""}>
          <p className="text-muted-foreground">Phone</p>
          <p className="font-medium text-foreground">{phone}</p>
        </div>
        {role === "Driver" && rating !== undefined ? (
          <div>
            <p className="text-muted-foreground">Rating</p>
            <p className="font-medium text-foreground">
              {rating.toFixed(1)} <span className="text-amber-500">★</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const KIGALI_CENTER: [number, number] = [-1.9577, 30.0619];
const KIGALI_ZOOM = 12;
const PICKUP_HEX = "#007AFF";
const DEST_HEX = "#1f2937";
const DRIVER_HEX = "#f59e0b";

function pointMarkerHtml(color: string): string {
  return `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};box-shadow:0 0 0 2px #fff;"></span>`;
}

function driverMarkerHtml(): string {
  return `
    <span style="position:relative;display:inline-block;width:14px;height:14px;">
      <span style="position:absolute;inset:-6px;border-radius:50%;background:${DRIVER_HEX};opacity:.35;animation:rideRoutePulse 1.8s ease-out infinite;"></span>
      <span style="position:relative;display:block;width:14px;height:14px;border-radius:50%;background:${DRIVER_HEX};box-shadow:0 0 0 2px #fff;"></span>
    </span>
  `;
}

function RideRouteMap({ ride }: { ride: RideDetail }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const hasPickup = ride.pickupLat != null && ride.pickupLng != null;
  const hasDest = ride.destLat != null && ride.destLng != null;
  const hasDriver = ride.driverLat != null && ride.driverLng != null;
  const hasAnyPoint = hasPickup || hasDest || hasDriver;

  useEffect(() => {
    if (!hasAnyPoint) return;
    let cancelled = false;
    async function init() {
      const L = (await import("leaflet")).default;
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
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    }
    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setReady(false);
    };
  }, [ride.id, hasAnyPoint]);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || !layerRef.current) return;

    layerRef.current.clearLayers();
    const points: [number, number][] = [];

    if (hasPickup) {
      const p: [number, number] = [ride.pickupLat!, ride.pickupLng!];
      points.push(p);
      L.marker(p, { icon: L.divIcon({ html: pointMarkerHtml(PICKUP_HEX), className: "", iconSize: [14, 14], iconAnchor: [7, 7] }) })
        .bindTooltip("Pickup", { direction: "top", offset: [0, -8], permanent: false })
        .addTo(layerRef.current);
    }
    if (hasDest) {
      const p: [number, number] = [ride.destLat!, ride.destLng!];
      points.push(p);
      L.marker(p, { icon: L.divIcon({ html: pointMarkerHtml(DEST_HEX), className: "", iconSize: [14, 14], iconAnchor: [7, 7] }) })
        .bindTooltip("Drop-off", { direction: "top", offset: [0, -8], permanent: false })
        .addTo(layerRef.current);
    }
    if (hasDriver) {
      const p: [number, number] = [ride.driverLat!, ride.driverLng!];
      points.push(p);
      L.marker(p, { icon: L.divIcon({ html: driverMarkerHtml(), className: "", iconSize: [14, 14], iconAnchor: [7, 7] }) })
        .bindTooltip("Driver — current position", { direction: "top", offset: [0, -8] })
        .addTo(layerRef.current);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.3), { animate: false });
    }
  }, [ready, ride, hasPickup, hasDest, hasDriver]);

  return (
    <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-border bg-surface">
      {hasAnyPoint ? (
        <div ref={containerRef} className="absolute inset-0 z-0" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <p className="max-w-xs px-4 text-xs text-muted-foreground">
            Location data isn&apos;t available for this ride yet.
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex items-center justify-between gap-3 bg-card/85 px-3 py-2 text-[11px] backdrop-blur">
        <span className="truncate text-foreground">
          <span className="text-muted-foreground">From</span> {ride.pickup}
        </span>
        <span className="truncate text-foreground">
          <span className="text-muted-foreground">To</span> {ride.destination}
        </span>
      </div>

      <style>{`
        @keyframes rideRoutePulse {
          0% { transform: scale(.8); opacity: .55; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function TimelineRow({ event }: { event: TimelineEvent }) {
  const dotColor =
    event.kind === "alert"
      ? "bg-red-500"
      : event.kind === "negotiation"
        ? "bg-amber-500"
        : event.kind === "trip"
          ? "bg-primary"
          : "bg-muted-foreground";
  return (
    <li className="relative pl-6">
      <span
        className={`absolute left-1.5 top-1.5 block h-2 w-2 rounded-full ring-2 ring-card ${dotColor}`}
      />
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-foreground">{event.event}</p>
        <p className="text-[10px] text-muted-foreground">{event.time}</p>
      </div>
    </li>
  );
}

export function RideDetailModal({
  ride,
  onClose,
}: {
  ride: RideDetail | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!ride) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [ride, onClose]);

  if (!ride) return null;

  const shortId = ride.id.length > 12 ? `${ride.id.slice(0, 10)}…` : ride.id;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ride-detail-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="ride-detail-modal-panel relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5">
        <div className="border-b border-border bg-surface/30 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Trip inspection
              </p>
              <h2
                id="ride-detail-title"
                className="mt-1 truncate text-lg font-bold tracking-tight text-foreground"
              >
                {ride.pickup} → {ride.destination}
              </h2>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                  {shortId}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[ride.status]}`}
                >
                  {ride.status}
                </span>
                <span className="text-[11px] text-muted-foreground">{ride.vehicleType}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mx-auto mt-4 flex max-w-sm items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 sm:mx-0 sm:max-w-none sm:inline-flex">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Negotiated price
            </p>
            <p className="ml-3 text-base font-bold tracking-tight text-foreground">
              {ride.fare === 0 ? "—" : formatRWF(ride.fare)}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <RideRouteMap ride={ride} />

          <div className="grid gap-3 sm:grid-cols-2">
            <ContactCard
              role="Customer"
              name={ride.customer.name}
              phone={ride.customer.phone}
              meta="Rider"
            />
            <ContactCard
              role="Driver"
              name={ride.driver?.name ?? null}
              phone={ride.driver?.phone}
              rating={ride.driver?.rating}
              meta={
                ride.driver
                  ? `${ride.driver.vehicleType} · ${ride.driver.plate}`
                  : undefined
              }
              emptyLabel="No driver on this trip"
            />
          </div>

          {ride.negotiation.length > 0 ? (
            <div>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Negotiation history
              </p>
              <div className="mt-2 space-y-2 rounded-xl border border-border bg-surface/40 p-3">
                {ride.negotiation.map((n, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs ${
                      n.from === "customer"
                        ? "bg-card text-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <span className="font-semibold capitalize">
                      {n.from} offered
                    </span>
                    <span className="font-bold">{formatRWF(n.amount)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {n.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {ride.timeline.length > 0 ? (
            <div>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Trip timeline
              </p>
              <ol className="mt-2 space-y-3 border-l border-border pl-1">
                {ride.timeline.map((e, i) => (
                  <TimelineRow key={i} event={e} />
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        .ride-detail-modal-panel {
          animation: rideDetailModalIn 0.22s ease-out;
        }
        @keyframes rideDetailModalIn {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
