"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminPackages,
  createPackage,
  updatePackage,
  togglePackage,
  deletePackage,
  type Package as ApiPackage,
} from "@/lib/api";
import { Card } from "../_components";

// ── Subscriber types (swap mock for real API later) ───────────────────────────
type Subscriber = {
  id: string;
  name: string;
  phone: string;
  purchased_at: string;
  expires_at: string;
  rides_remaining: number;
  rides_total: number;
};

const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: "1", name: "Jean Baptiste", phone: "+250 788 123 456", purchased_at: "2026-06-01", expires_at: "2026-07-01", rides_remaining: 7, rides_total: 10 },
  { id: "2", name: "Amina Uwase", phone: "+250 722 654 321", purchased_at: "2026-06-05", expires_at: "2026-07-05", rides_remaining: 3, rides_total: 10 },
  { id: "3", name: "Patrick Nkurunziza", phone: "+250 733 987 654", purchased_at: "2026-06-10", expires_at: "2026-07-10", rides_remaining: 10, rides_total: 10 },
  { id: "4", name: "Claudine Mukamana", phone: "+250 788 555 777", purchased_at: "2026-06-15", expires_at: "2026-07-15", rides_remaining: 0, rides_total: 10 },
];

const VEHICLE_TYPES = [
  { code: "MOTO_BIKE", name: "Moto" },
  { code: "CAB_TAXI", name: "Cab" },
  { code: "HEAVY_FUSO", name: "Heavy Fuso" },
  { code: "LIGHT_HILUX", name: "Light Hilux" },
  { code: "TUK_TUK", name: "Tuk Tuk" },
];

// The backend Package shape plus a client-only subscriber count. The count is
// not yet served by the API (see the drawer note), so it stays 0 for now.
type Package = ApiPackage & { subscribers: number };

const BLANK_FORM = {
  name: "",
  vehicleTypeCode: VEHICLE_TYPES[0].code,
  rideCount: 10 as number | "",
  bonusRides: 0 as number | "",
  validityDays: 30 as number | "",
  priceRWF: 1000 as number | "",
  isPromotional: false,
};

