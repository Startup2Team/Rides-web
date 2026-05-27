"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Card, StatCard } from "../_components";
import {
  TransactionModal,
  type Transaction,
  type TransactionStatus,
} from "./transaction-modal";

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

const data: Record<Period, PeriodData> = {
  today: {
    gross: 4_200_000,
    commission: 504_000,
    payouts: 3_696_000,
    trips: 1_247,
    pendingPayouts: 412_000,
    pendingCount: 84,
    grossDelta: 18,
    commissionDelta: 22,
    payoutsDelta: 17,
    avgFareDelta: 6,
    trend: [
      { label: "00", value: 38 },
      { label: "03", value: 22 },
      { label: "06", value: 84 },
      { label: "09", value: 142 },
      { label: "12", value: 168 },
      { label: "15", value: 224 },
      { label: "18", value: 312 },
      { label: "21", value: 188 },
    ],
    byVehicle: [
      { vehicle: "Cab Taxi", pct: 58, amount: 2_436_000, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 24, amount: 1_008_000, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 12, amount: 504_000, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, amount: 252_000, color: "bg-foreground" },
    ],
    byPayment: [
      { method: "MTN MoMo", pct: 62, amount: 2_604_000, color: "bg-amber-400" },
      { method: "Airtel Money", pct: 28, amount: 1_176_000, color: "bg-red-400" },
      { method: "Cash", pct: 10, amount: 420_000, color: "bg-muted-foreground/70" },
    ],
    topZones: [
      { name: "Kigali Heights", revenue: 612_000, trend: 22 },
      { name: "Kimironko Market", revenue: 487_000, trend: 18 },
      { name: "Convention Centre", revenue: 384_000, trend: 14 },
      { name: "Nyabugogo Station", revenue: 312_000, trend: 8 },
      { name: "Remera", revenue: 218_000, trend: 4 },
    ],
  },
  week: {
    gross: 24_800_000,
    commission: 2_976_000,
    payouts: 21_824_000,
    trips: 8_412,
    pendingPayouts: 1_240_000,
    pendingCount: 247,
    grossDelta: 12,
    commissionDelta: 14,
    payoutsDelta: 11,
    avgFareDelta: 3,
    trend: [
      { label: "Mon", value: 312 },
      { label: "Tue", value: 348 },
      { label: "Wed", value: 366 },
      { label: "Thu", value: 412 },
      { label: "Fri", value: 478 },
      { label: "Sat", value: 524 },
      { label: "Sun", value: 320 },
    ],
    byVehicle: [
      { vehicle: "Cab Taxi", pct: 60, amount: 14_880_000, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 22, amount: 5_456_000, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 12, amount: 2_976_000, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, amount: 1_488_000, color: "bg-foreground" },
    ],
    byPayment: [
      { method: "MTN MoMo", pct: 60, amount: 14_880_000, color: "bg-amber-400" },
      { method: "Airtel Money", pct: 29, amount: 7_192_000, color: "bg-red-400" },
      { method: "Cash", pct: 11, amount: 2_728_000, color: "bg-muted-foreground/70" },
    ],
    topZones: [
      { name: "Kigali Heights", revenue: 3_420_000, trend: 21 },
      { name: "Kimironko Market", revenue: 2_840_000, trend: 17 },
      { name: "Convention Centre", revenue: 2_410_000, trend: 12 },
      { name: "Nyabugogo Station", revenue: 1_980_000, trend: 7 },
      { name: "Remera", revenue: 1_240_000, trend: 4 },
    ],
  },
  month: {
    gross: 94_600_000,
    commission: 11_352_000,
    payouts: 83_248_000,
    trips: 32_184,
    pendingPayouts: 2_640_000,
    pendingCount: 412,
    grossDelta: 9,
    commissionDelta: 11,
    payoutsDelta: 8,
    avgFareDelta: 2,
    trend: [
      { label: "W1", value: 21_400 },
      { label: "W2", value: 23_100 },
      { label: "W3", value: 24_800 },
      { label: "W4", value: 25_300 },
    ],
    byVehicle: [
      { vehicle: "Cab Taxi", pct: 62, amount: 58_652_000, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 21, amount: 19_866_000, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 11, amount: 10_406_000, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, amount: 5_676_000, color: "bg-foreground" },
    ],
    byPayment: [
      { method: "MTN MoMo", pct: 58, amount: 54_868_000, color: "bg-amber-400" },
      { method: "Airtel Money", pct: 30, amount: 28_380_000, color: "bg-red-400" },
      { method: "Cash", pct: 12, amount: 11_352_000, color: "bg-muted-foreground/70" },
    ],
    topZones: [
      { name: "Kigali Heights", revenue: 13_400_000, trend: 18 },
      { name: "Kimironko Market", revenue: 10_800_000, trend: 15 },
      { name: "Convention Centre", revenue: 9_200_000, trend: 11 },
      { name: "Nyabugogo Station", revenue: 7_400_000, trend: 6 },
      { name: "Remera", revenue: 4_800_000, trend: 3 },
    ],
  },
  quarter: {
    gross: 268_400_000,
    commission: 32_208_000,
    payouts: 236_192_000,
    trips: 91_244,
    pendingPayouts: 4_120_000,
    pendingCount: 624,
    grossDelta: 14,
    commissionDelta: 16,
    payoutsDelta: 13,
    avgFareDelta: 4,
    trend: [
      { label: "M1", value: 76_400 },
      { label: "M2", value: 88_400 },
      { label: "M3", value: 94_600 },
    ],
    byVehicle: [
      { vehicle: "Cab Taxi", pct: 61, amount: 163_724_000, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 22, amount: 59_048_000, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 11, amount: 29_524_000, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, amount: 16_104_000, color: "bg-foreground" },
    ],
    byPayment: [
      { method: "MTN MoMo", pct: 59, amount: 158_356_000, color: "bg-amber-400" },
      { method: "Airtel Money", pct: 29, amount: 77_836_000, color: "bg-red-400" },
      { method: "Cash", pct: 12, amount: 32_208_000, color: "bg-muted-foreground/70" },
    ],
    topZones: [
      { name: "Kigali Heights", revenue: 38_200_000, trend: 16 },
      { name: "Kimironko Market", revenue: 30_400_000, trend: 13 },
      { name: "Convention Centre", revenue: 26_800_000, trend: 9 },
      { name: "Nyabugogo Station", revenue: 21_400_000, trend: 5 },
      { name: "Remera", revenue: 13_900_000, trend: 2 },
    ],
  },
  year: {
    gross: 982_400_000,
    commission: 117_888_000,
    payouts: 864_512_000,
    trips: 334_812,
    pendingPayouts: 5_240_000,
    pendingCount: 812,
    grossDelta: 38,
    commissionDelta: 41,
    payoutsDelta: 37,
    avgFareDelta: 7,
    trend: [
      { label: "Q1", value: 218_400 },
      { label: "Q2", value: 242_600 },
      { label: "Q3", value: 253_000 },
      { label: "Q4", value: 268_400 },
    ],
    byVehicle: [
      { vehicle: "Cab Taxi", pct: 60, amount: 589_440_000, color: "bg-primary" },
      { vehicle: "Moto Bike", pct: 22, amount: 216_128_000, color: "bg-sky-500" },
      { vehicle: "Light Hilux", pct: 12, amount: 117_888_000, color: "bg-amber-400" },
      { vehicle: "Heavy Fuso", pct: 6, amount: 58_944_000, color: "bg-foreground" },
    ],
    byPayment: [
      { method: "MTN MoMo", pct: 57, amount: 559_968_000, color: "bg-amber-400" },
      { method: "Airtel Money", pct: 30, amount: 294_720_000, color: "bg-red-400" },
      { method: "Cash", pct: 13, amount: 127_712_000, color: "bg-muted-foreground/70" },
    ],
    topZones: [
      { name: "Kigali Heights", revenue: 142_400_000, trend: 32 },
      { name: "Kimironko Market", revenue: 116_200_000, trend: 28 },
      { name: "Convention Centre", revenue: 98_400_000, trend: 22 },
      { name: "Nyabugogo Station", revenue: 78_400_000, trend: 14 },
      { name: "Remera", revenue: 52_400_000, trend: 8 },
    ],
  },
};

