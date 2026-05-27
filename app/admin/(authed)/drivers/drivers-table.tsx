"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Card } from "../_components";
import { VerifyDriverModal, type VerifyDriver } from "./verify-driver-modal";

const vehicleSlugMap: Record<string, string> = {
  moto: "Moto Bike",
  cab: "Cab Taxi",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
};

const vehicleSlugLabels: Record<string, string> = {
  moto: "Moto Bikes",
  cab: "Cab Taxis",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
};

type DriverStatus =
  | "Online"
  | "On trip"
  | "Offline"
  | "Pending"
  | "Suspended";

type Driver = {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  status: DriverStatus;
  acceptance: number | null;
  rating: number | null;
  lastActive: string;
  kyc?: VerifyDriver["kyc"];
};

const initialDrivers: Driver[] = [
  { id: "d1", name: "Aiden Mugisha", vehicle: "Cab Taxi", plate: "RAB 123 D", status: "Online", acceptance: 94, rating: 4.9, lastActive: "Just now", kyc: { phone: "+250 788 213 401", dob: "14 Mar 1992", age: 33, location: "Kacyiru, Gasabo, Kigali City", licenseNumber: "DL-0001245", submittedAt: "Approved 8 months ago", momoProvider: "MTN MoMo", momoCode: "250788213401" } },
  { id: "d2", name: "Beni Karenzi", vehicle: "Moto Bike", plate: "RAA 887 K", status: "On trip", acceptance: 88, rating: 4.7, lastActive: "2m", kyc: { phone: "+250 788 552 110", dob: "22 Jul 1995", age: 30, location: "Remera, Gasabo, Kigali City", licenseNumber: "DL-0009881", submittedAt: "Approved 6 months ago", momoProvider: "MTN MoMo", momoCode: "250788552110" } },
  { id: "d3", name: "Claude Rwema", vehicle: "Light Hilux", plate: "RAC 552 R", status: "Online", acceptance: 91, rating: 4.8, lastActive: "5m", kyc: { phone: "+250 788 102 887", dob: "9 Nov 1989", age: 36, location: "Gisozi, Gasabo, Kigali City", licenseNumber: "DL-0014562", submittedAt: "Approved 1 year ago", momoProvider: "Airtel Money", momoCode: "250788102887" } },
  { id: "d4", name: "Diane Uwase", vehicle: "Cab Taxi", plate: "RAB 410 U", status: "Offline", acceptance: 82, rating: 4.6, lastActive: "3h", kyc: { phone: "+250 788 339 220", dob: "5 May 1990", age: 35, location: "Nyamirambo, Nyarugenge, Kigali City", licenseNumber: "DL-0018837", submittedAt: "Approved 9 months ago", momoProvider: "MTN MoMo", momoCode: "250788339220" } },
  { id: "d5", name: "Eric Nshuti", vehicle: "Heavy Fuso", plate: "RAD 094 N", status: "On trip", acceptance: 76, rating: 4.5, lastActive: "1m", kyc: { phone: "+250 788 477 661", dob: "30 Jan 1987", age: 38, location: "Niboye, Kicukiro, Kigali City", licenseNumber: "DL-0022114", submittedAt: "Approved 1 year ago", momoProvider: "Airtel Money", momoCode: "250788477661" } },
  { id: "d6", name: "Florence Ingabire", vehicle: "Moto Bike", plate: "RAA 211 I", status: "Pending", acceptance: null, rating: null, lastActive: "Pending", kyc: { phone: "+250 788 123 456", dob: "12 Apr 1998", age: 27, location: "Kacyiru, Gasabo, Kigali City", licenseNumber: "DL-1234567", submittedAt: "2h ago", momoProvider: "MTN MoMo", momoCode: "250788123456" } },
  { id: "d7", name: "Gerard Bizimana", vehicle: "Cab Taxi", plate: "RAB 763 B", status: "Suspended", acceptance: 61, rating: 3.9, lastActive: "2d", kyc: { phone: "+250 788 821 003", dob: "11 Apr 1985", age: 40, location: "Gikondo, Kicukiro, Kigali City", licenseNumber: "DL-0026891", submittedAt: "Suspended 3 weeks ago", momoProvider: "MTN MoMo", momoCode: "250788821003" } },
  { id: "d8", name: "Helen Niyibizi", vehicle: "Cab Taxi", plate: "RAB 318 H", status: "Online", acceptance: 96, rating: 4.9, lastActive: "Just now", kyc: { phone: "+250 788 614 005", dob: "27 Sep 1991", age: 34, location: "Kimironko, Gasabo, Kigali City", licenseNumber: "DL-0030124", submittedAt: "Approved 7 months ago", momoProvider: "MTN MoMo", momoCode: "250788614005" } },
  { id: "d9", name: "Ivan Mukasa", vehicle: "Heavy Fuso", plate: "RAD 421 I", status: "On trip", acceptance: 84, rating: 4.6, lastActive: "3m", kyc: { phone: "+250 788 290 887", dob: "17 Dec 1988", age: 37, location: "Ndera, Gasabo, Kigali City", licenseNumber: "DL-0034772", submittedAt: "Approved 1 year ago", momoProvider: "Airtel Money", momoCode: "250788290887" } },
  { id: "d10", name: "Joyce Habineza", vehicle: "Moto Bike", plate: "RAA 502 J", status: "Online", acceptance: 92, rating: 4.8, lastActive: "1m", kyc: { phone: "+250 788 705 332", dob: "2 Aug 1994", age: 31, location: "Kacyiru, Gasabo, Kigali City", licenseNumber: "DL-0038905", submittedAt: "Approved 5 months ago", momoProvider: "MTN MoMo", momoCode: "250788705332" } },
  { id: "d11", name: "Kevin Tuyizere", vehicle: "Light Hilux", plate: "RAC 167 K", status: "Offline", acceptance: 79, rating: 4.4, lastActive: "5h", kyc: { phone: "+250 788 412 998", dob: "19 Jun 1986", age: 39, location: "Gahanga, Kicukiro, Kigali City", licenseNumber: "DL-0042561", submittedAt: "Approved 10 months ago", momoProvider: "Airtel Money", momoCode: "250788412998" } },
  { id: "d12", name: "Liliane Murasi", vehicle: "Cab Taxi", plate: "RAB 944 L", status: "Pending", acceptance: null, rating: null, lastActive: "Pending", kyc: { phone: "+250 788 904 211", dob: "8 Sep 1995", age: 30, location: "Nyamirambo, Nyarugenge, Kigali City", licenseNumber: "DL-2398574", submittedAt: "5h ago", momoProvider: "Airtel Money", momoCode: "250788904211" } },
  { id: "d13", name: "Marc Iradukunda", vehicle: "Heavy Fuso", plate: "RAD 286 M", status: "On trip", acceptance: 73, rating: 4.5, lastActive: "8m", kyc: { phone: "+250 788 156 224", dob: "8 Feb 1990", age: 35, location: "Gitega, Nyarugenge, Kigali City", licenseNumber: "DL-0049012", submittedAt: "Approved 11 months ago", momoProvider: "MTN MoMo", momoCode: "250788156224" } },
  { id: "d14", name: "Nadine Kayitesi", vehicle: "Moto Bike", plate: "RAA 638 N", status: "Online", acceptance: 89, rating: 4.7, lastActive: "Just now", kyc: { phone: "+250 788 803 117", dob: "23 Oct 1996", age: 29, location: "Muhima, Nyarugenge, Kigali City", licenseNumber: "DL-0052338", submittedAt: "Approved 4 months ago", momoProvider: "MTN MoMo", momoCode: "250788803117" } },
  { id: "d15", name: "Olivier Hakizimana", vehicle: "Cab Taxi", plate: "RAB 502 O", status: "Online", acceptance: 95, rating: 4.9, lastActive: "2m", kyc: { phone: "+250 788 449 660", dob: "15 May 1988", age: 37, location: "Kanyinya, Nyarugenge, Kigali City", licenseNumber: "DL-0056781", submittedAt: "Approved 1 year ago", momoProvider: "Airtel Money", momoCode: "250788449660" } },
  { id: "d16", name: "Patrick Nshimiyimana", vehicle: "Light Hilux", plate: "RAC 712 P", status: "On trip", acceptance: 81, rating: 4.6, lastActive: "12m", kyc: { phone: "+250 788 322 178", dob: "28 Jan 1993", age: 32, location: "Nyarugunga, Kicukiro, Kigali City", licenseNumber: "DL-0061447", submittedAt: "Approved 8 months ago", momoProvider: "MTN MoMo", momoCode: "250788322178" } },
  { id: "d17", name: "Queen Mukamana", vehicle: "Cab Taxi", plate: "RAB 138 Q", status: "Suspended", acceptance: 58, rating: 3.7, lastActive: "5d", kyc: { phone: "+250 788 187 504", dob: "4 Aug 1984", age: 41, location: "Kimironko, Gasabo, Kigali City", licenseNumber: "DL-0065223", submittedAt: "Suspended 1 week ago", momoProvider: "Airtel Money", momoCode: "250788187504" } },
  { id: "d18", name: "Roland Karangwa", vehicle: "Moto Bike", plate: "RAA 489 R", status: "Online", acceptance: 90, rating: 4.8, lastActive: "Just now", kyc: { phone: "+250 788 670 219", dob: "12 Mar 1997", age: 28, location: "Remera, Gasabo, Kigali City", licenseNumber: "DL-0069880", submittedAt: "Approved 3 months ago", momoProvider: "MTN MoMo", momoCode: "250788670219" } },
  { id: "d19", name: "Sarah Uwimana", vehicle: "Cab Taxi", plate: "RAB 056 S", status: "Offline", acceptance: 85, rating: 4.6, lastActive: "1d", kyc: { phone: "+250 788 091 553", dob: "19 Jun 1991", age: 34, location: "Gikondo, Kicukiro, Kigali City", licenseNumber: "DL-0073104", submittedAt: "Approved 7 months ago", momoProvider: "MTN MoMo", momoCode: "250788091553" } },
  { id: "d20", name: "Thierry Nkurunziza", vehicle: "Heavy Fuso", plate: "RAD 819 T", status: "On trip", acceptance: 77, rating: 4.5, lastActive: "4m", kyc: { phone: "+250 788 558 002", dob: "1 Sep 1986", age: 39, location: "Ndera, Gasabo, Kigali City", licenseNumber: "DL-0078445", submittedAt: "Approved 1 year ago", momoProvider: "Airtel Money", momoCode: "250788558002" } },
  { id: "d21", name: "Umuhoza Aline", vehicle: "Moto Bike", plate: "RAA 374 U", status: "Pending", acceptance: null, rating: null, lastActive: "Pending", kyc: { phone: "+250 788 567 102", dob: "23 Feb 2002", age: 23, location: "Remera, Gasabo, Kigali City", licenseNumber: "DL-9182736", submittedAt: "1d ago", momoProvider: "MTN MoMo", momoCode: "250788567102" } },
];

