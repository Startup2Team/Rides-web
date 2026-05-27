"use client";

import { useState } from "react";
import { Avatar, Card, StatCard } from "../_components";

type Period = "week" | "month" | "quarter" | "year";

const periodLabels: Record<Period, string> = {
  week: "This week",
  month: "This month",
  quarter: "This quarter",
  year: "This year",
};

const periodCompare: Record<Period, string> = {
  week: "vs last week",
  month: "vs last month",
  quarter: "vs last quarter",
  year: "vs last year",
};

type PeriodData = {
  totalTrips: number;
  conversionRate: number;
  avgDurationMin: number;
  repeatRiders: number;
  totalTripsDelta: number;
  conversionDelta: number;
  durationDelta: number;
  repeatDelta: number;
  trend: { label: string; value: number }[];
  funnel: { stage: string; value: number; pct: number }[];
  vehicleMix: { vehicle: string; pct: number; color: string }[];
  satisfaction: {
    avg: number;
    total: number;
    breakdown: { stars: number; pct: number }[];
  };
};

const data: Record<Period, PeriodData> = {
  week: {
    totalTrips: 8_412,
    conversionRate: 82,
    avgDurationMin: 14.4,
    repeatRiders: 64,
    totalTripsDelta: 9,
    conversionDelta: 2,
    durationDelta: -3,
    repeatDelta: 4,
    trend: [
      { label: "Mon", value: 1080 },
      { label: "Tue", value: 1184 },
      { label: "Wed", value: 1220 },
      { label: "Thu", value: 1284 },
      { label: "Fri", value: 1412 },
      { label: "Sat", value: 1540 },
      { label: "Sun", value: 692 },
    ],
    funnel: [
      { stage: "Ride requested", value: 10_280, pct: 100 },
      { stage: "Driver matched", value: 9_734, pct: 95 },
      { stage: "Negotiation agreed", value: 8_580, pct: 84 },
      { stage: "Ride completed", value: 8_412, pct: 82 },
    ],
    vehicleMix: [
      { vehicle: "Cab Taxi", pct: 60, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 22, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 12, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, color: "bg-foreground" },
    ],
    satisfaction: {
      avg: 4.8,
      total: 8_412,
      breakdown: [
        { stars: 5, pct: 78 },
        { stars: 4, pct: 16 },
        { stars: 3, pct: 4 },
        { stars: 2, pct: 1 },
        { stars: 1, pct: 1 },
      ],
    },
  },
  month: {
    totalTrips: 32_184,
    conversionRate: 84,
    avgDurationMin: 14.1,
    repeatRiders: 67,
    totalTripsDelta: 12,
    conversionDelta: 3,
    durationDelta: -4,
    repeatDelta: 6,
    trend: [
      { label: "W1", value: 7_100 },
      { label: "W2", value: 7_840 },
      { label: "W3", value: 8_200 },
      { label: "W4", value: 9_044 },
    ],
    funnel: [
      { stage: "Ride requested", value: 38_312, pct: 100 },
      { stage: "Driver matched", value: 36_240, pct: 95 },
      { stage: "Negotiation agreed", value: 32_450, pct: 85 },
      { stage: "Ride completed", value: 32_184, pct: 84 },
    ],
    vehicleMix: [
      { vehicle: "Cab Taxi", pct: 62, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 21, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 11, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, color: "bg-foreground" },
    ],
    satisfaction: {
      avg: 4.8,
      total: 32_184,
      breakdown: [
        { stars: 5, pct: 79 },
        { stars: 4, pct: 15 },
        { stars: 3, pct: 4 },
        { stars: 2, pct: 1 },
        { stars: 1, pct: 1 },
      ],
    },
  },
  quarter: {
    totalTrips: 91_244,
    conversionRate: 83,
    avgDurationMin: 14.2,
    repeatRiders: 68,
    totalTripsDelta: 18,
    conversionDelta: 4,
    durationDelta: -2,
    repeatDelta: 8,
    trend: [
      { label: "M1", value: 27_400 },
      { label: "M2", value: 31_660 },
      { label: "M3", value: 32_184 },
    ],
    funnel: [
      { stage: "Ride requested", value: 109_932, pct: 100 },
      { stage: "Driver matched", value: 104_115, pct: 95 },
      { stage: "Negotiation agreed", value: 91_650, pct: 83 },
      { stage: "Ride completed", value: 91_244, pct: 83 },
    ],
    vehicleMix: [
      { vehicle: "Cab Taxi", pct: 61, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 22, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 11, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, color: "bg-foreground" },
    ],
    satisfaction: {
      avg: 4.8,
      total: 91_244,
      breakdown: [
        { stars: 5, pct: 78 },
        { stars: 4, pct: 16 },
        { stars: 3, pct: 4 },
        { stars: 2, pct: 1 },
        { stars: 1, pct: 1 },
      ],
    },
  },
  year: {
    totalTrips: 334_812,
    conversionRate: 81,
    avgDurationMin: 14.7,
    repeatRiders: 71,
    totalTripsDelta: 38,
    conversionDelta: 6,
    durationDelta: 1,
    repeatDelta: 14,
    trend: [
      { label: "Q1", value: 76_280 },
      { label: "Q2", value: 81_440 },
      { label: "Q3", value: 85_848 },
      { label: "Q4", value: 91_244 },
    ],
    funnel: [
      { stage: "Ride requested", value: 413_348, pct: 100 },
      { stage: "Driver matched", value: 388_546, pct: 94 },
      { stage: "Negotiation agreed", value: 339_206, pct: 82 },
      { stage: "Ride completed", value: 334_812, pct: 81 },
    ],
    vehicleMix: [
      { vehicle: "Cab Taxi", pct: 60, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 22, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 12, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, color: "bg-foreground" },
    ],
    satisfaction: {
      avg: 4.7,
      total: 334_812,
      breakdown: [
        { stars: 5, pct: 74 },
        { stars: 4, pct: 18 },
        { stars: 3, pct: 5 },
        { stars: 2, pct: 2 },
        { stars: 1, pct: 1 },
      ],
    },
  },
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 7 × 24 heatmap — Kigali commute pattern
const heatmap: number[][] = [
  // Mon
  [4, 2, 1, 1, 1, 4, 24, 68, 82, 64, 52, 58, 72, 68, 52, 48, 68, 92, 78, 54, 32, 18, 10, 6],
  // Tue
  [4, 2, 1, 1, 1, 4, 26, 72, 84, 66, 54, 60, 74, 70, 54, 50, 70, 94, 80, 56, 34, 20, 12, 7],
  // Wed
  [5, 3, 1, 1, 1, 5, 28, 74, 86, 68, 56, 62, 76, 72, 56, 52, 72, 96, 82, 58, 36, 22, 12, 8],
  // Thu
  [5, 3, 2, 1, 2, 5, 30, 78, 90, 72, 58, 64, 80, 76, 60, 56, 76, 100, 88, 62, 40, 24, 14, 9],
  // Fri
  [8, 4, 2, 2, 3, 7, 34, 84, 96, 78, 64, 68, 84, 80, 68, 64, 84, 110, 124, 102, 78, 56, 38, 22],
  // Sat
  [22, 12, 6, 4, 4, 6, 18, 38, 56, 64, 72, 86, 96, 92, 88, 86, 92, 108, 132, 118, 94, 78, 58, 38],
  // Sun
  [18, 10, 5, 3, 3, 5, 14, 28, 38, 46, 52, 64, 76, 72, 68, 66, 76, 84, 78, 64, 48, 32, 22, 14],
];

const topPerformers = [
  { name: "Helen Niyibizi", vehicleType: "Cab Taxi", trips: 432, rating: 4.95 },
  { name: "Olivier Hakizimana", vehicleType: "Cab Taxi", trips: 401, rating: 4.93 },
  { name: "Joyce Habineza", vehicleType: "Moto Bike", trips: 388, rating: 4.91 },
  { name: "Aiden Mugisha", vehicleType: "Cab Taxi", trips: 376, rating: 4.89 },
  { name: "Patrick Nshimiyimana", vehicleType: "Light Hilux", trips: 312, rating: 4.87 },
  { name: "Roland Karangwa", vehicleType: "Moto Bike", trips: 298, rating: 4.86 },
];

function formatBigNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

function DeltaPill({ value, invertColor }: { value: number; invertColor?: boolean }) {
  const up = value >= 0;
  const positive = invertColor ? !up : up;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        positive ? "text-primary" : "text-red-600"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-2.5 w-2.5"
        aria-hidden
      >
        {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div className="flex h-44 items-end gap-3">
        {data.map((d, i) => {
          const isPeak = d.value === max;
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-foreground shadow-sm ring-1 ring-border group-hover:block">
                {d.label} · {formatBigNumber(d.value)}
              </span>
              <div
                className={`w-full rounded-md ${
                  isPeak ? "bg-primary" : "bg-primary/30"
                }`}
                style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
              />
              <span
                className={`text-[10px] ${
                  isPeak ? "font-bold text-primary" : "text-muted-foreground"
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

function FunnelChart({
  funnel,
}: {
  funnel: { stage: string; value: number; pct: number }[];
}) {
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
                {f.value.toLocaleString()}{" "}
                <span className="font-bold text-foreground">({f.pct}%)</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${f.pct}%` }}
              />
            </div>
            {dropoff > 0 ? (
              <p
                className={`mt-1 text-[10px] font-semibold ${
                  dropoff > 5 ? "text-red-600" : "text-amber-600"
                }`}
              >
                −{dropoff}% drop-off
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ActivityHeatmap() {
  const flat = heatmap.flat();
  const max = Math.max(...flat);
  const cellColor = (v: number) => {
    const intensity = v / max;
    if (intensity > 0.85) return "bg-primary";
    if (intensity > 0.65) return "bg-primary/75";
    if (intensity > 0.45) return "bg-primary/50";
    if (intensity > 0.25) return "bg-primary/25";
    if (intensity > 0.08) return "bg-primary/15";
    return "bg-muted";
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <div className="flex shrink-0 flex-col justify-between pt-3 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {daysOfWeek.map((d) => (
            <span key={d} className="h-4 leading-none">
              {d}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="space-y-1">
            {heatmap.map((row, dayIdx) => (
              <div key={dayIdx} className="flex gap-1">
                {row.map((v, hourIdx) => (
                  <div
                    key={hourIdx}
                    className={`group relative h-4 flex-1 rounded ${cellColor(v)}`}
                  >
                    <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-foreground shadow-sm ring-1 ring-border group-hover:block">
                      {daysOfWeek[dayIdx]} · {hourIdx.toString().padStart(2, "0")}
                      :00 · {v} trips
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-muted-foreground">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <span className="block h-3 w-3 rounded bg-muted" />
        <span className="block h-3 w-3 rounded bg-primary/15" />
        <span className="block h-3 w-3 rounded bg-primary/25" />
        <span className="block h-3 w-3 rounded bg-primary/50" />
        <span className="block h-3 w-3 rounded bg-primary/75" />
        <span className="block h-3 w-3 rounded bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}

function Donut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: { pct: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  let offset = 0;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 40 40" aria-hidden className="h-full w-full">
        <circle
          cx="20"
          cy="20"
          r="14"
          fill="none"
          strokeWidth="5"
          className="stroke-muted"
        />
        {slices.map((s, i) => {
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
              strokeWidth="5"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              className={s.color.replace("bg-", "stroke-")}
              transform="rotate(-90 20 20)"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {centerLabel}
        </span>
        <span className="text-sm font-bold text-foreground">{centerValue}</span>
      </div>
    </div>
  );
}

export function AnalyticsConsole() {
  const [period, setPeriod] = useState<Period>("month");
  const p = data[period];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Period
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
          {(Object.keys(periodLabels) as Period[]).map((id) => {
            const active = period === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setPeriod(id)}
                className={`shrink-0 rounded-md px-3 py-1 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {periodLabels[id]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Trips"
          value={formatBigNumber(p.totalTrips)}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.totalTripsDelta} />
              <span>{periodCompare[period]}</span>
            </span>
          }
        />
        <StatCard
          label="Conversion Rate"
          value={`${p.conversionRate}%`}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.conversionDelta} />
              <span>request → completed</span>
            </span>
          }
        />
        <StatCard
          label="Avg Trip Duration"
          value={`${Math.floor(p.avgDurationMin)}m ${Math.round(
            (p.avgDurationMin - Math.floor(p.avgDurationMin)) * 60,
          )}s`}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.durationDelta} invertColor />
              <span>{periodCompare[period]}</span>
            </span>
          }
        />
        <StatCard
          label="Repeat Riders"
          value={`${p.repeatRiders}%`}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.repeatDelta} />
              <span>took 2+ trips</span>
            </span>
          }
        />
      </div>

      <Card
        title={`Trips · ${periodLabels[period].toLowerCase()}`}
        bodyClass="p-4"
        action={
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="block h-2 w-2 rounded-full bg-primary" />
            Completed trips
          </span>
        }
      >
        <TrendChart data={p.trend} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Conversion funnel">
          <FunnelChart funnel={p.funnel} />
        </Card>

        <Card
          title="Activity by day & hour"
          action={
            <span className="text-[11px] text-muted-foreground">
              Peak: Fri 18:00
            </span>
          }
        >
          <ActivityHeatmap />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Vehicle mix" bodyClass="p-4">
          <div className="flex items-center gap-4">
            <Donut
              slices={p.vehicleMix.map((v) => ({ pct: v.pct, color: v.color }))}
              centerLabel="Total"
              centerValue={formatBigNumber(p.totalTrips)}
            />
            <ul className="flex-1 space-y-2 text-xs">
              {p.vehicleMix.map((v) => (
                <li key={v.vehicle} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={`block h-2 w-2 rounded-full ${v.color}`} />
                    {v.vehicle}
                  </span>
                  <span className="font-bold text-foreground">{v.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Customer satisfaction" bodyClass="p-4">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {p.satisfaction.avg.toFixed(1)}
            </p>
            <span className="text-2xl text-amber-500">★</span>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            based on {p.satisfaction.total.toLocaleString()} ratings
          </p>
          <div className="mt-4 space-y-1.5 text-[11px]">
            {p.satisfaction.breakdown.map((r) => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="w-3 text-muted-foreground">{r.stars}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top performers">
          <ul className="divide-y divide-border">
            {topPerformers.map((d, i) => (
              <li
                key={d.name}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <Avatar name={d.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                    {d.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {d.vehicleType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">
                    {d.trips}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {d.rating.toFixed(2)}{" "}
                    <span className="text-amber-500">★</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
