"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCustomer,
  suspendCustomer,
  reinstateCustomer,
  type CustomerDetail,
  type CustomerTrip,
} from "@/lib/api";
import { Avatar, StatusPill } from "../../_components";
import {
  isMockCustomerId,
  MOCK_CUSTOMERS,
} from "@/lib/mock-customers";

const NO_BACKEND = !process.env.NEXT_PUBLIC_API_BASE_URL;

/* ── helpers ──────────────────────────────────────────────────────────────── */

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function vehicleLabel(type: string) {
  const map: Record<string, string> = {
    MOTO_BIKE: "Moto",
    RIFANI: "Rifani",
    CAB_TAXI: "Cab",
    LIGHT_HILUX: "Hilux",
    HEAVY_FUSO: "Fuso",
  };
  return map[type] ?? type.replace(/_/g, " ");
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type CustomerStatus = "Active" | "Suspended";

function deriveStatus(detail: CustomerDetail): CustomerStatus {
  return detail.is_suspended ? "Suspended" : "Active";
}

/* ── sub-components ───────────────────────────────────────────────────────── */

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="text-right text-[11px] font-medium text-foreground break-all">{value ?? "—"}</span>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface/40 p-3">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 text-lg font-bold tracking-tight text-foreground leading-none">
        {value}
      </span>
      {sub ? (
        <span className="mt-0.5 text-[10px] text-muted-foreground">{sub}</span>
      ) : null}
    </div>
  );
}