const transactions: Transaction[] = [
  {
    id: "TXN-58471",
    customer: { name: "Alice Mukamana", phone: "+250 788 213 005" },
    driver: { name: "Aiden Mugisha", phone: "+250 788 213 401", vehicleType: "Cab Taxi", plate: "RAB 123 D" },
    pickup: "Kimironko Market",
    destination: "Kigali Heights",
    vehicleType: "Cab Taxi",
    fare: 3800,
    commission: 456,
    payout: 3344,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "8 min ago",
    duration: "14 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58470",
    customer: { name: "Boris Habineza", phone: "+250 788 552 198" },
    driver: { name: "Beni Karenzi", phone: "+250 788 552 110", vehicleType: "Moto Bike", plate: "RAA 887 K" },
    pickup: "Remera",
    destination: "Town",
    vehicleType: "Moto Bike",
    fare: 2200,
    commission: 264,
    payout: 1936,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "12 min ago",
    duration: "8 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58469",
    customer: { name: "Christine Niyibizi", phone: "+250 788 614 770" },
    driver: { name: "Claude Rwema", phone: "+250 788 102 887", vehicleType: "Light Hilux", plate: "RAC 552 R" },
    pickup: "Kacyiru",
    destination: "Nyabugogo Station",
    vehicleType: "Light Hilux",
    fare: 5500,
    commission: 660,
    payout: 4840,
    paymentMethod: "MTN MoMo",
    status: "Pending payout",
    completedAt: "18 min ago",
    duration: "22 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58468",
    customer: { name: "Daniel Iradukunda", phone: "+250 788 102 441" },
    driver: { name: "Diane Uwase", phone: "+250 788 339 220", vehicleType: "Cab Taxi", plate: "RAB 410 U" },
    pickup: "Gikondo",
    destination: "Town",
    vehicleType: "Cab Taxi",
    fare: 2200,
    commission: 264,
    payout: 1936,
    paymentMethod: "Airtel Money",
    status: "Settled",
    completedAt: "32 min ago",
    duration: "11 min",
    district: "Kicukiro",
  },
  {
    id: "TXN-58467",
    customer: { name: "Fabrice Bizimana", phone: "+250 788 477 113" },
    driver: { name: "Eric Nshuti", phone: "+250 788 477 661", vehicleType: "Heavy Fuso", plate: "RAD 094 N" },
    pickup: "Gikondo Industrial",
    destination: "Nyabugogo",
    vehicleType: "Heavy Fuso",
    fare: 18500,
    commission: 2220,
    payout: 16280,
    paymentMethod: "Cash",
    status: "Disputed",
    completedAt: "1h ago",
    duration: "47 min",
    district: "Kicukiro",
    notes:
      "Customer disputed fare mid-trip and refused to pay agreed amount. Held pending dispute resolution.",
  },
  {
    id: "TXN-58466",
    customer: { name: "Grace Uwineza", phone: "+250 788 823 005" },
    driver: { name: "Helen Niyibizi", phone: "+250 788 614 005", vehicleType: "Cab Taxi", plate: "RAB 318 H" },
    pickup: "Kacyiru",
    destination: "Airport",
    vehicleType: "Cab Taxi",
    fare: 8500,
    commission: 1020,
    payout: 7480,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "1h ago",
    duration: "28 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58465",
    customer: { name: "Henri Mugisha", phone: "+250 788 156 992" },
    driver: { name: "Joyce Habineza", phone: "+250 788 705 332", vehicleType: "Moto Bike", plate: "RAA 502 J" },
    pickup: "Kimironko",
    destination: "Town",
    vehicleType: "Moto Bike",
    fare: 2400,
    commission: 288,
    payout: 2112,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "2h ago",
    duration: "12 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58464",
    customer: { name: "Irene Mukasa", phone: "+250 788 290 552" },
    driver: { name: "Roland Karangwa", phone: "+250 788 670 219", vehicleType: "Moto Bike", plate: "RAA 489 R" },
    pickup: "Remera",
    destination: "Kacyiru",
    vehicleType: "Moto Bike",
    fare: 1800,
    commission: 216,
    payout: 1584,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "2h ago",
    duration: "7 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58463",
    customer: { name: "Sandrine Uwimana", phone: "+250 788 091 553" },
    driver: { name: "Olivier Hakizimana", phone: "+250 788 449 660", vehicleType: "Cab Taxi", plate: "RAB 502 O" },
    pickup: "Gikondo",
    destination: "Town",
    vehicleType: "Cab Taxi",
    fare: 4200,
    commission: 504,
    payout: 3696,
    paymentMethod: "Airtel Money",
    status: "Refunded",
    completedAt: "3h ago",
    duration: "15 min",
    district: "Kicukiro",
    notes:
      "Refunded after driver could not deliver — vehicle breakdown mid-trip.",
  },
  {
    id: "TXN-58462",
    customer: { name: "Liliane Uwase", phone: "+250 788 904 660" },
    driver: { name: "Aiden Mugisha", phone: "+250 788 213 401", vehicleType: "Cab Taxi", plate: "RAB 123 D" },
    pickup: "Kacyiru",
    destination: "BPR HQ",
    vehicleType: "Cab Taxi",
    fare: 3800,
    commission: 456,
    payout: 3344,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "3h ago",
    duration: "11 min",
    district: "Gasabo",
  },
  {
    id: "TXN-58461",
    customer: { name: "Kalisa Eric", phone: "+250 788 412 003" },
    driver: { name: "Patrick Nshimiyimana", phone: "+250 788 322 178", vehicleType: "Light Hilux", plate: "RAC 712 P" },
    pickup: "Gahanga",
    destination: "Town",
    vehicleType: "Light Hilux",
    fare: 6200,
    commission: 744,
    payout: 5456,
    paymentMethod: "MTN MoMo",
    status: "Settled",
    completedAt: "4h ago",
    duration: "24 min",
    district: "Kicukiro",
  },
  {
    id: "TXN-58460",
    customer: { name: "Olivier Habimana", phone: "+250 788 449 660" },
    driver: { name: "Nadine Kayitesi", phone: "+250 788 803 117", vehicleType: "Moto Bike", plate: "RAA 638 N" },
    pickup: "Kanyinya",
    destination: "Town",
    vehicleType: "Moto Bike",
    fare: 2200,
    commission: 264,
    payout: 1936,
    paymentMethod: "MTN MoMo",
    status: "Pending payout",
    completedAt: "4h ago",
    duration: "9 min",
    district: "Nyarugenge",
  },
];

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

const completedAgoMinutes: Record<string, number> = {
  "8 min ago": 8,
  "12 min ago": 12,
  "18 min ago": 18,
  "32 min ago": 32,
  "1h ago": 60,
  "2h ago": 120,
  "3h ago": 180,
  "4h ago": 240,
};

function completedRank(t: Transaction) {
  return completedAgoMinutes[t.completedAt] ?? 9999;
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
            <stop offset="0%" stopColor="#00C853" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#rev-grad)" />
        <polyline
          points={points}
          fill="none"
          stroke="#00C853"
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
            fill="#00C853"
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

export function RevenueConsole() {
  const [period, setPeriod] = useState<Period>("month");
  const [txTab, setTxTab] = useState<"all" | TransactionStatus>("all");
  const [txQuery, setTxQuery] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [txList, setTxList] = useState<Transaction[]>(transactions);
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

  const p = data[period];

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
