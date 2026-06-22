"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Card } from "../_components";
import { VerifyDriverModal, type VerifyDriver } from "./verify-driver-modal";
import {
  getDrivers,
  getDriver,
  approveDriver,
  rejectDriver,
  suspendDriver,
  reinstateDriver,
  forceDriverOffline,
} from "@/lib/api";
import {
  mapApiDriver,
  mapDriverDetailToVerify,
  VEHICLE_SLUG_LABELS,
  vehicleTypeFromSlug,
  type DriverRow,
  type DriverStatus,
} from "@/lib/drivers";

type Driver = DriverRow;


const statusStyles: Record<DriverStatus, string> = {
  Online: "bg-primary/15 text-primary",
  "On trip": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Offline: "bg-muted text-muted-foreground",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Suspended: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  Rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
};

type Tab = { id: "all" | DriverStatus; label: string };

const tabs: Tab[] = [
  { id: "all", label: "All" },
  { id: "Online", label: "Online" },
  { id: "On trip", label: "On trip" },
  { id: "Pending", label: "Pending" },
  { id: "Suspended", label: "Suspended" },
  { id: "Rejected", label: "Rejected" },
];

type SortKey = "name" | "acceptance" | "rating" | "lastActive" | "applied";
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
  const vehicleType = vehicleTypeFromSlug(vehicleSlug);

  const [tab, setTab] = useState<Tab["id"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("applied");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyDriver, setVerifyDriver] = useState<VerifyDriver | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [totalFromApi, setTotalFromApi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [vehicleSlug, debouncedQuery]);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        limit: "500",
        offset: "0",
      };
      if (vehicleType) params.vehicle_type = vehicleType;
      if (debouncedQuery) params.search = debouncedQuery;

      const res = await getDrivers(params);
      setDrivers((res.drivers ?? []).map(mapApiDriver));
      setTotalFromApi(res.total ?? res.drivers?.length ?? 0);
    } catch (err) {
      setDrivers([]);
      setTotalFromApi(0);
      setError(err instanceof Error ? err.message : "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  }, [vehicleType, debouncedQuery]);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  useEffect(() => {
    if (!verifyingId) {
      setVerifyDriver(null);
      return;
    }
    const row = drivers.find((d) => d.id === verifyingId);
    let cancelled = false;
    setDetailLoading(true);
    getDriver(verifyingId)
      .then((detail) => {
        if (cancelled) return;
        setVerifyDriver(
          mapDriverDetailToVerify(detail, row ?? undefined),
        );
      })
      .catch(() => {
        if (cancelled) return;
        if (row) {
          setVerifyDriver({
            id: row.id,
            name: row.name,
            vehicle: row.vehicle,
            plate: row.plate,
            kyc: {
              phone: row.phone ?? "",
              dob: "—",
              age: 0,
              location: "—",
              licenseNumber: "—",
              submittedAt: row.lastActive,
              momoProvider: "MTN MoMo",
              momoCode: "",
            },
          });
        } else {
          setVerifyDriver(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [verifyingId, drivers]);

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

  const counts: Record<Tab["id"], number> = {
    all: drivers.length,
    Online: drivers.filter((d) => d.status === "Online").length,
    "On trip": drivers.filter((d) => d.status === "On trip").length,
    Offline: drivers.filter((d) => d.status === "Offline").length,
    Pending: drivers.filter((d) => d.status === "Pending").length,
    Suspended: drivers.filter((d) => d.status === "Suspended").length,
    Rejected: drivers.filter((d) => d.status === "Rejected").length,
  };

  const filtered = drivers.filter((d) => {
    if (tab !== "all" && d.status !== tab) return false;
    return true;
  });

  const statusOrder: Record<string, number> = {
    Pending: 0, Online: 1, "On trip": 2, Offline: 3, Suspended: 4,
  };

  const sorted = [...filtered].sort((a, b) => {
    // Always surface Pending first when sorting by applied date.
    if (sortKey === "applied") {
      const statusDiff = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      if (statusDiff !== 0) return statusDiff;
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortDir === "asc" ? ta - tb : tb - ta;
    }

    let va: string | number;
    let vb: string | number;
    if (sortKey === "name") {
      va = a.name; vb = b.name;
    } else if (sortKey === "acceptance") {
      va = a.acceptance ?? -1; vb = b.acceptance ?? -1;
    } else if (sortKey === "rating") {
      va = a.rating ?? -1; vb = b.rating ?? -1;
    } else {
      va = a.lastActive; vb = b.lastActive;
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
    if (d.status === "Suspended") {
      return (
        <div className="flex w-full items-center gap-1.5">
          <button
            type="button"
            onClick={() => setVerifyingId(d.id)}
            className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            View
          </button>
          <button
            type="button"
            onClick={async () => {
              try { await reinstateDriver(d.id); } catch { /* ignore */ }
              updateStatus(d.id, "Offline");
              setToast(`${d.name} reinstated`);
            }}
            className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Reinstate
          </button>
        </div>
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
        d.status === "Pending" ? () => setVerifyingId(d.id) : undefined
      }
      onView={() => setVerifyingId(d.id)}
      onMessage={() => setToast(`Message sent to ${d.name}`)}
      onForceOffline={async () => {
        try {
          await forceDriverOffline(d.id);
          updateStatus(d.id, "Offline");
          setToast(`${d.name} forced offline`);
        } catch (err) {
          setToast(
            err instanceof Error ? err.message : "Failed to force offline",
          );
        }
      }}
      onSuspend={async () => {
        try { await suspendDriver(d.id, 24); } catch { /* ignore */ }
        updateStatus(d.id, "Suspended");
        setToast(`${d.name} suspended`);
      }}
      onReinstate={async () => {
        try { await reinstateDriver(d.id); } catch { /* ignore */ }
        updateStatus(d.id, "Offline");
        setToast(`${d.name} reinstated`);
      }}
    />
  );

  return (
    <Card
      title={
        vehicleSlug && VEHICLE_SLUG_LABELS[vehicleSlug]
          ? VEHICLE_SLUG_LABELS[vehicleSlug]
          : "All drivers"
      }
      action={
        <div className="flex items-center gap-2">
          {vehicleSlug && VEHICLE_SLUG_LABELS[vehicleSlug] ? (
            <button
              type="button"
              onClick={() => router.push("/admin/drivers")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
            >
              {VEHICLE_SLUG_LABELS[vehicleSlug]}
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
      {error ? (
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void loadDrivers()}
            className="mt-2 text-xs font-semibold text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : null}

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
                label="Applied"
                sortKey="applied"
                currentKey={sortKey}
                dir={sortDir}
                align="right"
                onClick={() => toggleSort("applied")}
              />
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Loading drivers…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
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
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading drivers…</p>
          ) : paginated.length === 0 ? (
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
          <span className="font-semibold text-foreground">
            {debouncedQuery || tab !== "all" ? sorted.length : totalFromApi}
          </span>{" "}
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

      {detailLoading && verifyingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <p className="rounded-xl border border-border bg-card px-6 py-4 text-sm font-medium text-foreground shadow-xl">
            Loading driver profile…
          </p>
        </div>
      ) : null}

      <VerifyDriverModal
        driver={verifyDriver}
        mode={verifyingDriver?.status === "Pending" ? "verify" : "view"}
        onClose={() => setVerifyingId(null)}
        onApprove={async (id) => {
          try {
            await approveDriver(id);
            updateStatus(id, "Offline");
            setToast(`${verifyingDriver?.name ?? "Driver"} approved`);
            setVerifyingId(null);
            void loadDrivers();
          } catch (err) {
            setToast(
              err instanceof Error ? err.message : "Failed to approve driver",
            );
          }
        }}
        onReject={async (id, reason) => {
          try {
            await rejectDriver(id, reason);
            updateStatus(id, "Rejected");
            setToast(`${verifyingDriver?.name ?? "Driver"} rejected`);
            setVerifyingId(null);
            void loadDrivers();
          } catch (err) {
            setToast(
              err instanceof Error ? err.message : "Failed to reject driver",
            );
          }
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
