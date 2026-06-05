"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getRidesSeries, getDriverStatus, getTopDrivers,
  type RidesSeries, type DriverStatusSnapshot, type TopDriver,
} from "@/lib/api";
import { periodToDays, readCustomRange, readPeriod } from "./_period-filter";

// ── Ride Trend ───────────────────────────────────────────────────────────────

const HOUR_LABELS = ["00", "06", "12", "18"];

function formatBucketLabel(iso: string, bucket: "hour" | "day"): string {
  const d = new Date(iso);
  if (bucket === "hour") return d.getHours().toString().padStart(2, "0");
  return d.toLocaleDateString("en-US", { weekday: "narrow" });
}

export function RideTrendWidget() {
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const range = readCustomRange(searchParams);
  const isCustom = period === "custom" && range !== null;
  const fetchKey = isCustom ? `from=${range.from}&to=${range.to}` : `days=${periodToDays(period)}`;

  const [data, setData] = useState<RidesSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const win = isCustom ? { from: range.from, to: range.to } : { days: periodToDays(period) };
    getRidesSeries(win)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const totalLabel = data
    ? `${(data.current.totalCompleted + data.current.totalCancelled).toLocaleString()} rides`
    : "—";
  const periodTag = data?.current.label ?? "—";

  // Sample bars: aim for ~24 to keep the bars readable.
  const points = data?.current.points ?? [];
  const visible = sampleBars(points, 24);
  const max = Math.max(1, ...visible.map((p) => p.completed + p.cancelled));

  // Highlight today's bar when showing daily buckets
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Ride Trend</h2>
          <p className="text-[10px] text-muted-foreground">
            {data ? `${totalLabel} ${periodTag.toLowerCase()}` : "Loading…"}
          </p>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">{periodTag}</span>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted/60" />
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Could not load ride trend.
          </div>
        ) : visible.length === 0 || max === 1 ? (
          <div className="flex h-32 items-center justify-center text-[11px] text-muted-foreground">
            No rides in this window yet.
          </div>
        ) : (
          <>
            <div className="flex h-32 items-end justify-between gap-1">
              {visible.map((p, i) => {
                const completedH = (p.completed / max) * 100;
                const cancelledH = (p.cancelled / max) * 100;
                const isToday = data?.bucket === "day" && p.t.slice(0, 10) === todayKey;
                return (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-0.5">
                    {p.cancelled > 0 ? (
                      <div className="w-full rounded-t bg-muted" style={{ height: `${cancelledH}%` }} />
                    ) : null}
                    <div
                      className={`w-full ${isToday ? "bg-primary" : "bg-primary/80"} ${
                        p.cancelled > 0 ? "rounded-b-sm" : "rounded-sm"
                      }`}
                      style={{ height: `${completedH}%`, minHeight: p.completed > 0 ? 2 : 0 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between px-0.5 text-[9px] text-muted-foreground">
              {axisLabels(visible, data?.bucket ?? "day")}
            </div>
          </>
        )}
        <div className="mt-3 flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-primary" /> Completed
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-muted" /> Cancelled
          </span>
        </div>
      </div>
    </div>
  );
}

function sampleBars<T>(pts: T[], maxBars: number): T[] {
  if (pts.length <= maxBars) return pts;
  const step = pts.length / maxBars;
  return Array.from({ length: maxBars }, (_, i) => pts[Math.floor(i * step)]);
}

function axisLabels(points: { t: string }[], bucket: "hour" | "day") {
  if (points.length === 0) return null;
  // Pick up to 7 evenly spaced labels
  const labelCount = Math.min(7, points.length);
  const step = Math.max(1, Math.floor(points.length / labelCount));
  const picks = new Set<number>();
  for (let i = 0; i < points.length; i += step) picks.add(i);
  picks.add(points.length - 1);

  return points.map((p, i) => (
    <span key={i} className={picks.has(i) ? "" : "opacity-0"}>
      {picks.has(i) ? formatBucketLabel(p.t, bucket) : ""}
    </span>
  ));
}

// ── Driver Status ────────────────────────────────────────────────────────────

export function DriverStatusWidget() {
  const [data, setData] = useState<DriverStatusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getDriverStatus()
        .then((d) => !cancelled && setData(d))
        .catch(() => !cancelled && setError(true))
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    const id = setInterval(load, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const total = data ? data.online + data.onTrip + data.offline : 0;
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  // Donut: stroke-dasharray takes "length gap" where the circumference is 100.
  // We position the on-trip arc with dashoffset so it sits after online.
  const onlinePct = pct(data?.online ?? 0);
  const onTripPct = pct(data?.onTrip ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Driver Status</h2>
        <span className="text-[10px] font-medium text-muted-foreground">Now</span>
      </div>
      <div className="flex items-center gap-4 p-4">
        {loading ? (
          <div className="h-20 w-20 animate-pulse rounded-full bg-muted/60" />
        ) : error ? (
          <div className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Could not load driver status.
          </div>
        ) : (
          <>
            <svg viewBox="0 0 40 40" aria-hidden className="h-20 w-20 shrink-0">
              <circle cx="20" cy="20" r="14" fill="none" strokeWidth="5" className="stroke-muted" />
              {onlinePct > 0 ? (
                <circle
                  cx="20" cy="20" r="14" fill="none" strokeWidth="5"
                  strokeDasharray={`${onlinePct} ${100 - onlinePct}`}
                  className="stroke-primary"
                  transform="rotate(-90 20 20)"
                  strokeLinecap="round"
                />
              ) : null}
              {onTripPct > 0 ? (
                <circle
                  cx="20" cy="20" r="14" fill="none" strokeWidth="5"
                  strokeDasharray={`${onTripPct} ${100 - onTripPct}`}
                  strokeDashoffset={`-${onlinePct}`}
                  className="stroke-amber-400"
                  transform="rotate(-90 20 20)"
                  strokeLinecap="round"
                />
              ) : null}
            </svg>
            <div className="flex-1 space-y-2">
              <StatusRow color="bg-primary" label="Online" value={data?.online ?? 0} />
              <StatusRow color="bg-amber-400" label="On trip" value={data?.onTrip ?? 0} />
              <StatusRow color="bg-muted-foreground/30" label="Offline" value={data?.offline ?? 0} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-muted-foreground">{label}</span>
      </span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

// ── Top Drivers ──────────────────────────────────────────────────────────────

export function TopDriversWidget() {
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const range = readCustomRange(searchParams);
  const isCustom = period === "custom" && range !== null;
  const fetchKey = isCustom ? `from=${range.from}&to=${range.to}` : `days=${periodToDays(period)}`;

  const [drivers, setDrivers] = useState<TopDriver[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const win = isCustom ? { from: range.from, to: range.to } : { days: periodToDays(period) };
    getTopDrivers(win, 4)
      .then(setDrivers)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const max = drivers && drivers.length > 0 ? Math.max(...drivers.map((d) => d.rides)) : 0;
  const periodTag = period === "today" ? "Today" : period === "week" ? "Week" : period === "month" ? "Month" : "Custom";

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Top Drivers</h2>
        <span className="text-[10px] font-medium text-muted-foreground">{periodTag}</span>
      </div>
      {loading ? (
        <ul className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-3 w-3 rounded bg-muted" />
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2"><div className="h-3 w-24 rounded bg-muted" /><div className="h-1.5 w-full rounded bg-muted" /></div>
              <div className="h-3 w-6 rounded bg-muted" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not load top drivers.
        </div>
      ) : drivers && drivers.length > 0 ? (
        <ul className="space-y-3 p-4">
          {drivers.map((d, i) => {
            const initial = d.name.charAt(0).toUpperCase() || "?";
            const widthPct = max > 0 ? Math.round((d.rides / max) * 100) : 0;
            return (
              <li key={d.id} className="flex items-center gap-3">
                <span className="w-3 text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-inset ring-primary/30">
                  <span className="text-[10px] font-bold">{initial}</span>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                      d.isOnline ? "bg-primary" : "bg-muted-foreground/40"
                    }`}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-foreground">{d.name}</div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground">{d.rides}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex h-32 items-center justify-center px-4 text-[11px] text-muted-foreground">
          No completed rides in this window yet.
        </div>
      )}
    </div>
  );
}
