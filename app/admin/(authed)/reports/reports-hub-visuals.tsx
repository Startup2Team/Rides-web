"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatBigNumber, formatRWF } from "../analytics/analytics-visuals";

const PAGE_SIZE = 8;

export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  deltaPct: number | null;
  hint: string;
  tone?: "default" | "primary" | "success" | "warn" | "danger";
};

export type NamedValue = { name: string; value: number; pct?: number; color?: string };

export type RideRecord = {
  id: string;
  customer: string;
  driver: string;
  pickup: string;
  destination: string;
  fare: number;
  paymentMethod: string;
  status: string;
  vehicle: string;
  branch: string;
  createdAt: string;
  createdAtMs: number;
};

export type TimelineEvent = {
  id: string;
  kind: "registration" | "booking" | "payment" | "driver" | "admin" | "alert";
  title: string;
  detail: string;
  at: string;
  atMs: number;
};

export type HubAlert = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  actionLabel?: string;
  actionHref?: string;
};

export function HubKpiGrid({ kpis, loading }: { kpis: KpiMetric[]; loading: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {kpis.map((k) => {
        const toneClass =
          k.tone === "primary"
            ? "text-primary"
            : k.tone === "success"
              ? "text-emerald-600"
              : k.tone === "warn"
                ? "text-amber-600"
                : k.tone === "danger"
                  ? "text-red-600"
                  : "text-foreground";
        return (
          <div
            key={k.id}
            className="rounded-2xl border border-border bg-card p-3.5 transition-shadow hover:shadow-md hover:shadow-primary/5"
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{k.label}</p>
            <p className={`mt-1.5 text-xl font-bold tracking-tight ${toneClass}`}>{loading ? "…" : k.value}</p>
            {!loading && k.deltaPct !== null ? (
              <p className={`mt-1 text-[10px] font-semibold ${k.deltaPct >= 0 ? "text-primary" : "text-red-600"}`}>
                {k.deltaPct >= 0 ? "+" : ""}
                {k.deltaPct}% vs prior period
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-muted-foreground">{k.hint}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function HorizontalBars({ items, valueFmt }: { items: NamedValue[]; valueFmt?: (n: number) => string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const fmt = valueFmt ?? ((n: number) => formatBigNumber(n));
  return (
    <ul className="space-y-3 p-4">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{item.name}</span>
            <span className="font-bold text-foreground">
              {fmt(item.value)}
              {item.pct !== undefined ? ` · ${item.pct}%` : ""}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${item.color ?? "bg-primary"}`}
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatPairGrid({
  items,
}: {
  items: { label: string; value: string | number; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-surface/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{item.value}</p>
          {item.hint ? <p className="mt-0.5 text-[10px] text-muted-foreground">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

const TIMELINE_ICONS: Record<TimelineEvent["kind"], string> = {
  registration: "👤",
  booking: "🚗",
  payment: "💳",
  driver: "🪪",
  admin: "⚙️",
  alert: "⚠️",
};

export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ul className="divide-y divide-border">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3 px-4 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
            {TIMELINE_ICONS[e.kind]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{e.title}</p>
            <p className="text-[11px] text-muted-foreground">{e.detail}</p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">{e.at}</span>
        </li>
      ))}
    </ul>
  );
}

const ALERT_STYLES: Record<HubAlert["severity"], string> = {
  critical: "border-red-200 bg-red-50/80",
  warning: "border-amber-200 bg-amber-50/80",
  info: "border-sky-200 bg-sky-50/60",
};

export function AlertsPanel({ alerts }: { alerts: HubAlert[] }) {
  return (
    <ul className="space-y-2 p-4">
      {alerts.map((a) => (
        <li key={a.id} className={`rounded-xl border p-3 ${ALERT_STYLES[a.severity]}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-foreground">{a.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{a.detail}</p>
            </div>
            {a.actionHref ? (
              <Link
                href={a.actionHref}
                className="shrink-0 text-[10px] font-semibold text-primary hover:underline"
              >
                {a.actionLabel ?? "View"} →
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

type SortKey = keyof RideRecord | "fare";
type SortDir = "asc" | "desc";

export function RecordsTable({ records }: { records: RideRecord[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAtMs");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = records;
    if (q) {
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          r.driver.toLowerCase().includes(q) ||
          r.pickup.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      const av = a[sortKey as keyof RideRecord];
      const bv = b[sortKey as keyof RideRecord];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [records, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const statusStyle = (s: string) =>
    s === "Completed"
      ? "bg-primary/15 text-primary"
      : s === "Ongoing"
        ? "bg-sky-50 text-sky-700"
        : s === "Pending"
          ? "bg-amber-50 text-amber-700"
          : "bg-red-50 text-red-700";

  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search ride ID, customer, driver, locations…"
          className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary sm:max-w-md"
        />
        <span className="text-[10px] text-muted-foreground">
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {(
                [
                  ["id", "Ride ID"],
                  ["customer", "Customer"],
                  ["driver", "Driver"],
                  ["pickup", "Pickup"],
                  ["destination", "Destination"],
                  ["fare", "Fare"],
                  ["paymentMethod", "Payment"],
                  ["status", "Status"],
                  ["createdAt", "Time"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th key={key} className="px-3 py-2.5">
                  <button type="button" onClick={() => toggleSort(key)} className="hover:text-foreground">
                    {label}
                    {sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 hover:bg-primary/[0.02]">
                <td className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-foreground">{r.id}</td>
                <td className="px-3 py-2.5 text-foreground">{r.customer}</td>
                <td className="px-3 py-2.5 text-foreground">{r.driver}</td>
                <td className="max-w-[120px] truncate px-3 py-2.5 text-muted-foreground">{r.pickup}</td>
                <td className="max-w-[120px] truncate px-3 py-2.5 text-muted-foreground">{r.destination}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-foreground">{formatRWF(r.fare)}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.paymentMethod}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle(r.status)}`}>
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">No records match your filters.</p>
      ) : null}
      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
              className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
