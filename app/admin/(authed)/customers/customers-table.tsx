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
  getCustomer,
  suspendCustomer,
  reinstateCustomer,
  type Customer as ApiCustomer,
  type CustomerDetail,
  type CustomerTrip as ApiTrip,
} from "@/lib/api";
import type { CustomerTrip } from "./customer-modal";

function mapApiCustomer(c: ApiCustomer): Customer {
  return {
    id: c.id,
    name: c.full_name ?? c.phone,
    email: c.email ?? "",
    phone: c.phone,
    location: "",
    joined: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    trips: c.total_rides,
    spend: c.total_spend ?? 0,
    avgFare: c.total_rides > 0 ? Math.round((c.total_spend ?? 0) / c.total_rides) : 0,
    lastTrip: c.last_seen_at
      ? new Date(c.last_seen_at).toLocaleDateString()
      : "—",
    rating: c.rating ?? 0,
    preferredVehicle: "",
    status: mapCustomerStatus(c.is_suspended),
    recentTrips: [],
    notes: c.notes,
  };
}

function mapApiTrip(t: ApiTrip): CustomerTrip {
  return {
    id: t.id,
    date: new Date(t.created_at).toLocaleDateString(),
    from: t.pickup_address,
    to: t.destination_address,
    vehicle: t.transport_type.replace(/_/g, " "),
    fare: t.agreed_fare ?? 0,
    status: t.status === "COMPLETED" ? "Completed" : "Cancelled",
  };
}

function mapCustomerStatus(isSuspended: boolean): CustomerStatus {
  if (isSuspended) return "Suspended";
  return "Active";
}

function mergeDetail(base: Customer, detail: CustomerDetail): Customer {
  return {
    ...base,
    email: detail.email ?? base.email,
    rating: detail.rating ?? base.rating,
    lastTrip: detail.last_seen_at
      ? new Date(detail.last_seen_at).toLocaleDateString()
      : base.lastTrip,
    recentTrips: (detail.recent_trips ?? []).map(mapApiTrip),
  };
}

type Customer = CustomerProfile;

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

// The backend only distinguishes Active vs Suspended (mapCustomerStatus), so the
// customer list is filtered to those states plus All. VIP/Dormant/Flagged were
// never populated by the API and are intentionally omitted.
const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
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

  const openProfile = (id: string) => {
    setViewingId(id);
    getCustomer(id)
      .then((detail) => {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? mergeDetail(c, detail) : c))
        );
      })
      .catch(() => null);
  };

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
      onView={() => openProfile(c.id)}
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
                          onClick={() => openProfile(c.id)}
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
                  onView={() => openProfile(c.id)}
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
