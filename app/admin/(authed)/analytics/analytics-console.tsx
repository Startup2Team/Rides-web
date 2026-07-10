"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Card, StatCard } from "../_components";
import {
  getRidesDaily,
  getFunnel,
  getVehicleMix,
  getDriverPerformance,
  getSatisfaction,
  getActivityHeatmap,
  type DailyRidePoint,
  type FunnelData,
  type VehicleMixItem,
  type DriverPerf,
  type SatisfactionData,
  type ActivityCell,
} from "@/lib/api";

// ── Period helpers ────────────────────────────────────────────────────────

type Period = "week" | "month" | "quarter" | "year";

const periodLabels: Record<Period, string> = {
  week: "This week", month: "This month", quarter: "This quarter", year: "This year",
};
const periodCompare: Record<Period, string> = {
  week: "vs last week", month: "vs last month", quarter: "vs last quarter", year: "vs last year",
};
const periodDays: Record<Period, number> = { week: 7, month: 30, quarter: 90, year: 365 };

const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike", CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux", HEAVY_FUSO: "Heavy Fuso", TUK_TUK: "Tuk Tuk",
};
const VEHICLE_COLORS: Record<string, string> = {
  MOTO_BIKE: "bg-sky-500", CAB_TAXI: "bg-primary",
  LIGHT_HILUX: "bg-amber-400", HEAVY_FUSO: "bg-foreground", TUK_TUK: "bg-rose-400",
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Trend aggregation ─────────────────────────────────────────────────────

function aggregateTrend(days: DailyRidePoint[], period: Period): { label: string; value: number }[] {
  if (!days.length) return [];
  const sorted = [...days].sort((a, b) => a.day.localeCompare(b.day));
  if (period === "week") {
    return sorted.map((d) => ({
      label: new Date(d.day).toLocaleDateString("en-US", { weekday: "short" }),
      value: d.completed,
    }));
  }
  if (period === "month") {
    const weeks: { label: string; value: number }[] = [];
    for (let i = 0; i < sorted.length; i += 7) {
      const chunk = sorted.slice(i, i + 7);
      weeks.push({ label: `W${Math.floor(i / 7) + 1}`, value: chunk.reduce((s, d) => s + d.completed, 0) });
    }
    return weeks;
  }
  if (period === "quarter") {
    const months: { label: string; value: number }[] = [];
    for (let i = 0; i < sorted.length; i += 30) {
      const chunk = sorted.slice(i, i + 30);
      const m = new Date(chunk[0].day).toLocaleDateString("en-US", { month: "short" });
      months.push({ label: m, value: chunk.reduce((s, d) => s + d.completed, 0) });
    }
    return months;
  }
  // year → quarterly buckets
  const quarters: { label: string; value: number }[] = [];
  for (let i = 0; i < sorted.length; i += 91) {
    const chunk = sorted.slice(i, i + 91);
    quarters.push({ label: `Q${Math.floor(i / 91) + 1}`, value: chunk.reduce((s, d) => s + d.completed, 0) });
  }
  return quarters;
}

// ── Activity heatmap builder ──────────────────────────────────────────────

function buildHeatmap(cells: ActivityCell[]): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const c of cells) {
    const row = (c.day + 6) % 7; // convert Sun=0 → row[6], Mon=1 → row[0]
    grid[row][c.hour] = (grid[row][c.hour] ?? 0) + c.count;
  }
  return grid;
}

// ── Chart components ──────────────────────────────────────────────────────

function formatBigNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

