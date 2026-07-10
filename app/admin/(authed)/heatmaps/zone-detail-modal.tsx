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
  topRoutes: { destination: string; share: number }[];
  hourlyDemand: number[];
  vehicleSplit: { vehicle: string; pct: number; color: string }[];
};

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function MiniStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "danger" | "warn" | "success";
}) {
  const valueTone =
    tone === "danger"
      ? "text-red-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "success"
          ? "text-primary"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-base font-bold tracking-tight ${valueTone}`}>
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function HourlyDemandChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-32 items-end gap-0.5">
      {data.map((v, i) => {
        const intensity = v / max;
        const color =
          intensity > 0.75
            ? "bg-red-400"
            : intensity > 0.5
              ? "bg-amber-400"
              : intensity > 0.25
                ? "bg-primary/70"
                : "bg-muted-foreground/30";
        return (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
            <span
              className={`w-full rounded-t ${color}`}
              style={{ height: `${Math.max(2, intensity * 100)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function ZoneDetailModal({
  zone,
  onClose,
  onNotifyDrivers,
  onViewLiveRides,
}: {
  zone: Zone | null;
  onClose: () => void;
  onNotifyDrivers: (id: string) => void;
  onViewLiveRides: (id: string) => void;
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

  const gap = zone.demand - zone.supply;
  const supplyHealth =
    gap > 30 ? "danger" : gap > 10 ? "warn" : ("success" as const);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {zone.name}
              </h2>
              {zone.surge > 1 ? (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-100">
                  Surge × {zone.surge.toFixed(1)}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {zone.district} · {zone.drivers} drivers on the ground
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              label="Demand"
              value={`${zone.demand}/100`}
              hint="rides requested"
              tone={zone.demand > 75 ? "danger" : zone.demand > 50 ? "warn" : "success"}
            />
            <MiniStat
              label="Supply"
              value={`${zone.supply}/100`}
              hint="driver availability"
              tone={supplyHealth}
            />
            <MiniStat
              label="Trips 24h"
              value={zone.trips24h.toLocaleString()}
              hint="completed"
            />
            <MiniStat
              label="Avg fare"
              value={formatRWF(zone.avgFare)}
              hint="in this zone"
            />
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Demand by hour · last 24h
              </p>
              <p className="text-[10px] text-muted-foreground">
                Peak{" "}
                <span className="font-semibold text-foreground">
                  {zone.hourlyDemand.indexOf(Math.max(...zone.hourlyDemand))}:00
                </span>
              </p>
            </div>
            <div className="mt-3">
              <HourlyDemandChart data={zone.hourlyDemand} />
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
              <span>00</span>
              <span>06</span>
              <span>12</span>
              <span>18</span>
              <span>23</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Top destinations
              </p>
              <ul className="mt-2 space-y-2">
                {zone.topRoutes.map((r) => (
                  <li key={r.destination}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground">→ {r.destination}</span>
                      <span className="font-semibold text-foreground">
                        {r.share}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${r.share}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Vehicle mix
              </p>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                {zone.vehicleSplit.map((v) => (
                  <div
                    key={v.vehicle}
                    className={v.color}
                    style={{ width: `${v.pct}%` }}
                    title={`${v.vehicle} ${v.pct}%`}
                  />
                ))}
              </div>
              <ul className="mt-3 space-y-1.5">
                {zone.vehicleSplit.map((v) => (
                  <li key={v.vehicle} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`block h-2 w-2 rounded-full ${v.color}`} />
                      {v.vehicle}
                    </span>
                    <span className="font-semibold text-foreground">{v.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {gap > 10 ? (
            <div
              className={`rounded-xl border p-4 ${
                gap > 30
                  ? "border-red-100 bg-red-50"
                  : "border-amber-100 bg-amber-50"
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  gap > 30 ? "text-red-700" : "text-amber-700"
                }`}
              >
                Supply gap detected
              </p>
              <p
                className={`mt-1 text-xs ${
                  gap > 30 ? "text-red-700" : "text-amber-700"
                }`}
              >
                Demand is {gap} points above supply. Consider sending a notification
                to nearby drivers to relocate to {zone.name}.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewLiveRides(zone.id)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              View live rides
            </button>
            <button
              type="button"
              onClick={() => onNotifyDrivers(zone.id)}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Notify nearby drivers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
