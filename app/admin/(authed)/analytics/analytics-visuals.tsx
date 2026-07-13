"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "../_components";
import type { DriverPerf } from "@/lib/api";
import { isAnalyticsVehicle, vehicleSharePct } from "@/lib/mock-analytics";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatBigNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike",
  CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO: "Heavy Fuso",
};

const VEHICLE_COLORS: Record<string, string> = {
  MOTO_BIKE: "bg-sky-500",
  CAB_TAXI: "bg-primary",
  LIGHT_HILUX: "bg-amber-400",
  HEAVY_FUSO: "bg-foreground",
};

const VEHICLE_STROKE: Record<string, string> = {
  MOTO_BIKE: "stroke-sky-500",
  CAB_TAXI: "stroke-primary",
  LIGHT_HILUX: "stroke-amber-400",
  HEAVY_FUSO: "stroke-foreground",
};

const RANK_STYLES = [
  "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 ring-amber-300/60",
  "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 ring-slate-300/60",
  "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-900 ring-orange-300/60",
];

export function peakActivityLabel(grid: number[][]): string | null {
  let peak = 0;
  let peakRow = 0;
  let peakCol = 0;
  grid.forEach((row, ri) => {
    row.forEach((v, ci) => {
      if (v > peak) {
        peak = v;
        peakRow = ri;
        peakCol = ci;
      }
    });
  });
  if (peak === 0) return null;
  return `${daysOfWeek[peakRow]} ${peakCol.toString().padStart(2, "0")}:00`;
}

export function buildInsights(input: {
  loading: boolean;
  completedDeltaPct: number | null;
  conversionRate: number;
  peakHour: string | null;
  topVehicleLabel: string | null;
  vehicleFilter: string;
  rangeLabel: string;
  totalCompleted: number;
  priorPeriodLabel: string;
}): string[] {
  if (input.loading || input.totalCompleted === 0) return [];

  const lines: string[] = [];

  if (input.completedDeltaPct !== null) {
    const dir = input.completedDeltaPct >= 0 ? "up" : "down";
    lines.push(
      `Completed trips ${dir} ${Math.abs(input.completedDeltaPct)}% vs ${input.priorPeriodLabel} (${input.rangeLabel.toLowerCase()}).`,
    );
  }

  lines.push(`${input.conversionRate}% of requests completed end-to-end in this view.`);

  if (input.peakHour) {
    lines.push(`Busiest hour: ${input.peakHour} — plan driver supply around rush windows.`);
  }

  if (input.vehicleFilter === "all" && input.topVehicleLabel) {
    lines.push(`${input.topVehicleLabel} carries the largest share of trips this period.`);
  } else if (isAnalyticsVehicle(input.vehicleFilter)) {
    lines.push(
      `${TRANSPORT_DISPLAY[input.vehicleFilter]} ≈ ${vehicleSharePct(input.vehicleFilter)}% of typical platform volume.`,
    );
  }

  return lines.slice(0, 3);
}

function ChartSkeleton({ height = "h-44" }: { height?: string }) {
  return (
    <div className={`${height} animate-pulse rounded-xl bg-gradient-to-r from-muted via-surface to-muted bg-[length:200%_100%] analytics-shimmer`} />
  );
}

export function AnalyticsQuickLinks() {
  const links = [
    { href: "/admin/heatmaps", label: "Live heatmaps", desc: "Demand now" },
    { href: "/admin/live-rides", label: "Live rides", desc: "Active trips" },
    { href: "/admin/reports", label: "Reports", desc: "Export data" },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="group flex items-center justify-between rounded-xl border border-border/80 bg-card/80 px-4 py-3 transition-all hover:border-primary/35 hover:bg-primary/[0.03] hover:shadow-md hover:shadow-primary/5"
        >
          <div>
            <p className="text-xs font-semibold text-foreground group-hover:text-primary">{l.label}</p>
            <p className="text-[10px] text-muted-foreground">{l.desc}</p>
          </div>
          <span className="text-sm text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
            →
          </span>
        </Link>
      ))}
    </div>
  );
}