function DeltaPill({ value, invertColor }: { value: number; invertColor?: boolean }) {
  const up = value >= 0;
  const positive = invertColor ? !up : up;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${positive ? "text-primary" : "text-red-600"}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
        {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No trip data for this period.</p>;
  }
  return (
    <div>
      <div className="flex h-44 items-end gap-3">
        {data.map((d, i) => {
          const isPeak = d.value === max;
          return (
            <div key={i} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-foreground shadow-sm ring-1 ring-border group-hover:block">
                {d.label} · {formatBigNumber(d.value)}
              </span>
              <div className={`w-full rounded-md ${isPeak ? "bg-primary" : "bg-primary/30"}`}
                style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} />
              <span className={`text-[10px] ${isPeak ? "font-bold text-primary" : "text-muted-foreground"}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FunnelChart({ funnel }: { funnel: { stage: string; value: number; pct: number }[] }) {
  if (funnel.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground">No funnel data for this period.</p>;
  }
  return (
    <ul className="space-y-4 p-4">
      {funnel.map((f, i) => {
        const prev = i > 0 ? funnel[i - 1].pct : 100;
        const dropoff = prev - f.pct;
        return (
          <li key={f.stage}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-foreground">{f.stage}</span>
              <span className="text-xs text-muted-foreground">
                {f.value.toLocaleString()} <span className="font-bold text-foreground">({f.pct}%)</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${f.pct}%` }} />
            </div>
            {dropoff > 0 ? (
              <p className={`mt-1 text-[10px] font-semibold ${dropoff > 5 ? "text-red-600" : "text-amber-600"}`}>
                −{dropoff}% drop-off
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ActivityHeatmapChart({ grid }: { grid: number[][] }) {
  const flat = grid.flat();
  const max = Math.max(...flat, 1);
  const cellColor = (v: number) => {
    const intensity = v / max;
    if (intensity > 0.85) return "bg-primary";
    if (intensity > 0.65) return "bg-primary/75";
    if (intensity > 0.45) return "bg-primary/50";
    if (intensity > 0.25) return "bg-primary/25";
    if (intensity > 0.08) return "bg-primary/15";
    return "bg-muted";
  };

  const peakRow = grid.reduce((pr, row, ri) => {
    const rowMax = Math.max(...row);
    return rowMax > Math.max(...grid[pr]) ? ri : pr;
  }, 0);
  const peakCol = grid[peakRow].indexOf(Math.max(...grid[peakRow]));

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <div className="flex shrink-0 flex-col justify-between pt-3 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {daysOfWeek.map((d) => <span key={d} className="h-4 leading-none">{d}</span>)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="space-y-1">
            {grid.map((row, dayIdx) => (
              <div key={dayIdx} className="flex gap-1">
                {row.map((v, hourIdx) => (
                  <div key={hourIdx} className={`group relative h-4 flex-1 rounded ${cellColor(v)}`}>
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-foreground shadow-sm ring-1 ring-border group-hover:block">
                      {daysOfWeek[dayIdx]} · {hourIdx.toString().padStart(2, "0")}:00 · {v}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Less</span>
          {["bg-muted", "bg-primary/15", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"].map((c) => (
            <span key={c} className={`block h-3 w-3 rounded ${c}`} />
          ))}
          <span>More</span>
        </div>
        {max > 0 ? (
          <span>Peak: {daysOfWeek[peakRow]} {peakCol.toString().padStart(2, "0")}:00</span>
        ) : null}
      </div>
    </div>
  );
}

function Donut({ slices, centerLabel, centerValue }: { slices: { pct: number; color: string }[]; centerLabel: string; centerValue: string }) {
  let offset = 0;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 40 40" aria-hidden className="h-full w-full">
        <circle cx="20" cy="20" r="14" fill="none" strokeWidth="5" className="stroke-muted" />
        {slices.map((s, i) => {
          const length = s.pct;
          const dasharray = `${length} 100`;
          const dashoffset = -offset;
          offset += length;
          return (
            <circle key={i} cx="20" cy="20" r="14" fill="none" strokeWidth="5"
              strokeDasharray={dasharray} strokeDashoffset={dashoffset}
              className={s.color.replace("bg-", "stroke-")}
              transform="rotate(-90 20 20)" strokeLinecap="round" />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{centerLabel}</span>
        <span className="text-sm font-bold text-foreground">{centerValue}</span>
      </div>
    </div>
  );
}

// ── Main console ──────────────────────────────────────────────────────────

export function AnalyticsConsole() {
  const [period, setPeriod] = useState<Period>("month");
  const [dailyRides, setDailyRides] = useState<DailyRidePoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [vehicleMix, setVehicleMix] = useState<VehicleMixItem[]>([]);
  const [drivers, setDrivers] = useState<DriverPerf[]>([]);
  const [satisfaction, setSatisfaction] = useState<SatisfactionData | null>(null);
  const [activityCells, setActivityCells] = useState<ActivityCell[]>([]);

  useEffect(() => {
    const days = periodDays[period];
    getRidesDaily(days).then((d) => setDailyRides(Array.isArray(d) ? d : [])).catch(() => setDailyRides([]));
    getFunnel(days).then(setFunnel).catch(() => setFunnel(null));
    getVehicleMix(days).then((d) => setVehicleMix(Array.isArray(d) ? d : [])).catch(() => setVehicleMix([]));
  }, [period]);

  useEffect(() => {
    getDriverPerformance().then((d) => setDrivers(Array.isArray(d) ? d.slice(0, 6) : [])).catch(() => setDrivers([]));
    getSatisfaction().then(setSatisfaction).catch(() => setSatisfaction(null));
    getActivityHeatmap().then((d) => setActivityCells(Array.isArray(d) ? d : [])).catch(() => setActivityCells([]));
  }, []);

  const trend = useMemo(() => aggregateTrend(dailyRides, period), [dailyRides, period]);
  const heatmapGrid = useMemo(() => buildHeatmap(activityCells), [activityCells]);

  const totalTrips = funnel?.completed ?? 0;
  const conversionRate = funnel && funnel.booked > 0
    ? Math.round((funnel.completed / funnel.booked) * 100)
    : 0;

  const funnelStages = funnel && funnel.booked > 0
    ? [
        { stage: "Ride requested", value: funnel.booked, pct: 100 },
        { stage: "Driver matched", value: funnel.matched, pct: Math.round(funnel.matched / funnel.booked * 100) },
        { stage: "Ride confirmed", value: funnel.confirmed, pct: Math.round(funnel.confirmed / funnel.booked * 100) },
        { stage: "Ride completed", value: funnel.completed, pct: Math.round(funnel.completed / funnel.booked * 100) },
      ]
    : [];

  const totalVehicleRides = vehicleMix.reduce((s, v) => s + v.rides, 1);
  const vehicleMixUI = vehicleMix.map((v) => ({
    vehicle: TRANSPORT_DISPLAY[v.transport_type] ?? v.transport_type,
    pct: Math.round((v.rides / totalVehicleRides) * 100),
    color: VEHICLE_COLORS[v.transport_type] ?? "bg-muted",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Period</div>
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
          {(Object.keys(periodLabels) as Period[]).map((id) => {
            const active = period === id;
            return (
              <button key={id} type="button" onClick={() => setPeriod(id)}
                className={`shrink-0 rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {periodLabels[id]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Trips"
          value={formatBigNumber(totalTrips)}
          hint={<span className="text-muted-foreground">{periodCompare[period]}</span>}
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          hint="request → completed"
        />
        <StatCard
          label="Completed Rides"
          value={funnel ? formatBigNumber(funnel.completed) : "—"}
          hint={`${funnel ? funnel.cancelled : 0} cancelled`}
        />
        <StatCard
          label="Completion Rate"
          value={satisfaction ? `${satisfaction.completion_rate_pct.toFixed(1)}%` : "—"}
          hint="30-day completion proxy"
        />
      </div>

      <Card
        title={`Trips · ${periodLabels[period].toLowerCase()}`}
        bodyClass="p-4"
        action={<span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="block h-2 w-2 rounded-full bg-primary" />Completed trips</span>}
      >
        <TrendChart data={trend} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Conversion funnel">
          <FunnelChart funnel={funnelStages} />
        </Card>

        <Card
          title="Activity by day & hour"
          action={<span className="text-[11px] text-muted-foreground">Last 90 days · Kigali time</span>}
        >
          <ActivityHeatmapChart grid={heatmapGrid} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Vehicle mix" bodyClass="p-4">
          {vehicleMixUI.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No vehicle data yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <Donut
                slices={vehicleMixUI.map((v) => ({ pct: v.pct, color: v.color }))}
                centerLabel="Total"
                centerValue={formatBigNumber(totalTrips)}
              />
              <ul className="flex-1 space-y-2 text-xs">
                {vehicleMixUI.map((v) => (
                  <li key={v.vehicle} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`block h-2 w-2 rounded-full ${v.color}`} />{v.vehicle}
                    </span>
                    <span className="font-bold text-foreground">{v.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Platform completion" bodyClass="p-4">
          {satisfaction ? (
            <>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {satisfaction.completion_rate_pct.toFixed(1)}%
                </p>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {satisfaction.completed_rides_30d.toLocaleString()} completed of {satisfaction.total_rides_30d.toLocaleString()} rides (30d)
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${satisfaction.completion_rate_pct}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {(100 - satisfaction.completion_rate_pct).toFixed(1)}% cancelled or incomplete
              </p>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No satisfaction data yet.</p>
          )}
        </Card>

        <Card title="Top drivers (30d)">
          {drivers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No driver data yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {drivers.map((d, i) => {
                const name = d.full_name ?? d.phone;
                return (
                  <li key={d.driver_id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                    <Avatar name={name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold tracking-tight text-foreground">{name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{TRANSPORT_DISPLAY[d.transport_type] ?? d.transport_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{d.total_rides}</p>
                      <p className="text-[10px] text-muted-foreground">{d.acceptance_rate.toFixed(0)}% accept</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