const statusStyles: Record<DriverStatus, string> = {
  Online: "bg-primary/15 text-primary",
  "On trip": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Offline: "bg-muted text-muted-foreground",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Suspended: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
};

type Tab = { id: "all" | DriverStatus; label: string };

const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Online", label: "Online" },
  { id: "On trip", label: "On trip" },
  { id: "Pending", label: "Pending" },
  { id: "Suspended", label: "Suspended" },
];

type SortKey = "name" | "acceptance" | "rating" | "lastActive";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 8;

type ViewMode = "grid" | "table";

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

function DriverCard({
  driver,
  primaryAction,
  menu,
}: {
  driver: Driver;
  primaryAction: React.ReactNode;
  menu: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={driver.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {driver.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {driver.vehicle}
            </p>
          </div>
        </div>
        {menu}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[driver.status]}`}
        >
          {driver.status}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {driver.plate}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div className="text-center">
          <p className="text-sm font-bold tracking-tight text-foreground">
            {driver.acceptance === null ? "—" : `${driver.acceptance}%`}
          </p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Accept
          </p>
        </div>
        <div className="border-x border-border text-center">
          <p className="text-sm font-bold tracking-tight text-foreground">
            {driver.rating === null ? (
              "—"
            ) : (
              <>
                {driver.rating.toFixed(1)}{" "}
                <span className="text-amber-500">★</span>
              </>
            )}
          </p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rating
          </p>
        </div>
        <div className="text-center">
          <p className="truncate text-sm font-bold tracking-tight text-foreground">
            {driver.lastActive}
          </p>
          <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Active
          </p>
        </div>
      </div>

      <div className="mt-3">{primaryAction}</div>
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
  onVerify,
  onView,
  onMessage,
  onForceOffline,
  onSuspend,
  onReinstate,
}: {
  status: DriverStatus;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onVerify?: () => void;
  onView?: () => void;
  onMessage?: () => void;
  onForceOffline?: () => void;
  onSuspend?: () => void;
  onReinstate?: () => void;
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

  type Action = { label: string; tone?: "danger"; onClick?: () => void };
  const actions: Action[] = [
    { label: "View profile", onClick: onView },
    ...(status === "Pending"
      ? [{ label: "Verify documents", onClick: onVerify }]
      : []),
    { label: "Message driver", onClick: onMessage },
    ...(status === "Online" || status === "On trip"
      ? [{ label: "Force offline", onClick: onForceOffline }]
      : []),
    ...(status !== "Suspended"
      ? [{ label: "Suspend driver", tone: "danger" as const, onClick: onSuspend }]
      : [{ label: "Reinstate driver", onClick: onReinstate }]),
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
                    a.onClick?.();
                  }}
                  className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-surface ${
                    a.tone === "danger"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-foreground"
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

export function DriversTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleSlug = searchParams.get("vehicle");
  const vehicleFilter = vehicleSlug ? vehicleSlugMap[vehicleSlug] ?? null : null;

  const [tab, setTab] = useState<Tab["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    setPage(1);
  }, [vehicleSlug]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const updateStatus = (id: string, status: DriverStatus) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const verifyingDriver = verifyingId
    ? drivers.find((d) => d.id === verifyingId)
    : null;

  const scoped = vehicleFilter
    ? drivers.filter((d) => d.vehicle === vehicleFilter)
    : drivers;

  const counts: Record<Tab["id"], number> = {
    all: scoped.length,
    Online: scoped.filter((d) => d.status === "Online").length,
    "On trip": scoped.filter((d) => d.status === "On trip").length,
    Offline: scoped.filter((d) => d.status === "Offline").length,
    Pending: scoped.filter((d) => d.status === "Pending").length,
    Suspended: scoped.filter((d) => d.status === "Suspended").length,
  };

  const filtered = scoped.filter((d) => {
    if (tab !== "all" && d.status !== tab) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.plate.toLowerCase().includes(q) ||
        d.vehicle.toLowerCase().includes(q)
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
    } else if (sortKey === "acceptance") {
      va = a.acceptance ?? -1;
      vb = b.acceptance ?? -1;
    } else if (sortKey === "rating") {
      va = a.rating ?? -1;
      vb = b.rating ?? -1;
    } else {
      va = a.lastActive;
      vb = b.lastActive;
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

  const renderPrimaryAction = (d: Driver) => {
    if (d.status === "Pending" && d.kyc) {
      return (
        <button
          type="button"
          onClick={() => setVerifyingId(d.id)}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Verify
        </button>
      );
    }
    if (d.status === "Suspended") {
      return (
        <>
          <button
            type="button"
            onClick={() => setVerifyingId(d.id)}
            className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => {
              updateStatus(d.id, "Online");
              setToast(`${d.name} reinstated`);
            }}
            className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Reinstate
          </button>
        </>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setVerifyingId(d.id)}
        className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
      >
        View
      </button>
    );
  };

  const renderMenu = (d: Driver) => (
    <RowMenu
      status={d.status}
      open={openMenuId === d.id}
      onToggle={() => setOpenMenuId(openMenuId === d.id ? null : d.id)}
      onClose={() => setOpenMenuId(null)}
      onVerify={
        d.status === "Pending" && d.kyc
          ? () => setVerifyingId(d.id)
          : undefined
      }
      onView={() => setVerifyingId(d.id)}
      onMessage={() => setToast(`Message sent to ${d.name}`)}
      onForceOffline={() => {
        updateStatus(d.id, "Offline");
        setToast(`${d.name} forced offline`);
      }}
      onSuspend={() => {
        updateStatus(d.id, "Suspended");
        setToast(`${d.name} suspended`);
      }}
      onReinstate={() => {
        updateStatus(d.id, "Online");
        setToast(`${d.name} reinstated`);
      }}
    />
  );

  return (
    <Card
      title={
        vehicleSlug && vehicleSlugLabels[vehicleSlug]
          ? vehicleSlugLabels[vehicleSlug]
          : "All drivers"
      }
      action={
        <div className="flex items-center gap-2">
          {vehicleSlug && vehicleSlugLabels[vehicleSlug] ? (
            <button
              type="button"
              onClick={() => router.push("/admin/drivers")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              {vehicleSlugLabels[vehicleSlug]}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-3 w-3"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : null}
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <input
            type="search"
            placeholder="Search drivers, plates…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-8 w-56 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
          />
        </div>
      }
    >
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
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
                label="Driver"
                sortKey="name"
                currentKey={sortKey}
                dir={sortDir}
                onClick={() => toggleSort("name")}
              />
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicle
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Plate
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <SortHeader
                label="Acceptance"
                sortKey="acceptance"
                currentKey={sortKey}
                dir={sortDir}
                align="right"
                onClick={() => toggleSort("acceptance")}
              />
              <SortHeader
                label="Rating"
                sortKey="rating"
                currentKey={sortKey}
                dir={sortDir}
                align="right"
                onClick={() => toggleSort("rating")}
              />
              <SortHeader
                label="Last active"
                sortKey="lastActive"
                currentKey={sortKey}
                dir={sortDir}
                align="right"
                onClick={() => toggleSort("lastActive")}
              />
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
                  No drivers match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((d) => (
                <tr key={d.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} />
                      <span className="font-semibold tracking-tight text-foreground">
                        {d.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.vehicle}</td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {d.plate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[d.status]}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {d.acceptance === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      `${d.acceptance}%`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {d.rating === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span>
                        {d.rating.toFixed(1)}{" "}
                        <span className="text-amber-500">★</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {d.lastActive}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {renderPrimaryAction(d)}
                      {renderMenu(d)}
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
              No drivers match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((d) => (
                <DriverCard
                  key={d.id}
                  driver={d}
                  primaryAction={
                    <div className="flex items-center gap-1.5">
                      {renderPrimaryAction(d)}
                    </div>
                  }
                  menu={renderMenu(d)}
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
          drivers
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

      <VerifyDriverModal
        driver={
          verifyingDriver && verifyingDriver.kyc
            ? {
                id: verifyingDriver.id,
                name: verifyingDriver.name,
                vehicle: verifyingDriver.vehicle,
                plate: verifyingDriver.plate,
                kyc: verifyingDriver.kyc,
              }
            : null
        }
        mode={verifyingDriver?.status === "Pending" ? "verify" : "view"}
        onClose={() => setVerifyingId(null)}
        onApprove={(id) => {
          updateStatus(id, "Online");
          setToast(`${verifyingDriver?.name} approved`);
          setVerifyingId(null);
        }}
        onReject={(id) => {
          updateStatus(id, "Suspended");
          setToast(`${verifyingDriver?.name} rejected`);
          setVerifyingId(null);
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
