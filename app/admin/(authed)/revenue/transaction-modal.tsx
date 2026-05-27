"use client";

import { useEffect } from "react";
import { Avatar } from "../_components";

export type TransactionStatus = "Settled" | "Pending payout" | "Refunded" | "Disputed";

export type Transaction = {
  id: string;
  customer: { name: string; phone: string };
  driver: { name: string; phone: string; vehicleType: string; plate: string };
  pickup: string;
  destination: string;
  vehicleType: "Moto Bike" | "Cab Taxi" | "Light Hilux" | "Heavy Fuso";
  fare: number;
  commission: number;
  payout: number;
  paymentMethod: "MTN MoMo" | "Airtel Money" | "Cash";
  status: TransactionStatus;
  completedAt: string;
  duration: string;
  district: string;
  notes?: string;
};

const statusStyles: Record<TransactionStatus, string> = {
  Settled: "bg-primary/15 text-primary",
  "Pending payout": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Refunded: "bg-muted text-muted-foreground",
  Disputed: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
};

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

export function TransactionModal({
  transaction,
  onClose,
  onRefund,
  onResolveDispute,
}: {
  transaction: Transaction | null;
  onClose: () => void;
  onRefund: (id: string) => void;
  onResolveDispute: (id: string) => void;
}) {
  useEffect(() => {
    if (!transaction) return;
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
  }, [transaction, onClose]);

  if (!transaction) return null;

  const commissionPct = Math.round((transaction.commission / transaction.fare) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {transaction.id}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[transaction.status]}`}
              >
                {transaction.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {transaction.vehicleType} · {transaction.district} · completed{" "}
              {transaction.completedAt}
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
              Fare breakdown
            </p>
            <div className="mt-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-muted-foreground">Gross fare</span>
                <span className="text-base font-bold text-foreground">
                  {formatRWF(transaction.fare)}
                </span>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-primary"
                  style={{
                    width: `${(transaction.payout / transaction.fare) * 100}%`,
                  }}
                />
                <div
                  className="bg-amber-400"
                  style={{
                    width: `${(transaction.commission / transaction.fare) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="block h-2 w-2 rounded-full bg-primary" />
                  Driver payout
                </span>
                <span className="font-semibold text-foreground">
                  {formatRWF(transaction.payout)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="block h-2 w-2 rounded-full bg-amber-400" />
                  Platform commission ({commissionPct}%)
                </span>
                <span className="font-semibold text-foreground">
                  {formatRWF(transaction.commission)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Customer
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={transaction.customer.name} tone="neutral" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {transaction.customer.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {transaction.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Driver
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={transaction.driver.name} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {transaction.driver.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {transaction.driver.vehicleType} · {transaction.driver.plate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Trip details
            </p>
            <div className="mt-2">
              <Row label="Route" value={`${transaction.pickup} → ${transaction.destination}`} />
              <Row label="Duration" value={transaction.duration} />
              <Row label="Payment method" value={transaction.paymentMethod} />
              <Row label="Vehicle" value={transaction.vehicleType} />
              <Row label="District" value={transaction.district} />
            </div>
          </div>

          {transaction.notes ? (
            <div
              className={`rounded-xl border p-4 ${
                transaction.status === "Disputed"
                  ? "border-amber-100 bg-amber-50"
                  : "border-border bg-surface/40"
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${
                  transaction.status === "Disputed"
                    ? "text-amber-700"
                    : "text-muted-foreground"
                }`}
              >
                Notes
              </p>
              <p
                className={`mt-1 text-xs ${
                  transaction.status === "Disputed"
                    ? "text-amber-700"
                    : "text-muted-foreground"
                }`}
              >
                {transaction.notes}
              </p>
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
            {transaction.status === "Disputed" ? (
              <button
                type="button"
                onClick={() => onResolveDispute(transaction.id)}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Resolve dispute
              </button>
            ) : null}
            {transaction.status === "Settled" ? (
              <button
                type="button"
                onClick={() => onRefund(transaction.id)}
                className="inline-flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Issue refund
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
