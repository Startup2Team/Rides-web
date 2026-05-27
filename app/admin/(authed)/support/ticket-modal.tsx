"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../_components";

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
  fromRole: "Customer" | "Driver";
  fromEmail: string;
  fromPhone: string;
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
}: {
  ticket: Ticket | null;
  onClose: () => void;
  onAssign: (id: string) => void;
  onResolve: (id: string) => void;
  onReply: (id: string, body: string) => void;
}) {
  const [reply, setReply] = useState("");

  useEffect(() => {
    setReply("");
  }, [ticket?.id]);

  useEffect(() => {
    if (!ticket) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [ticket, onClose]);

  if (!ticket) return null;

  const showAssign = !ticket.assignedTo && ticket.status !== "Resolved";
  const showResolve = ticket.status !== "Resolved" && ticket.status !== "Closed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {ticket.id}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${priorityStyles[ticket.priority]}`}
              >
                {ticket.priority}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[ticket.status]}`}
              >
                {ticket.status}
              </span>
              <span className="text-[10px] text-muted-foreground">{ticket.type}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{ticket.subject}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              from {ticket.fromName} · {ticket.fromRole} · opened {ticket.createdAt}
              {ticket.assignedTo ? ` · assigned to ${ticket.assignedTo}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-surface/30 px-6 py-5">
          {ticket.messages.map((m) => {
            const isAgent = m.from === "agent";
            const isSystem = m.from === "system";
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
                  <div className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                    {m.body} · {m.time}
                  </div>
                ) : (
                  <div
                    className={`flex max-w-[80%] gap-2 ${
                      isAgent ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar
                      name={m.author}
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

        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{ticket.fromPhone}</span>
            <span>·</span>
            <span>{ticket.fromEmail}</span>
            {ticket.rideId ? (
              <>
                <span>·</span>
                <span>
                  Ride{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {ticket.rideId}
                  </span>
                </span>
              </>
            ) : null}
          </div>
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
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {showAssign ? (
              <button
                type="button"
                onClick={() => onAssign(ticket.id)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                Assign to me
              </button>
            ) : null}
            {showResolve ? (
              <button
                type="button"
                onClick={() => onResolve(ticket.id)}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Mark resolved
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
