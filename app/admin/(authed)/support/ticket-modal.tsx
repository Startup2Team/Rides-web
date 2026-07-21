"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../_components";
import type { TeamMember } from "@/lib/api";

export type TicketStatus = "Open" | "Pending" | "Resolved" | "Closed";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketType =
  | "Ride dispute"
  | "Refund"
  | "Lost item"
  | "Driver"
  | "Payment"
  | "Account"
  | "Other";

export type TicketMessage = {
  id: string;
  from: "customer" | "driver" | "agent" | "system";
  author: string;
  time: string;
  body: string;
};

export type Ticket = {
  id: string;
  subject: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  fromName: string;
  fromRole: string;
  fromEmail: string;
  fromPhone: string;
  avatarUrl?: string;
  rideId?: string;
  assignedTo?: string;
  createdAt: string;
  lastActivity: string;
  messages: TicketMessage[];
};

export const priorityStyles: Record<TicketPriority, string> = {
  High: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Low: "bg-muted text-muted-foreground",
};

export const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Resolved: "bg-primary/15 text-primary",
  Closed: "bg-muted text-muted-foreground",
};

export function TicketModal({
  ticket,
  onClose,
  onAssign,
  onResolve,
  onReply,
  onCloseTicket,
  admins = [],
  user,
}: {
  ticket: Ticket | null;
  onClose: () => void;
  onAssign: (id: string, assigneeId: string) => void;
  onResolve: (id: string, reason: string) => void;
  onReply: (id: string, body: string) => void;
  onCloseTicket: (id: string, reason: string) => void;
  admins?: TeamMember[];
  user: any;
}) {
  const [reply, setReply] = useState("");
  const [promptType, setPromptType] = useState<"solve" | "close" | null>(null);
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    setReply("");
    setPromptType(null);
    setActionReason("");
  }, [ticket?.id]);



  if (!ticket) return null;

  const getAssigneeName = (assignedTo?: string) => {
    if (!assignedTo) return "";
    const admin = admins.find((a) => a.id === assignedTo || a.name === assignedTo);
    return admin ? admin.name : assignedTo;
  };

  const assigneeName = getAssigneeName(ticket.assignedTo);
  const showResolve = ticket.status !== "Resolved" && ticket.status !== "Closed";

  return (
    <div className="flex-1 flex flex-col h-full bg-card min-h-0">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 shrink-0 bg-card">
          <div className="flex items-center gap-3 min-w-0">
            {/* Customer/Driver Avatar */}
            <div className="shrink-0 rounded-full overflow-hidden shadow-sm">
              <Avatar name={ticket.fromName} url={ticket.avatarUrl} tone="neutral" size="md" />
            </div>
            
            {/* User Meta Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground truncate">
                  {ticket.fromName}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">
                  {ticket.fromRole}
                </span>
                {ticket.fromPhone && (
                  <a
                    href={`tel:${ticket.fromPhone}`}
                    className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.122-4.103-6.927-6.927l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {ticket.fromPhone}
                  </a>
                )}
                {ticket.fromEmail && (
                  <span className="text-[10px] text-muted-foreground font-medium">
                    · {ticket.fromEmail}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs font-bold text-foreground truncate">
                  {ticket.subject}
                </span>
                <span className="text-[9px] text-muted-foreground shrink-0 font-medium">
                  · {ticket.type} · #{ticket.id.slice(0, 8)}
                  {ticket.status === "Resolved"
                    ? ` · resolved by ${assigneeName || "Admin"}`
                    : ticket.status === "Closed"
                    ? ` · closed by ${assigneeName || "Admin"}`
                    : assigneeName
                    ? ` · assigned to ${assigneeName}`
                    : " · unassigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Priority, Status & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${priorityStyles[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${statusStyles[ticket.status]}`}>
              {ticket.status}
            </span>
             <button
              type="button"
              onClick={onClose}
              className="group flex h-8 items-center gap-1.5 rounded-lg px-2 text-muted-foreground/60 transition-all hover:bg-surface hover:text-foreground"
              title="Close panel (Esc)"
            >
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-80 group-hover:opacity-100">
                esc
              </kbd>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 transition-transform group-hover:rotate-90">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-surface/30 px-6 py-5 custom-scrollbar">
          {ticket.messages.map((m) => {
            const isAgent = m.from === "agent";
            const isSystem = m.from === "system";
            
            let messageBody = m.body;
            if (isSystem && (messageBody.startsWith("⚠️ Ticket Closed:") || messageBody.startsWith("⚠️ Closed:")) && !messageBody.includes("Closed/solved by:")) {
              const reason = messageBody.replace("⚠️ Ticket Closed:", "").replace("⚠️ Closed:", "").trim();
              const adminName = getAssigneeName(ticket.assignedTo) || user?.name || "Admin";
              const admin = admins.find((a) => a.id === ticket.assignedTo || a.name === ticket.assignedTo);
              const adminEmail = (admin ? admin.email : null) || user?.email || "admin@rides.rw";
              const d = new Date(ticket.lastActivity);
              const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
              
              messageBody = `⚠️ Closed:
Reason: ${reason}
Closed/solved by: ${adminName} (${adminEmail})
Date : ${dateStr}
Time: ${timeStr}`;
            } else if (isSystem && (messageBody.startsWith("✅ Case Marked Solved:") || messageBody.startsWith("✅ Solved:")) && !messageBody.includes("Closed/solved by:")) {
              const reason = messageBody.replace("✅ Case Marked Solved:", "").replace("✅ Solved:", "").trim();
              const adminName = getAssigneeName(ticket.assignedTo) || user?.name || "Admin";
              const admin = admins.find((a) => a.id === ticket.assignedTo || a.name === ticket.assignedTo);
              const adminEmail = (admin ? admin.email : null) || user?.email || "admin@rides.rw";
              const d = new Date(ticket.lastActivity);
              const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
              
              messageBody = `✅ Solved:
Reason: ${reason}
Closed/solved by: ${adminName} (${adminEmail})
Date : ${dateStr}
Time: ${timeStr}`;
            }

            return (
              <div
                key={m.id}
                className={`flex ${
                  isSystem
                    ? "justify-center"
                    : isAgent
                      ? "justify-end"
                      : "justify-start"
                }`}
              >
                {isSystem ? (
                  <div className="rounded-xl bg-muted/60 border border-border/30 px-3.5 py-1.5 text-[10px] text-muted-foreground whitespace-pre-line text-center max-w-[90%] mx-auto leading-relaxed shadow-sm">
                    {messageBody}
                  </div>
                ) : (
                  <div
                    className={`flex max-w-[80%] gap-2 ${
                      isAgent ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar
                      name={m.author}
                      url={m.from === "customer" || m.from === "driver" ? ticket.avatarUrl : undefined}
                      size="sm"
                      tone={isAgent ? "primary" : "neutral"}
                    />
                    <div className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
                      <div className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                        {m.author} · {m.time}
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm ${
                          isAgent
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-card text-foreground ring-1 ring-border"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {promptType && (
          <div className={`border-t p-4 shrink-0 ${
            promptType === "close"
              ? "border-red-100 bg-red-50/70"
              : "border-primary/10 bg-primary/[0.02]"
          }`}>
            <h4 className={`text-xs font-bold ${
              promptType === "close" ? "text-red-800" : "text-primary"
            }`}>
              {promptType === "close" ? "Close / Cancel Support Case" : "Mark Case as Solved"}
            </h4>
            <p className={`text-[10px] mt-0.5 ${
              promptType === "close" ? "text-red-600" : "text-muted-foreground"
            }`}>
              {promptType === "close"
                ? "Please describe the reason for closing or cancelling this support case. This will be logged permanently in the timeline."
                : "Please describe how this issue was resolved. This will be logged permanently in the timeline."}
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={
                promptType === "close"
                  ? "Describe closing reason (e.g. User unresponsive, duplicate ticket...)"
                  : "Describe solution (e.g. Refund processed, app glitch explained...)"
              }
              rows={2}
              className={`w-full mt-2 rounded-lg border bg-card p-2 text-xs text-foreground outline-none ${
                promptType === "close" ? "focus:border-red-500 border-red-200" : "focus:border-primary border-border"
              }`}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setPromptType(null);
                  setActionReason("");
                }}
                className="h-7 rounded px-3 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-200/50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!actionReason.trim()}
                onClick={() => {
                  if (promptType === "close") {
                    onCloseTicket(ticket.id, actionReason.trim());
                  } else {
                    onResolve(ticket.id, actionReason.trim());
                  }
                  setPromptType(null);
                  setActionReason("");
                }}
                className={`h-7 rounded px-3 text-[11px] font-semibold text-white ${
                  promptType === "close"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary hover:bg-primary/90"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                Confirm {promptType === "close" ? "Closure" : "Resolution"}
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-border px-6 py-4 shrink-0 bg-card">
          {ticket.rideId && (
            <div className="mb-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
              <span>Linked Trip:</span>
              <a
                href={`/admin/live-rides?search=${ticket.rideId}`}
                className="font-mono font-bold text-primary hover:underline"
              >
                #{ticket.rideId.slice(0, 8)}
              </a>
            </div>
          )}
          {ticket.status === "Resolved" || ticket.status === "Closed" ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/40 border border-dashed border-border px-4 py-3 text-xs text-muted-foreground font-semibold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-muted-foreground/60 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              This case is marked {ticket.status.toLowerCase()} and is closed to further replies.
            </div>
          ) : (
            <div className="mt-2 flex items-end gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply…"
                rows={2}
                className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={!reply.trim()}
                onClick={() => {
                  onReply(ticket.id, reply.trim());
                  setReply("");
                }}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send reply
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-surface/40 px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Assignee:</span>
                <select
                  value={ticket.assignedTo || ""}
                  onChange={(e) => onAssign(ticket.id, e.target.value)}
                  className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] font-semibold text-foreground outline-none cursor-pointer focus:border-primary"
                >
                  <option value="">Unassigned</option>
                  {admins
                    .filter(
                      (admin) =>
                        admin.role_name.toLowerCase().includes("support") ||
                        admin.id === user?.id
                    )
                    .map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name} ({admin.role_name}) {admin.id === user?.id ? "(Me)" : ""}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {showResolve ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPromptType("close")}
                  className="inline-flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  Close Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setPromptType("solve")}
                  className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Mark Resolved
                </button>
              </div>
            ) : null}
          </div>
        </div>
    </div>
  );
}