export function PackagesConsole() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Package | null>(null);

  // Subscribers drawer
  const [subDrawerPkg, setSubDrawerPkg] = useState<Package | null>(null);

  // Create form
  const [form, setForm] = useState(BLANK_FORM);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    rideCount: 10 as number | "",
    bonusRides: 0 as number | "",
    validityDays: 30 as number | "",
    priceRWF: 1000 as number | "",
  });

  const refresh = useCallback(async () => {
    try {
      const list = await getAdminPackages();
      setPackages(list.map((p) => ({ ...p, subscribers: 0 })));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load packages");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!pkg.name.toLowerCase().includes(q)) return false;
      }

      // 2. Vehicle Filter
      if (vehicleFilter !== "all" && pkg.vehicle_type_code !== vehicleFilter) {
        return false;
      }

      // 3. Status Filter
      if (statusFilter !== "all") {
        const isActive = statusFilter === "active";
        if (pkg.is_active !== isActive) return false;
      }

      return true;
    });
  }, [packages, searchQuery, vehicleFilter, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPackage({
        name: form.name,
        vehicle_type_code: form.vehicleTypeCode,
        ride_count: Number(form.rideCount) || 1,
        bonus_rides: Number(form.bonusRides) || 0,
        validity_days: Number(form.validityDays) || 30,
        price_rwf: Number(form.priceRWF) || 0,
        is_promotional: form.isPromotional,
      });
      setForm(BLANK_FORM);
      setCreateOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create package");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await updatePackage(selected.id, {
        name: editForm.name,
        ride_count: Number(editForm.rideCount) || 1,
        bonus_rides: Number(editForm.bonusRides) || 0,
        validity_days: Number(editForm.validityDays) || 30,
        price_rwf: Number(editForm.priceRWF) || 0,
      });
      setEditOpen(false);
      setSelected(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update package");
    }
  };

  const handleToggle = async (id: string) => {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return;
    try {
      await togglePackage(id, !pkg.is_active);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle package");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deletePackage(selected.id);
      setDeleteOpen(false);
      setSelected(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete package");
    }
  };

  const openEdit = (pkg: Package) => {
    setSelected(pkg);
    setEditForm({
      name: pkg.name,
      rideCount: pkg.ride_count,
      bonusRides: pkg.bonus_rides,
      validityDays: pkg.validity_days,
      priceRWF: pkg.price_rwf,
    });
    setEditOpen(true);
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n) + " RWF";
  const num = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    return isNaN(v) ? ("" as const) : v;
  };

  const inputCls = "w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none";
  const labelCls = "text-xs font-bold text-muted-foreground uppercase tracking-wider";

  if (!ready) return null;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Visual Analytics & KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI Card 1: Subscribers */}
        <Card bodyClass="p-5 flex flex-col justify-between h-[125px]">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Active Subscribers</span>
            <span className="text-2xl font-black text-foreground mt-1 block">1,420 Drivers</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            +8.4% increase this week
          </div>
        </Card>

        {/* KPI Card 2: Estimated Revenue */}
        <Card bodyClass="p-5 flex flex-col justify-between h-[125px] relative overflow-hidden">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Subscription Revenue</span>
            <span className="text-2xl font-black text-foreground mt-1 block">8,450,000 RWF</span>
          </div>
          {/* Micro sparkline */}
          <div className="absolute right-4 bottom-2 w-20 h-10 text-primary opacity-60">
            <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0 35 L 20 28 L 40 32 L 60 15 L 80 18 L 100 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">MTN MoMo & Airtel Money</span>
        </Card>

        {/* KPI Card 3: Vehicle Share */}
        <Card bodyClass="p-5 flex flex-col justify-between h-[125px]">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Subscriber Share</span>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
              <div className="h-full bg-sky-500" style={{ width: "48%" }} title="Moto: 48%" />
              <div className="h-full bg-emerald-500" style={{ width: "32%" }} title="Cab: 32%" />
              <div className="h-full bg-amber-500" style={{ width: "15%" }} title="Hilux: 15%" />
              <div className="h-full bg-purple-500" style={{ width: "5%" }} title="Fuso: 5%" />
            </div>
          </div>
          <div className="flex gap-2 text-[9px] font-bold text-muted-foreground uppercase">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" />Moto (48%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Cab (32%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Hilux (15%)</span>
          </div>
        </Card>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {packages.length} {packages.length === 1 ? "package" : "packages"} configured
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Package
        </button>
      </div>

      {/* Search & Filter Suite */}
      {packages.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
          <div className="relative flex-1 max-w-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search packages by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-border bg-background text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="pl-3.5 pr-8 h-10 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Vehicles</option>
                {VEHICLE_TYPES.map((v) => (
                  <option key={v.code} value={v.code}>{v.name}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3.5 pr-8 h-10 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {(searchQuery || vehicleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setVehicleFilter("all");
                  setStatusFilter("all");
                }}
                className="h-10 px-3.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl border border-dashed border-border transition-all flex items-center gap-1.5"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {packages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground" aria-hidden>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">No packages yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">Create your first ride credit package to get started.</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Create Package
            </button>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-muted-foreground" aria-hidden>
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">No matching packages found</p>
            <p className="max-w-xs text-xs text-muted-foreground">Adjust or clear your filters to find configured packages.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setVehicleFilter("all");
                setStatusFilter("all");
              }}
              className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPackages.map((pkg) => {
              const vehicleName = VEHICLE_TYPES.find((v) => v.code === pkg.vehicle_type_code)?.name ?? pkg.vehicle_type_code;
              
              const vehicleColors: Record<string, string> = {
                MOTO_BIKE: "bg-sky-50 text-sky-700 border border-sky-100/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30",
                CAB_TAXI: "bg-emerald-50 text-emerald-700 border border-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
                HEAVY_FUSO: "bg-purple-50 text-purple-700 border border-purple-100/60 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
                LIGHT_HILUX: "bg-amber-50 text-amber-700 border border-amber-100/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
              };
              const vColor = vehicleColors[pkg.vehicle_type_code] ?? "bg-muted text-muted-foreground border border-border";

              return (
                <div
                  key={pkg.id}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Title & Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground" title={pkg.name}>{pkg.name}</p>
                      <span className={`mt-1 inline-flex items-center rounded-lg px-1.5 py-0.5 text-[9px] font-bold ${vColor}`}>
                        {vehicleName}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggle(pkg.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors shrink-0 ${
                        pkg.is_active
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-200/40 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${pkg.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                      {pkg.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {/* Price & Validity */}
                  <div className="mt-3.5 flex items-baseline justify-between border-t border-border/40 pt-3">
                    <span className="text-base font-black text-foreground">{fmt(pkg.price_rwf)}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Valid {pkg.validity_days} days</span>
                  </div>

                  {/* Credits & Subscribers Summary */}
                  <div className="mt-3 flex items-center justify-between text-xs border-t border-border/40 pt-3">
                    <div className="flex items-center gap-1 font-semibold text-foreground text-[11px]">
                      <span>{pkg.ride_count} rides</span>
                      {pkg.bonus_rides > 0 && <span className="text-emerald-600">+{pkg.bonus_rides} bonus</span>}
                    </div>
                    
                    <button
                      onClick={() => setSubDrawerPkg(pkg)}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-bold flex items-center gap-1 shrink-0"
                    >
                      <span>{pkg.subscribers} subs</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 border-t border-border/40 pt-3 flex gap-2">
                    <button
                      onClick={() => openEdit(pkg)}
                      className="flex-1 rounded-lg border border-border py-1 text-[10px] font-bold text-foreground hover:bg-muted transition-colors"
                    >
                      Edit Package
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(pkg);
                        setDeleteOpen(true);
                      }}
                      title="Delete Package"
                      className="px-2 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center shrink-0"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setCreateOpen(false); setForm(BLANK_FORM); }} className="fixed inset-0 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out" />
          
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">Create Ride Package</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Prepaid credit packs config for drivers</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setCreateOpen(false); setForm(BLANK_FORM); }}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
              <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Package Definition</span>
                
                <div className="space-y-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Package Name</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Starter Pack"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="block w-full min-h-[42px] rounded-xl border border-border bg-card px-3.5 py-2 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">Vehicle Type</span>
                      <div className="relative">
                        <select
                          value={form.vehicleTypeCode}
                          onChange={(e) => setForm({ ...form, vehicleTypeCode: e.target.value })}
                          className="block w-full min-h-[42px] rounded-xl border border-border bg-card pl-3.5 pr-10 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          {VEHICLE_TYPES.map((vt) => (
                            <option key={vt.code} value={vt.code}>{vt.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">Price (RWF)</span>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs text-muted-foreground font-semibold">RWF</span>
                        <input
                          type="number"
                          min="0"
                          required
                          value={form.priceRWF}
                          onChange={(e) => setForm({ ...form, priceRWF: num(e) })}
                          className="pl-12 block h-11 w-full rounded-xl border border-border bg-card pr-3 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Credits & Validity</span>
                
                <div className="grid grid-cols-3 gap-3.5">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Ride Count</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.rideCount}
                      onChange={(e) => setForm({ ...form, rideCount: num(e) })}
                      className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Bonus Rides</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.bonusRides}
                      onChange={(e) => setForm({ ...form, bonusRides: num(e) })}
                      className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Validity Days</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={form.validityDays}
                      onChange={(e) => setForm({ ...form, validityDays: num(e) })}
                      className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <label className="relative flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isPromotional}
                    onChange={(e) => setForm({ ...form, isPromotional: e.target.checked })}
                    className="h-4.5 w-4.5 rounded-lg border-border bg-card text-primary focus:ring-primary focus:ring-offset-background"
                  />
                  <span className="text-xs font-semibold text-foreground">Mark this package as a Free Trial</span>
                </label>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-border pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setCreateOpen(false); setForm(BLANK_FORM); }}
                  className="h-10 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  Create Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setEditOpen(false); setSelected(null); }} className="fixed inset-0 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out" />
          
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ease-out flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">Edit Ride Package</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Modify parameters for "{selected.name}"</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setEditOpen(false); setSelected(null); }}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleEdit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm">
              <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Package Definition</span>
                
                <div className="space-y-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Package Name</span>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="block w-full min-h-[42px] rounded-xl border border-border bg-card px-3.5 py-2 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">Vehicle Type</span>
                      <input
                        disabled
                        value={VEHICLE_TYPES.find((v) => v.code === selected.vehicle_type_code)?.name ?? selected.vehicle_type_code}
                        className="block w-full min-h-[42px] rounded-xl border border-border bg-muted/30 px-3.5 text-foreground cursor-not-allowed opacity-60 font-semibold"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">Price (RWF)</span>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs text-muted-foreground font-semibold">RWF</span>
                        <input
                          type="number"
                          min="0"
                          required
                          value={editForm.priceRWF}
                          onChange={(e) => setEditForm({ ...editForm, priceRWF: num(e) })}
                          className="pl-12 block h-11 w-full rounded-xl border border-border bg-card pr-3 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Credits & Validity</span>
                
                <div className="grid grid-cols-3 gap-3.5">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Ride Count</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.rideCount}
                      onChange={(e) => setEditForm({ ...editForm, rideCount: num(e) })}
                      className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Bonus Rides</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.bonusRides}
                      onChange={(e) => setEditForm({ ...editForm, bonusRides: num(e) })}
                      className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Validity Days</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editForm.validityDays}
                      onChange={(e) => setEditForm({ ...editForm, validityDays: num(e) })}
                      className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-border pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setEditOpen(false); setSelected(null); }}
                  className="h-10 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Subscribers Drawer ── */}
      {subDrawerPkg && (() => {
        const active   = MOCK_SUBSCRIBERS.filter(s => new Date(s.expires_at) >= new Date() && s.rides_remaining > 0);
        const expired  = MOCK_SUBSCRIBERS.filter(s => new Date(s.expires_at) < new Date());
        const usedUp   = MOCK_SUBSCRIBERS.filter(s => s.rides_remaining === 0 && new Date(s.expires_at) >= new Date());
        const avatarColors = ["bg-violet-500","bg-sky-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-indigo-500"];
        return (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => setSubDrawerPkg(null)} />
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-background">

              {/* Header */}
              <div className="px-6 pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Package subscribers</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{subDrawerPkg.name}</h2>
                  </div>
                  <button onClick={() => setSubDrawerPkg(null)} className="mt-0.5 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Summary stats */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Active", value: active.length, color: "text-emerald-600" },
                    { label: "Expired", value: expired.length, color: "text-muted-foreground" },
                    { label: "Used up", value: usedUp.length, color: "text-amber-600" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-center">
                      <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-6 h-px bg-border" />

              {/* List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {MOCK_SUBSCRIBERS.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-24 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-muted-foreground/50" aria-hidden>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">No subscribers yet</p>
                    <p className="text-xs text-muted-foreground">Drivers who purchase this package will appear here.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {MOCK_SUBSCRIBERS.map((sub, i) => {
                      const pct = Math.round((sub.rides_remaining / sub.rides_total) * 100);
                      const isExpired  = new Date(sub.expires_at) < new Date();
                      const isExhausted = sub.rides_remaining === 0;
                      const statusLabel = isExpired ? "Expired" : isExhausted ? "Used up" : "Active";
                      const statusCls   = isExpired || isExhausted
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                      const barCls = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-400" : "bg-rose-500";
                      const avatarCls = avatarColors[i % avatarColors.length];

                      return (
                        <li key={sub.id} className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30">
                          {/* Avatar */}
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarCls}`}>
                            {sub.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{sub.name}</p>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCls}`}>{statusLabel}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">{sub.phone}</p>

                            {/* Progress */}
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                                <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                                {sub.rides_remaining}/{sub.rides_total} rides
                              </span>
                            </div>

                            {/* Expiry */}
                            <p className="mt-1.5 text-[11px] text-muted-foreground">
                              Expires <span className={isExpired ? "font-semibold text-rose-500" : "text-muted-foreground"}>{sub.expires_at}</span>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-muted/20 px-6 py-3">
                <p className="text-[11px] text-muted-foreground">
                  Showing mock data · wire up <code className="rounded bg-muted px-1 font-mono text-[10px]">GET /admin/packages/:id/subscribers</code> for live results
                </p>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Delete Modal ── */}
      {deleteOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-destructive">Delete Package</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">"{selected.name}"</strong>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => { setDeleteOpen(false); setSelected(null); }} className="h-10 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">Cancel</button>
              <button onClick={handleDelete} className="h-10 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
