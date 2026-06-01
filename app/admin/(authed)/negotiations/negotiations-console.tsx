"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Card } from "../_components";
import {
  NegotiationModal,
  type NegotiationDetail,
  type NegotiationStatus,
} from "./negotiation-modal";
import { getNegotiations, type Negotiation as ApiNegotiation } from "@/lib/api";

function mapNegStatus(s: string): NegotiationStatus {
  if (s === "AGREED" || s === "COMPLETED") return "Agreed";
  if (s === "FAILED" || s === "EXPIRED") return "Failed";
  if (s === "DISPUTED") return "Disputed";
  return "In progress";
}

function mapApiNegotiation(n: ApiNegotiation): NegotiationDetail {
  return {
    id: n.id,
    customer: { name: n.customer_name, phone: "", rating: 0 },
    driver: n.driver_name
      ? { name: n.driver_name, phone: "", vehicleType: "Cab Taxi", plate: "—", rating: 0 }
      : null,
    pickup: n.pickup_location,
    destination: "—",
    vehicleType: "Cab Taxi",
    initial: n.initial_offer,
    final: n.final_price ?? null,
    rounds: 0,
    status: mapNegStatus(n.status),
    startedAt: new Date(n.created_at).toLocaleString(),
    duration: "—",
    paymentMethod: "MTN MoMo",
    offers: [],
  };
}

type Negotiation = NegotiationDetail;

