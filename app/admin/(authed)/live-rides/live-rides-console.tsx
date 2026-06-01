"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Card } from "../_components";
import {
  RideDetailModal,
  type RideDetail,
  type RideStatus,
} from "./ride-detail-modal";
import { getLiveRides, type Ride as ApiRide } from "@/lib/api";

function mapRideStatus(s: string): RideStatus {
  if (s === "NEGOTIATING") return "Negotiating";
  if (s === "DRIVER_ARRIVING") return "Driver arriving";
  if (s === "ON_TRIP" || s === "IN_PROGRESS") return "On trip";
  return "Searching";
}

function mapApiRide(r: ApiRide): Ride {
  return {
    id: r.id,
    customer: { name: r.customer_name, phone: "", rating: 0 },
    driver: r.driver_name
      ? { name: r.driver_name, phone: "", vehicleType: r.transport_type, plate: "—", rating: 0 }
      : null,
    pickup: r.pickup_location,
    destination: r.dropoff_location,
    vehicleType: "Cab Taxi",
    status: mapRideStatus(r.status),
    startedAt: new Date(r.created_at).toLocaleString(),
    eta: null,
    fare: r.fare,
    paymentMethod: "MTN MoMo",
    district: "—",
    timeline: [],
    negotiation: [],
    position: { x: Math.random() * 80 + 10, y: Math.random() * 70 + 10 },
  };
}

type VehicleType = "Moto Bike" | "Cab Taxi" | "Light Hilux" | "Heavy Fuso";

type Ride = RideDetail & {
  position: { x: number; y: number };
};

type Tab = { id: "all" | RideStatus; label: string };

const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Searching", label: "Searching" },
  { id: "Negotiating", label: "Negotiating" },
  { id: "Driver arriving", label: "Driver arriving" },
  { id: "On trip", label: "On trip" },
];

const VEHICLE_FILTERS: { id: VehicleType | "all"; label: string }[] = [
  { id: "all", label: "All vehicles" },
  { id: "Moto Bike", label: "Moto Bike" },
  { id: "Cab Taxi", label: "Cab Taxi" },
  { id: "Light Hilux", label: "Light Hilux" },
  { id: "Heavy Fuso", label: "Heavy Fuso" },
];

const statusStyles: Record<RideStatus, string> = {
  Searching: "bg-muted text-muted-foreground",
  Negotiating: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  "Driver arriving":
    "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  "On trip": "bg-primary/15 text-primary",
};

const pinColor: Record<RideStatus, string> = {
  Searching: "bg-muted-foreground",
  Negotiating: "bg-amber-500",
  "Driver arriving": "bg-sky-500",
  "On trip": "bg-primary",
};

const vehicleEmoji: Record<VehicleType, string> = {
  "Moto Bike": "M",
  "Cab Taxi": "C",
  "Light Hilux": "H",
  "Heavy Fuso": "F",
};

function formatRWF(n: number) {
  if (n === 0) return "—";
  return `${n.toLocaleString("en-US")} RWF`;
}

function LiveMap({
  rides,
  selectedId,
  onSelect,
}: {
  rides: Ride[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative aspect-[16/8] overflow-hidden rounded-2xl border border-border bg-card">
      <img
        src="/maps/map.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      {rides.map((r) => {
        const isSelected = selectedId === r.id;
        return (
          <button
            type="button"
            key={r.id}
            onClick={() => onSelect(r.id)}
            aria-label={`${r.id} — ${r.status}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${r.position.y}%`, left: `${r.position.x}%` }}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              {r.status !== "Searching" ? (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${pinColor[r.status]}`}
                />
              ) : null}
              <span
                className={`relative flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-card transition-transform ${
                  pinColor[r.status]
                } ${isSelected ? "scale-150" : ""}`}
              >
                {vehicleEmoji[r.vehicleType]}
              </span>
            </span>
          </button>
        );
      })}

      <div className="absolute left-4 top-4 z-10 rounded-xl border border-border bg-card/85 px-3 py-2 text-[11px] backdrop-blur">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Live · {rides.length} rides
        </div>
      </div>

      <div className="absolute right-4 top-4 z-10 space-y-1 rounded-xl border border-border bg-card/85 px-3 py-2 text-[10px] backdrop-blur">
        {(["On trip", "Driver arriving", "Negotiating", "Searching"] as RideStatus[]).map(
          (s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`block h-2 w-2 rounded-full ${pinColor[s]}`} />
              <span className="text-foreground">{s}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function RideCard({
  ride,
  onOpen,
}: {
  ride: Ride;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-foreground">
          {ride.id}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[ride.status]}`}
        >
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
          <p className="truncate text-xs font-semibold text-foreground">
            {ride.pickup}
          </p>
          <p className="mt-2 truncate text-xs font-semibold text-foreground">
            {ride.destination}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle
          </p>
          <p className="mt-0.5 text-xs font-bold text-foreground">
            {ride.vehicleType}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            {ride.status === "Negotiating" || ride.status === "Searching"
              ? "Started"
              : "Fare · ETA"}
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {ride.status === "Negotiating" || ride.status === "Searching"
              ? ride.startedAt
              : `${formatRWF(ride.fare)} · ${ride.eta ?? "—"}`}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={ride.customer.name} tone="neutral" size="sm" />
          <span className="truncate text-[11px] text-foreground">
            {ride.customer.name}
          </span>
        </div>
        {ride.driver ? (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={ride.driver.name} size="sm" />
            <span className="truncate text-[11px] text-foreground">
              {ride.driver.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            No driver yet
          </span>
        )}
      </div>
    </button>
  );
}

export function LiveRidesConsole() {
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    getLiveRides({ limit: "100", offset: "0" })
      .then((res) => setRides((res.rides ?? []).map(mapApiRide)))
      .catch(() => null);
  }, []);
  const [tab, setTab] = useState<Tab["id"]>("all");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleType | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tickAt, setTickAt] = useState(new Date());
  const tickInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    tickInterval.current = setInterval(() => setTickAt(new Date()), 15000);
    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (vehicleFilter !== "all" && r.vehicleType !== vehicleFilter) return false;
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
  }, [rides, tab, vehicleFilter, query]);

  const counts: Record<Tab["id"], number> = useMemo(
    () => ({
      all: rides.length,
      Searching: rides.filter((r) => r.status === "Searching").length,
      Negotiating: rides.filter((r) => r.status === "Negotiating").length,
      "Driver arriving": rides.filter((r) => r.status === "Driver arriving").length,
      "On trip": rides.filter((r) => r.status === "On trip").length,
    }),
    [rides],
  );

  const openingRide = openingId ? rides.find((r) => r.id === openingId) ?? null : null;

  const lastUpdate = `${tickAt.getHours().toString().padStart(2, "0")}:${tickAt
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <LiveMap
        rides={filtered}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setOpeningId(id);
        }}
      />

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
            <input
              type="search"
              placeholder="Search ride, name, area…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-56 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        }
      >
        <div className="flex flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
            {VEHICLE_FILTERS.map((v) => {
              const active = vehicleFilter === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleFilter(v.id)}
                  className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No active rides match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((r) => (
                <RideCard
                  key={r.id}
                  ride={r}
                  onOpen={() => {
                    setSelectedId(r.id);
                    setOpeningId(r.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
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
          setToast(
            r?.driver ? `Message sent to ${r.driver.name}` : "Message sent",
          );
        }}
        onCancelRide={(id) => {
          const r = rides.find((x) => x.id === id);
          setRides((prev) => prev.filter((x) => x.id !== id));
          setOpeningId(null);
          setToast(`${r?.id ?? "Ride"} cancelled`);
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
