"use client";

import { useEffect } from "react";
import { Avatar, StatusPill } from "../_components";

export type CustomerStatus =
  | "Active"
  | "VIP"
  | "Dormant"
  | "Flagged"
  | "Suspended";

export type CustomerTrip = {
  id: string;
  date: string;
  from: string;
  to: string;
  vehicle: string;
  fare: number;
  status: "Completed" | "Cancelled";
};

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo_url?: string | null;
  location: string;
  joined: string;
  createdAt?: string;
  trips: number;
  spend: number;
  avgFare: number;
  lastTrip: string;
  preferredVehicle: string;
  status: CustomerStatus;
  recentTrips: CustomerTrip[];
  notes?: string;
};

const statusToneMap: Record<
  CustomerStatus,
  "success" | "info" | "warn" | "danger" | "neutral"
> = {
  Active: "success",
  VIP: "info",
  Dormant: "neutral",
  Flagged: "warn",
  Suspended: "danger",
};

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

export function CustomerModal({
  customer,
  onClose,
  onMessage,
  onFlag,
  onUnflag,
  onSuspend,
  onReinstate,
}: {
  customer: CustomerProfile | null;
  onClose: () => void;
  onMessage: (id: string) => void;
  onFlag: (id: string) => void;
  onUnflag: (id: string) => void;
  onSuspend: (id: string) => void;
  onReinstate: (id: string) => void;
}) {
  useEffect(() => {
    if (!customer) return;
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
  }, [customer, onClose]);

  if (!customer) return null;

  const tone = statusToneMap[customer.status];
  const showFlag = customer.status !== "Flagged" && customer.status !== "Suspended";
  const showUnflag = customer.status === "Flagged";
  const showSuspend = customer.status !== "Suspended";
  const showReinstate = customer.status === "Suspended";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={customer.name} />
              {customer.status === "VIP" ? (
                <span
                  aria-hidden
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] text-white ring-2 ring-card"
                >
                  ★
                </span>
              ) : null}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-foreground">
                  {customer.name}
                </h2>
                <StatusPill status={customer.status} tone={tone} />
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Member since {customer.joined}
              </p>
            </div>
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Lifetime Trips" value={String(customer.trips)} />
            <Stat label="Total Spend" value={formatRWF(customer.spend)} />
            <Stat label="Avg Fare" value={formatRWF(customer.avgFare)} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Contact
              </p>
              <div className="mt-2">
                <InfoRow label="Phone" value={customer.phone} />
                <InfoRow label="Location" value={customer.location} />
                <InfoRow label="Last trip" value={customer.lastTrip} />
                <InfoRow
                  label="Preferred vehicle"
                  value={customer.preferredVehicle}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Account notes
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {customer.notes ??
                  "No notes on file. Add observations when this customer needs follow-up."}
              </p>
            </div>
          </div>

          <div>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Recent trips
            </p>
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-surface/60">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                    <th className="px-3 py-2 text-left font-semibold">Route</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Vehicle
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">Fare</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customer.recentTrips.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-muted-foreground"
                      >
                        No trips yet.
                      </td>
                    </tr>
                  ) : (
                    customer.recentTrips.map((t) => (
                      <tr key={t.id}>
                        <td className="px-3 py-2 text-muted-foreground">
                          {t.date}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-foreground">{t.from}</span>{" "}
                          <span className="text-muted-foreground">→</span>{" "}
                          <span className="text-foreground">{t.to}</span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {t.vehicle}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">
                          {formatRWF(t.fare)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              t.status === "Completed"
                                ? "bg-primary/10 text-primary"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
            <button
              type="button"
              onClick={() => onMessage(customer.id)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              Message
            </button>
            {showFlag ? (
              <button
                type="button"
                onClick={() => onFlag(customer.id)}
                className="inline-flex h-9 items-center rounded-lg border border-amber-200 bg-amber-50 px-4 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
              >
                Flag account
              </button>
            ) : null}
            {showUnflag ? (
              <button
                type="button"
                onClick={() => onUnflag(customer.id)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                Remove flag
              </button>
            ) : null}
            {showSuspend ? (
              <button
                type="button"
                onClick={() => onSuspend(customer.id)}
                className="inline-flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Suspend
              </button>
            ) : null}
            {showReinstate ? (
              <button
                type="button"
                onClick={() => onReinstate(customer.id)}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Reinstate
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
