"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../_components";
import {
  getTickets,
  getTicket,
  assignTicket,
  replyToTicket,
  resolveTicket,
  getTeam,
  type TeamMember,
  type Ticket as ApiTicket,
  type TicketMessage as ApiMsg,
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import {
  TicketModal,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from "./ticket-modal";

const MOCK_AVATARS: Record<string, string> = {
  "Alice Smith": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "John Doe": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  "David Miller": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  "Sarah Connor": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  "James Carter": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  "Emily Watson": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  "Michael Brown": "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150",
  "Jessica Taylor": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
  "Daniel Wilson": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
  "Sophie Martin": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
};

function mapApiTicket(t: ApiTicket): Ticket {
  const name = t.from_name ?? t.from_phone ?? "Unknown";
  const messages = (t.messages ?? []).map((m: ApiMsg) => {
    const isSystem =
      m.body.startsWith("⚠️ Ticket Closed:") ||
      m.body.startsWith("⚠️ Closed:") ||
      m.body.startsWith("✅ Case Marked Solved:") ||
      m.body.startsWith("✅ Solved:") ||
      m.from_role === "SYSTEM" ||
      m.author === "System";
    return {
      id: m.id,
      from: isSystem ? ("system" as const) : m.from_role === "ADMIN" ? ("agent" as const) : ("customer" as const),
      author: m.author,
      time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      body: m.body,
    };
  });
  
  const isClosed = messages.some(m => m.from === "system" && (m.body.startsWith("⚠️ Ticket Closed:") || m.body.startsWith("⚠️ Closed:")));
  
  let statusMapped: TicketStatus = "Open";
  const rawStatus = (t.status || "").toUpperCase();
  if (rawStatus === "OPEN") {
    statusMapped = "Open";
  } else if (rawStatus === "PENDING") {
    statusMapped = "Pending";
  } else if (rawStatus === "RESOLVED") {
    statusMapped = isClosed ? "Closed" : "Resolved";
  } else if (rawStatus === "CLOSED") {
    statusMapped = "Closed";
  }

  let priorityMapped: TicketPriority = "Medium";
  const rawPriority = (t.priority || "").toUpperCase();
  if (rawPriority === "HIGH") {
    priorityMapped = "High";
  } else if (rawPriority === "LOW") {
    priorityMapped = "Low";
  } else {
    priorityMapped = "Medium";
  }

  return {
    id: t.id,
    subject: t.subject,
    type: (t.type as TicketType) ?? "Other",
    priority: priorityMapped,
    status: statusMapped,
    fromName: name,
    fromRole: (t.from_role as string) ?? "Customer",
    fromEmail: "",
    fromPhone: t.from_phone ?? "",
    avatarUrl: MOCK_AVATARS[name],
    rideId: t.ride_id ?? undefined,
    assignedTo: t.assigned_to ?? undefined,
    createdAt: new Date(t.created_at).toLocaleString(),
    lastActivity: new Date(t.updated_at).toLocaleString(),
    messages,
  };
}

const tabs: { id: "all" | TicketStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Open", label: "Open" },
  { id: "Pending", label: "Pending" },
  { id: "Resolved", label: "Solved" },
  { id: "Closed", label: "Closed" },
];
const typeFilters: ("all" | TicketType)[] = [
  "all", "Ride dispute", "Refund", "Lost item", "Driver", "Payment", "Account", "Other",
];

const priorityFilters: ("all" | TicketPriority)[] = ["all", "High", "Medium", "Low"];

function formatRelativeTime(date?: Date): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SupportConsole() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [admins, setAdmins] = useState<TeamMember[]>([]);

  const getAssigneeName = (assignedTo?: string) => {
    if (!assignedTo) return "";
    const admin = admins.find((a) => a.id === assignedTo || a.name === assignedTo);
    return admin ? admin.name : assignedTo;
  };

  useEffect(() => {
    getTickets({ limit: "100", offset: "0" })
      .then((res) => setTickets((Array.isArray(res.tickets) ? res.tickets : []).map(mapApiTicket)))
      .catch(() => null);

    getTeam()
      .then((res) => setAdmins(res.admins || []))
      .catch(() => null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setViewingId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openTicket = (id: string) => {
    setViewingId(id);
    getTicket(id)
      .then((detail) =>
        setTickets((prev) => prev.map((t) => (t.id === id ? mapApiTicket(detail) : t)))
      )
      .catch(() => null);
  };

  const [tab, setTab] = useState<"all" | TicketStatus>("all");
  const [priority, setPriority] = useState<"all" | TicketPriority>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | TicketType>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const mainWrapper = document.querySelector("main")?.parentElement;
    const mainEl = document.querySelector("main");
    if (!mainWrapper || !mainEl) return;

    const originalWrapperOverflow = mainWrapper.style.overflow;
    const originalWrapperHeight = mainWrapper.style.height;
    const originalMainOverflow = mainEl.style.overflow;
    const originalMainHeight = mainEl.style.height;
    const originalMainMinHeight = mainEl.style.minHeight;
    const originalMainDisplay = mainEl.style.display;
    const originalMainFlexDir = mainEl.style.flexDirection;

    mainWrapper.style.overflow = "hidden";
    mainWrapper.style.height = "100vh";

    mainEl.style.overflow = "hidden";
    mainEl.style.height = "100%";
    mainEl.style.minHeight = "0";
    mainEl.style.display = "flex";
    mainEl.style.flexDirection = "column";

    return () => {
      mainWrapper.style.overflow = originalWrapperOverflow;
      mainWrapper.style.height = originalWrapperHeight;
      mainEl.style.overflow = originalMainOverflow;
      mainEl.style.height = originalMainHeight;
      mainEl.style.minHeight = originalMainMinHeight;
      mainEl.style.display = originalMainDisplay;
      mainEl.style.flexDirection = originalMainFlexDir;
    };
  }, []);

  const counts = useMemo(() => {
    return {
      all: tickets.length,
      Open: tickets.filter((t) => t.status === "Open").length,
      Pending: tickets.filter((t) => t.status === "Pending").length,
      Resolved: tickets.filter((t) => t.status === "Resolved").length,
      Closed: tickets.filter((t) => t.status === "Closed").length,
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (tab !== "all" && t.status !== tab) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;

      // Assignee Filter
      if (assigneeFilter === "me") {
        if (t.assignedTo !== user?.id && t.assignedTo !== user?.name) return false;
      } else if (assigneeFilter === "unassigned") {
        if (t.assignedTo) return false;
      } else if (assigneeFilter !== "all") {
        // Match selected team member ID or Name
        const selectedAdmin = admins.find((a) => a.id === assigneeFilter);
        const nameToMatch = selectedAdmin ? selectedAdmin.name : assigneeFilter;
        if (t.assignedTo !== assigneeFilter && t.assignedTo !== nameToMatch) {
          return false;
        }
      }

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
  }, [tickets, tab, priority, typeFilter, assigneeFilter, query, user]);

  const viewing = viewingId ? tickets.find((t) => t.id === viewingId) ?? null : null;

  const updateTicket = (id: string, patch: Partial<Ticket>) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const stats = useMemo(() => {
    const total = tickets.length;
    const solved = tickets.filter((t) => t.status === "Resolved").length;
    const closed = tickets.filter((t) => t.status === "Closed").length;
    const active = total - solved - closed;
    const rate = total > 0 ? Math.round(((solved + closed) / total) * 100) : 0;
    return { total, solved, closed, active, rate };
  }, [tickets]);

  return (
    <div className="h-full flex flex-col flex-1 min-h-0">
      <div className="border border-border rounded-2xl bg-card overflow-hidden flex h-full shadow-sm flex-1 min-h-0">
        <div className={`${viewingId ? "hidden md:flex" : "flex"} w-full md:w-[350px] shrink-0 border-r border-border flex flex-col h-full bg-card`}>
          
          {/* Team Resolution Metrics Quick-View Panel */}
          <div className="border-b border-border bg-surface/30 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Team Resolution Rate
              </span>
              <span className="text-xs font-extrabold text-primary">
                {stats.rate}%
              </span>
            </div>
            
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted flex">
              <div
                style={{ width: `${stats.total > 0 ? (stats.solved / stats.total) * 100 : 0}%` }}
                className="bg-primary transition-all duration-500"
                title={`Solved: ${stats.solved}`}
              />
              <div
                style={{ width: `${stats.total > 0 ? (stats.closed / stats.total) * 100 : 0}%` }}
                className="bg-neutral-400 transition-all duration-500"
                title={`Closed: ${stats.closed}`}
              />
              <div
                style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                className="bg-sky-400 transition-all duration-500"
                title={`Active: ${stats.active}`}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Solved ({stats.solved})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                <span>Closed ({stats.closed})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Active ({stats.active})</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-b border-border space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-bold text-foreground">Queue</h1>
            </div>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="search"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-9 rounded-full border border-border bg-muted/10 text-xs text-foreground outline-none focus:border-primary transition-all placeholder-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={tab}
                onChange={(e) => setTab(e.target.value as "all" | TicketStatus)}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[9px] font-semibold text-foreground outline-none appearance-none cursor-pointer"
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>{t.label} ({counts[t.id]})</option>
                ))}
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "all" | TicketPriority)}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[9px] font-semibold text-foreground outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                {priorityFilters.filter(p => p !== "all").map((p) => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | TicketType)}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[9px] font-semibold text-foreground outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Issue Types</option>
                {typeFilters.filter(t => t !== "all").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[9px] font-semibold text-foreground outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Assignees</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
                <optgroup label="Support Team">
                  {admins
                    .filter((admin) => admin.role_name.toLowerCase().includes("support"))
                    .map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
            {(query || tab !== "all" || priority !== "all" || typeFilter !== "all" || assigneeFilter !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setTab("all");
                  setPriority("all");
                  setTypeFilter("all");
                  setAssigneeFilter("all");
                }}
                className="text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 px-2 py-1 rounded border border-dashed border-border transition-all block w-full text-center"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 custom-scrollbar bg-muted/5">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground font-medium">
                No tickets found
              </div>
            ) : (
              filtered.map((t) => {
                const isActive = t.id === viewingId;
                const isOpen = t.status === "Open";
                const isHigh = t.priority === "High";
                return (
                  <div
                    key={t.id}
                    onClick={() => openTicket(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-4 ${
                      isActive
                        ? "border-l-primary bg-primary/[0.04]"
                        : "border-l-transparent hover:bg-muted/30"
                    }`}
                  >
                    <div className="shrink-0">
                      <div className="rounded-full overflow-hidden shadow-sm">
                        <Avatar name={t.fromName} url={t.avatarUrl} tone="neutral" size="md" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs truncate font-bold text-foreground">
                          {t.fromName}
                        </span>
                        <span className="text-[9px] text-muted-foreground shrink-0 font-medium">
                          {formatRelativeTime(new Date(t.createdAt))}
                        </span>
                      </div>

                      <p className="text-[11px] truncate text-foreground font-semibold">
                        {t.subject}
                      </p>
                      
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[10px] text-muted-foreground truncate opacity-85 leading-normal flex-1">
                          {t.status === "Resolved" || t.status === "Closed"
                            ? `${t.status} by ${getAssigneeName(t.assignedTo) || "Admin"}`
                            : `${t.type} · ${t.fromRole}`}
                        </p>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                            isHigh ? "bg-red-500/10 text-red-600" : "bg-neutral-100 text-neutral-600"
                          }`}>
                            {t.priority}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            isOpen ? "bg-sky-500 animate-pulse" : "bg-neutral-300"
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className={`${viewingId ? "flex" : "hidden md:flex"} flex-1 h-full flex-col bg-muted/5`}>
          {viewingId && viewing ? (
            <TicketModal
              ticket={viewing}
              onClose={() => setViewingId(null)}
              admins={admins}
              user={user}
              onAssign={async (id, assigneeId) => {
                try { await assignTicket(id, assigneeId); } catch { /* ignore */ }
                updateTicket(id, { assignedTo: assigneeId || undefined });
                setToast(assigneeId ? "Ticket assigned successfully" : "Ticket unassigned");
              }}
              onResolve={async (id, reason) => {
                const myEmail = user?.email || "admin@mock.local";
                const myName = user?.name || "Admin (Mock)";
                const now = new Date();
                const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                
                const auditMsg = `✅ Solved:
Reason: ${reason}
Closed/solved by: ${myName} (${myEmail})
Date : ${dateStr}
Time: ${timeStr}`;

                try {
                  await replyToTicket(id, auditMsg);
                  await resolveTicket(id);
                } catch {
                  /* ignore */
                }
                updateTicket(id, {
                  status: "Resolved",
                  messages: [
                    ...viewing.messages,
                    {
                      id: `resolve-${viewing.messages.length + 1}`,
                      from: "system",
                      author: "System",
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      body: auditMsg,
                    },
                  ],
                });
                setToast("Ticket resolved and logged");
              }}
              onCloseTicket={async (id, reason) => {
                const myEmail = user?.email || "admin@rides.rw";
                const myName = user?.name || "Admin";
                const now = new Date();
                const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                
                const auditMsg = `⚠️ Closed:
Reason: ${reason}
Closed/solved by: ${myName} (${myEmail})
Date : ${dateStr}
Time: ${timeStr}`;

                try {
                  await replyToTicket(id, auditMsg);
                  await resolveTicket(id);
                } catch {
                  /* ignore */
                }
                updateTicket(id, {
                  status: "Closed",
                  messages: [
                    ...viewing.messages,
                    {
                      id: `close-${viewing.messages.length + 1}`,
                      from: "system",
                      author: "System",
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      body: auditMsg,
                    },
                  ],
                });
                setToast("Ticket closed and logged");
              }}
              onReply={async (id, body) => {
                try { await replyToTicket(id, body); } catch { /* ignore */ }
                updateTicket(id, {
                  status: "Pending",
                  messages: [
                    ...viewing.messages,
                    {
                      id: `reply-${viewing.messages.length + 1}`,
                      from: "agent",
                      author: user?.name ?? "Admin",
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      body,
                    },
                  ],
                });
                setToast("Reply sent successfully");
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 bg-card">
              <div className="w-20 h-20 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Support Queue</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Select a support ticket from the left panel to review messages and reply.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold text-foreground">{toast}</span>
        </div>
      )}
    </div>
  );
}
