"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../_components";
import {
  IncidentModal,
  severityStyles,
  statusStyles,
  type Incident,
  type IncidentSeverity,
  type IncidentStatus,
  type IncidentType,
} from "./incident-modal";
import {
  getIncidents,
  getIncident,
  acknowledgeIncident,
  escalateIncident,
  resolveIncident,
  type Incident as ApiIncident,
} from "@/lib/api";

function mapIncidentSeverity(s: string): IncidentSeverity {
  if (s === "CRITICAL") return "Critical";
  if (s === "HIGH") return "High";
  if (s === "LOW") return "Low";
  return "Medium";
}

function mapIncidentStatus(s: string): IncidentStatus {
  if (s === "ACKNOWLEDGED") return "Acknowledged";
  if (s === "RESOLVED") return "Resolved";
  if (s === "ESCALATED") return "Escalated";
  return "Open";
}

function mapApiIncident(i: ApiIncident): Incident {
  return {
    id: i.id,
    type: (i.type ?? "Safety check") as IncidentType,
    severity: mapIncidentSeverity(i.severity),
    status: mapIncidentStatus(i.status),
    reportedAt: new Date(i.reported_at).toLocaleString(),
    description: i.description ?? "—",
    rideId: i.ride_id ?? undefined,
    reporter: {
      name: i.reporter_name ?? "Unknown",
      phone: i.reporter_phone ?? "",
      role: i.reporter_role ?? "System",
    },
    involves: [],
    location: i.location_text ?? "—",
    district: i.district ?? "—",
    timeline: (i.timeline ?? []).map((e) => ({
      time: new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      event: e.event_text,
      kind: (e.kind as "system" | "ops" | "alert") ?? "system",
    })),
  };
}

const tabs: { id: "all" | IncidentStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Open", label: "Open" },
  { id: "Acknowledged", label: "Acknowledged" },
  { id: "Escalated", label: "Escalated" },
  { id: "Resolved", label: "Resolved" },
];

const severityFilters: ("all" | IncidentSeverity)[] = [
  "all",
  "Critical",
  "High",
  "Medium",
  "Low",
];

const typeFilters: ("all" | IncidentType)[] = [
  "all",
  "SOS Alert",
  "Driver complaint",
  "Customer complaint",
  "Fraud signal",
  "Fake GPS",
  "Lost item",
  "Accident",
  "Safety check",
];

const PAGE_SIZE = 6;

export function IncidentsConsole() {
  const [items, setItems] = useState<Incident[]>([]);

  useEffect(() => {
    getIncidents({ limit: "100", offset: "0" })
      .then((res) => setItems((Array.isArray(res.incidents) ? res.incidents : []).map(mapApiIncident)))
      .catch(() => null);
  }, []);

  const openIncident = (id: string) => {
    setViewingId(id);
    getIncident(id)
      .then((detail) =>
        setItems((prev) =>
          prev.map((i) => (i.id === id ? mapApiIncident(detail) : i))
        )
      )
      .catch(() => null);
  };
  const [tab, setTab] = useState<"all" | IncidentStatus>("all");
  const [severity, setSeverity] = useState<"all" | IncidentSeverity>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | IncidentType>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts: Record<"all" | IncidentStatus, number> = useMemo(
    () => ({
      all: items.length,
      Open: items.filter((i) => i.status === "Open").length,
      Acknowledged: items.filter((i) => i.status === "Acknowledged").length,
      Escalated: items.filter((i) => i.status === "Escalated").length,
      Resolved: items.filter((i) => i.status === "Resolved").length,
    }),
    [items],
  );

  const sosOpen = items.filter(
    (i) => i.type === "SOS Alert" && i.status !== "Resolved",
  );

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (tab !== "all" && i.status !== tab) return false;
      if (severity !== "all" && i.severity !== severity) return false;
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          i.id.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          (i.rideId?.toLowerCase().includes(q) ?? false) ||
          i.reporter.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, tab, severity, typeFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(start, end);

  const updateStatus = (id: string, status: IncidentStatus, event: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              timeline: [
                ...i.timeline,
                { time: "Just now", event, kind: status === "Escalated" ? "alert" : "ops" },
              ],
            }
          : i,
      ),
    );
  };

  const viewing = viewingId ? items.find((i) => i.id === viewingId) ?? null : null;

  return (
    <div className="space-y-6">
      {sosOpen.length > 0 ? (
        <Card title={`SOS active · ${sosOpen.length}`} bodyClass="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {sosOpen.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => openIncident(i.id)}
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-3 text-left transition-colors hover:bg-red-50"
              >
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 ring-1 ring-inset ring-red-200">
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-red-700">
                      {i.id}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {i.reporter.name}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {i.description}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {i.location} · {i.reportedAt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <Card
        title="Incident inbox"
        action={
          <input
            type="search"
            placeholder="Search ID, ride, location…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-8 w-64 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
          />
        }
      >
        <div className="space-y-2 border-b border-border px-3 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
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
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
              {severityFilters.map((s) => {
                const active = severity === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSeverity(s);
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "all" ? "All severities" : s}
                  </button>
                );
              })}
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as typeof typeFilter);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-border bg-surface px-2 text-[11px] font-medium text-foreground outline-none focus:border-primary"
            >
              {typeFilters.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All types" : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-semibold">Incident</th>
                <th className="px-4 py-2.5 text-left font-semibold">Severity</th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-left font-semibold">Reported by</th>
                <th className="px-4 py-2.5 text-left font-semibold">Location</th>
                <th className="px-4 py-2.5 text-right font-semibold">When</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    No incidents match your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((i) => (
                  <tr
                    key={i.id}
                    onClick={() => openIncident(i.id)}
                    className="cursor-pointer hover:bg-surface/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-[10px] font-bold text-foreground">
                        {i.id}
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {i.type}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">
                        {i.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[i.severity]}`}
                      >
                        {i.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[i.status]}`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-foreground">{i.reporter.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {i.reporter.role}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {i.location}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {i.reportedAt}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openIncident(i.id);
                        }}
                        className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filtered.length === 0 ? 0 : start + 1}–{end}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            incidents
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
              of <span className="font-semibold text-foreground">{totalPages}</span>
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
      </Card>

      <IncidentModal
        incident={viewing}
        onClose={() => setViewingId(null)}
        onAcknowledge={async (id) => {
          try { await acknowledgeIncident(id); } catch { /* ignore */ }
          updateStatus(id, "Acknowledged", "Acknowledged");
          setToast(`${id} acknowledged`);
        }}
        onEscalate={async (id) => {
          try { await escalateIncident(id); } catch { /* ignore */ }
          updateStatus(id, "Escalated", "Escalated");
          setToast(`${id} escalated`);
        }}
        onResolve={async (id) => {
          try { await resolveIncident(id); } catch { /* ignore */ }
          updateStatus(id, "Resolved", "Resolved");
          setToast(`${id} resolved`);
          setViewingId(null);
        }}
        onMessage={(id, party) => setToast(`Message sent to ${party} on ${id}`)}
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
    </div>
  );
}
