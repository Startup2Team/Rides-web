"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  type Ride as ApiRide,
  type RideDetail as ApiRideDetail,
} from "@/lib/api";

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
  position: { x: number; y: number };
  _transportCode: string;
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
    destination: r.destination_address,
    vehicleType: toVehicleType(r.transport_type),
    status: mapRideStatus(r.status),
    startedAt: new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    eta: null,
    fare: r.agreed_fare ?? 0,
    paymentMethod: "Cash",
    district: "—",
    timeline: [],
    negotiation: [],
    position: { x: Math.random() * 80 + 10, y: Math.random() * 70 + 10 },
    _transportCode: r.transport_type,
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

type Tab = { id: "all" | RideStatus; label: string };

const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Searching", label: "Searching" },
  { id: "Negotiating", label: "Negotiating" },
  { id: "Driver arriving", label: "Driver arriving" },
  { id: "On trip", label: "On trip" },
];

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

const pinColor: Record<RideStatus, string> = {
  Searching: "bg-muted-foreground",
  Negotiating: "bg-amber-500",
  "Driver arriving": "bg-sky-500",
  "On trip": "bg-primary",
};

const vehicleChar: Record<string, string> = {
  MOTO_BIKE: "M", CAB_TAXI: "C", LIGHT_HILUX: "H", HEAVY_FUSO: "F", TUK_TUK: "T",
};

function formatRWF(n: number) {
  if (n === 0) return "—";
  return `${n.toLocaleString("en-US")} RWF`;
}

// ── Live map ──────────────────────────────────────────────────────────────

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
      <img src="/maps/map.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
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
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${pinColor[r.status]}`} />
              ) : null}
              <span className={`relative flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white ring-2 ring-card transition-transform ${pinColor[r.status]} ${isSelected ? "scale-150" : ""}`}>
                {vehicleChar[r._transportCode] ?? "?"}
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
        {(["On trip", "Driver arriving", "Negotiating", "Searching"] as RideStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`block h-2 w-2 rounded-full ${pinColor[s]}`} />
            <span className="text-foreground">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ride card ─────────────────────────────────────────────────────────────

function RideCard({ ride, onOpen }: { ride: Ride; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
    >
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
    </button>
  );
}

// ── Main console ──────────────────────────────────────────────────────────

export function LiveRidesConsole() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [tab, setTab] = useState<Tab["id"]>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tickAt, setTickAt] = useState(new Date());
  const tickInterval = useRef<NodeJS.Timeout | null>(null);

  const loadRides = useCallback(() => {
    getLiveRides({ limit: "100", offset: "0" })
      .then((res) =>
        setRides((prev) => {
          const existing = new Map(prev.map((r) => [r.id, r]));
          return (res.rides ?? []).map((r) => {
            const e = existing.get(r.id);
            const mapped = mapApiRide(r);
            return e ? { ...mapped, position: e.position, timeline: e.timeline, negotiation: e.negotiation } : mapped;
          });
        })
      )
      .catch(() => null);
  }, []);

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

  const openRide = (id: string) => {
    setSelectedId(id);
    setOpeningId(id);
    getLiveRide(id)
      .then((detail) => {
        setRides((prev) =>
          prev.map((r) => (r.id === id ? mapApiDetail(detail, r) : r))
        );
      })
      .catch(() => null);
  };

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
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
  }, [rides, tab, vehicleFilter, query]);

  const counts = useMemo(() => ({
    all: rides.length,
    Searching: rides.filter((r) => r.status === "Searching").length,
    Negotiating: rides.filter((r) => r.status === "Negotiating").length,
    "Driver arriving": rides.filter((r) => r.status === "Driver arriving").length,
    "On trip": rides.filter((r) => r.status === "On trip").length,
  }), [rides]);

  const openingRide = openingId ? rides.find((r) => r.id === openingId) ?? null : null;

  const lastUpdate = `${tickAt.getHours().toString().padStart(2, "0")}:${tickAt.getMinutes().toString().padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <LiveMap
        rides={filtered}
        selectedId={selectedId}
        onSelect={openRide}
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
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
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
                    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
                <RideCard key={r.id} ride={r} onOpen={() => openRide(r.id)} />
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
          setToast(r?.driver ? `Message sent to ${r.driver.name}` : "Message sent");
        }}
        onCancelRide={async (id) => {
          try {
            await interveneRide(id, "cancel", "Admin cancelled ride");
          } catch { /* ignore */ }
          setRides((prev) => prev.filter((x) => x.id !== id));
          setOpeningId(null);
          const r = rides.find((x) => x.id === id);
          setToast(`${r?.id.slice(0, 8) ?? "Ride"}… cancelled`);
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
