"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "../_components";
import {
  PeriodFilter,
  periodLabel,
  priorPeriodLabel,
  periodToQueryDays,
  readCustomRange,
  readPeriod,
} from "../_period-filter";
import { isAnalyticsVehicle, vehicleSharePct } from "@/lib/mock-analytics";
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
import {
  ActivityHeatmapChart,
  AnalyticsInsightBanner,
  AnalyticsQuickLinks,
  AnalyticsStatGrid,
  buildInsights,
  ChartSkeleton,
  formatBigNumber,
  FunnelChart,
  peakActivityLabel,
  TopDriversList,
  TrendChart,
  VehicleFilteredSummary,
  VehicleMixDonut,
  VEHICLE_COLORS,
  TRANSPORT_DISPLAY,
} from "./analytics-visuals";

const VEHICLE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All vehicles" },
  { id: "MOTO_BIKE", label: "Moto Bike" },
  { id: "CAB_TAXI", label: "Cab Taxi" },
  { id: "LIGHT_HILUX", label: "Light Hilux" },
  { id: "HEAVY_FUSO", label: "Heavy Fuso" },
];

function readVehicleFilter(params: { get(k: string): string | null }): string {
  const v = params.get("vehicle");
  return v && isAnalyticsVehicle(v) ? v : "all";
}

function sumCompleted(points: DailyRidePoint[]): number {
  return points.reduce((sum, d) => sum + d.completed, 0);
}

function aggregateTrend(
  days: DailyRidePoint[],
  queryDays: number,
): { label: string; value: number }[] {
  if (!days.length) return [];
  const sorted = [...days].sort((a, b) => a.day.localeCompare(b.day));

  if (queryDays <= 14) {
    return sorted.map((d) => ({
      label:
        queryDays === 1
          ? "Today"
          : new Date(d.day).toLocaleDateString("en-US", { weekday: "short" }),
      value: d.completed,
    }));
  }
  if (queryDays <= 45) {
    return sorted.map((d) => ({
      label: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: d.completed,
    }));
  }
  const weeks: { label: string; value: number }[] = [];
  for (let i = 0; i < sorted.length; i += 7) {
    const chunk = sorted.slice(i, i + 7);
    weeks.push({
      label: `W${Math.floor(i / 7) + 1}`,
      value: chunk.reduce((s, d) => s + d.completed, 0),
    });
  }
  return weeks;
}

function buildHeatmap(cells: ActivityCell[]): number[][] {
  const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const c of cells) {
    const row = (c.day + 6) % 7;
    grid[row][c.hour] = (grid[row][c.hour] ?? 0) + c.count;
  }
  return grid;
}

function findPeakCell(grid: number[][]): { row: number; col: number } {
  let peak = 0;
  let row = 0;
  let col = 0;
  grid.forEach((r, ri) => {
    r.forEach((v, ci) => {
      if (v > peak) {
        peak = v;
        row = ri;
        col = ci;
      }
    });
  });
  return { row, col };
}

