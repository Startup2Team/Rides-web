"use client";

import { useEffect } from "react";
import { Avatar } from "../_components";

export type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "Open" | "Acknowledged" | "Resolved" | "Escalated";
export type IncidentType =
  | "SOS Alert"
  | "Driver complaint"
  | "Customer complaint"
  | "Fraud signal"
  | "Fake GPS"
  | "Lost item"
  | "Accident"
  | "Safety check";

export type IncidentParty = {
  name: string;
  phone: string;
  role: "Customer" | "Driver";
  vehicleType?: string;
  plate?: string;
};

export type Incident = {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string;
  description: string;
  rideId?: string;
  reporter: { name: string; phone: string; role: string };
  involves: IncidentParty[];
  location: string;
  district: string;
  position?: { x: number; y: number };
  timeline: { time: string; event: string; kind: "system" | "ops" | "alert" }[];
  assignedTo?: string;
  notes?: string;
};

export const severityStyles: Record<IncidentSeverity, string> = {
  Critical: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  High: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Low: "bg-muted text-muted-foreground",
};

export const statusStyles: Record<IncidentStatus, string> = {
  Open: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  Acknowledged: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Resolved: "bg-primary/15 text-primary",
  Escalated: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
};

export function IncidentModal({
  incident,
  onClose,
  onAcknowledge,
  onEscalate,
  onResolve,
  onMessage,
}: {
  incident: Incident | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
  onMessage: (id: string, party: "Customer" | "Driver") => void;
}) {
  useEffect(() => {
    if (!incident) return;
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
  }, [incident, onClose]);

  if (!incident) return null;

  const showAck = incident.status === "Open";
  const showEscalate = incident.status !== "Resolved" && incident.status !== "Escalated";
  const showResolve = incident.status !== "Resolved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {incident.id}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[incident.severity]}`}
              >
                {incident.severity}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[incident.status]}`}
              >
                {incident.status}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">{incident.type}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {incident.location} · {incident.district} · reported {incident.reportedAt}
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

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Description
            </p>
            <p className="mt-1 text-sm text-foreground">{incident.description}</p>
            {incident.rideId ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Linked ride:{" "}
                <span className="font-mono font-semibold text-foreground">
                  {incident.rideId}
                </span>
              </p>
            ) : null}
          </div>

          <div>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Parties involved
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {incident.involves.map((party, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface/40 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={party.name}
                      tone={party.role === "Driver" ? "primary" : "neutral"}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {party.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {party.role}
                        {party.vehicleType ? ` · ${party.vehicleType}` : ""}
                        {party.plate ? ` · ${party.plate}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">{party.phone}</p>
                    <button
                      type="button"
                      onClick={() => onMessage(incident.id, party.role)}
                      className="inline-flex h-7 items-center rounded-lg border border-border bg-card px-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Timeline
            </p>
            <ol className="mt-2 space-y-3 border-l border-border pl-1">
              {incident.timeline.map((e, i) => {
                const dot =
                  e.kind === "alert"
                    ? "bg-red-500"
                    : e.kind === "ops"
                      ? "bg-primary"
                      : "bg-muted-foreground";
                return (
                  <li key={i} className="relative pl-6">
                    <span
                      className={`absolute left-1.5 top-1.5 block h-2 w-2 rounded-full ring-2 ring-card ${dot}`}
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-xs text-foreground">{e.event}</p>
                      <p className="text-[10px] text-muted-foreground">{e.time}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {incident.notes ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700">
                Ops notes
              </p>
              <p className="mt-1 text-xs text-amber-700">{incident.notes}</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {showAck ? (
              <button
                type="button"
                onClick={() => onAcknowledge(incident.id)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                Acknowledge
              </button>
            ) : null}
            {showEscalate ? (
              <button
                type="button"
                onClick={() => onEscalate(incident.id)}
                className="inline-flex h-9 items-center rounded-lg border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
              >
                Escalate
              </button>
            ) : null}
            {showResolve ? (
              <button
                type="button"
                onClick={() => onResolve(incident.id)}
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