function TripStatusBadge({ status }: { status: string }) {
  const completed = status === "COMPLETED";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        completed
          ? "bg-primary/10 text-primary"
          : "bg-red-50 text-red-600"
      }`}
    >
      {completed ? "Completed" : "Cancelled"}
    </span>
  );
}

function VehicleBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    MOTO_BIKE: "bg-purple-50 text-purple-700",
    RIFANI: "bg-indigo-50 text-indigo-700",
    CAB_TAXI: "bg-sky-50 text-sky-700",
    LIGHT_HILUX: "bg-amber-50 text-amber-700",
    HEAVY_FUSO: "bg-orange-50 text-orange-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors[type] ?? "bg-muted text-muted-foreground"}`}
    >
      {vehicleLabel(type)}
    </span>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (NO_BACKEND || isMockCustomerId(id)) {
      const mock = isMockCustomerId(id) ? MOCK_CUSTOMERS[id] : null;
      setDetail(mock);
      setLoading(false);
      return;
    }
    getCustomer(id)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSuspend = async () => {
    if (!detail) return;
    setActing(true);
    try {
      if (!NO_BACKEND) await suspendCustomer(detail.id, 24);
      setDetail((d) => d ? { ...d, is_suspended: true } : d);
      setToast("Customer suspended");
    } finally {
      setActing(false);
    }
  };

  const handleReinstate = async () => {
    if (!detail) return;
    setActing(true);
    try {
      if (!NO_BACKEND) await reinstateCustomer(detail.id);
      setDetail((d) => d ? { ...d, is_suspended: false } : d);
      setToast("Customer reinstated");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">Customer not found.</p>
        <Link
          href="/admin/customers"
          className="text-xs font-medium text-primary underline underline-offset-2"
        >
          Back to customers
        </Link>
      </div>
    );
  }

  const status = deriveStatus(detail);
  const name = detail.full_name ?? detail.phone;
  const avgFare =
    detail.total_rides > 0 && detail.total_spend
      ? Math.round(detail.total_spend / detail.total_rides)
      : 0;

  /* derive unique drivers who served this customer */
  const driverMap = new Map<
    string,
    { id: string; name: string; phone: string; plate: string; vehicleType: string; tripCount: number; lastTrip: string }
  >();
  for (const t of detail.recent_trips ?? []) {
    if (!t.driver_id) continue;
    const existing = driverMap.get(t.driver_id);
    if (existing) {
      existing.tripCount++;
      if (t.created_at > existing.lastTrip) existing.lastTrip = t.created_at;
    } else {
      driverMap.set(t.driver_id, {
        id: t.driver_id,
        name: t.driver_name ?? "Unknown",
        phone: t.driver_phone ?? "—",
        plate: t.vehicle_plate ?? "—",
        vehicleType: t.transport_type,
        tripCount: 1,
        lastTrip: t.created_at,
      });
    }
  }
  const uniqueDrivers = Array.from(driverMap.values()).sort(
    (a, b) => b.tripCount - a.tripCount,
  );

  return (
    <div className="space-y-6">
      {/* back + page title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Customers
        </Link>
        <h1 className="text-sm font-semibold text-foreground">{name}</h1>
        <StatusPill
          status={status}
          tone={status === "Active" ? "success" : "danger"}
        />
      </div>

      {/* 2-col layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* ── main ────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Trip history */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Trip history</h2>
              <span className="text-[11px] text-muted-foreground">
                {detail.total_rides} total trips
              </span>
            </div>

            {(detail.recent_trips ?? []).length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No trips recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Route</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vehicle</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Driver</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fare</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(detail.recent_trips ?? []).map((t) => (
                      <TripRow key={t.id} trip={t} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Drivers who served this customer */}
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">Drivers in our system</h2>
              <span className="text-[11px] text-muted-foreground">
                {uniqueDrivers.length} unique driver{uniqueDrivers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {uniqueDrivers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No driver data available.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {uniqueDrivers.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={d.name} tone="neutral" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                        <p className="text-[11px] text-muted-foreground">{d.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{d.tripCount}</p>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">trips</p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[11px] font-medium text-foreground">{d.plate}</p>
                        <VehicleBadge type={d.vehicleType} />
                      </div>
                      <Link
                        href={`/admin/drivers/${d.id}`}
                        className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── sidebar ─────────────────────────────────────────────────────── */}
        <aside className="sticky top-6 self-start space-y-4">
          {/* Profile card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            {/* avatar + name */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                <Avatar name={name} tone="neutral" />
              </div>
              <div>
                <p className="text-base font-bold tracking-tight text-foreground leading-tight">
                  {name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Customer account
                </p>
              </div>
              <StatusPill
                status={status}
                tone={status === "Active" ? "success" : "danger"}
              />
            </div>

            <div className="mt-4 border-t border-border pt-4 space-y-0 divide-y divide-border/60">
              <InfoRow label="Phone" value={detail.phone} />
              <InfoRow label="Email" value={detail.email ?? "—"} />
              <InfoRow label="Member since" value={fmt(detail.created_at)} />
              <InfoRow
                label="Last seen"
                value={
                  detail.last_seen_at ? (
                    <span title={fmtDateTime(detail.last_seen_at)}>
                      {timeAgo(detail.last_seen_at)}
                    </span>
                  ) : "—"
                }
              />
              {detail.is_suspended && detail.suspension_until ? (
                <InfoRow label="Suspended until" value={fmt(detail.suspension_until)} />
              ) : null}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox
              label="Total trips"
              value={detail.total_rides}
            />
            <StatBox
              label="Total spend"
              value={
                detail.total_spend
                  ? `${Math.round(detail.total_spend / 1000)}K`
                  : "—"
              }
              sub={detail.total_spend ? "RWF" : undefined}
            />
            <StatBox
              label="Avg fare"
              value={avgFare ? `${Math.round(avgFare / 1000)}K` : "—"}
              sub={avgFare ? "RWF" : undefined}
            />
            <StatBox
              label="Rating"
              value={
                detail.rating ? (
                  <>
                    {detail.rating.toFixed(1)}{" "}
                    <span className="text-amber-500 text-sm">★</span>
                  </>
                ) : "—"
              }
            />
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Account actions
            </p>
            {detail.is_suspended ? (
              <button
                type="button"
                disabled={acting}
                onClick={handleReinstate}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50"
              >
                Reinstate account
              </button>
            ) : (
              <button
                type="button"
                disabled={acting}
                onClick={handleSuspend}
                className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                Suspend account
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Toast */}
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

/* ── TripRow ─────────────────────────────────────────────────────────────── */

function TripRow({ trip }: { trip: CustomerTrip }) {
  return (
    <tr className="hover:bg-surface/50">
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {new Date(trip.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {trip.pickup_address}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
            {trip.destination_address}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <VehicleBadge type={trip.transport_type} />
      </td>
      <td className="px-4 py-3">
        {trip.driver_name ? (
          <div className="text-xs">
            <p className="font-medium text-foreground">{trip.driver_name}</p>
            {trip.vehicle_plate ? (
              <p className="text-muted-foreground">{trip.vehicle_plate}</p>
            ) : null}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-xs font-semibold text-foreground whitespace-nowrap">
        {trip.agreed_fare ? `${trip.agreed_fare.toLocaleString()} RWF` : "—"}
      </td>
      <td className="px-4 py-3">
        <TripStatusBadge status={trip.status} />
      </td>
    </tr>
  );
}