export function AnalyticsInsightBanner({ lines, loading }: { lines: string[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-primary/10" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full max-w-lg animate-pulse rounded bg-muted" />
          <div className="h-3 w-full max-w-md animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) return null;

  return (
    <div className="analytics-fade-in relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.09] via-card to-accent/30 p-5 shadow-sm shadow-primary/5">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/25">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">At a glance</p>
          <ul className="mt-2 space-y-1.5">
            {lines.map((line) => (
              <li key={line} className="flex gap-2 text-sm leading-snug text-foreground/90">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

type StatItem = {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "default" | "primary" | "success" | "warn";
  icon: "trips" | "conversion" | "cancel" | "completion";
};

function StatIcon({ type }: { type: StatItem["icon"] }) {
  const cls = "h-4 w-4";
  switch (type) {
    case "trips":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden>
          <path d="M3 17h18M5 17l2-8h10l2 8M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
      );
    case "conversion":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case "cancel":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
  }
}

export function AnalyticsStatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s, i) => {
        const toneCls =
          s.tone === "success"
            ? "border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/[0.02]"
            : s.tone === "warn"
              ? "border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-500/[0.02]"
              : s.tone === "primary"
                ? "border-primary/25 bg-gradient-to-br from-card via-card to-primary/[0.03]"
                : "border-border bg-card";
        return (
          <div
            key={s.label}
            className={`analytics-fade-in group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5 hover:border-primary/30 ${toneCls}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                <StatIcon type={s.icon} />
              </span>
            </div>
            <p
              className={`mt-3 text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
                s.tone === "primary" || s.tone === "success"
                  ? "text-primary"
                  : s.tone === "warn"
                    ? "text-amber-600"
                    : "text-foreground"
              }`}
            >
              {s.value}
            </p>
            {s.hint ? <div className="mt-2 text-[11px] font-medium text-muted-foreground">{s.hint}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No trip data for this period.</p>;
  }

  return (
    <div className="relative pt-6">
      <div className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-dashed border-border/40" />
        ))}
      </div>
      <div className="relative flex h-52 items-end gap-2.5 sm:gap-3.5 px-2">
        {data.map((d, i) => {
          const isPeak = d.value === max;
          const h = Math.max(6, (d.value / max) * 100);
          return (
            <div
              key={`${d.label}-${i}`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2.5"
            >
              {/* Premium Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-2.5 hidden z-20 flex-col items-center group-hover:flex">
                <div className="whitespace-nowrap rounded-xl border border-primary/20 bg-card/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-foreground shadow-xl shadow-primary/5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{d.label}:</span>
                  <span className="text-primary">{formatBigNumber(d.value)} trips</span>
                </div>
                <div className="w-2 h-2 rotate-45 bg-card border-r border-b border-primary/10 -mt-1" />
              </div>
              
              <div
                className={`analytics-bar-grow w-full max-w-[2.25rem] rounded-t-xl transition-all duration-300 group-hover:scale-x-110 ${
                  isPeak
                    ? "bg-gradient-to-t from-primary via-primary/90 to-primary/75 shadow-lg shadow-primary/20 group-hover:brightness-110"
                    : "bg-gradient-to-t from-primary/30 to-primary/10 group-hover:from-primary/50 group-hover:to-primary/20"
                }`}
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 35}ms`,
                }}
              />
              <span
                className={`max-w-full truncate text-[10px] tracking-wide uppercase font-bold transition-colors ${
                  isPeak ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FunnelChart({ funnel }: { funnel: { stage: string; value: number; pct: number }[] }) {
  if (funnel.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground">No funnel data for this period.</p>;
  }

  return (
    <ul className="space-y-2.5 p-4">
      {funnel.map((f, i) => {
        const prev = i > 0 ? funnel[i - 1].pct : 100;
        const dropoff = prev - f.pct;
        const isLast = i === funnel.length - 1;
        return (
          <li key={f.stage} className="relative">
            <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-surface/30 p-3.5 transition-all hover:border-primary/20 hover:bg-primary/[0.01]">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-4 ring-offset-2 ring-offset-card ${
                  isLast
                    ? "bg-primary text-primary-foreground ring-primary/20"
                    : "bg-muted text-foreground ring-muted"
                }`}
              >
                0{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold tracking-tight text-foreground">{f.stage}</span>
                  <span className="shrink-0 text-xs font-bold text-foreground">
                    {f.value.toLocaleString()}{" "}
                    <span className="text-primary ml-1">{f.pct}%</span>
                  </span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="analytics-bar-grow h-full rounded-full bg-gradient-to-r from-primary/60 to-primary shadow-sm"
                    style={{ width: `${f.pct}%`, animationDelay: `${i * 80}ms` }}
                  />
                </div>
                {dropoff > 0 ? (
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      dropoff > 5 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      ↓ {dropoff}% drop
                    </span>
                    <span className="text-[9px] text-muted-foreground">from previous stage</span>
                  </div>
                ) : null}
              </div>
            </div>
            {!isLast ? (
              <div className="absolute left-[30px] top-[50px] bottom-[-22px] w-0.5 border-l-2 border-dashed border-border/80 z-0" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityHeatmapChart({
  grid,
  peakRow,
  peakCol,
}: {
  grid: number[][];
  peakRow: number;
  peakCol: number;
}) {
  const flat = grid.flat();
  const max = Math.max(...flat, 1);

  const cellColor = (v: number, isPeak: boolean) => {
    if (isPeak) return "bg-primary ring-2 ring-primary/35 ring-offset-2 ring-offset-card";
    const intensity = v / max;
    if (intensity > 0.85) return "bg-primary";
    if (intensity > 0.65) return "bg-primary/80";
    if (intensity > 0.45) return "bg-primary/60";
    if (intensity > 0.25) return "bg-primary/40";
    if (intensity > 0.08) return "bg-primary/20";
    return "bg-muted/80 dark:bg-muted/30";
  };

  const peak = peakActivityLabel(grid);

  return (
    <div className="p-4">
      <div className="flex gap-3">
        <div className="flex shrink-0 flex-col justify-between py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          {daysOfWeek.map((d) => (
            <span key={d} className="flex h-5 items-center leading-none">
              {d}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="space-y-1">
            {grid.map((row, dayIdx) => (
              <div key={dayIdx} className="flex gap-1">
                {row.map((v, hourIdx) => {
                  const isPeak = dayIdx === peakRow && hourIdx === peakCol && v > 0;
                  return (
                    <div
                      key={hourIdx}
                      className={`group relative h-5 flex-1 rounded transition-all duration-200 hover:scale-125 hover:z-10 ${cellColor(v, isPeak)}`}
                    >
                      {/* Interactive Popover */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 flex-col items-center group-hover:flex">
                        <div className="whitespace-nowrap rounded-xl border border-primary/20 bg-card/95 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold text-foreground shadow-lg flex items-center gap-1">
                          <span className="text-primary">{daysOfWeek[dayIdx]} {hourIdx.toString().padStart(2, "0")}:00</span>
                          <span className="text-muted-foreground">·</span>
                          <span>{v} completed trips</span>
                        </div>
                        <div className="w-1.5 h-1.5 rotate-45 bg-card border-r border-b border-primary/10 -mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between px-1 text-[9px] font-bold tracking-widest text-muted-foreground">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground border-t border-border/40 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold mr-1">Quiet</span>
          {["bg-muted/80", "bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary/80", "bg-primary"].map(
            (c) => (
              <span key={c} className={`block h-3.5 w-3.5 rounded-sm ${c}`} />
            ),
          )}
          <span className="font-semibold ml-1">Busy</span>
        </div>
        {peak ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
            Peak · {peak}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function VehicleMixDonut({
  items,
  centerValue,
}: {
  items: { vehicle: string; pct: number; rides: number; colorKey: string }[];
  centerValue: string;
}) {
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0 flex items-center justify-center">
        {/* Inner ambient glow */}
        <div className="absolute inset-4 rounded-full bg-primary/5 blur-lg" />
        
        <svg viewBox="0 0 40 40" aria-hidden className="h-full w-full -rotate-90 relative z-10">
          <circle cx="20" cy="20" r="14" fill="none" strokeWidth="4" className="stroke-muted" />
          {items.map((s, i) => {
            const length = s.pct;
            const dasharray = `${length} 100`;
            const dashoffset = -offset;
            offset += length;
            return (
              <circle
                key={i}
                cx="20"
                cy="20"
                r="14"
                fill="none"
                strokeWidth="4"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                className={`analytics-donut-segment transition-all duration-300 hover:stroke-[5] ${VEHICLE_STROKE[s.colorKey] ?? "stroke-muted"}`}
                style={{ animationDelay: `${i * 120}ms` }}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center z-10">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Trips</span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">{centerValue}</span>
        </div>
      </div>
      <ul className="w-full flex-1 space-y-4">
        {items.map((v) => (
          <li key={v.vehicle} className="group p-2.5 rounded-xl border border-border/40 bg-surface/30 transition-all hover:bg-primary/[0.01] hover:border-primary/20">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-semibold text-foreground">
                <span className={`block h-2.5 w-2.5 rounded-full ${VEHICLE_COLORS[v.colorKey] ?? "bg-muted"}`} />
                {v.vehicle}
              </span>
              <span className="font-extrabold text-primary">{v.pct}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`analytics-bar-grow h-full rounded-full ${VEHICLE_COLORS[v.colorKey] ?? "bg-muted"}`}
                style={{ width: `${v.pct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{formatBigNumber(v.rides)} completed trips</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VehicleFilteredSummary({
  vehicleLabel,
  vehicleCode,
  trips,
  revenue,
}: {
  vehicleLabel: string;
  vehicleCode: string;
  trips: number;
  revenue: number;
}) {
  const share = isAnalyticsVehicle(vehicleCode) ? vehicleSharePct(vehicleCode) : null;

  return (
    <div className="space-y-4 py-1">
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] to-card p-6 text-center">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-xl" aria-hidden />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{vehicleLabel}</p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-foreground">{formatBigNumber(trips)}</p>
        <p className="mt-1 text-sm text-muted-foreground">completed this period</p>
      </div>
      {share !== null ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-4 py-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} />
          </div>
          <span className="shrink-0 text-xs font-semibold text-foreground">{share}% platform</span>
        </div>
      ) : null}
      {revenue > 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Est. revenue</p>
          <p className="mt-1 text-base font-bold text-foreground">{formatRWF(revenue)}</p>
        </div>
      ) : null}
    </div>
  );
}

export function TopDriversList({ drivers }: { drivers: DriverPerf[] }) {
  return (
    <ul className="divide-y divide-border/60">
      {drivers.map((d, i) => {
        const name = d.full_name ?? d.phone;
        const rankStyle = i < 3 ? RANK_STYLES[i] : "bg-primary/10 text-primary ring-primary/20";
        return (
          <li key={d.driver_id}>
            <Link
              href={`/admin/drivers/${d.driver_id}`}
              className="group flex items-center gap-3.5 px-4 py-4 transition-all hover:bg-primary/[0.02]"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset ${rankStyle}`}
              >
                {i + 1}
              </span>
              <Avatar name={name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {name}
                </p>
                <p className="truncate text-[11px] font-semibold text-muted-foreground">
                  {TRANSPORT_DISPLAY[d.transport_type] ?? d.transport_type}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-foreground">{d.total_rides} trips</p>
                <p className="text-[10px] font-semibold text-muted-foreground">{d.acceptance_rate.toFixed(0)}% accept</p>
              </div>
              <span className="text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">→</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { ChartSkeleton, TRANSPORT_DISPLAY, VEHICLE_COLORS };
