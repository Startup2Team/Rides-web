"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, Card, StatusPill } from "../_components";
import {
  CustomerModal,
  type CustomerProfile,
  type CustomerStatus,
} from "./customer-modal";
import {
  getCustomers,
  suspendCustomer,
  reinstateCustomer,
  banCustomer,
  type Customer as ApiCustomer,
} from "@/lib/api";

function mapApiCustomer(c: ApiCustomer): Customer {
  return {
    id: c.id,
    name: c.full_name,
    email: c.email ?? "",
    phone: c.phone_number,
    location: "",
    joined: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    trips: c.total_rides,
    spend: 0,
    avgFare: 0,
    lastTrip: c.last_active_at
      ? new Date(c.last_active_at).toLocaleDateString()
      : "—",
    rating: 0,
    preferredVehicle: "",
    status: mapCustomerStatus(c.status),
    recentTrips: [],
    notes: c.notes,
  };
}

function mapCustomerStatus(status: string): CustomerStatus {
  if (status === "BANNED" || status === "SUSPENDED") return "Suspended";
  if (status === "FLAGGED") return "Flagged";
  return "Active";
}

type Customer = CustomerProfile;

const initialCustomers: Customer[] = [
  {
    id: "c1",
    name: "Alice Mukamana",
    email: "alice.m@taravelis.io",
    phone: "+250 788 213 005",
    location: "Kacyiru, Gasabo, Kigali City",
    joined: "Jan 2026",
    trips: 24,
    spend: 82500,
    avgFare: 3437,
    lastTrip: "2 days ago",
    rating: 4.8,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "25 May", from: "Kacyiru", to: "Kigali Heights", vehicle: "Cab Taxi", fare: 3500, status: "Completed" },
      { id: "t2", date: "22 May", from: "Kimironko", to: "Kacyiru", vehicle: "Cab Taxi", fare: 2800, status: "Completed" },
      { id: "t3", date: "18 May", from: "Kacyiru", to: "Nyarutarama", vehicle: "Moto Bike", fare: 1500, status: "Completed" },
    ],
  },
  {
    id: "c2",
    name: "Boris Habineza",
    email: "boris.h@taravelis.io",
    phone: "+250 788 552 198",
    location: "Remera, Gasabo, Kigali City",
    joined: "Mar 2026",
    trips: 8,
    spend: 31200,
    avgFare: 3900,
    lastTrip: "5 days ago",
    rating: 4.6,
    preferredVehicle: "Moto Bike",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "22 May", from: "Remera", to: "Town", vehicle: "Moto Bike", fare: 2200, status: "Completed" },
      { id: "t2", date: "16 May", from: "Remera", to: "Kicukiro", vehicle: "Cab Taxi", fare: 4500, status: "Completed" },
    ],
  },
  {
    id: "c3",
    name: "Christine Niyibizi",
    email: "christine.n@taravelis.io",
    phone: "+250 788 614 770",
    location: "Nyarutarama, Gasabo, Kigali City",
    joined: "Jul 2024",
    trips: 142,
    spend: 547800,
    avgFare: 3858,
    lastTrip: "Just now",
    rating: 4.9,
    preferredVehicle: "Cab Taxi",
    status: "VIP",
    notes: "Corporate account · Bank of Kigali. Quarterly invoicing on file.",
    recentTrips: [
      { id: "t1", date: "27 May", from: "Nyarutarama", to: "Kigali Heights", vehicle: "Cab Taxi", fare: 3200, status: "Completed" },
      { id: "t2", date: "27 May", from: "Kigali Heights", to: "Nyarutarama", vehicle: "Cab Taxi", fare: 3400, status: "Completed" },
      { id: "t3", date: "26 May", from: "Nyarutarama", to: "MTN Centre", vehicle: "Cab Taxi", fare: 2800, status: "Completed" },
      { id: "t4", date: "25 May", from: "Kacyiru", to: "Nyarutarama", vehicle: "Cab Taxi", fare: 3600, status: "Completed" },
    ],
  },
  {
    id: "c4",
    name: "Daniel Iradukunda",
    email: "daniel.i@taravelis.io",
    phone: "+250 788 102 441",
    location: "Gikondo, Kicukiro, Kigali City",
    joined: "Apr 2026",
    trips: 3,
    spend: 12400,
    avgFare: 4133,
    lastTrip: "1 week ago",
    rating: 4.5,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "20 May", from: "Gikondo", to: "Town", vehicle: "Cab Taxi", fare: 4200, status: "Completed" },
      { id: "t2", date: "12 May", from: "Town", to: "Gikondo", vehicle: "Cab Taxi", fare: 4400, status: "Completed" },
    ],
  },
  {
    id: "c5",
    name: "Elise Twagiramungu",
    email: "elise.t@taravelis.io",
    phone: "+250 788 339 882",
    location: "Nyamirambo, Nyarugenge, Kigali City",
    joined: "Dec 2025",
    trips: 0,
    spend: 0,
    avgFare: 0,
    lastTrip: "Never",
    rating: 0,
    preferredVehicle: "—",
    status: "Dormant",
    notes: "Signed up but never completed onboarding promo trip.",
    recentTrips: [],
  },
  {
    id: "c6",
    name: "Fabrice Bizimana",
    email: "fabrice.b@taravelis.io",
    phone: "+250 788 477 113",
    location: "Niboye, Kicukiro, Kigali City",
    joined: "May 2026",
    trips: 1,
    spend: 3800,
    avgFare: 3800,
    lastTrip: "3 days ago",
    rating: 2.1,
    preferredVehicle: "Moto Bike",
    status: "Flagged",
    notes:
      "Two driver complaints in 48h — aggressive language. Hold any disputes for manual review.",
    recentTrips: [
      { id: "t1", date: "24 May", from: "Niboye", to: "Kicukiro Centre", vehicle: "Moto Bike", fare: 1800, status: "Cancelled" },
      { id: "t2", date: "24 May", from: "Niboye", to: "Town", vehicle: "Moto Bike", fare: 3800, status: "Completed" },
    ],
  },
  {
    id: "c7",
    name: "Grace Uwineza",
    email: "grace.u@taravelis.io",
    phone: "+250 788 823 005",
    location: "Kacyiru, Gasabo, Kigali City",
    joined: "Sep 2024",
    trips: 98,
    spend: 423500,
    avgFare: 4321,
    lastTrip: "Yesterday",
    rating: 4.9,
    preferredVehicle: "Cab Taxi",
    status: "VIP",
    notes: "Loyalty tier: Gold. Birthday: 12 Aug.",
    recentTrips: [
      { id: "t1", date: "26 May", from: "Kacyiru", to: "Airport", vehicle: "Cab Taxi", fare: 8500, status: "Completed" },
      { id: "t2", date: "24 May", from: "Kacyiru", to: "Town", vehicle: "Cab Taxi", fare: 3200, status: "Completed" },
    ],
  },
  {
    id: "c8",
    name: "Henri Mugisha",
    email: "henri.m@taravelis.io",
    phone: "+250 788 156 992",
    location: "Kimironko, Gasabo, Kigali City",
    joined: "Feb 2026",
    trips: 18,
    spend: 67200,
    avgFare: 3733,
    lastTrip: "4 hours ago",
    rating: 4.7,
    preferredVehicle: "Moto Bike",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "27 May", from: "Kimironko", to: "Town", vehicle: "Moto Bike", fare: 2400, status: "Completed" },
    ],
  },
  {
    id: "c9",
    name: "Irene Mukasa",
    email: "irene.m@taravelis.io",
    phone: "+250 788 290 552",
    location: "Remera, Gasabo, Kigali City",
    joined: "Nov 2025",
    trips: 35,
    spend: 124300,
    avgFare: 3551,
    lastTrip: "Today",
    rating: 4.8,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "27 May", from: "Remera", to: "Kigali Heights", vehicle: "Cab Taxi", fare: 3000, status: "Completed" },
      { id: "t2", date: "26 May", from: "Remera", to: "Kacyiru", vehicle: "Cab Taxi", fare: 2800, status: "Completed" },
    ],
  },
  {
    id: "c10",
    name: "Jean-Paul Karangwa",
    email: "jp.k@taravelis.io",
    phone: "+250 788 705 887",
    location: "Muhima, Nyarugenge, Kigali City",
    joined: "Aug 2025",
    trips: 2,
    spend: 7600,
    avgFare: 3800,
    lastTrip: "3 weeks ago",
    rating: 1.8,
    preferredVehicle: "Cab Taxi",
    status: "Suspended",
    notes:
      "Suspended on 2026-05-04 after confirmed fraudulent chargeback. Do not reactivate without supervisor approval.",
    recentTrips: [
      { id: "t1", date: "06 May", from: "Muhima", to: "Town", vehicle: "Cab Taxi", fare: 3800, status: "Completed" },
      { id: "t2", date: "04 May", from: "Town", to: "Muhima", vehicle: "Cab Taxi", fare: 3800, status: "Completed" },
    ],
  },
  {
    id: "c11",
    name: "Kalisa Eric",
    email: "kalisa.e@taravelis.io",
    phone: "+250 788 412 003",
    location: "Gahanga, Kicukiro, Kigali City",
    joined: "Feb 2026",
    trips: 12,
    spend: 45800,
    avgFare: 3816,
    lastTrip: "2 hours ago",
    rating: 4.6,
    preferredVehicle: "Light Hilux",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "27 May", from: "Gahanga", to: "Town", vehicle: "Light Hilux", fare: 5400, status: "Completed" },
    ],
  },
  {
    id: "c12",
    name: "Liliane Uwase",
    email: "liliane.u@taravelis.io",
    phone: "+250 788 904 660",
    location: "Kacyiru, Gasabo, Kigali City",
    joined: "Jun 2024",
    trips: 76,
    spend: 312400,
    avgFare: 4110,
    lastTrip: "Today",
    rating: 4.9,
    preferredVehicle: "Cab Taxi",
    status: "VIP",
    notes: "Pays in advance — corporate prepaid wallet, BPR.",
    recentTrips: [
      { id: "t1", date: "27 May", from: "Kacyiru", to: "BPR HQ", vehicle: "Cab Taxi", fare: 3600, status: "Completed" },
      { id: "t2", date: "27 May", from: "BPR HQ", to: "Kacyiru", vehicle: "Cab Taxi", fare: 3800, status: "Completed" },
    ],
  },
  {
    id: "c13",
    name: "Maurice Nshuti",
    email: "maurice.n@taravelis.io",
    phone: "+250 788 156 224",
    location: "Niboye, Kicukiro, Kigali City",
    joined: "Jan 2026",
    trips: 14,
    spend: 52100,
    avgFare: 3721,
    lastTrip: "Yesterday",
    rating: 4.5,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "26 May", from: "Niboye", to: "Town", vehicle: "Cab Taxi", fare: 4200, status: "Completed" },
    ],
  },
  {
    id: "c14",
    name: "Nadia Kayitesi",
    email: "nadia.k@taravelis.io",
    phone: "+250 788 803 117",
    location: "Muhima, Nyarugenge, Kigali City",
    joined: "Oct 2025",
    trips: 1,
    spend: 4200,
    avgFare: 4200,
    lastTrip: "2 months ago",
    rating: 4.0,
    preferredVehicle: "Cab Taxi",
    status: "Dormant",
    recentTrips: [
      { id: "t1", date: "20 Mar", from: "Muhima", to: "Town", vehicle: "Cab Taxi", fare: 4200, status: "Completed" },
    ],
  },
  {
    id: "c15",
    name: "Olivier Habimana",
    email: "olivier.h@taravelis.io",
    phone: "+250 788 449 660",
    location: "Kanyinya, Nyarugenge, Kigali City",
    joined: "Dec 2025",
    trips: 22,
    spend: 88400,
    avgFare: 4018,
    lastTrip: "Today",
    rating: 4.7,
    preferredVehicle: "Moto Bike",
    status: "Active",
    recentTrips: [
      { id: "t1", date: "27 May", from: "Kanyinya", to: "Town", vehicle: "Moto Bike", fare: 2200, status: "Completed" },
    ],
  },
  {
    id: "c16",
    name: "Patricia Mukamana",
    email: "patricia.m@taravelis.io",
    phone: "+250 788 322 178",
    location: "Nyarugunga, Kicukiro, Kigali City",
    joined: "Feb 2026",
    trips: 3,
    spend: 11200,
    avgFare: 3733,
    lastTrip: "6 days ago",
    rating: 2.4,
    preferredVehicle: "Moto Bike",
    status: "Flagged",
    notes: "Reported by 2 drivers for repeated no-shows.",
    recentTrips: [
      { id: "t1", date: "21 May", from: "Nyarugunga", to: "Town", vehicle: "Moto Bike", fare: 2400, status: "Cancelled" },
      { id: "t2", date: "20 May", from: "Nyarugunga", to: "Kicukiro Centre", vehicle: "Moto Bike", fare: 1800, status: "Completed" },
    ],
  },
  {
    id: "c17",
    name: "Queen Niyonsenga",
    email: "queen.n@taravelis.io",
    phone: "+250 788 187 504",
    location: "Kimironko, Gasabo, Kigali City",
    joined: "Mar 2026",
    trips: 9,
    spend: 34600,
    avgFare: 3844,
    lastTrip: "Yesterday",
    rating: 4.5,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [],
  },
  {
    id: "c18",
    name: "Robert Tuyizere",
    email: "robert.t@taravelis.io",
    phone: "+250 788 670 219",
    location: "Remera, Gasabo, Kigali City",
    joined: "Sep 2025",
    trips: 27,
    spend: 98700,
    avgFare: 3655,
    lastTrip: "Today",
    rating: 4.8,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [],
  },
  {
    id: "c19",
    name: "Sandrine Uwimana",
    email: "sandrine.u@taravelis.io",
    phone: "+250 788 091 553",
    location: "Gikondo, Kicukiro, Kigali City",
    joined: "Jun 2025",
    trips: 5,
    spend: 18400,
    avgFare: 3680,
    lastTrip: "1 month ago",
    rating: 2.2,
    preferredVehicle: "Cab Taxi",
    status: "Suspended",
    notes: "Suspended for confirmed payment fraud — chargebacks on 3 trips.",
    recentTrips: [],
  },
  {
    id: "c20",
    name: "Théo Bizimana",
    email: "theo.b@taravelis.io",
    phone: "+250 788 558 002",
    location: "Ndera, Gasabo, Kigali City",
    joined: "Mar 2024",
    trips: 64,
    spend: 268500,
    avgFare: 4195,
    lastTrip: "2 hours ago",
    rating: 4.9,
    preferredVehicle: "Cab Taxi",
    status: "VIP",
    notes: "Frequent airport runs. Always pre-books for early flights.",
    recentTrips: [],
  },
  {
    id: "c21",
    name: "Umutoni Aline",
    email: "aline.u@taravelis.io",
    phone: "+250 788 567 102",
    location: "Remera, Gasabo, Kigali City",
    joined: "Jul 2025",
    trips: 0,
    spend: 0,
    avgFare: 0,
    lastTrip: "Never",
    rating: 0,
    preferredVehicle: "—",
    status: "Dormant",
    recentTrips: [],
  },
  {
    id: "c22",
    name: "Vincent Karangwa",
    email: "vincent.k@taravelis.io",
    phone: "+250 788 821 003",
    location: "Gisozi, Gasabo, Kigali City",
    joined: "Jan 2026",
    trips: 16,
    spend: 61800,
    avgFare: 3862,
    lastTrip: "Today",
    rating: 4.6,
    preferredVehicle: "Moto Bike",
    status: "Active",
    recentTrips: [],
  },
  {
    id: "c23",
    name: "Winnie Mukamana",
    email: "winnie.m@taravelis.io",
    phone: "+250 788 123 456",
    location: "Kacyiru, Gasabo, Kigali City",
    joined: "Apr 2026",
    trips: 11,
    spend: 42300,
    avgFare: 3845,
    lastTrip: "Yesterday",
    rating: 4.7,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [],
  },
  {
    id: "c24",
    name: "Xavier Iradukunda",
    email: "xavier.i@taravelis.io",
    phone: "+250 788 614 005",
    location: "Kimironko, Gasabo, Kigali City",
    joined: "Feb 2026",
    trips: 7,
    spend: 28900,
    avgFare: 4128,
    lastTrip: "4 days ago",
    rating: 4.5,
    preferredVehicle: "Cab Taxi",
    status: "Active",
    recentTrips: [],
  },
];

