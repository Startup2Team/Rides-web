"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Card, StatCard } from "../_components";
import {
  TransactionModal,
  type Transaction,
  type TransactionStatus,
} from "./transaction-modal";
import {
  getTransactions,
  getRevenue,
  disbursePayouts,
  type Transaction as ApiTransaction,
} from "@/lib/api";

const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike", CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux", HEAVY_FUSO: "Heavy Fuso", TUK_TUK: "Tuk Tuk",
};

function mapApiTransaction(t: ApiTransaction): Transaction {
  const status: TransactionStatus =
    t.status === "PENDING" ? "Pending payout"
    : t.status === "REFUNDED" ? "Refunded"
    : t.status === "DISPUTED" ? "Disputed"
    : "Settled";
  const custName = t.customer?.name ?? t.customer?.phone ?? "Unknown";
  const driverName = t.driver?.name ?? t.driver?.phone ?? "Unknown";
  return {
    id: t.id,
    customer: { name: custName, phone: t.customer?.phone ?? "" },
    driver: {
      name: driverName,
      phone: t.driver?.phone ?? "",
      vehicleType: TRANSPORT_DISPLAY[t.transport_type] ?? t.transport_type,
      plate: t.driver?.plate ?? "—",
    },
    pickup: t.pickup_address,
    destination: t.destination_address,
    vehicleType: (TRANSPORT_DISPLAY[t.transport_type] ?? "Cab Taxi") as Transaction["vehicleType"],
    fare: t.fare ?? 0,
    commission: t.commission,
    payout: t.payout,
    paymentMethod: "Cash",
    status,
    completedAt: t.completed_at ? new Date(t.completed_at).toLocaleString() : "—",
    duration: "—",
    district: "—",
  };
}

type Period = "today" | "week" | "month" | "quarter" | "year";

const periodLabels: Record<Period, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  quarter: "This quarter",
  year: "This year",
};

const periodCompareLabel: Record<Period, string> = {
  today: "vs yesterday",
  week: "vs last week",
  month: "vs last month",
  quarter: "vs last quarter",
  year: "vs last year",
};

type PeriodData = {
  gross: number;
  commission: number;
  payouts: number;
  trips: number;
  pendingPayouts: number;
  pendingCount: number;
  grossDelta: number;
  commissionDelta: number;
  payoutsDelta: number;
  avgFareDelta: number;
  trend: { label: string; value: number }[];
  byVehicle: { vehicle: string; pct: number; amount: number; color: string }[];
  byPayment: { method: string; pct: number; amount: number; color: string }[];
  topZones: { name: string; revenue: number; trend: number }[];
};



const txStatusStyles: Record<TransactionStatus, string> = {
  Settled: "bg-primary/15 text-primary",
  "Pending payout": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Refunded: "bg-muted text-muted-foreground",
  Disputed: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
};

const txTabs: { id: "all" | TransactionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Settled", label: "Settled" },
  { id: "Pending payout", label: "Pending payout" },
  { id: "Disputed", label: "Disputed" },
  { id: "Refunded", label: "Refunded" },
];

const PAGE_SIZE = 6;

type SortKey = "fare" | "commission" | "completedAt";
type SortDir = "asc" | "desc";

