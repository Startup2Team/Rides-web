"use client";

import { useEffect, useState } from "react";

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

const STORAGE_KEY = "rides_admin_packages";

const VEHICLE_TYPES = [
  { code: "MOTO_BIKE", name: "Moto" },
  { code: "CAB_TAXI", name: "Cab" },
  { code: "HEAVY_FUSO", name: "Heavy Fuso" },
  { code: "LIGHT_HILUX", name: "Light Hilux" },
  { code: "TUK_TUK", name: "Tuk Tuk" },
];

type Package = {
  id: string;
  name: string;
  vehicle_type_code: string;
  ride_count: number;
  bonus_rides: number;
  validity_days: number;
  price_rwf: number;
  is_promotional: boolean;
  is_active: boolean;
  created_at: string;
  subscribers: number;
};

function load(): Package[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(pkgs: Package[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pkgs));
}

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

  useEffect(() => {
    setPackages(load());
    setReady(true);
  }, []);

  const persist = (updated: Package[]) => {
    setPackages(updated);
    save(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const pkg: Package = {
      id: crypto.randomUUID(),
      name: form.name,
      vehicle_type_code: form.vehicleTypeCode,
      ride_count: Number(form.rideCount) || 1,
      bonus_rides: Number(form.bonusRides) || 0,
      validity_days: Number(form.validityDays) || 30,
      price_rwf: Number(form.priceRWF) || 0,
      is_promotional: form.isPromotional,
      is_active: true,
      created_at: new Date().toISOString(),
      subscribers: 0,
    };
    persist([...packages, pkg]);
    setForm(BLANK_FORM);
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    persist(
      packages.map((p) =>
        p.id === selected.id
          ? {
              ...p,
              name: editForm.name,
              ride_count: Number(editForm.rideCount) || 1,
              bonus_rides: Number(editForm.bonusRides) || 0,
              validity_days: Number(editForm.validityDays) || 30,
              price_rwf: Number(editForm.priceRWF) || 0,
            }
          : p,
      ),
    );
    setEditOpen(false);
    setSelected(null);
  };

  const handleToggle = (id: string) => {
    persist(packages.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)));
  };

  const handleDelete = () => {
    if (!selected) return;
    persist(packages.filter((p) => p.id !== selected.id));
    setDeleteOpen(false);
    setSelected(null);
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
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => {
              const vehicleName = VEHICLE_TYPES.find((v) => v.code === pkg.vehicle_type_code)?.name ?? pkg.vehicle_type_code;
              return (
                <div key={pkg.id} className="group relative flex flex-col rounded-2xl border border-border bg-background p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{pkg.name}</p>
                      <span className="mt-1 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {vehicleName}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {pkg.is_promotional && (
                        <span className="rounded-md bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">Trial</span>
                      )}
                      <button
                        onClick={() => handleToggle(pkg.id)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                          pkg.is_active
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {pkg.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                    {fmt(pkg.price_rwf)}
                  </p>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/30">
                    <div className="flex flex-col items-center py-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground">Rides</span>
                      <span className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{pkg.ride_count}</span>
                    </div>
                    <div className="flex flex-col items-center py-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground">Bonus</span>
                      <span className="mt-0.5 text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-500">
                        {pkg.bonus_rides > 0 ? `+${pkg.bonus_rides}` : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center py-2.5">
                      <span className="text-[11px] font-medium text-muted-foreground">Total</span>
                      <span className="mt-0.5 text-sm font-bold tabular-nums text-foreground">{pkg.ride_count + pkg.bonus_rides}</span>
                    </div>
                  </div>

                  {/* Validity + subscribers */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/30 px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      Expires after <span className="font-semibold text-foreground">{pkg.validity_days} days</span>
                    </div>
                    <button
                      onClick={() => setSubDrawerPkg(pkg)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="font-semibold text-foreground">{pkg.subscribers}</span> subscribers
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 border-t border-border pt-4">
                    <button
                      onClick={() => openEdit(pkg)}
                      className="w-full rounded-lg border border-border py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Edit
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Create Ride Package</h3>
            <p className="mt-1 text-sm text-muted-foreground">Define a new prepaid credit pack for drivers.</p>

            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Package Name</label>
                <input
                  type="text" required placeholder="e.g. Starter Pack"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Vehicle Type</label>
                  <select value={form.vehicleTypeCode} onChange={(e) => setForm({ ...form, vehicleTypeCode: e.target.value })} className={inputCls}>
                    {VEHICLE_TYPES.map((vt) => <option key={vt.code} value={vt.code}>{vt.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Price (RWF)</label>
                  <input type="number" min="0" required value={form.priceRWF} onChange={(e) => setForm({ ...form, priceRWF: num(e) })} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Ride Count</label>
                  <input type="number" min="1" required value={form.rideCount} onChange={(e) => setForm({ ...form, rideCount: num(e) })} className={inputCls + " font-mono"} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Bonus Rides</label>
                  <input type="number" min="0" required value={form.bonusRides} onChange={(e) => setForm({ ...form, bonusRides: num(e) })} className={inputCls + " font-mono"} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Validity (Days)</label>
                  <input type="number" min="1" required value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: num(e) })} className={inputCls} />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input type="checkbox" checked={form.isPromotional} onChange={(e) => setForm({ ...form, isPromotional: e.target.checked })} className="h-4 w-4 rounded border-border text-primary" />
                <span className="text-sm font-medium text-foreground">Mark as Free Trial</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => { setCreateOpen(false); setForm(BLANK_FORM); }} className="h-10 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Edit Package</h3>
            <p className="mt-1 text-sm text-muted-foreground">{selected.name}</p>

            <form onSubmit={handleEdit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>Package Name</label>
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Vehicle Type</label>
                  <input disabled value={VEHICLE_TYPES.find((v) => v.code === selected.vehicle_type_code)?.name ?? selected.vehicle_type_code} className={inputCls + " cursor-not-allowed opacity-50"} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Price (RWF)</label>
                  <input type="number" min="0" required value={editForm.priceRWF} onChange={(e) => setEditForm({ ...editForm, priceRWF: num(e) })} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Ride Count</label>
                  <input type="number" min="1" required value={editForm.rideCount} onChange={(e) => setEditForm({ ...editForm, rideCount: num(e) })} className={inputCls + " font-mono"} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Bonus Rides</label>
                  <input type="number" min="0" required value={editForm.bonusRides} onChange={(e) => setEditForm({ ...editForm, bonusRides: num(e) })} className={inputCls + " font-mono"} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>Validity (Days)</label>
                  <input type="number" min="1" required value={editForm.validityDays} onChange={(e) => setEditForm({ ...editForm, validityDays: num(e) })} className={inputCls} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button type="button" onClick={() => { setEditOpen(false); setSelected(null); }} className="h-10 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90">Save Changes</button>
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
