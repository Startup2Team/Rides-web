"use client";

import { useMemo, useState } from "react";
import { Card, StatCard, StatusPill, Avatar } from "../_components";
import {
  MOCK_PACKAGES,
  MOCK_PURCHASES,
  VEHICLE_LABELS,
  VEHICLE_ORDER,
  formatDateTime,
  formatRWF,
  type PurchaseSnapshot,
  type PurchaseStatus,
  type VehicleType,
} from "@/lib/packages-mock";

const STATUS_TONE: Record<PurchaseStatus, "success" | "warn" | "danger" | "neutral"> = {
  paid: "success",
  pending: "warn",
  failed: "danger",
  cancelled: "neutral",
  expired: "neutral",
};

type StatusFilter = "all" | PurchaseStatus;
type VehicleFilter = "all" | VehicleType;
type PackageFilter = "all" | string;

export function PurchasesConsole() {
  const [purchases] = useState<PurchaseSnapshot[]>(MOCK_PURCHASES);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [vehicle, setVehicle] = useState<VehicleFilter>("all");
  const [pkgFilter, setPkgFilter] = useState<PackageFilter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (vehicle !== "all" && p.vehicleType !== vehicle) return false;
      if (pkgFilter !== "all" && p.packageId !== pkgFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const haystack = [
          p.driverName,
          p.driverPhone,
          p.vehiclePlate,
          p.packageName,
          p.campaignName ?? "",
          p.paymentReference ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [purchases, status, vehicle, pkgFilter, query]);

  /* Stats */
  const totalPaid = purchases.filter((p) => p.status === "paid");
  const revenue = totalPaid.reduce((s, p) => s + p.pricePaid, 0);
  const pendingCount = purchases.filter((p) => p.status === "pending").length;
  const failedCount = purchases.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatRWF(revenue)} tone="primary" />
        <StatCard label="Paid purchases" value={String(totalPaid.length)} />
        <StatCard label="Pending" value={String(pendingCount)} tone="alert" />
        <StatCard label="Failed" value={String(failedCount)} />
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-3 border-b border-border px-4 py-3">
          {/* Search */}
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by driver, plate, package, campaign or payment ref…"
              className="block min-h-[44px] w-full rounded-xl border border-border bg-card px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary sm:text-sm"
            />
          </div>

          {/* Filter rows */}
          <div className="grid gap-3 sm:grid-cols-3">
            <FilterDropdown
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "paid", label: "Paid" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "cancelled", label: "Cancelled" },
                { value: "expired", label: "Expired" },
              ]}
            />
            <FilterDropdown
              label="Vehicle"
              value={vehicle}
              onChange={(v) => setVehicle(v as VehicleFilter)}
              options={[
                { value: "all", label: "All vehicles" },
                ...VEHICLE_ORDER.map((v) => ({ value: v, label: VEHICLE_LABELS[v] })),
              ]}
            />
            <FilterDropdown
              label="Package"
              value={pkgFilter}
              onChange={(v) => setPkgFilter(v as PackageFilter)}
              options={[
                { value: "all", label: "All packages" },
                ...MOCK_PACKAGES.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Package · Version</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Rides</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 whitespace-nowrap">When</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No purchases match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.driverName} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {p.driverName}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.driverPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {VEHICLE_LABELS[p.vehicleType]}
                        </span>
                        <span className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {p.vehiclePlate}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-foreground">{p.packageName}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        v{p.packageVersion}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.campaignName ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          {p.campaignName}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold tabular-nums text-foreground">
                      {formatRWF(p.pricePaid)}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-foreground">
                      {p.ridesGranted}
                      {p.bonusRidesGranted > 0 ? (
                        <span className="ml-1 text-emerald-600">
                          +{p.bonusRidesGranted}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {p.paymentProvider ? (
                        <>
                          <p className="font-medium text-foreground">
                            {p.paymentProvider === "mtn-momo" ? "MTN MoMo" : "Airtel Money"}
                          </p>
                          {p.paymentReference ? (
                            <p className="mt-0.5 font-mono text-[10px]">{p.paymentReference}</p>
                          ) : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={p.status.toUpperCase()} tone={STATUS_TONE[p.status]} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <p>
              {filtered.length} of {purchases.length} purchases
            </p>
            <p>Pagination will be wired with the real API.</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
