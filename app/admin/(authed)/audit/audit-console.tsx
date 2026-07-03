"use client";

import { useEffect, useState } from "react";
import { getAuditLogs, type AuditLogEntry } from "@/lib/api";

const LIMIT = 20;

export function AuditConsole() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [actionInput, setActionInput] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(1);

  const fetchLogs = () => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * LIMIT;

    // Convert local date strings to ISO string dates if present
    let fromISO = "";
    if (fromFilter) {
      fromISO = new Date(fromFilter).toISOString();
    }
    let toISO = "";
    if (toFilter) {
      toISO = new Date(toFilter).toISOString();
    }

    getAuditLogs({
      action: actionFilter || undefined,
      from: fromISO || undefined,
      to: toISO || undefined,
      limit: LIMIT,
      offset,
    })
      .then((data) => {
        setEntries(data.entries ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        setError(err.message || "Failed to load audit logs");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, fromFilter, toFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActionFilter(actionInput);
  };

  const handleReset = () => {
    setActionInput("");
    setActionFilter("");
    setFromFilter("");
    setToFilter("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);

  const fmtTimestamp = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label htmlFor="action" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Action Type
          </label>
          <input
            id="action"
            type="text"
            placeholder="e.g. package.create"
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="from" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            From Date
          </label>
          <input
            id="from"
            type="date"
            value={fromFilter}
            onChange={(e) => {
              setPage(1);
              setFromFilter(e.target.value);
            }}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="to" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            To Date
          </label>
          <input
            id="to"
            type="date"
            value={toFilter}
            onChange={(e) => {
              setPage(1);
              setToFilter(e.target.value);
            }}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading audit logs...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            No audit log entries found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor (Admin)</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground font-mono">
                      {fmtTimestamp(entry.occurred_at)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {entry.admin_name || <span className="text-muted-foreground">System</span>}
                      {entry.admin_id && (
                        <span className="block text-[10px] text-muted-foreground font-mono">
                          ID: {entry.admin_id.substring(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {entry.admin_role ? (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {entry.admin_role}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">
                      {entry.action}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {entry.target_type ? (
                        <div>
                          <span className="font-semibold text-foreground uppercase tracking-wide text-[10px]">
                            {entry.target_type}
                          </span>
                          {entry.target_id && (
                            <span className="block font-mono text-muted-foreground mt-0.5">
                              ID: {entry.target_id.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-foreground max-w-xs break-words">
                      {entry.detail || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground font-mono">
                      {entry.ip || "—"}
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
            Showing <span className="font-semibold text-foreground">{(page - 1) * LIMIT + 1}</span> to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(page * LIMIT, total)}
            </span>{" "}
            of <span className="font-semibold text-foreground">{total}</span> entries
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
