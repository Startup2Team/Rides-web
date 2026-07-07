"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { Avatar, Card } from "../_components";
import {
  RideDetailModal,
  type RideDetail,
  type RideStatus,
  type TimelineEvent,
  type NegotiationOffer,
} from "./ride-detail-modal";
import {
  getLiveRides,
  getLiveRide,
  interveneRide,
  getLiveMap,
  getDrivers,
  type Ride as ApiRide,
  type RideDetail as ApiRideDetail,
  type LiveMapDriver,
  type Driver as ApiDriver,
} from "@/lib/api";
import {
  isMockLiveRideId,
  MOCK_LIVE_RIDES,
  MOCK_LIVE_RIDE_DETAILS,
  MOCK_LIVE_MAP_DRIVERS,
  MOCK_ONLINE_DRIVERS,
} from "@/lib/mock-live-rides";

// ── Transport type helpers ────────────────────────────────────────────────

type VehicleType = "Moto Bike" | "Cab Taxi" | "Light Hilux" | "Heavy Fuso" | "Tuk Tuk";

const TRANSPORT_DISPLAY: Record<string, VehicleType> = {
  MOTO_BIKE:   "Moto Bike",
  CAB_TAXI:    "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO:  "Heavy Fuso",
  TUK_TUK:     "Tuk Tuk",
};

function toVehicleType(code: string): VehicleType {
  return TRANSPORT_DISPLAY[code] ?? ("Cab Taxi" as VehicleType);
}

// ── Status helpers ────────────────────────────────────────────────────────

function mapRideStatus(s: string): RideStatus {
  if (s === "NEGOTIATING") return "Negotiating";
  if (s === "DRIVER_EN_ROUTE" || s === "DRIVER_FOUND") return "Driver arriving";
  if (s === "DRIVER_ARRIVED") return "Driver arriving";
  if (s === "ON_TRIP") return "On trip";
  return "Searching";
}

// ── Mappers ───────────────────────────────────────────────────────────────

type Ride = RideDetail & {
  _transportCode: string;
  _driverId: string | null;
};

function mapApiRide(r: ApiRide): Ride {
  const custName = r.customer?.name ?? r.customer?.phone ?? "Unknown";
  const driverName = r.driver?.name ?? null;
  return {
    id: r.id,
    customer: { name: custName, phone: r.customer?.phone ?? "" },
    driver: driverName
      ? {
          name: driverName,
          phone: r.driver?.phone ?? "",
          vehicleType: toVehicleType(r.transport_type),
          plate: r.driver?.plate ?? "—",
          rating: 0,
        }
      : null,
    pickup: r.pickup_address,
    pickupLat: r.pickup_lat ?? null,
    pickupLng: r.pickup_lng ?? null,
    destination: r.destination_address,
    destLat: r.dest_lat ?? null,
    destLng: r.dest_lng ?? null,
    driverLat: null,
    driverLng: null,
    vehicleType: toVehicleType(r.transport_type),
    status: mapRideStatus(r.status),
    startedAt: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    eta: null,
    fare: r.agreed_fare ?? 0,
    paymentMethod: "Cash",
    district: "—",
    timeline: [],
    negotiation: [],
    _transportCode: r.transport_type,
    _driverId: r.driver?.id ?? null,
  };
}