const initialNegotiations: Negotiation[] = [
  {
    id: "NEG-1247",
    customer: { name: "Alice Mukamana", phone: "+250 788 213 005", rating: 4.8 },
    driver: {
      name: "Aiden Mugisha",
      phone: "+250 788 213 401",
      vehicleType: "Cab Taxi",
      plate: "RAB 123 D",
      rating: 4.9,
    },
    pickup: "Kimironko Market",
    destination: "Kigali Heights",
    vehicleType: "Cab Taxi",
    initial: 3000,
    final: 3800,
    rounds: 4,
    status: "Agreed",
    startedAt: "2m ago",
    duration: "1m 24s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 3000, time: "12:34" },
      { round: 1, from: "driver", amount: 4500, time: "12:34" },
      { round: 2, from: "customer", amount: 3500, time: "12:35" },
      { round: 2, from: "driver", amount: 4000, time: "12:35" },
      { round: 3, from: "customer", amount: 3800, time: "12:36" },
    ],
  },
  {
    id: "NEG-1246",
    customer: { name: "Boris Habineza", phone: "+250 788 552 198", rating: 4.6 },
    driver: {
      name: "Beni Karenzi",
      phone: "+250 788 552 110",
      vehicleType: "Moto Bike",
      plate: "RAA 887 K",
      rating: 4.7,
    },
    pickup: "Remera",
    destination: "Town",
    vehicleType: "Moto Bike",
    initial: 2500,
    final: null,
    rounds: 5,
    status: "Failed",
    startedAt: "8m ago",
    duration: "3m 12s",
    paymentMethod: "Cash",
    offers: [
      { round: 1, from: "customer", amount: 1800, time: "12:26" },
      { round: 1, from: "driver", amount: 2800, time: "12:26" },
      { round: 2, from: "customer", amount: 2000, time: "12:27" },
      { round: 2, from: "driver", amount: 2700, time: "12:27" },
      { round: 3, from: "customer", amount: 2200, time: "12:28" },
      { round: 3, from: "driver", amount: 2500, time: "12:29" },
    ],
    failureReason:
      "Customer requested cash discount; driver insisted on metered rate. Both walked away.",
  },
  {
    id: "NEG-1245",
    customer: {
      name: "Christine Niyibizi",
      phone: "+250 788 614 770",
      rating: 4.9,
    },
    driver: {
      name: "Claude Rwema",
      phone: "+250 788 102 887",
      vehicleType: "Light Hilux",
      plate: "RAC 552 R",
      rating: 4.8,
    },
    pickup: "Kacyiru",
    destination: "Nyabugogo Station",
    vehicleType: "Light Hilux",
    initial: 5000,
    final: 5500,
    rounds: 2,
    status: "Agreed",
    startedAt: "14m ago",
    duration: "42s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 5000, time: "12:20" },
      { round: 1, from: "driver", amount: 6000, time: "12:20" },
      { round: 2, from: "customer", amount: 5500, time: "12:21" },
    ],
  },
  {
    id: "NEG-1244",
    customer: {
      name: "Daniel Iradukunda",
      phone: "+250 788 102 441",
      rating: 4.5,
    },
    driver: {
      name: "Diane Uwase",
      phone: "+250 788 339 220",
      vehicleType: "Cab Taxi",
      plate: "RAB 410 U",
      rating: 4.6,
    },
    pickup: "Gikondo",
    destination: "Town",
    vehicleType: "Cab Taxi",
    initial: 1800,
    final: 2200,
    rounds: 3,
    status: "Agreed",
    startedAt: "22m ago",
    duration: "55s",
    paymentMethod: "Airtel Money",
    offers: [
      { round: 1, from: "customer", amount: 1800, time: "12:12" },
      { round: 1, from: "driver", amount: 2500, time: "12:12" },
      { round: 2, from: "customer", amount: 2000, time: "12:13" },
      { round: 2, from: "driver", amount: 2200, time: "12:13" },
    ],
  },
  {
    id: "NEG-1243",
    customer: {
      name: "Elise Twagiramungu",
      phone: "+250 788 339 882",
      rating: 4.2,
    },
    driver: null,
    pickup: "Nyamirambo",
    destination: "Convention Centre",
    vehicleType: "Moto Bike",
    initial: 4000,
    final: null,
    rounds: 1,
    status: "In progress",
    startedAt: "31s ago",
    duration: "31s",
    paymentMethod: "MTN MoMo",
    offers: [{ round: 1, from: "customer", amount: 4000, time: "12:34" }],
  },
  {
    id: "NEG-1242",
    customer: {
      name: "Fabrice Bizimana",
      phone: "+250 788 477 113",
      rating: 2.1,
    },
    driver: {
      name: "Eric Nshuti",
      phone: "+250 788 477 661",
      vehicleType: "Heavy Fuso",
      plate: "RAD 094 N",
      rating: 4.5,
    },
    pickup: "Gikondo Industrial",
    destination: "Nyabugogo",
    vehicleType: "Heavy Fuso",
    initial: 12000,
    final: null,
    rounds: 6,
    status: "Disputed",
    startedAt: "1h ago",
    duration: "8m 47s",
    paymentMethod: "Cash",
    offers: [
      { round: 1, from: "customer", amount: 12000, time: "11:34" },
      { round: 1, from: "driver", amount: 25000, time: "11:35" },
      { round: 2, from: "customer", amount: 15000, time: "11:36" },
      { round: 2, from: "driver", amount: 22000, time: "11:37" },
      { round: 3, from: "customer", amount: 18000, time: "11:38" },
      { round: 3, from: "driver", amount: 20000, time: "11:39" },
    ],
    failureReason:
      "Customer accused driver of price gouging mid-trip and refused to pay agreed fare.",
    notes:
      "Both parties flagged. Held pending dispute resolution by ops manager.",
  },
  {
    id: "NEG-1241",
    customer: { name: "Grace Uwineza", phone: "+250 788 823 005", rating: 4.9 },
    driver: {
      name: "Helen Niyibizi",
      phone: "+250 788 614 005",
      vehicleType: "Cab Taxi",
      plate: "RAB 318 H",
      rating: 4.9,
    },
    pickup: "Kacyiru",
    destination: "Airport",
    vehicleType: "Cab Taxi",
    initial: 8000,
    final: 8500,
    rounds: 2,
    status: "Agreed",
    startedAt: "45m ago",
    duration: "38s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 8000, time: "11:49" },
      { round: 1, from: "driver", amount: 9000, time: "11:49" },
      { round: 2, from: "customer", amount: 8500, time: "11:49" },
    ],
  },
  {
    id: "NEG-1240",
    customer: { name: "Henri Mugisha", phone: "+250 788 156 992", rating: 4.7 },
    driver: {
      name: "Joyce Habineza",
      phone: "+250 788 705 332",
      vehicleType: "Moto Bike",
      plate: "RAA 502 J",
      rating: 4.8,
    },
    pickup: "Kimironko",
    destination: "Town",
    vehicleType: "Moto Bike",
    initial: 2000,
    final: 2400,
    rounds: 3,
    status: "Agreed",
    startedAt: "1h ago",
    duration: "1m 02s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 2000, time: "11:34" },
      { round: 1, from: "driver", amount: 3000, time: "11:34" },
      { round: 2, from: "customer", amount: 2200, time: "11:35" },
      { round: 2, from: "driver", amount: 2500, time: "11:35" },
      { round: 3, from: "customer", amount: 2400, time: "11:35" },
    ],
  },
  {
    id: "NEG-1239",
    customer: { name: "Irene Mukasa", phone: "+250 788 290 552", rating: 4.8 },
    driver: {
      name: "Roland Karangwa",
      phone: "+250 788 670 219",
      vehicleType: "Moto Bike",
      plate: "RAA 489 R",
      rating: 4.8,
    },
    pickup: "Remera",
    destination: "Kacyiru",
    vehicleType: "Moto Bike",
    initial: 1500,
    final: 1800,
    rounds: 2,
    status: "Agreed",
    startedAt: "1h ago",
    duration: "29s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 1500, time: "11:30" },
      { round: 1, from: "driver", amount: 2000, time: "11:30" },
      { round: 2, from: "customer", amount: 1800, time: "11:30" },
    ],
  },
  {
    id: "NEG-1238",
    customer: {
      name: "Jean-Paul Karangwa",
      phone: "+250 788 705 887",
      rating: 1.8,
    },
    driver: {
      name: "Marc Iradukunda",
      phone: "+250 788 156 224",
      vehicleType: "Heavy Fuso",
      plate: "RAD 286 M",
      rating: 4.5,
    },
    pickup: "Muhima",
    destination: "Gikondo Industrial",
    vehicleType: "Heavy Fuso",
    initial: 18000,
    final: null,
    rounds: 7,
    status: "Failed",
    startedAt: "2h ago",
    duration: "11m 23s",
    paymentMethod: "Cash",
    offers: [
      { round: 1, from: "customer", amount: 18000, time: "10:34" },
      { round: 1, from: "driver", amount: 28000, time: "10:35" },
      { round: 2, from: "customer", amount: 20000, time: "10:37" },
      { round: 2, from: "driver", amount: 26000, time: "10:39" },
      { round: 3, from: "customer", amount: 21000, time: "10:42" },
      { round: 3, from: "driver", amount: 25000, time: "10:43" },
    ],
    failureReason: "Driver wanted return-fare premium; customer abandoned.",
  },
  {
    id: "NEG-1237",
    customer: { name: "Kalisa Eric", phone: "+250 788 412 003", rating: 4.6 },
    driver: {
      name: "Patrick Nshimiyimana",
      phone: "+250 788 322 178",
      vehicleType: "Light Hilux",
      plate: "RAC 712 P",
      rating: 4.6,
    },
    pickup: "Gahanga",
    destination: "Town",
    vehicleType: "Light Hilux",
    initial: 5500,
    final: 6200,
    rounds: 3,
    status: "Agreed",
    startedAt: "2h ago",
    duration: "1m 18s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 5500, time: "10:30" },
      { round: 1, from: "driver", amount: 7000, time: "10:31" },
      { round: 2, from: "customer", amount: 6000, time: "10:31" },
      { round: 2, from: "driver", amount: 6500, time: "10:31" },
      { round: 3, from: "customer", amount: 6200, time: "10:32" },
    ],
  },
  {
    id: "NEG-1236",
    customer: { name: "Liliane Uwase", phone: "+250 788 904 660", rating: 4.9 },
    driver: {
      name: "Olivier Hakizimana",
      phone: "+250 788 449 660",
      vehicleType: "Cab Taxi",
      plate: "RAB 502 O",
      rating: 4.9,
    },
    pickup: "Kacyiru",
    destination: "BPR HQ",
    vehicleType: "Cab Taxi",
    initial: 3500,
    final: 3800,
    rounds: 2,
    status: "Agreed",
    startedAt: "3h ago",
    duration: "22s",
    paymentMethod: "MTN MoMo",
    offers: [
      { round: 1, from: "customer", amount: 3500, time: "09:34" },
      { round: 1, from: "driver", amount: 4000, time: "09:34" },
      { round: 2, from: "customer", amount: 3800, time: "09:34" },
    ],
  },
];

