"use client";

import { useEffect, useState } from "react";
import { Avatar, StatusPill } from "../_components";
import { getRides, type Ride } from "@/lib/api";

const LIMIT = 20;

const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike",
  CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO: "Heavy Fuso",
  TUK_TUK: "Rifani",
};

function toVehicleLabel(code: string): string {
  // No silent default — an unmapped code is shown as-is rather than mislabelled.
  return TRANSPORT_DISPLAY[code] ?? code;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "IN_PROGRESS", label: "On trip" },
  { id: "NEGOTIATING", label: "Negotiating" },
  { id: "SEARCHING", label: "Searching" },
  { id: "", label: "All statuses" },
];

function statusTone(
  status: string,
): "success" | "warn" | "danger" | "neutral" | "info" {
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "IN_PROGRESS") return "info";
  if (status === "SEARCHING") return "neutral";
  return "warn";
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function formatRWF(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `${Math.round(n).toLocaleString("en-US")} RWF`;
}

function formatDuration(minutes: number | null | undefined) {
  if (minutes === null || minutes === undefined) return "—";
  const mins = Math.max(0, Math.round(minutes));
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatCompletedAt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Quick ranges, in minutes back from now.
 *
 * Whole-date inputs alone cannot express "the last 30 minutes" — the shortest
 * window they allow is a full day. These are relative to the moment of the
 * fetch, so "last hour" keeps meaning the last hour as the console sits open
 * and refetches, rather than an hour pinned to when the page loaded.
 */
const RANGE_PRESETS: { id: string; label: string; minutes: number | null }[] = [
  { id: "30m", label: "30 min", minutes: 30 },
  { id: "1h", label: "1 hour", minutes: 60 },
  { id: "6h", label: "6 hours", minutes: 6 * 60 },
  { id: "24h", label: "24 hours", minutes: 24 * 60 },
  { id: "7d", label: "7 days", minutes: 7 * 24 * 60 },
  { id: "30d", label: "30 days", minutes: 30 * 24 * 60 },
  // All time is the default: a console that opens empty because the window is
  // narrower than the data reads as broken.
  { id: "all", label: "All time", minutes: null },
  { id: "custom", label: "Custom", minutes: null },
];

/** Local calendar day → ISO instant, so the range is inclusive of both days. */
function startOfDayISO(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

function endOfDayISO(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export function RidesConsole() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states — COMPLETED is the default view the console was asked for.
  const [statusFilter, setStatusFilter] = useState("COMPLETED");
  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [rangePreset, setRangePreset] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {
      limit: String(LIMIT),
      offset: String((page - 1) * LIMIT),
    };
    if (statusFilter) params.status = statusFilter;
    if (searchFilter) params.search = searchFilter;

    const preset = RANGE_PRESETS.find((r) => r.id === rangePreset);
    if (rangePreset === "custom") {
      if (fromFilter) params.from = startOfDayISO(fromFilter);
      if (toFilter) params.to = endOfDayISO(toFilter);
    } else if (preset?.minutes != null) {
      // Relative to now, computed per fetch — no `to`, since the window always
      // runs up to the present moment.
      params.from = new Date(Date.now() - preset.minutes * 60_000).toISOString();
    }

    getRides(params)
      .then((data) => {
        if (cancelled) return;
        setRides(data.rides ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load rides");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, searchFilter, fromFilter, toFilter, rangePreset]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchFilter(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchFilter("");
    setFromFilter("");
    setToFilter("");
    setStatusFilter("COMPLETED");
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* Quick ranges — the common question is "what happened in the last N",
          which whole-date inputs cannot answer below a full day. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
          Period
        </span>
        {RANGE_PRESETS.map((r) => {
          const active = rangePreset === r.id;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setPage(1);
                setRangePreset(r.id);
              }}
              className={`h-9 rounded-xl border px-3.5 text-sm font-medium transition-all ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-5"
      >
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label
            htmlFor="ride-search"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Search
          </label>
          <input
            id="ride-search"
            type="search"
            placeholder="Customer or driver name / phone, or ride ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="ride-status"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            Status
          </label>
          <select
            id="ride-status"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.id || "all"} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {rangePreset === "custom" ? (
          <>
            <div className="space-y-1.5">
              <label
                htmlFor="ride-from"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                From Date
              </label>
              <input
                id="ride-from"
                type="date"
                value={fromFilter}
                max={toFilter || undefined}
                onChange={(e) => {
                  setPage(1);
                  setFromFilter(e.target.value);
                }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ride-to"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                To Date
              </label>
              <input
                id="ride-to"
                type="date"
                value={toFilter}
                min={fromFilter || undefined}
                onChange={(e) => {
                  setPage(1);
                  setToFilter(e.target.value);
                }}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </>
        ) : null}

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

      {/* Rides Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading rides...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">{error}</div>
        ) : rides.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No rides found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Ride</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3">Dropoff</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rides.map((ride) => {
                  const customerName =
                    ride.customer?.name ?? ride.customer?.phone ?? "Unknown";
                  const driverName = ride.driver?.name ?? null;
                  return (
                    <tr
                      key={ride.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="block font-mono text-[10px] text-muted-foreground">
                          {ride.id.substring(0, 8)}...
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1.5">
                          <StatusPill
                            status={statusLabel(ride.status)}
                            tone={statusTone(ride.status)}
                          />
                        </span>
                        <span className="mt-1 block text-[10px] text-muted-foreground">
                          {toVehicleLabel(ride.transport_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar name={customerName} tone="neutral" size="sm" />
                          <div className="min-w-0">
                            <span className="block font-medium text-foreground">
                              {customerName}
                            </span>
                            <span className="block text-[10px] font-mono text-muted-foreground">
                              {ride.customer?.phone ?? "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {driverName ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={driverName} size="sm" />
                            <div className="min-w-0">
                              <span className="block font-medium text-foreground">
                                {driverName}
                              </span>
                              <span className="block text-[10px] font-mono text-muted-foreground">
                                {ride.driver?.phone ?? "—"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-[14rem] break-words text-foreground">
                        {ride.pickup_address || "—"}
                      </td>
                      <td className="px-4 py-3.5 max-w-[14rem] break-words text-foreground">
                        {ride.destination_address || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="block text-foreground">
                          {formatDuration(ride.duration_minutes)}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {ride.distance_km !== null
                            ? `${ride.distance_km.toFixed(1)} km`
                            : "— km"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs font-mono text-muted-foreground">
                        {formatCompletedAt(ride.completed_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <span className="block font-semibold text-foreground">
                          {formatRWF(ride.agreed_fare)}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          asked {formatRWF(ride.initial_fare)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            rides
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
    </div>
  );
}
