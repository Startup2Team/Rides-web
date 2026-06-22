"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRevenueSeries, type RevenueSeries, type RevenuePoint } from "@/lib/api";
import { periodToDays, readCustomRange, readPeriod } from "./_period-filter";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}

function fmtTimeForBucket(iso: string, bucket: "hour" | "day"): string {
  const d = new Date(iso);
  if (bucket === "hour") {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Sample N points evenly down to fit into vbox width — keeps the SVG light
// even if the backend ever returns hundreds of buckets.
function sample<T>(pts: T[], max = 96): T[] {
  if (pts.length <= max) return pts;
  const step = pts.length / max;
  const out: T[] = [];
  for (let i = 0; i < max; i++) out.push(pts[Math.floor(i * step)]);
  // Always include the last point
  out[out.length - 1] = pts[pts.length - 1];
  return out;
}

// Build a smoothed-ish SVG path from values normalized to viewBox 200x80.
// vMax controls the y-scale; both lines share the same scale.
function pathFor(values: number[], vMax: number, opts: { area?: boolean }): string {
  if (values.length === 0) return "";
  const w = 200, h = 80, pad = 4;
  const usableH = h - pad * 2;
  const n = values.length;
  if (n === 1) {
    const x = w / 2;
    const y = h - pad - (values[0] / Math.max(vMax, 1)) * usableH;
    return opts.area ? `M0 ${h} L0 ${y} L${w} ${y} L${w} ${h} Z` : `M0 ${y} L${w} ${y}`;
  }

  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * w;
    const norm = vMax > 0 ? v / vMax : 0;
    const y = h - pad - norm * usableH;
    return { x, y };
  });

  // Quadratic-ish smoothing: line between successive midpoints with the actual
  // point as the control. Looks cleaner than straight L segments.
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const midX = (prev.x + cur.x) / 2;
    const midY = (prev.y + cur.y) / 2;
    d += ` Q${prev.x} ${prev.y} ${midX} ${midY}`;
    if (i === pts.length - 1) d += ` T${cur.x} ${cur.y}`;
  }

  if (opts.area) {
    d += ` L${w} ${h} L0 ${h} Z`;
  }
  return d;
}

// Locate the peak position in viewBox coords for the badge marker.
function peakPosition(points: RevenuePoint[], peak: RevenuePoint | undefined | null, vMax: number) {
  if (!peak || points.length === 0 || vMax <= 0) return null;
  const idx = points.findIndex((p) => p.t === peak.t);
  if (idx < 0) return null;
  const w = 200, h = 80, pad = 4;
  const usableH = h - pad * 2;
  const x = points.length === 1 ? w / 2 : (idx / (points.length - 1)) * w;
  const y = h - pad - (peak.v / vMax) * usableH;
  return { x, y };
}

// ── component ────────────────────────────────────────────────────────────────

export function RevenueWidget() {
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const range = readCustomRange(searchParams);
  const isCustom = period === "custom" && range !== null;

  const fetchKey = isCustom ? `from=${range.from}&to=${range.to}` : `days=${periodToDays(period)}`;

  const [series, setSeries] = useState<RevenueSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const win = isCustom
      ? { from: range.from, to: range.to }
      : { days: periodToDays(period) };
    getRevenueSeries(win)
      .then(setSeries)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Revenue {series?.current.label ?? "Today"}
        </h2>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
          Live
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {loading ? (
          <SkeletonBody />
        ) : error || !series ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Could not load revenue chart.
          </div>
        ) : (
          <ChartBody series={series} />
        )}
      </div>
    </div>
  );
}

function SkeletonBody() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-7 w-32 rounded bg-muted" />
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="mt-3 h-32 rounded-lg bg-muted/60" />
    </div>
  );
}

function ChartBody({ series }: { series: RevenueSeries }) {
  const currentPoints = sample(series.current.points);
  const previousPoints = sample(series.previous.points);

  // Share scale across both lines so they compare visually.
  const vMax = Math.max(
    1,
    ...currentPoints.map((p) => p.v),
    ...previousPoints.map((p) => p.v)
  );

  const currentValues = currentPoints.map((p) => p.v);
  const previousValues = previousPoints.map((p) => p.v);

  const peakPos = peakPosition(currentPoints, series.current.peak, vMax);

  const deltaRound = Math.round(series.deltaPct);
  const deltaPositive = deltaRound >= 0;
  const noData = series.current.total === 0 && series.previous.total === 0;

  return (
    <>
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {fmtCurrency(series.current.total)} RWF
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center gap-0.5 font-semibold ${
            deltaPositive ? "text-primary" : "text-red-600"
          }`}
        >
          {deltaPositive ? "↑" : "↓"} {Math.abs(deltaRound)}%
        </span>
        <span className="text-muted-foreground">vs {series.previous.label.toLowerCase()}</span>
      </div>

      <div className="relative mt-4 flex-1">
        {noData ? (
          <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
            No revenue in this window yet.
          </div>
        ) : (
          <>
            {series.current.peak && peakPos ? (
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-md"
                style={{ left: `${(peakPos.x / 200) * 100}%`, top: `${(peakPos.y / 80) * 100}%` }}
              >
                <div className="text-[8px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Peak
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="whitespace-nowrap text-[11px] font-bold text-foreground">
                    {fmtTimeForBucket(series.current.peak.t, series.bucket)}
                  </span>
                  <span className="text-[11px] font-bold text-primary">
                    {fmtCurrency(series.current.peak.v)}
                  </span>
                </div>
              </div>
            ) : null}

            <svg
              viewBox="0 0 200 80"
              preserveAspectRatio="none"
              aria-hidden
              className="h-full w-full"
            >
              {/* Current area + line */}
              <path d={pathFor(currentValues, vMax, { area: true })} fill="rgba(0,200,83,0.15)" />
              <path
                d={pathFor(currentValues, vMax, { area: false })}
                stroke="#007AFF"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* Previous dashed line */}
              <path
                d={pathFor(previousValues, vMax, { area: false })}
                stroke="rgba(0,0,0,0.35)"
                strokeWidth="1.25"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              {/* Peak marker */}
              {peakPos ? (
                <>
                  <line
                    x1={peakPos.x}
                    x2={peakPos.x}
                    y1="0"
                    y2="80"
                    stroke="rgba(0,200,83,0.4)"
                    strokeWidth="0.75"
                    strokeDasharray="2 2"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={peakPos.x} cy={peakPos.y} r="3" fill="#007AFF" stroke="white" strokeWidth="1.5" />
                </>
              ) : null}
            </svg>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-3 rounded-full bg-primary" />
          {series.current.label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-3 bg-muted-foreground/50" />
          {series.previous.label}
        </span>
      </div>
    </>
  );
}
