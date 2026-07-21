"use client";

import { useEffect } from "react";
import { StatusPill } from "../_components";
import { type Package as RidesPackage } from "@/lib/api";

const VEHICLE_LABELS: Record<string, string> = {
  moto: "Moto Bike",
  cab: "Cab Taxi",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
  MOTO_BIKE: "Moto Bike",
  CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO: "Heavy Fuso",
};

function formatRWF(amount: number): string {
  return `${amount.toLocaleString()} RWF`;
}

function formatDate(isoStr: string): string {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PackageDetailDrawer({
  pkg,
  onClose,
}: {
  pkg: RidesPackage;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const vtLabel = VEHICLE_LABELS[pkg.vehicle_type_code] ?? VEHICLE_LABELS[pkg.vehicle_type_id] ?? pkg.vehicle_type_code;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-sm transition-opacity"
      />

      <div
        role="dialog"
        aria-label={`Package details — ${pkg.name}`}
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {vtLabel}
              </span>
              <StatusPill status={pkg.is_active ? "active" : "inactive"} tone={pkg.is_active ? "success" : "neutral"} />
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {pkg.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pkg.ride_count} rides + {pkg.bonus_rides} bonus rides · Valid for {pkg.validity_days} days
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="rounded-2xl border border-border/80 bg-surface/50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Package Parameters
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-muted-foreground">Price</dt>
                <dd className="mt-0.5 font-bold text-foreground text-sm">{formatRWF(pkg.price_rwf)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Ride Count</dt>
                <dd className="mt-0.5 font-bold text-foreground text-sm">{pkg.ride_count} rides</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Bonus Rides</dt>
                <dd className="mt-0.5 font-bold text-emerald-600 text-sm">+{pkg.bonus_rides} bonus</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created At</dt>
                <dd className="mt-0.5 font-medium text-foreground">{formatDate(pkg.created_at)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