export function AnalyticsConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const customRange = readCustomRange(searchParams);
  const queryDays = periodToQueryDays(period, customRange);
  const rangeLabel = periodLabel(period, customRange);
  const vehicleFilter = readVehicleFilter(searchParams);
  const vehicleQuery = vehicleFilter === "all" ? undefined : vehicleFilter;
  const vehicleLabel =
    vehicleFilter === "all" ? "All vehicles" : (TRANSPORT_DISPLAY[vehicleFilter] ?? vehicleFilter);

  const setVehicleFilter = (id: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id === "all") next.delete("vehicle");
    else next.set("vehicle", id);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const [dailyRides, setDailyRides] = useState<DailyRidePoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [vehicleMix, setVehicleMix] = useState<VehicleMixItem[]>([]);
  const [drivers, setDrivers] = useState<DriverPerf[]>([]);
  const [satisfaction, setSatisfaction] = useState<SatisfactionData | null>(null);
  const [activityCells, setActivityCells] = useState<ActivityCell[]>([]);
  const [completedDeltaPct, setCompletedDeltaPct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getRidesDaily(queryDays, vehicleQuery),
      getRidesDaily(queryDays, vehicleQuery, queryDays),
      getFunnel(queryDays, vehicleQuery),
      getVehicleMix(queryDays, vehicleQuery),
      getDriverPerformance(vehicleQuery),
      getActivityHeatmap(vehicleQuery),
      getSatisfaction(),
    ])
      .then(([rides, priorRides, f, mix, driverList, activity, sat]) => {
        if (cancelled) return;
        const currentRides = Array.isArray(rides) ? rides : [];
        const previousRides = Array.isArray(priorRides) ? priorRides : [];
        setDailyRides(currentRides);
        setFunnel(f ?? null);
        setVehicleMix(Array.isArray(mix) ? mix : []);
        setDrivers(Array.isArray(driverList) ? driverList.slice(0, 6) : []);
        setActivityCells(Array.isArray(activity) ? activity : []);
        setSatisfaction(sat ?? null);

        const cur = sumCompleted(currentRides);
        const prev = sumCompleted(previousRides);
        setCompletedDeltaPct(prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);
      })
      .catch(() => {
        if (!cancelled) {
          setDailyRides([]);
          setFunnel(null);
          setVehicleMix([]);
          setDrivers([]);
          setActivityCells([]);
          setSatisfaction(null);
          setCompletedDeltaPct(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryDays, vehicleQuery]);

  const trend = useMemo(() => aggregateTrend(dailyRides, queryDays), [dailyRides, queryDays]);
  const heatmapGrid = useMemo(() => buildHeatmap(activityCells), [activityCells]);
  const peakCell = useMemo(() => findPeakCell(heatmapGrid), [heatmapGrid]);
  const peakHour = useMemo(() => peakActivityLabel(heatmapGrid), [heatmapGrid]);

  const totalCompleted = funnel?.completed ?? 0;
  const totalCancelled = funnel?.cancelled ?? 0;
  const conversionRate =
    funnel && funnel.booked > 0 ? Math.round((funnel.completed / funnel.booked) * 100) : 0;
  const cancelRate =
    funnel && funnel.booked > 0 ? Math.round((funnel.cancelled / funnel.booked) * 100) : 0;

  const funnelStages =
    funnel && funnel.booked > 0
      ? [
          { stage: "Ride requested", value: funnel.booked, pct: 100 },
          {
            stage: "Driver matched",
            value: funnel.matched,
            pct: Math.round((funnel.matched / funnel.booked) * 100),
          },
          {
            stage: "Ride confirmed",
            value: funnel.confirmed,
            pct: Math.round((funnel.confirmed / funnel.booked) * 100),
          },
          {
            stage: "Ride completed",
            value: funnel.completed,
            pct: Math.round((funnel.completed / funnel.booked) * 100),
          },
        ]
      : [];

  const totalVehicleRides = vehicleMix.reduce((s, v) => s + v.rides, 0) || 1;
  const vehicleMixUI = vehicleMix.map((v) => ({
    vehicle: TRANSPORT_DISPLAY[v.transport_type] ?? v.transport_type,
    pct: Math.round((v.rides / totalVehicleRides) * 100),
    colorKey: v.transport_type,
    color: VEHICLE_COLORS[v.transport_type] ?? "bg-muted",
    revenue: v.revenue,
    rides: v.rides,
  }));

  const topVehicleLabel =
    vehicleFilter === "all" && vehicleMixUI.length > 0
      ? [...vehicleMixUI].sort((a, b) => b.pct - a.pct)[0]?.vehicle ?? null
      : null;

  const scopeSummary =
    vehicleFilter === "all" ? rangeLabel : `${rangeLabel} · ${vehicleLabel}`;

  const insightLines = buildInsights({
    loading,
    completedDeltaPct,
    conversionRate,
    peakHour,
    topVehicleLabel,
    vehicleFilter,
    rangeLabel,
    totalCompleted,
    priorPeriodLabel: priorPeriodLabel(period),
  });

  const statItems: Parameters<typeof AnalyticsStatGrid>[0]["stats"] = [
    {
      label: "Completed trips",
      value: loading ? "…" : formatBigNumber(totalCompleted),
      hint:
        loading || completedDeltaPct === null ? (
          rangeLabel.toLowerCase()
        ) : (
          <span className={completedDeltaPct >= 0 ? "font-semibold text-primary" : "font-semibold text-red-600"}>
            {completedDeltaPct >= 0 ? "+" : ""}
            {completedDeltaPct}% vs {priorPeriodLabel(period)}
          </span>
        ),
      tone: completedDeltaPct !== null && completedDeltaPct >= 0 ? "success" : "default",
      icon: "trips",
    },
    {
      label: "Conversion",
      value: loading ? "…" : `${conversionRate}%`,
      hint: "request → completed",
      tone: conversionRate >= 80 ? "primary" : "default",
      icon: "conversion",
    },
    {
      label: "Cancelled",
      value: loading ? "…" : formatBigNumber(totalCancelled),
      hint: loading ? "—" : `${cancelRate}% of requests`,
      tone: cancelRate > 15 ? "warn" : "default",
      icon: "cancel",
    },
    vehicleFilter !== "all" && isAnalyticsVehicle(vehicleFilter)
      ? {
          label: "Platform share",
          value: loading ? "…" : `${vehicleSharePct(vehicleFilter)}%`,
          hint: "typical share of all trips",
          tone: "primary",
          icon: "completion",
        }
      : {
          label: "Completion (30d)",
          value: loading || !satisfaction ? "…" : `${satisfaction.completion_rate_pct.toFixed(1)}%`,
          hint: "all vehicles · rolling",
          tone: "primary",
          icon: "completion",
        },
  ];

  return (
    <div className="analytics-console space-y-6">
      <AnalyticsQuickLinks />

      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.04] p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">Filters</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Platform-wide · {scopeSummary}</p>
          </div>
          <PeriodFilter />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
          {VEHICLE_FILTERS.map((v) => {
            const active = vehicleFilter === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVehicleFilter(v.id)}
                className={`inline-flex h-8 items-center rounded-full px-3.5 text-[11px] font-semibold transition-all ${
                  active
                    ? "border border-primary/40 bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border bg-card/80 text-muted-foreground hover:border-primary/25 hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnalyticsInsightBanner lines={insightLines} loading={loading} />

      <AnalyticsStatGrid stats={statItems} />

      <Card
        title={`Trip volume · ${rangeLabel.toLowerCase()}${vehicleFilter !== "all" ? ` · ${vehicleLabel}` : ""}`}
        bodyClass="p-4 pt-2"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Completed trips
          </span>
        }
      >
        {loading ? <ChartSkeleton /> : <TrendChart data={trend} />}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title={`Conversion funnel${vehicleFilter !== "all" ? ` · ${vehicleLabel}` : ""}`}>
          {loading ? (
            <div className="p-4">
              <ChartSkeleton height="h-52" />
            </div>
          ) : (
            <FunnelChart funnel={funnelStages} />
          )}
        </Card>

        <Card
          title="When riders travel"
          action={
            <div className="flex flex-col items-end gap-0.5">
              <Link href="/admin/heatmaps" className="text-[11px] font-semibold text-primary hover:underline">
                Live demand →
              </Link>
              <span className="text-[10px] text-muted-foreground">90-day pattern · Kigali time</span>
            </div>
          }
        >
          {loading ? (
            <div className="p-4">
              <ChartSkeleton height="h-40" />
            </div>
          ) : (
            <ActivityHeatmapChart grid={heatmapGrid} peakRow={peakCell.row} peakCol={peakCell.col} />
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title={vehicleFilter === "all" ? "Vehicle mix" : vehicleLabel} bodyClass="p-4">
          {loading ? (
            <ChartSkeleton height="h-36" />
          ) : vehicleMixUI.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No vehicle data yet.</p>
          ) : vehicleFilter !== "all" && vehicleMixUI.length === 1 ? (
            <VehicleFilteredSummary
              vehicleLabel={vehicleMixUI[0]!.vehicle}
              vehicleCode={vehicleFilter}
              trips={vehicleMixUI[0]!.rides}
              revenue={vehicleMixUI[0]!.revenue}
            />
          ) : (
            <VehicleMixDonut
              items={vehicleMixUI.map((v) => ({
                vehicle: v.vehicle,
                pct: v.pct,
                rides: v.rides,
                colorKey: v.colorKey,
              }))}
              centerValue={formatBigNumber(totalCompleted)}
            />
          )}
        </Card>

        <Card
          title={
            vehicleFilter === "all"
              ? "Top drivers · 30 days"
              : `Top ${vehicleLabel.toLowerCase()} drivers`
          }
          action={
            peakHour ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Rush · {peakHour}
              </span>
            ) : null
          }
        >
          {loading ? (
            <div className="p-4">
              <ChartSkeleton height="h-48" />
            </div>
          ) : drivers.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No driver data for this vehicle type yet.
            </p>
          ) : (
            <TopDriversList drivers={drivers} />
          )}
        </Card>
      </div>
    </div>
  );
}