function mapApiDetail(r: ApiRideDetail, base: Ride): Ride {
  const timeline: TimelineEvent[] = (r.events ?? []).map((e) => ({
    time: new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    event: e.type.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
    kind: e.type.includes("CANCEL") ? "alert"
      : e.type.includes("NEGOTIAT") ? "negotiation"
      : e.type.includes("TRIP") || e.type.includes("COMPLET") ? "trip"
      : "system",
  }));

  const negotiation: NegotiationOffer[] = (r.negotiation_rounds ?? []).map((n) => ({
    from: n.proposed_by === "DRIVER" ? "driver" : "customer",
    amount: n.amount,
    time: new Date(n.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return {
    ...base,
    timeline,
    negotiation,
    fare: r.agreed_fare ?? base.fare,
    driver: r.driver?.name
      ? {
          name: r.driver.name,
          phone: r.driver.phone ?? "",
          vehicleType: toVehicleType(r.transport_type),
          plate: r.driver.plate ?? "—",
          rating: 0,
        }
      : base.driver,
  };
}

// ── Tabs / filters ────────────────────────────────────────────────────────

const VEHICLE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All vehicles" },
  { id: "MOTO_BIKE", label: "Moto Bike" },
  { id: "CAB_TAXI", label: "Cab Taxi" },
  { id: "LIGHT_HILUX", label: "Light Hilux" },
  { id: "HEAVY_FUSO", label: "Heavy Fuso" },
];

// ── Styles ────────────────────────────────────────────────────────────────

const statusStyles: Record<RideStatus, string> = {
  Searching: "bg-muted text-muted-foreground",
  Negotiating: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  "Driver arriving": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  "On trip": "bg-primary/15 text-primary",
};

function formatRWF(n: number) {
  if (n === 0) return "—";
  return `${n.toLocaleString("en-US")} RWF`;
}

// ── Grid/table toggle + pagination — shared by all three tabs ─────────────

type DisplayMode = "grid" | "table";
const PAGE_SIZE = 8;

function paginate(length: number, page: number) {
  const totalPages = Math.max(1, Math.ceil(length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, length);
  return { totalPages, safePage, start, end };
}

function DisplayModeToggle({ value, onChange }: { value: DisplayMode; onChange: (v: DisplayMode) => void }) {
  const btn = (mode: DisplayMode, label: string, icon: React.ReactNode) => {
    const active = value === mode;
    return (
      <button
        type="button"
        onClick={() => onChange(mode)}
        aria-label={label}
        aria-pressed={active}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {icon}
      </button>
    );
  };
  return (
    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
      {btn(
        "grid",
        "Grid view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>,
      )}
      {btn(
        "table",
        "Table view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>,
      )}
    </div>
  );
}

function PaginationBar({
  start,
  end,
  total,
  safePage,
  totalPages,
  itemLabel,
  onPrev,
  onNext,
}: {
  start: number;
  end: number;
  total: number;
  safePage: number;
  totalPages: number;
  itemLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {total === 0 ? 0 : start + 1}–{end}
        </span>{" "}
        of <span className="font-semibold text-foreground">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={safePage === 1}
          className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-xs text-muted-foreground">
          Page <span className="font-semibold text-foreground">{safePage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={safePage === totalPages}
          className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Online drivers ───────────────────────────────────────────────────────
// A separate concept from live rides: every driver currently online, whether
// they're mid-trip or just available and waiting for one. Joins the drivers
// list (identity) with the live-map endpoint (position) by driver id.

type OnlineDriver = {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  _transportCode: string;
  plate: string;
  onTrip: boolean;
  lat: number | null;
  lng: number | null;
};

function buildOnlineDrivers(apiDrivers: ApiDriver[], positions: LiveMapDriver[]): OnlineDriver[] {
  const posById = new Map(positions.map((p) => [p.id, p]));
  return apiDrivers
    .filter((d) => d.is_online)
    .map((d) => {
      const pos = posById.get(d.id);
      return {
        id: d.id,
        name: d.full_name?.trim() || d.phone || "Unknown driver",
        phone: d.phone ?? "",
        vehicleType: toVehicleType(d.transport_type),
        _transportCode: d.transport_type,
        plate: d.vehicle_plate ?? "—",
        onTrip: Boolean(d.on_trip),
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
      };
    });
}

const MOCK_ONLINE_DRIVERS_DISPLAY: OnlineDriver[] = MOCK_ONLINE_DRIVERS.map((d) => ({
  id: d.id,
  name: d.name,
  phone: d.phone,
  vehicleType: toVehicleType(d.transportType),
  _transportCode: d.transportType,
  plate: d.plate,
  onTrip: d.onTrip,
  lat: d.lat,
  lng: d.lng,
}));

function OnlineDriverCard({ driver, onOpen }: { driver: OnlineDriver; onOpen: () => void }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={driver.name} size="sm" />
          <span className="truncate text-sm font-semibold text-foreground">{driver.name}</span>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            driver.onTrip ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100" : "bg-primary/15 text-primary"
          }`}
        >
          {driver.onTrip ? "On trip" : "Available"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</p>
          <p className="mt-0.5 text-xs font-bold text-foreground">{driver.vehicleType}</p>
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Plate</p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">{driver.plate}</p>
        </div>
      </div>
      <p className="mt-3 truncate text-[11px] text-muted-foreground">{driver.phone}</p>

      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-surface"
      >
        View more
      </button>
    </div>
  );
}

function DriversTable({
  drivers,
  onOpen,
}: {
  drivers: OnlineDriver[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plate</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {drivers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                No drivers online right now.
              </td>
            </tr>
          ) : (
            drivers.map((d) => (
              <tr key={d.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={d.name} size="sm" />
                    <span className="font-semibold tracking-tight text-foreground">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.vehicleType}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{d.plate}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      d.onTrip ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100" : "bg-primary/15 text-primary"
                    }`}
                  >
                    {d.onTrip ? "On trip" : "Available"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(d.id)}
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Ride card ─────────────────────────────────────────────────────────────

function RideCard({ ride, onOpen }: { ride: Ride; onOpen: () => void }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-foreground truncate">{ride.id.slice(0, 8)}…</span>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[ride.status]}`}>
          {ride.status}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <div className="mt-0.5 flex flex-col items-center">
          <span className="block h-2 w-2 rounded-full bg-primary" />
          <span className="my-0.5 block h-4 w-px bg-border" />
          <span className="block h-2 w-2 rounded-full bg-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">{ride.pickup}</p>
          <p className="mt-2 truncate text-xs font-semibold text-foreground">{ride.destination}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</p>
          <p className="mt-0.5 text-xs font-bold text-foreground">{ride.vehicleType}</p>
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            {ride.status === "Negotiating" || ride.status === "Searching" ? "Started" : "Fare"}
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {ride.status === "Negotiating" || ride.status === "Searching"
              ? ride.startedAt
              : formatRWF(ride.fare)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={ride.customer.name} tone="neutral" size="sm" />
          <span className="truncate text-[11px] text-foreground">{ride.customer.name}</span>
        </div>
        {ride.driver ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={ride.driver.name} size="sm" />
            <span className="truncate text-[11px] text-foreground">{ride.driver.name.split(" ")[0]}</span>
          </div>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">No driver yet</span>
        )}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-surface"
      >
        View more
      </button>
    </div>
  );
}

function RidesTable({ rides, onOpen }: { rides: Ride[]; onOpen: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ride</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Route</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fare</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rides.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                No active rides match your filters.
              </td>
            </tr>
          ) : (
            rides.map((r) => (
              <tr key={r.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-mono text-xs font-bold text-foreground">{r.id.slice(0, 8)}…</td>
                <td className="px-4 py-3">
                  <span className="block max-w-[240px] truncate text-xs text-foreground">
                    {r.pickup} → {r.destination}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.vehicleType}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-foreground">{r.customer.name}</td>
                <td className="px-4 py-3 text-xs text-foreground">{r.driver?.name ?? "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-foreground">{formatRWF(r.fare)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(r.id)}
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Rider card ────────────────────────────────────────────────────────────
// Same underlying ride data as the Active rides tab, framed around the rider
// instead. There's no standalone "rider location" data source — before pickup
// their position is the ride's pickup point, and once on trip they're with the
// driver, so "View more" opens the same route map that already plots both.

function riderPositionLabel(ride: Ride): string {
  if (ride.status === "On trip") return "With driver — en route to drop-off";
  if (ride.status === "Driver arriving") return `Waiting at ${ride.pickup}`;
  if (ride.status === "Negotiating") return `At pickup — agreeing fare · ${ride.pickup}`;
  return `Requested pickup at ${ride.pickup}`;
}

function RiderCard({ ride, onOpen }: { ride: Ride; onOpen: () => void }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={ride.customer.name} tone="neutral" />
          <span className="truncate text-sm font-semibold text-foreground">
            {ride.customer.name}
            {ride.driver ? <span className="font-normal text-muted-foreground"> ({ride.driver.name})</span> : null}
          </span>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[ride.status]}`}>
          {ride.status}
        </span>
      </div>

      <p className="mt-3 truncate text-xs text-muted-foreground">{riderPositionLabel(ride)}</p>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</p>
          <p className="mt-0.5 text-xs font-bold text-foreground">{ride.vehicleType}</p>
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">{ride.customer.phone}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-card text-xs font-medium text-foreground transition-colors hover:bg-surface"
      >
        View more
      </button>
    </div>
  );
}

function RidersTable({ rides, onOpen }: { rides: Ride[]; onOpen: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rider</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Position</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rides.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                No riders in an active ride right now.
              </td>
            </tr>
          ) : (
            rides.map((r) => (
              <tr key={r.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.customer.name} tone="neutral" size="sm" />
                    <span className="font-semibold tracking-tight text-foreground">
                      {r.customer.name}
                      {r.driver ? <span className="font-normal text-muted-foreground"> ({r.driver.name})</span> : null}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.customer.phone}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.vehicleType}</td>
                <td className="px-4 py-3 max-w-[240px] truncate text-xs text-foreground">{riderPositionLabel(r)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpen(r.id)}
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    View more
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main console ──────────────────────────────────────────────────────────

export function LiveRidesConsole() {
  const [viewMode, setViewMode] = useState<"rides" | "drivers" | "riders">("rides");
  const [rides, setRides] = useState<Ride[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tickAt, setTickAt] = useState(new Date());
  const tickInterval = useRef<NodeJS.Timeout | null>(null);

  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [page, setPage] = useState(1);

  const switchViewMode = (mode: "rides" | "drivers" | "riders") => {
    setViewMode(mode);
    setPage(1);
  };

  const router = useRouter();
  const [onlineDrivers, setOnlineDrivers] = useState<OnlineDriver[]>([]);
  const openDriver = (id: string) => router.push(`/admin/live-rides/drivers/${id}`);

  useEffect(() => {
    if (viewMode !== "drivers") return;
    let cancelled = false;
    const load = () => {
      Promise.all([getDrivers({ limit: "200", offset: "0" }), getLiveMap()])
        .then(([driversRes, mapRes]) => {
          if (cancelled) return;
          const real = buildOnlineDrivers(driversRes.drivers ?? [], mapRes.drivers ?? []);
          // Same rule as rides: mocks only stand in when there's genuinely no real online driver.
          setOnlineDrivers(real.length > 0 ? real : MOCK_ONLINE_DRIVERS_DISPLAY);
        })
        .catch(() => !cancelled && setOnlineDrivers(MOCK_ONLINE_DRIVERS_DISPLAY));
    };
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [viewMode]);

  // Real driver GPS positions, used to plot the driver's live spot in a ride's route map.
  const [driverPositions, setDriverPositions] = useState<LiveMapDriver[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getLiveMap()
        .then((d) => {
          if (cancelled) return;
          const real = d.drivers ?? [];
          setDriverPositions(real.length > 0 ? real : MOCK_LIVE_MAP_DRIVERS);
        })
        .catch(() => !cancelled && setDriverPositions(MOCK_LIVE_MAP_DRIVERS));
    };
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const mergeRides = useCallback((apiRides: ApiRide[]) => {
    // This page monitors real live activity, so mocks must never inflate a real count —
    // they only appear as a stand-in when the platform genuinely has zero active rides.
    const combined = apiRides.length > 0 ? apiRides : MOCK_LIVE_RIDES;
    setRides((prev) => {
      const existing = new Map(prev.map((r) => [r.id, r]));
      return combined.map((r) => {
        const e = existing.get(r.id);
        const mapped = mapApiRide(r);
        return e ? { ...mapped, timeline: e.timeline, negotiation: e.negotiation } : mapped;
      });
    });
  }, []);

  const loadRides = useCallback(() => {
    getLiveRides({ limit: "100", offset: "0" })
      .then((res) => mergeRides(res.rides ?? []))
      .catch(() => mergeRides([]));
  }, [mergeRides]);

  useEffect(() => {
    loadRides();
    tickInterval.current = setInterval(() => {
      setTickAt(new Date());
      loadRides();
    }, 15000);
    return () => { if (tickInterval.current) clearInterval(tickInterval.current); };
  }, [loadRides]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const applyDriverPosition = useCallback(
    (mapped: Ride): Ride => {
      if (!mapped._driverId) return mapped;
      const pos = driverPositions.find((d) => d.id === mapped._driverId);
      return pos ? { ...mapped, driverLat: pos.lat, driverLng: pos.lng } : mapped;
    },
    [driverPositions],
  );

  const openRide = (id: string) => {
    setOpeningId(id);
    if (isMockLiveRideId(id)) {
      const detail = MOCK_LIVE_RIDE_DETAILS[id];
      setRides((prev) => prev.map((r) => (r.id === id ? mapApiDetail(detail, r) : r)));
      return;
    }
    getLiveRide(id)
      .then((detail) => {
        setRides((prev) => prev.map((r) => (r.id === id ? mapApiDetail(detail, r) : r)));
      })
      .catch(() => null);
  };

  // Active rides = a driver is matched and something is actually moving.
  const movingRides = useMemo(
    () => rides.filter((r) => r.status === "Driver arriving" || r.status === "On trip"),
    [rides],
  );

  const filtered = useMemo(() => {
    return movingRides.filter((r) => {
      if (vehicleFilter !== "all" && r._transportCode !== vehicleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.customer.name.toLowerCase().includes(q) ||
          (r.driver?.name.toLowerCase().includes(q) ?? false) ||
          r.pickup.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [movingRides, vehicleFilter, query]);

  // Recomputed from driverPositions on every render (not via an effect + setState) so the
  // driver marker in the modal keeps moving as new positions arrive, without patching `rides` state.
  const openingRide = useMemo(() => {
    const base = openingId ? rides.find((r) => r.id === openingId) ?? null : null;
    return base ? applyDriverPosition(base) : null;
  }, [openingId, rides, applyDriverPosition]);

  const lastUpdate = `${tickAt.getHours().toString().padStart(2, "0")}:${tickAt.getMinutes().toString().padStart(2, "0")}`;

  const ridesPagination = paginate(filtered.length, page);
  const paginatedRides = filtered.slice(ridesPagination.start, ridesPagination.end);

  const driversPagination = paginate(onlineDrivers.length, page);
  const paginatedDrivers = onlineDrivers.slice(driversPagination.start, driversPagination.end);

  const ridersPagination = paginate(rides.length, page);
  const paginatedRiders = rides.slice(ridersPagination.start, ridersPagination.end);

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5">
        <button
          type="button"
          onClick={() => switchViewMode("rides")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "rides" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active rides
        </button>
        <button
          type="button"
          onClick={() => switchViewMode("drivers")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "drivers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Online drivers
        </button>
        <button
          type="button"
          onClick={() => switchViewMode("riders")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            viewMode === "riders" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Online riders
        </button>
      </div>

      {viewMode === "riders" ? (
        <Card
          title="Online riders"
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                {rides.length} in an active ride
              </span>
              <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
            </div>
          }
        >
          <div className={displayMode === "grid" ? "p-4" : ""}>
            {displayMode === "grid" ? (
              <p className="mb-4 rounded-xl border border-border bg-surface/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                Riders only show up here while they&apos;re part of an active ride — we don&apos;t
                yet track a customer&apos;s location while they&apos;re just browsing the app.
              </p>
            ) : null}
            {displayMode === "grid" ? (
              paginatedRiders.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No riders in an active ride right now.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedRiders.map((r) => (
                    <RiderCard key={r.id} ride={r} onOpen={() => openRide(r.id)} />
                  ))}
                </div>
              )
            ) : (
              <RidersTable rides={paginatedRiders} onOpen={openRide} />
            )}
          </div>
          <PaginationBar
            start={ridersPagination.start}
            end={ridersPagination.end}
            total={rides.length}
            safePage={ridersPagination.safePage}
            totalPages={ridersPagination.totalPages}
            itemLabel="riders"
            onPrev={() => setPage(Math.max(1, ridersPagination.safePage - 1))}
            onNext={() => setPage(Math.min(ridersPagination.totalPages, ridersPagination.safePage + 1))}
          />
        </Card>
      ) : viewMode === "drivers" ? (
        <>
          <Card
            title="Online drivers"
            action={
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {onlineDrivers.length} online
                </span>
                <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
              </div>
            }
          >
            <div className={displayMode === "grid" ? "p-4" : ""}>
              {displayMode === "grid" ? (
                paginatedDrivers.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    No drivers online right now.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedDrivers.map((d) => (
                      <OnlineDriverCard key={d.id} driver={d} onOpen={() => openDriver(d.id)} />
                    ))}
                  </div>
                )
              ) : (
                <DriversTable drivers={paginatedDrivers} onOpen={openDriver} />
              )}
            </div>
            <PaginationBar
              start={driversPagination.start}
              end={driversPagination.end}
              total={onlineDrivers.length}
              safePage={driversPagination.safePage}
              totalPages={driversPagination.totalPages}
              itemLabel="drivers"
              onPrev={() => setPage(Math.max(1, driversPagination.safePage - 1))}
              onNext={() => setPage(Math.min(driversPagination.totalPages, driversPagination.safePage + 1))}
            />
          </Card>
        </>
      ) : (
      <>
      <Card
        title="Active rides"
        action={
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Updated {lastUpdate}
            </span>
            <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
            <input
              type="search"
              placeholder="Search ride, name, area…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="h-8 w-56 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        }
      >
        <div className="flex items-center justify-start border-b border-border px-3 py-2">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
            {VEHICLE_FILTERS.map((v) => {
              const active = vehicleFilter === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setVehicleFilter(v.id);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={displayMode === "grid" ? "p-4" : ""}>
          {displayMode === "grid" ? (
            paginatedRides.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No active rides match your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedRides.map((r) => (
                  <RideCard key={r.id} ride={r} onOpen={() => openRide(r.id)} />
                ))}
              </div>
            )
          ) : (
            <RidesTable rides={paginatedRides} onOpen={openRide} />
          )}
        </div>
        <PaginationBar
          start={ridesPagination.start}
          end={ridesPagination.end}
          total={filtered.length}
          safePage={ridesPagination.safePage}
          totalPages={ridesPagination.totalPages}
          itemLabel="active rides"
          onPrev={() => setPage(Math.max(1, ridesPagination.safePage - 1))}
          onNext={() => setPage(Math.min(ridesPagination.totalPages, ridesPagination.safePage + 1))}
        />
      </Card>

      <RideDetailModal
        ride={openingRide}
        onClose={() => setOpeningId(null)}
        onMessageCustomer={(id) => {
          const r = rides.find((x) => x.id === id);
          setToast(r ? `Message sent to ${r.customer.name}` : "Message sent");
        }}
        onMessageDriver={(id) => {
          const r = rides.find((x) => x.id === id);
          setToast(r?.driver ? `Message sent to ${r.driver.name}` : "Message sent");
        }}
        onCancelRide={async (id) => {
          if (!isMockLiveRideId(id)) {
            try {
              await interveneRide(id, "cancel", "Admin cancelled ride");
            } catch { /* ignore */ }
          }
          setRides((prev) => prev.filter((x) => x.id !== id));
          setOpeningId(null);
          const r = rides.find((x) => x.id === id);
          setToast(`${r?.id.slice(0, 8) ?? "Ride"}… cancelled`);
        }}
      />
      </>
      )}

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