const statusStyles: Record<CustomerStatus, string> = {
  Active: "bg-primary/15 text-primary",
  VIP: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Dormant: "bg-muted text-muted-foreground",
  Flagged: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Suspended: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
};

const statusToneMap: Record<
  CustomerStatus,
  "success" | "info" | "warn" | "danger" | "neutral"
> = {
  Active: "success",
  VIP: "info",
  Dormant: "neutral",
  Flagged: "warn",
  Suspended: "danger",
};

type Tab = { id: "all" | CustomerStatus; label: string };

const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
  { id: "VIP", label: "VIP" },
  { id: "Dormant", label: "Dormant" },
  { id: "Flagged", label: "Flagged" },
  { id: "Suspended", label: "Suspended" },
];

type SortKey = "name" | "trips" | "spend" | "joined";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "grid";

const PAGE_SIZE = 8;

function formatRWF(n: number) {
  if (n === 0) return "—";
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
        </svg>
      )}
      {btn(
        "table",
        "Table view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      )}
    </div>
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

function RowMenu({
  status,
  open,
  onToggle,
  onClose,
  onView,
  onMessage,
  onFlag,
  onUnflag,
  onSuspend,
  onReinstate,
}: {
  status: CustomerStatus;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onView: () => void;
  onMessage: () => void;
  onFlag: () => void;
  onUnflag: () => void;
  onSuspend: () => void;
  onReinstate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  type Action = { label: string; tone?: "danger"; onClick: () => void };
  const actions: Action[] = [
    { label: "View profile", onClick: onView },
    { label: "Message", onClick: onMessage },
    ...(status === "Flagged"
      ? [{ label: "Remove flag", onClick: onUnflag }]
      : status === "Suspended"
        ? []
        : [{ label: "Flag account", onClick: onFlag }]),
    ...(status === "Suspended"
      ? [{ label: "Reinstate", onClick: onReinstate }]
      : [{ label: "Suspend", tone: "danger" as const, onClick: onSuspend }]),
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Actions"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
          <ul className="space-y-0.5">
            {actions.map((a) => (
              <li key={a.label}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    a.onClick();
                  }}
                  className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                    a.tone === "danger"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CustomerCard({
  customer,
  onView,
  menu,
}: {
  customer: Customer;
  onView: () => void;
  menu: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative">
            <Avatar name={customer.name} tone="neutral" />
            {customer.status === "VIP" ? (
              <span
                aria-hidden
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] text-white ring-2 ring-card"
              >
                ★
              </span>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {customer.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {customer.email}
            </p>
          </div>
        </div>
        {menu}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[customer.status]}`}
        >
          {customer.status}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Joined {customer.joined}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div className="text-center">
          <p className="text-sm font-bold tracking-tight text-foreground">
            {customer.trips}
          </p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Trips
          </p>
        </div>
        <div className="border-x border-border text-center">
          <p className="truncate text-sm font-bold tracking-tight text-foreground">
            {customer.spend === 0
              ? "—"
              : `${Math.round(customer.spend / 1000)}K`}
          </p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Spend
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-tight text-foreground">
            {customer.rating === 0 ? "—" : (
              <>
                {customer.rating.toFixed(1)}{" "}
                <span className="text-amber-500">★</span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rating
          </p>
        </div>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={onView}
          className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
        >
          View profile
        </button>
      </div>
    </div>
  );
}

export function CustomersTable() {
  const [tab, setTab] = useState<Tab["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    getCustomers({ limit: "100", offset: "0" })
      .then((res) => setCustomers((res.customers ?? []).map(mapApiCustomer)))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const updateStatus = (id: string, status: CustomerStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const viewingCustomer = viewingId
    ? customers.find((c) => c.id === viewingId) ?? null
    : null;

  const counts: Record<Tab["id"], number> = {
    all: customers.length,
    Active: customers.filter((c) => c.status === "Active").length,
    VIP: customers.filter((c) => c.status === "VIP").length,
    Dormant: customers.filter((c) => c.status === "Dormant").length,
    Flagged: customers.filter((c) => c.status === "Flagged").length,
    Suspended: customers.filter((c) => c.status === "Suspended").length,
  };

  const filtered = customers.filter((c) => {
    if (tab !== "all" && c.status !== tab) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: string | number;
    let vb: string | number;
    if (sortKey === "name") {
      va = a.name;
      vb = b.name;
    } else if (sortKey === "trips") {
      va = a.trips;
      vb = b.trips;
    } else if (sortKey === "spend") {
      va = a.spend;
      vb = b.spend;
    } else {
      va = a.joined;
      vb = b.joined;
    }
    if (typeof va === "number" && typeof vb === "number") {
      return sortDir === "asc" ? va - vb : vb - va;
    }
    return sortDir === "asc"
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });

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

  const renderMenu = (c: Customer) => (
    <RowMenu
      status={c.status}
      open={openMenuId === c.id}
      onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
      onClose={() => setOpenMenuId(null)}
      onView={() => setViewingId(c.id)}
      onMessage={() => setToast(`Message sent to ${c.name}`)}
      onFlag={() => {
        updateStatus(c.id, "Flagged");
        setToast(`${c.name} flagged for review`);
      }}
      onUnflag={() => {
        updateStatus(c.id, "Active");
        setToast(`${c.name} flag removed`);
      }}
      onSuspend={async () => {
        try { await suspendCustomer(c.id, 24); } catch { /* ignore */ }
        updateStatus(c.id, "Suspended");
        setToast(`${c.name} suspended`);
      }}
      onReinstate={async () => {
        try { await reinstateCustomer(c.id); } catch { /* ignore */ }
        updateStatus(c.id, "Active");
        setToast(`${c.name} reinstated`);
      }}
    />
  );

  return (
    <Card
      title="Customer directory"
      action={
        <div className="flex items-center gap-2">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <input
            type="search"
            placeholder="Search name, email, phone…"
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

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <SortHeader
                  label="Customer"
                  sortKey="name"
                  currentKey={sortKey}
                  dir={sortDir}
                  onClick={() => toggleSort("name")}
                />
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
                <SortHeader
                  label="Joined"
                  sortKey="joined"
                  currentKey={sortKey}
                  dir={sortDir}
                  onClick={() => toggleSort("joined")}
                />
                <SortHeader
                  label="Trips"
                  sortKey="trips"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("trips")}
                />
                <SortHeader
                  label="Total spend"
                  sortKey="spend"
                  currentKey={sortKey}
                  dir={sortDir}
                  align="right"
                  onClick={() => toggleSort("spend")}
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
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No customers match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar name={c.name} tone="neutral" />
                          {c.status === "VIP" ? (
                            <span
                              aria-hidden
                              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] text-white ring-2 ring-card"
                            >
                              ★
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold tracking-tight text-foreground">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {c.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-foreground">{c.email}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {c.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.joined}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {c.trips}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatRWF(c.spend)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        status={c.status}
                        tone={statusToneMap[c.status]}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingId(c.id)}
                          className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                        >
                          View
                        </button>
                        {renderMenu(c)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4">
          {paginated.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No customers match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((c) => (
                <CustomerCard
                  key={c.id}
                  customer={c}
                  onView={() => setViewingId(c.id)}
                  menu={renderMenu(c)}
                />
              ))}
            </div>
          )}
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
          customers
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

      <CustomerModal
        customer={viewingCustomer}
        onClose={() => setViewingId(null)}
        onMessage={(id) => {
          const target = customers.find((c) => c.id === id);
          setToast(target ? `Message sent to ${target.name}` : "Message sent");
        }}
        onFlag={(id) => {
          updateStatus(id, "Flagged");
          const target = customers.find((c) => c.id === id);
          setToast(`${target?.name ?? "Customer"} flagged for review`);
        }}
        onUnflag={(id) => {
          updateStatus(id, "Active");
          const target = customers.find((c) => c.id === id);
          setToast(`${target?.name ?? "Customer"} flag removed`);
        }}
        onSuspend={(id) => {
          updateStatus(id, "Suspended");
          const target = customers.find((c) => c.id === id);
          setToast(`${target?.name ?? "Customer"} suspended`);
          setViewingId(null);
        }}
        onReinstate={(id) => {
          updateStatus(id, "Active");
          const target = customers.find((c) => c.id === id);
          setToast(`${target?.name ?? "Customer"} reinstated`);
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
    </Card>
  );
}
