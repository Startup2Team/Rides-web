"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Card } from "../_components";
import {
  getTickets,
  resolveTicket,
  type Ticket as ApiTicket,
} from "@/lib/api";
import {
  priorityStyles,
  statusStyles,
  TicketModal,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "./ticket-modal";

function mapApiTicket(t: ApiTicket): Ticket {
  return {
    id: t.id,
    subject: t.subject,
    type: "Other" as TicketType,
    priority: (t.priority as TicketPriority) ?? "Medium",
    status: (t.status as TicketStatus) ?? "Open",
    fromName: t.created_by,
    fromRole: "Customer",
    fromEmail: "",
    fromPhone: "",
    assignedTo: t.assigned_to,
    createdAt: new Date(t.created_at).toLocaleString(),
    lastActivity: new Date(t.updated_at).toLocaleString(),
    messages: [],
  };
}

const PAGE_SIZE = 6;

const tabs: { id: "all" | TicketStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Open", label: "Open" },
  { id: "Pending", label: "Pending" },
  { id: "Resolved", label: "Resolved" },
  { id: "Closed", label: "Closed" },
];

const typeFilters: ("all" | TicketType)[] = [
  "all",
  "Ride dispute",
  "Refund",
  "Lost item",
  "Driver",
  "Payment",
  "Account",
  "Other",
];

const priorityFilters: ("all" | TicketPriority)[] = ["all", "High", "Medium", "Low"];

export function SupportConsole() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    getTickets({ limit: "100", offset: "0" })
      .then((res) => setTickets((res.tickets ?? []).map(mapApiTicket)))
      .catch(() => null);
  }, []);
  const [tab, setTab] = useState<"all" | TicketStatus>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | TicketType>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts: Record<"all" | TicketStatus, number> = useMemo(
    () => ({
      all: tickets.length,
      Open: tickets.filter((t) => t.status === "Open").length,
      Pending: tickets.filter((t) => t.status === "Pending").length,
      Resolved: tickets.filter((t) => t.status === "Resolved").length,
      Closed: tickets.filter((t) => t.status === "Closed").length,
    }),
    [tickets],
  );

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (tab !== "all" && t.status !== tab) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.fromName.toLowerCase().includes(q) ||
          (t.rideId?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [tickets, tab, priority, typeFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(start, end);

  const viewing = viewingId ? tickets.find((t) => t.id === viewingId) ?? null : null;

  const updateTicket = (id: string, patch: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  return (
    <div className="space-y-6">
      <Card
        title="Ticket queue"
        action={
          <input
            type="search"
            placeholder="Search ID, subject, name…"
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
              {priorityFilters.map((p) => {
                const active = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriority(p);
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "all" ? "All priorities" : p}
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

        <ul className="divide-y divide-border">
          {paginated.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              No tickets match your filters.
            </li>
          ) : (
            paginated.map((t) => (
              <li
                key={t.id}
                onClick={() => setViewingId(t.id)}
                className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface/50"
              >
                <Avatar name={t.fromName} tone="neutral" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">
                      {t.id}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[t.status]}`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">· {t.type}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
                    {t.subject}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t.fromName} · {t.fromRole}
                    {t.assignedTo ? ` · assigned to ${t.assignedTo}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {t.lastActivity}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingId(t.id);
                    }}
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    Open
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filtered.length === 0 ? 0 : start + 1}–{end}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            tickets
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
              Page <span className="font-semibold text-foreground">{safePage}</span> of{" "}
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
      </Card>

      <TicketModal
        ticket={viewing}
        onClose={() => setViewingId(null)}
        onAssign={(id) => {
          updateTicket(id, { assignedTo: "Aiden Mugisha", status: "Pending" });
          setToast(`${id} assigned to you`);
        }}
        onResolve={async (id) => {
          try { await resolveTicket(id); } catch { /* ignore */ }
          updateTicket(id, { status: "Resolved" });
          setToast(`${id} marked resolved`);
          setViewingId(null);
        }}
        onReply={(id, body) => {
          setTickets((prev) =>
            prev.map((t) =>
              t.id === id
                ? {
                    ...t,
                    lastActivity: "Just now",
                    status: t.status === "Open" ? "Pending" : t.status,
                    messages: [
                      ...t.messages,
                      {
                        id: `m${t.messages.length + 1}`,
                        from: "agent",
                        author: "Aiden M.",
                        time: "Just now",
                        body,
                      },
                    ],
                  }
                : t,
            ),
          );
          setToast("Reply sent");
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
    </div>
  );
}
