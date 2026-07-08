"use client";

import { useEffect } from "react";

export type Zone = {
  id: string;
  name: string;
  district: string;
  position: { x: number; y: number };
  radius: number;
  demand: number;
  supply: number;
  drivers: number;
  trips24h: number;
  avgFare: number;
  surge: number;
  isLive?: boolean;
  waitingRiders?: number;
  pickupLabel?: string;
  topRoutes: { destination: string; share: number }[];
  hourlyDemand: number[];
  vehicleSplit: { vehicle: string; pct: number; color: string }[];
};

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

export function ZoneDetailModal({
  zone,
  onClose,
}: {
  zone: Zone | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!zone) return;
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
  }, [zone, onClose]);

  if (!zone) return null;

  const waiting = zone.waitingRiders ?? zone.trips24h;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zone-detail-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 flex max-h-[min(90vh,520px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border bg-surface/30 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Hot pickup zone
              </p>
              <h2
                id="zone-detail-title"
                className="mt-1 truncate text-lg font-bold tracking-tight text-foreground"
              >
                {zone.name}
              </h2>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {zone.district}, Kigali
              </p>
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
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              Riders waiting now
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{waiting}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              at this pickup · live from Online riders
            </p>
          </div>

          {zone.pickupLabel ? (
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Pickup area
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{zone.pickupLabel}</p>
            </div>
          ) : null}

          {zone.avgFare > 0 ? (
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Avg requested fare
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">{formatRWF(zone.avgFare)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                From riders waiting in this cluster
              </p>
            </div>
          ) : null}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Brighter map areas mean more customers waiting at the same place. Send drivers here
            when you need to cover live demand.
          </p>
        </div>
      </div>
    </div>
  );
}
