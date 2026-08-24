"use client";

import { useEffect, useState } from "react";
import { StatCard, StatusPill } from "../_components";
import { getWaitlist, type WaitlistSignup } from "@/lib/api";

const LIMIT = 20;

// Local map, matching the convention every other admin console (rides,
// negotiations, live-rides…) uses instead of sharing one module-level table.
const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike",
  CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO: "Heavy Fuso",
  TUK_TUK: "Rifani",
};

function toVehicleLabel(code: string): string {
  return TRANSPORT_DISPLAY[code] ?? code;
}

const ROLE_FILTERS: { id: string; label: string }[] = [
  { id: "", label: "All roles" },
  { id: "CUSTOMER", label: "Customers" },
  { id: "DRIVER", label: "Drivers" },
];

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type Summary = { customers: number; drivers: number } | null;

export function WaitlistTable() {
  const [signups, setSignups] = useState<WaitlistSignup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);

  // Top-of-page customers-vs-drivers split — two cheap `limit=1` calls read
  // just the `total` count per role, not the actual rows.
  const [summary, setSummary] = useState<Summary>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getWaitlist({ limit: "1", offset: "0", role: "CUSTOMER" }),
      getWaitlist({ limit: "1", offset: "0", role: "DRIVER" }),
    ])
      .then(([customerRes, driverRes]) => {
        if (cancelled) return;
        setSummary({ customers: customerRes.total, drivers: driverRes.total });
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {
      limit: String(LIMIT),
      offset: String((page - 1) * LIMIT),
    };
    if (roleFilter) params.role = roleFilter;
    if (areaFilter) params.area = areaFilter;

    getWaitlist(params)
      .then((data) => {
        if (cancelled) return;
        setSignups(data.signups ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load waitlist signups");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, roleFilter, areaFilter]);

  const handleAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAreaFilter(areaInput.trim());
  };

  const handleReset = () => {
    setAreaInput("");
    setAreaFilter("");
    setRoleFilter("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-6">
      {/* Customers vs drivers split — helps size the two sides ahead of launch. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Customers waitlisted"
          value={summary ? summary.customers.toLocaleString() : "—"}
        />
        <StatCard
          label="Drivers waitlisted"
          value={summary ? summary.drivers.toLocaleString() : "—"}
        />
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleAreaSubmit}
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="waitlist-role"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Role
          </label>
          <select
            id="waitlist-role"
            value={roleFilter}
            onChange={(e) => {
              setPage(1);
              setRoleFilter(e.target.value);
            }}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.id || "all"} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label
            htmlFor="waitlist-area"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Area
          </label>
          <input
            id="waitlist-area"
            type="search"
            placeholder="Filter by area…"
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Waitlist Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading waitlist signups...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">{error}</div>
        ) : signups.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No waitlist signups found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Signed up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {signups.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {s.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill
                        status={s.role === "CUSTOMER" ? "Customer" : "Driver"}
                        tone={s.role === "CUSTOMER" ? "info" : "success"}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                      {s.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {s.email || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-foreground">
                      {s.area || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-foreground">
                      {s.role === "DRIVER"
                        ? s.vehicle_type
                          ? toVehicleLabel(s.vehicle_type)
                          : "—"
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono text-muted-foreground">
                      {formatCreatedAt(s.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {(page - 1) * LIMIT + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * LIMIT, total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{total}</span>{" "}
            signups
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted/30 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="inline-flex items-center text-xs font-semibold text-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted/30 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <p className="px-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{total.toLocaleString()}</span>{" "}
          total signups on the waitlist.
        </p>
      )}
    </div>
  );
}
