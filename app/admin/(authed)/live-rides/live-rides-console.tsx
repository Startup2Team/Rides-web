"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  getLiveMap,
  getDrivers,
  type Ride as ApiRide,
  type RideDetail as ApiRideDetail,
  type LiveMapDriver,
  type Driver as ApiDriver,
} from "@/lib/api";

function nearestKigaliPlace(lat: number, lng: number): string {
  return "Kigali, Rwanda";
}

// ── Transport type helpers ────────────────────────────────────────────────

type VehicleType = "Moto Bike" | "Cab Taxi" | "Light Hilux" | "Heavy Fuso";

const TRANSPORT_DISPLAY: Record<string, VehicleType> = {
  MOTO_BIKE:   "Moto Bike",
  CAB_TAXI:    "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO:  "Heavy Fuso",
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

const RIDER_STATUS_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "Searching", label: "Searching" },
  { id: "Negotiating", label: "Negotiating" },
  { id: "Driver arriving", label: "Driver arriving" },
];

function matchesSearch(values: (string | undefined | null)[], query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return values.some((v) => v?.toLowerCase().includes(q));
}

function FilterChipBar({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function LiveRidesFilterBar({
  vehicleFilter,
  onVehicleFilter,
  statusFilter,
  onStatusFilter,
  query,
  onQuery,
  searchPlaceholder,
}: {
  vehicleFilter: string;
  onVehicleFilter: (id: string) => void;
  statusFilter?: string;
  onStatusFilter?: (id: string) => void;
  query: string;
  onQuery: (q: string) => void;
  searchPlaceholder: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <FilterChipBar options={VEHICLE_FILTERS} value={vehicleFilter} onChange={onVehicleFilter} />
        {statusFilter != null && onStatusFilter ? (
          <FilterChipBar options={RIDER_STATUS_FILTERS} value={statusFilter} onChange={onStatusFilter} />
        ) : null}
      </div>
      <input
        type="search"
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        className="h-8 w-full shrink-0 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary lg:w-56"
      />
    </div>
  );
}

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
// Drivers who are online and waiting for a ride — not on an active trip.
// Location is shown inline (same pattern as Online riders): a Kigali area name
// inferred from live GPS until the backend returns a proper address.

type OnlineDriver = {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  _transportCode: string;
  plate: string;
  lat: number | null;
  lng: number | null;
  positionLabel: string;
};

function driverWaitingLabel(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "Location unavailable — Kigali, Rwanda";
  return `Waiting at ${nearestKigaliPlace(lat, lng)}, Kigali`;
}

function buildOnlineDrivers(apiDrivers: ApiDriver[], positions: LiveMapDriver[]): OnlineDriver[] {
  const posById = new Map(positions.map((p) => [p.id, p]));
  return apiDrivers
    .filter((d) => {
      if (!d.is_online || d.on_trip) return false;
      const pos = posById.get(d.id);
      return !pos?.onTrip;
    })
    .map((d) => {
      const pos = posById.get(d.id);
      const lat = pos?.lat ?? null;
      const lng = pos?.lng ?? null;
      return {
        id: d.id,
        name: d.full_name?.trim() || d.phone || "Unknown driver",
        phone: d.phone ?? "",
        vehicleType: toVehicleType(d.transport_type),
        _transportCode: d.transport_type,
        plate: d.vehicle_plate ?? "—",
        lat,
        lng,
        positionLabel: driverWaitingLabel(lat, lng),
      };
    });
}

function OnlineDriverCard({ driver }: { driver: OnlineDriver }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={driver.name} size="sm" />
          <span className="truncate text-sm font-semibold text-foreground">{driver.name}</span>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          Waiting
        </span>
      </div>

      <p className="mt-3 truncate text-xs text-muted-foreground">{driver.positionLabel}</p>

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
    </div>
  );
}

function DriversTable({ drivers }: { drivers: OnlineDriver[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plate</th>
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Position</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {drivers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                No drivers waiting for rides right now.
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
                <td className="px-4 py-3 max-w-[280px] truncate text-xs text-foreground">{d.positionLabel}</td>
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
            Negotiated price
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {formatRWF(ride.fare)}
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
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price</th>
            <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rides.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                No rides on trip right now.
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

// ── Online riders (customers) ─────────────────────────────────────────────
// Customers with a live ride request who are not on trip yet — searching,
// negotiating, or waiting for the driver. On-trip customers appear under Active rides.

function riderPositionLabel(ride: Ride): string {
  const place = ride.pickup.toLowerCase().includes("kigali")
    ? ride.pickup
    : `${ride.pickup}, Kigali`;
  if (ride.status === "Driver arriving") return `Waiting at ${place} — driver en route`;
  if (ride.status === "Negotiating") return `At ${place} — negotiating fare`;
  return `Requested pickup at ${place}`;
}

function RiderCard({ ride }: { ride: Ride }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={ride.customer.name} tone="neutral" size="sm" />
          <span className="truncate text-sm font-semibold text-foreground">{ride.customer.name}</span>
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

      {ride.driver ? (
        <p className="mt-3 truncate text-[11px] text-muted-foreground">
          Matched driver: <span className="font-medium text-foreground">{ride.driver.name}</span>
        </p>
      ) : (
        <p className="mt-3 truncate text-[11px] text-muted-foreground">No driver matched yet</p>
      )}

      <p className="mt-1 truncate text-[11px] text-muted-foreground">
        To {ride.destination}
      </p>
    </div>
  );
}

function RidersTable({ rides }: { rides: Ride[] }) {
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
            <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Destination</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rides.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                No riders waiting for a driver right now.
              </td>
            </tr>
          ) : (
            rides.map((r) => (
              <tr key={r.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.customer.name} tone="neutral" size="sm" />
                    <span className="font-semibold tracking-tight text-foreground">{r.customer.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.customer.phone}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.vehicleType}</td>
                <td className="px-4 py-3 max-w-[280px] truncate text-xs text-foreground">{riderPositionLabel(r)}</td>
                <td className="px-4 py-3 max-w-[180px] truncate text-xs text-muted-foreground">{r.destination}</td>
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
  const [riderStatusFilter, setRiderStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [tickAt, setTickAt] = useState(new Date());
  const tickInterval = useRef<NodeJS.Timeout | null>(null);

  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");
  const [page, setPage] = useState(1);

  const switchViewMode = (mode: "rides" | "drivers" | "riders") => {
    setViewMode(mode);
    setPage(1);
    setQuery("");
    setVehicleFilter("all");
    setRiderStatusFilter("all");
  };

  const [onlineDrivers, setOnlineDrivers] = useState<OnlineDriver[]>([]);

  useEffect(() => {
    if (viewMode !== "drivers") return;
    let cancelled = false;
    const load = () => {
      Promise.all([getDrivers({ limit: "200", offset: "0" }), getLiveMap()])
        .then(([driversRes, mapRes]) => {
          if (cancelled) return;
          const real = buildOnlineDrivers(driversRes.drivers ?? [], mapRes.drivers ?? []);
          setOnlineDrivers(real);
        })
        .catch(() => !cancelled && setOnlineDrivers([]));
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
          setDriverPositions(d.drivers ?? []);
        })
        .catch(() => !cancelled && setDriverPositions([]));
    };
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const mergeRides = useCallback((apiRides: ApiRide[]) => {
    setRides((prev) => {
      const existing = new Map(prev.map((r) => [r.id, r]));
      return apiRides.map((r) => {
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
    getLiveRide(id)
      .then((detail) => {
        setRides((prev) => prev.map((r) => (r.id === id ? mapApiDetail(detail, r) : r)));
      })
      .catch(() => null);
  };

  // Active rides = driver and rider are en route (on trip only).
  const movingRides = useMemo(
    () => rides.filter((r) => r.status === "On trip"),
    [rides],
  );

  // Online riders = customers waiting for a driver (not on trip yet).
  const waitingRiders = useMemo(
    () => rides.filter((r) => r.status !== "On trip"),
    [rides],
  );

  const filtered = useMemo(() => {
    return movingRides.filter((r) => {
      if (vehicleFilter !== "all" && r._transportCode !== vehicleFilter) return false;
      return matchesSearch(
        [r.id, r.customer.name, r.customer.phone, r.driver?.name, r.driver?.plate, r.pickup, r.destination],
        query,
      );
    });
  }, [movingRides, vehicleFilter, query]);

  const filteredDrivers = useMemo(() => {
    return onlineDrivers.filter((d) => {
      if (vehicleFilter !== "all" && d._transportCode !== vehicleFilter) return false;
      return matchesSearch([d.name, d.phone, d.plate, d.positionLabel, d.vehicleType], query);
    });
  }, [onlineDrivers, vehicleFilter, query]);

  const filteredWaitingRiders = useMemo(() => {
    return waitingRiders.filter((r) => {
      if (vehicleFilter !== "all" && r._transportCode !== vehicleFilter) return false;
      if (riderStatusFilter !== "all" && r.status !== riderStatusFilter) return false;
      return matchesSearch(
        [r.id, r.customer.name, r.customer.phone, r.driver?.name, r.pickup, r.destination],
        query,
      );
    });
  }, [waitingRiders, vehicleFilter, riderStatusFilter, query]);

  // Recomputed from driverPositions on every render (not via an effect + setState) so the
  // driver marker in the modal keeps moving as new positions arrive, without patching `rides` state.
  const openingRide = useMemo(() => {
    const base = openingId ? rides.find((r) => r.id === openingId) ?? null : null;
    return base ? applyDriverPosition(base) : null;
  }, [openingId, rides, applyDriverPosition]);

  const lastUpdate = `${tickAt.getHours().toString().padStart(2, "0")}:${tickAt.getMinutes().toString().padStart(2, "0")}`;

  const ridesPagination = paginate(filtered.length, page);
  const paginatedRides = filtered.slice(ridesPagination.start, ridesPagination.end);

  const driversPagination = paginate(filteredDrivers.length, page);
  const paginatedDrivers = filteredDrivers.slice(driversPagination.start, driversPagination.end);

  const ridersPagination = paginate(filteredWaitingRiders.length, page);
  const paginatedRiders = filteredWaitingRiders.slice(ridersPagination.start, ridersPagination.end);

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
                {filteredWaitingRiders.length} waiting for a driver
              </span>
              <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
            </div>
          }
        >
          <LiveRidesFilterBar
            vehicleFilter={vehicleFilter}
            onVehicleFilter={(id) => {
              setVehicleFilter(id);
              setPage(1);
            }}
            statusFilter={riderStatusFilter}
            onStatusFilter={(id) => {
              setRiderStatusFilter(id);
              setPage(1);
            }}
            query={query}
            onQuery={(q) => {
              setQuery(q);
              setPage(1);
            }}
            searchPlaceholder="Search rider, phone, pickup…"
          />
          <div className={displayMode === "grid" ? "p-4" : ""}>
            {displayMode === "grid" ? (
              <p className="mb-4 rounded-xl border border-border bg-surface/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                Customers with an open ride request — searching, negotiating, or waiting
                for pickup. Their location is the requested pickup point in Kigali (placeholder
                until live customer GPS is available from the backend).
              </p>
            ) : null}
            {displayMode === "grid" ? (
              paginatedRiders.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {waitingRiders.length === 0
                    ? "No riders waiting for a driver right now."
                    : "No riders match your filters."}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedRiders.map((r) => (
                    <RiderCard key={r.id} ride={r} />
                  ))}
                </div>
              )
            ) : (
              <RidersTable rides={paginatedRiders} />
            )}
          </div>
          <PaginationBar
            start={ridersPagination.start}
            end={ridersPagination.end}
            total={filteredWaitingRiders.length}
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
                  {filteredDrivers.length} waiting for rides
                </span>
                <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
              </div>
            }
          >
            <LiveRidesFilterBar
              vehicleFilter={vehicleFilter}
              onVehicleFilter={(id) => {
                setVehicleFilter(id);
                setPage(1);
              }}
              query={query}
              onQuery={(q) => {
                setQuery(q);
                setPage(1);
              }}
              searchPlaceholder="Search driver, plate, area…"
            />
            <div className={displayMode === "grid" ? "p-4" : ""}>
              {displayMode === "grid" ? (
                <p className="mb-4 rounded-xl border border-border bg-surface/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                  Drivers who are online and waiting for a ride. Their position is shown
                  directly below each name — e.g. a Kigali area from live GPS (demo placeholders
                  until the backend returns street addresses).
                </p>
              ) : null}
              {displayMode === "grid" ? (
                paginatedDrivers.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    {onlineDrivers.length === 0
                      ? "No drivers waiting for rides right now."
                      : "No drivers match your filters."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedDrivers.map((d) => (
                      <OnlineDriverCard key={d.id} driver={d} />
                    ))}
                  </div>
                )
              ) : (
                <DriversTable drivers={paginatedDrivers} />
              )}
            </div>
            <PaginationBar
              start={driversPagination.start}
              end={driversPagination.end}
              total={filteredDrivers.length}
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
            <span className="text-[11px] font-medium text-muted-foreground">
              {filtered.length} on trip
            </span>
            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Updated {lastUpdate}
            </span>
            <DisplayModeToggle value={displayMode} onChange={setDisplayMode} />
          </div>
        }
      >
        <LiveRidesFilterBar
          vehicleFilter={vehicleFilter}
          onVehicleFilter={(id) => {
            setVehicleFilter(id);
            setPage(1);
          }}
          query={query}
          onQuery={(q) => {
            setQuery(q);
            setPage(1);
          }}
          searchPlaceholder="Search ride, name, pickup…"
        />

        <div className={displayMode === "grid" ? "p-4" : ""}>
          {displayMode === "grid" ? (
            paginatedRides.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {movingRides.length === 0
                  ? "No rides on trip right now."
                  : "No rides match your filters."}
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
      />
      </>
      )}

    </div>
  );
}