type Tab = { id: "all" | NegotiationStatus; label: string };

const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Agreed", label: "Agreed" },
  { id: "In progress", label: "In progress" },
  { id: "Failed", label: "Failed" },
  { id: "Disputed", label: "Disputed" },
];

const statusStyles: Record<NegotiationStatus, string> = {
  Agreed: "bg-primary/15 text-primary",
  Failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  "In progress": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Disputed: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
};

type SortKey = "id" | "initial" | "final" | "rounds";
type SortDir = "asc" | "desc";
type ViewMode = "grid" | "table";
const PAGE_SIZE = 8;

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const btn = (mode: ViewMode, label: string, icon: React.ReactNode) => {
    const active = value === mode;
    return (
      <button
        type="button"
        onClick={() => onChange(mode)}
        aria-label={label}
        aria-pressed={active}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          active
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {icon}
      </button>
    );
  };
  return (
    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
      {btn(
        "grid",
        "Grid view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>,
      )}
      {btn(
        "table",
        "Table view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>,
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: NegotiationStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}
    >
      {status === "Disputed" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5"
          aria-hidden
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ) : null}
      {status}
    </span>
  );
}

function NegotiationCard({
  negotiation,
  onOpen,
}: {
  negotiation: Negotiation;
  onOpen: () => void;
}) {
  const uplift =
    negotiation.final !== null
      ? Math.round(
          ((negotiation.final - negotiation.initial) / negotiation.initial) * 100,
        )
      : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-foreground">
          {negotiation.id}
        </span>
        <StatusBadge status={negotiation.status} />
      </div>

      <div className="mt-3 flex items-start gap-2">
        <div className="mt-0.5 flex flex-col items-center">
          <span className="block h-2 w-2 rounded-full bg-primary" />
          <span className="my-0.5 block h-4 w-px bg-border" />
          <span className="block h-2 w-2 rounded-full bg-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {negotiation.pickup}
          </p>
          <p className="mt-2 truncate text-xs font-semibold text-foreground">
            {negotiation.destination}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Initial → Final
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {formatRWF(negotiation.initial)} →{" "}
            {negotiation.final !== null ? formatRWF(negotiation.final) : "—"}
          </p>
          {uplift !== null ? (
            <p
              className={`text-[10px] font-semibold ${
                uplift > 0
                  ? "text-amber-600"
                  : uplift < 0
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {uplift > 0 ? "+" : ""}
              {uplift}% · {negotiation.rounds} rounds
            </p>
          ) : (
            <p className="text-[10px] font-semibold text-muted-foreground">
              {negotiation.rounds} rounds
            </p>
          )}
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle · Duration
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {negotiation.vehicleType}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {negotiation.duration}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={negotiation.customer.name} tone="neutral" size="sm" />
          <span className="truncate text-[11px] text-foreground">
            {negotiation.customer.name.split(" ")[0]}
          </span>
        </div>
        {negotiation.driver ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={negotiation.driver.name} size="sm" />
            <span className="truncate text-[11px] text-foreground">
              {negotiation.driver.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            No driver
          </span>
        )}
      </div>
    </button>
  );
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
      className={`h-3 w-3 transition-opacity ${active ? "opacity-100" : "opacity-30 group-hover:opacity-60"}`}
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
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <SortIcon active={active} dir={active ? dir : "asc"} />
      </button>
    </th>
  );
}

function DonutChart({
  agreed,
  failed,
  inProgress,
  disputed,
}: {
  agreed: number;
  failed: number;
  inProgress: number;
  disputed: number;
}) {
  const total = agreed + failed + inProgress + disputed || 1;
  const agreedPct = (agreed / total) * 100;
  const failedPct = (failed / total) * 100;
  const inProgressPct = (inProgress / total) * 100;
  const disputedPct = (disputed / total) * 100;

  let offset = 0;
  const slices = [
    { pct: agreedPct, color: "stroke-primary" },
    { pct: failedPct, color: "stroke-red-400" },
    { pct: inProgressPct, color: "stroke-amber-400" },
    { pct: disputedPct, color: "stroke-amber-600" },
  ];

  return (
    <svg viewBox="0 0 40 40" aria-hidden className="h-24 w-24 shrink-0">
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
            className={s.color}
            transform="rotate(-90 20 20)"
            strokeLinecap="round"
          />
        );
      })}
      <text
        x="20"
        y="21.5"
        textAnchor="middle"
        className="fill-foreground text-[6px] font-bold"
      >
        {Math.round(agreedPct)}%
      </text>
    </svg>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-24 items-end gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="block w-full rounded-t bg-primary/80" style={{ height: `${(d.value / max) * 90}%` }} />
          <span className="text-[8px] font-semibold text-muted-foreground">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function NegotiationsConsole() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);

  useEffect(() => {
    getNegotiations({ limit: "100", offset: "0" })
      .then((res) => setNegotiations((res.negotiations ?? []).map(mapApiNegotiation)))
      .catch(() => null);
  }, []);
  const [tab, setTab] = useState<Tab["id"]>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts: Record<Tab["id"], number> = useMemo(
    () => ({
      all: negotiations.length,
      Agreed: negotiations.filter((n) => n.status === "Agreed").length,
      Failed: negotiations.filter((n) => n.status === "Failed").length,
      "In progress": negotiations.filter((n) => n.status === "In progress").length,
      Disputed: negotiations.filter((n) => n.status === "Disputed").length,
    }),
    [negotiations],
  );

  const filtered = useMemo(() => {
    return negotiations.filter((n) => {
      if (tab !== "all" && n.status !== tab) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          n.id.toLowerCase().includes(q) ||
          n.customer.name.toLowerCase().includes(q) ||
          (n.driver?.name.toLowerCase().includes(q) ?? false) ||
          n.pickup.toLowerCase().includes(q) ||
          n.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [negotiations, tab, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      if (sortKey === "id") {
        va = a.id;
        vb = b.id;
      } else if (sortKey === "rounds") {
        va = a.rounds;
        vb = b.rounds;
      } else if (sortKey === "initial") {
        va = a.initial;
        vb = b.initial;
      } else {
        va = a.final ?? -1;
        vb = b.final ?? -1;
      }
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sorted.length);
  const paginated = sorted.slice(start, end);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const viewing = viewingId ? negotiations.find((n) => n.id === viewingId) ?? null : null;

  const agreedNegs = negotiations.filter((n) => n.status === "Agreed");
  const avgUplift = agreedNegs.length
    ? Math.round(
        (agreedNegs.reduce(
          (acc, n) => acc + ((n.final! - n.initial) / n.initial) * 100,
          0,
        ) /
          agreedNegs.length) * 10,
      ) / 10
    : 0;

  const byVehicle = useMemo(() => {
    const groups: Record<string, number> = {
      "Moto Bike": 0,
      "Cab Taxi": 0,
      "Light Hilux": 0,
      "Heavy Fuso": 0,
    };
    for (const n of negotiations) groups[n.vehicleType]++;
    return [
      { label: "Moto", value: groups["Moto Bike"] },
      { label: "Cab", value: groups["Cab Taxi"] },
      { label: "Hilux", value: groups["Light Hilux"] },
      { label: "Fuso", value: groups["Heavy Fuso"] },
    ];
  }, [negotiations]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Outcome split">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <DonutChart
                agreed={counts.Agreed}
                failed={counts.Failed}
                inProgress={counts["In progress"]}
                disputed={counts.Disputed}
              />
              <div className="flex-1 space-y-2 text-xs">
                {[
                  { label: "Agreed", value: counts.Agreed, dot: "bg-primary" },
                  { label: "Failed", value: counts.Failed, dot: "bg-red-400" },
                  {
                    label: "In progress",
                    value: counts["In progress"],
                    dot: "bg-amber-400",
                  },
                  {
                    label: "Disputed",
                    value: counts.Disputed,
                    dot: "bg-amber-600",
                  },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                      {r.label}
                    </span>
                    <span className="font-bold text-foreground">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Avg fare uplift">
          <div className="p-4">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {avgUplift > 0 ? "+" : ""}
              {avgUplift}%
            </p>
            <p className="text-[11px] text-muted-foreground">
              over initial customer offer
            </p>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-primary"
                style={{ width: `${Math.min(100, Math.max(0, avgUplift * 4))}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Across {agreedNegs.length} agreed negotiations today.
            </p>
          </div>
        </Card>

        <Card title="Volume by vehicle">
          <div className="p-4">
            <MiniBarChart data={byVehicle} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Negotiations per vehicle category today.
            </p>
          </div>
        </Card>
      </div>

      <Card
        title="Recent negotiations"
        action={
          <div className="flex items-center gap-2">
            <ViewToggle value={viewMode} onChange={setViewMode} />
            <input
              type="search"
              placeholder="Search ID, name, route…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="h-8 w-64 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        }
      >
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setPage(1);
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
                  {counts[t.id]}
                </span>
              </button>
            );
          })}
        </div>

        {viewMode === "grid" ? (
          <div className="p-4">
            {paginated.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No negotiations match your filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginated.map((n) => (
                  <NegotiationCard
                    key={n.id}
                    negotiation={n}
                    onOpen={() => setViewingId(n.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <SortHeader
                  label="ID"
                  sortKey="id"
                  currentKey={sortKey}
                  dir={sortDir}
                  onClick={() => toggleSort("id")}
                />
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Route
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Parties
                </th>
                <SortHeader
                  label="Initial"
                  sortKey="initial"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("initial")}
                />
                <SortHeader
                  label="Final"
                  sortKey="final"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("final")}
                />
                <SortHeader
                  label="Rounds"
                  sortKey="rounds"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("rounds")}
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
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No negotiations match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((n) => {
                  const uplift =
                    n.final !== null
                      ? Math.round(((n.final - n.initial) / n.initial) * 100)
                      : null;
                  return (
                    <tr
                      key={n.id}
                      className="cursor-pointer hover:bg-surface/50"
                      onClick={() => setViewingId(n.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        {n.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-foreground">
                          {n.pickup} → {n.destination}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {n.vehicleType}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={n.customer.name} tone="neutral" size="sm" />
                          <span className="text-xs text-foreground">
                            {n.customer.name}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {n.driver ? (
                            <>
                              <Avatar name={n.driver.name} size="sm" />
                              <span className="text-[11px] text-muted-foreground">
                                {n.driver.name}
                              </span>
                            </>
                          ) : (
                            <span className="pl-9 text-[11px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatRWF(n.initial)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {n.final !== null ? (
                          <div>
                            <div>{formatRWF(n.final)}</div>
                            {uplift !== null ? (
                              <div
                                className={`text-[10px] font-semibold ${
                                  uplift > 0
                                    ? "text-amber-600"
                                    : uplift < 0
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {uplift > 0 ? "+" : ""}
                                {uplift}%
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {n.rounds}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[n.status]}`}
                        >
                          {n.status === "Disputed" ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-2.5 w-2.5"
                              aria-hidden
                            >
                              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          ) : null}
                          {n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingId(n.id);
                          }}
                          className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                        >
                          View thread
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {sorted.length === 0 ? 0 : start + 1}–{end}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{sorted.length}</span>{" "}
            negotiations
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, safePage - 1))}
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
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </Card>

      <NegotiationModal
        negotiation={viewing}
        onClose={() => setViewingId(null)}
        onMessageCustomer={(id) => {
          const n = negotiations.find((x) => x.id === id);
          setToast(n ? `Message sent to ${n.customer.name}` : "Message sent");
        }}
        onMessageDriver={(id) => {
          const n = negotiations.find((x) => x.id === id);
          setToast(
            n?.driver ? `Message sent to ${n.driver.name}` : "Message sent",
          );
        }}
        onViewRide={(id) => {
          setToast(`Opening ride trace for ${id}`);
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