function completedRank(t: Transaction) {
  if (!t.completedAt || t.completedAt === "—") return 9999999;
  return new Date(t.completedAt).getTime();
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-3 w-3 transition-opacity ${
        active ? "opacity-100" : "opacity-30 group-hover:opacity-60"
      }`}
    >
      {dir === "asc" ? (
        <polyline points="6 15 12 9 18 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  dir,
  align = "left",
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: SortDir;
  align?: "left" | "right";
  onClick: () => void;
}) {
  const active = sortKey === currentKey;
  return (
    <th
      className={`px-4 py-2.5 font-semibold ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`group inline-flex items-center gap-1 text-[10px] uppercase tracking-wider transition-colors ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <SortIcon active={active} dir={active ? dir : "asc"} />
      </button>
    </th>
  );
}

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function formatLargeRWF(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M RWF`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K RWF`;
  return `${n} RWF`;
}

function DeltaPill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        up ? "text-primary" : "text-red-600"
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
        {up ? (
          <polyline points="18 15 12 9 6 15" />
        ) : (
          <polyline points="6 9 12 15 18 9" />
        )}
      </svg>
      {Math.abs(value)}%
    </span>
  );
}

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 600;
  const h = 160;
  const stepX = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((d, i) => `${i * stepX},${h - (d.value / max) * (h - 20) - 10}`)
    .join(" ");
  const area = `M 0,${h} L ${points
    .split(" ")
    .map((p) => p.replace(",", " "))
    .join(" L ")} L ${w},${h} Z`;
  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-44 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007AFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#007AFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rev-grad)" />
        <polyline
          points={points}
          fill="none"
          stroke="#007AFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={i * stepX}
            cy={h - (d.value / max) * (h - 20) - 10}
            r="3"
            fill="#007AFF"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
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

function mapRevenueToPeriodData(raw: Record<string, unknown> | null | undefined): PeriodData {
  if (!raw) return emptyPeriodData;
  const byVehicleColors: Record<string, string> = {
    CAB_TAXI: "bg-primary",
    MOTO_BIKE: "bg-sky-500",
    LIGHT_HILUX: "bg-amber-400",
    HEAVY_FUSO: "bg-foreground",
  };
  const vehicleLabels: Record<string, string> = {
    CAB_TAXI: "Cab Taxi",
    MOTO_BIKE: "Moto Bike",
    LIGHT_HILUX: "Light Hilux",
    HEAVY_FUSO: "Heavy Fuso",
  };
  const byVehicleRaw = (raw.by_vehicle ?? []) as Array<{ vehicle?: string; amount?: number; pct?: number }>;
  const deltas = (raw.deltas ?? {}) as Record<string, number>;
  const trendRaw = (raw.trend ?? []) as Array<{ label: string; value: number }>;
  return {
    gross: (raw.gross as number) ?? 0,
    commission: (raw.commission as number) ?? 0,
    payouts: (raw.payouts as number) ?? 0,
    trips: (raw.trips as number) ?? 0,
    pendingPayouts: 0,
    pendingCount: 0,
    grossDelta: deltas.gross ?? 0,
    commissionDelta: deltas.commission ?? 0,
    payoutsDelta: deltas.payouts ?? 0,
    avgFareDelta: 0,
    trend: trendRaw,
    byVehicle: byVehicleRaw.map((v) => ({
      vehicle: vehicleLabels[v.vehicle ?? ""] ?? (v.vehicle ?? "Other"),
      pct: Math.round(v.pct ?? 0),
      amount: v.amount ?? 0,
      color: byVehicleColors[v.vehicle ?? ""] ?? "bg-muted",
    })),
    byPayment: [],
    topZones: [],
  };
}

const emptyPeriodData: PeriodData = {
  gross: 0, commission: 0, payouts: 0, trips: 0,
  pendingPayouts: 0, pendingCount: 0,
  grossDelta: 0, commissionDelta: 0, payoutsDelta: 0, avgFareDelta: 0,
  trend: [], byVehicle: [], byPayment: [], topZones: [],
};

export function RevenueConsole() {
  const [period, setPeriod] = useState<Period>("month");
  const [periodData, setPeriodData] = useState<PeriodData>(emptyPeriodData);
  const [txTab, setTxTab] = useState<"all" | TransactionStatus>("all");
  const [txQuery, setTxQuery] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [txList, setTxList] = useState<Transaction[]>([]);

  useEffect(() => {
    getRevenue(period)
      .then((res) => setPeriodData(mapRevenueToPeriodData(res as unknown as Record<string, unknown>)))
      .catch(() => null);
  }, [period]);

  useEffect(() => {
    getTransactions({ limit: "100", offset: "0" })
      .then((res) => setTxList((res.transactions ?? []).map(mapApiTransaction)))
      .catch(() => null);
  }, []);

  const [sortKey, setSortKey] = useState<SortKey>("completedAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "completedAt" ? "asc" : "desc");
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const p = periodData;

  const filteredTx = useMemo(() => {
    return txList.filter((t) => {
      if (txTab !== "all" && t.status !== txTab) return false;
      if (txQuery) {
        const q = txQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.customer.name.toLowerCase().includes(q) ||
          t.driver.name.toLowerCase().includes(q) ||
          t.pickup.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [txList, txTab, txQuery]);

  const txCounts: Record<"all" | TransactionStatus, number> = useMemo(
    () => ({
      all: txList.length,
      Settled: txList.filter((t) => t.status === "Settled").length,
      "Pending payout": txList.filter((t) => t.status === "Pending payout").length,
      Disputed: txList.filter((t) => t.status === "Disputed").length,
      Refunded: txList.filter((t) => t.status === "Refunded").length,
    }),
    [txList],
  );

  const sortedTx = useMemo(() => {
    return [...filteredTx].sort((a, b) => {
      let va: number;
      let vb: number;
      if (sortKey === "fare") {
        va = a.fare;
        vb = b.fare;
      } else if (sortKey === "commission") {
        va = a.commission;
        vb = b.commission;
      } else {
        va = completedRank(a);
        vb = completedRank(b);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [filteredTx, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedTx.length / PAGE_SIZE));
  const safePage = Math.min(txPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sortedTx.length);
  const paginatedTx = sortedTx.slice(start, end);

  const viewing = viewingId ? txList.find((t) => t.id === viewingId) ?? null : null;

  const avgFare = Math.round(p.gross / p.trips);

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
          label="Gross Revenue"
          value={formatLargeRWF(p.gross)}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.grossDelta} />
              <span>{periodCompareLabel[period]}</span>
            </span>
          }
        />
        <StatCard
          label="Platform Commission"
          value={formatLargeRWF(p.commission)}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.commissionDelta} />
              <span>12% take rate</span>
            </span>
          }
        />
        <StatCard
          label="Driver Payouts"
          value={formatLargeRWF(p.payouts)}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.payoutsDelta} />
              <span>{periodCompareLabel[period]}</span>
            </span>
          }
        />
        <StatCard
          label="Avg Fare"
          value={formatRWF(avgFare)}
          hint={
            <span className="inline-flex items-center gap-1.5">
              <DeltaPill value={p.avgFareDelta} />
              <span>across {p.trips.toLocaleString()} trips</span>
            </span>
          }
        />
      </div>

      <Card
        title={`Revenue trend · ${periodLabels[period].toLowerCase()}`}
        action={
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="block h-2 w-2 rounded-full bg-primary" />
              Gross revenue
            </span>
          </div>
        }
        bodyClass="p-4"
      >
        <TrendChart data={p.trend} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="By vehicle category" bodyClass="p-4">
          <div className="flex items-center gap-4">
            <Donut
              slices={p.byVehicle.map((v) => ({ pct: v.pct, color: v.color }))}
              centerLabel="Total"
              centerValue={formatLargeRWF(p.gross)}
            />
            <ul className="flex-1 space-y-2 text-xs">
              {p.byVehicle.map((v) => (
                <li key={v.vehicle} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={`block h-2 w-2 rounded-full ${v.color}`} />
                    {v.vehicle}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{v.pct}%</span>
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      {formatLargeRWF(v.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="By payment method" bodyClass="p-4">
          <div className="flex items-center gap-4">
            <Donut
              slices={p.byPayment.map((v) => ({ pct: v.pct, color: v.color }))}
              centerLabel="Methods"
              centerValue={`${p.byPayment.length}`}
            />
            <ul className="flex-1 space-y-2 text-xs">
              {p.byPayment.map((v) => (
                <li key={v.method} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className={`block h-2 w-2 rounded-full ${v.color}`} />
                    {v.method}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{v.pct}%</span>
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      {formatLargeRWF(v.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Top zones by revenue">
          <ul className="divide-y divide-border">
            {p.topZones.map((z) => (
              <li key={z.name} className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {z.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {formatLargeRWF(z.revenue)}
                  </p>
                </div>
                <DeltaPill value={z.trend} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Recent transactions"
        action={
          <input
            type="search"
            placeholder="Search ID, name, route…"
            value={txQuery}
            onChange={(e) => {
              setTxQuery(e.target.value);
              setTxPage(1);
            }}
            className="h-8 w-64 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
          />
        }
      >
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-2">
          {txTabs.map((t) => {
            const active = txTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTxTab(t.id);
                  setTxPage(1);
                }}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    active
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {txCounts[t.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Parties
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Route
                </th>
                <SortHeader
                  label="Fare"
                  sortKey="fare"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("fare")}
                />
                <SortHeader
                  label="Commission"
                  sortKey="commission"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("commission")}
                />
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Payment
                </th>
                <SortHeader
                  label="Completed"
                  sortKey="completedAt"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("completedAt")}
                />
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTx.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                paginatedTx.map((t) => (
                  <tr
                    key={t.id}
                    className="cursor-pointer hover:bg-surface/50"
                    onClick={() => setViewingId(t.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                      {t.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={t.customer.name} tone="neutral" size="sm" />
                        <span className="text-xs text-foreground">
                          {t.customer.name}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar name={t.driver.name} size="sm" />
                        <span className="text-[11px] text-muted-foreground">
                          {t.driver.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-foreground">
                        {t.pickup} → {t.destination}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {t.vehicleType}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatRWF(t.fare)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-muted-foreground">
                        {formatRWF(t.commission)}
                      </div>
                      <div className="text-[10px] font-semibold text-muted-foreground/70">
                        {Math.round((t.commission / t.fare) * 100)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {t.completedAt}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${txStatusStyles[t.status]}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingId(t.id);
                        }}
                        className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredTx.length === 0 ? 0 : start + 1}–{end}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{filteredTx.length}</span>{" "}
            transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTxPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page{" "}
              <span className="font-semibold text-foreground">{safePage}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() => setTxPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </Card>

      <TransactionModal
        transaction={viewing}
        onClose={() => setViewingId(null)}
        onRefund={(id) => {
          setTxList((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "Refunded" } : t)),
          );
          setToast(`${id} refunded`);
          setViewingId(null);
        }}
        onResolveDispute={(id) => {
          setTxList((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "Settled" } : t)),
          );
          setToast(`${id} dispute resolved`);
          setViewingId(null);
        }}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
