"use client";

import { useEffect } from "react";
import { Avatar } from "../_components";

export type NegotiationStatus = "Agreed" | "Failed" | "In progress" | "Disputed";

export type Offer = {
  round: number;
  from: "customer" | "driver";
  amount: number;
  time: string;
};

export type NegotiationDetail = {
  id: string;
  customer: { name: string; phone: string; rating: number };
  driver: {
    name: string;
    phone: string;
    vehicleType: string;
    plate: string;
    rating: number;
  } | null;
  pickup: string;
  destination: string;
  vehicleType: string;
  initial: number;
  final: number | null;
  rounds: number;
  status: NegotiationStatus;
  startedAt: string;
  duration: string;
  paymentMethod: string;
  offers: Offer[];
  failureReason?: string;
  notes?: string;
};

const statusStyles: Record<NegotiationStatus, string> = {
  Agreed: "bg-primary/15 text-primary",
  Failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  "In progress": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Disputed: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
};

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function OfferBubble({
  offer,
  isCustomer,
  delta,
}: {
  offer: Offer;
  isCustomer: boolean;
  delta?: number;
}) {
  return (
    <div
      className={`flex ${isCustomer ? "justify-start" : "justify-end"} mb-2`}
    >
      <div
        className={`flex max-w-[80%] flex-col ${
          isCustomer ? "items-start" : "items-end"
        }`}
      >
        <span className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isCustomer ? "Customer" : "Driver"} · Round {offer.round}
        </span>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isCustomer
              ? "rounded-bl-sm bg-surface text-foreground"
              : "rounded-br-sm bg-primary text-primary-foreground"
          }`}
        >
          <p className="text-base font-bold tracking-tight">
            {formatRWF(offer.amount)}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{offer.time}</span>
          {typeof delta === "number" && delta !== 0 ? (
            <span
              className={`font-semibold ${
                delta > 0 ? "text-amber-600" : "text-primary"
              }`}
            >
              {delta > 0 ? "+" : ""}
              {formatRWF(delta).replace(" RWF", "")} RWF
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function NegotiationModal({
  negotiation,
  onClose,
  onMessageCustomer,
  onMessageDriver,
  onViewRide,
}: {
  negotiation: NegotiationDetail | null;
  onClose: () => void;
  onMessageCustomer: (id: string) => void;
  onMessageDriver: (id: string) => void;
  onViewRide: (id: string) => void;
}) {
  useEffect(() => {
    if (!negotiation) return;
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
  }, [negotiation, onClose]);

  if (!negotiation) return null;

  const uplift =
    negotiation.final !== null
      ? Math.round(((negotiation.final - negotiation.initial) / negotiation.initial) * 100)
      : null;

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
                {negotiation.id}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[negotiation.status]}`}
              >
                {negotiation.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {negotiation.pickup} → {negotiation.destination} ·{" "}
              {negotiation.vehicleType} · started {negotiation.startedAt}
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Customer
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={negotiation.customer.name} tone="neutral" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {negotiation.customer.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {negotiation.customer.phone}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Rating{" "}
                <span className="font-semibold text-foreground">
                  {negotiation.customer.rating.toFixed(1)}{" "}
                  <span className="text-amber-500">★</span>
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Driver
              </p>
              {negotiation.driver ? (
                <>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar name={negotiation.driver.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {negotiation.driver.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {negotiation.driver.vehicleType} ·{" "}
                        {negotiation.driver.plate}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    Rating{" "}
                    <span className="font-semibold text-foreground">
                      {negotiation.driver.rating.toFixed(1)}{" "}
                      <span className="text-amber-500">★</span>
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No driver assigned during this negotiation.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Initial offer" value={formatRWF(negotiation.initial)} />
            <MiniStat
              label="Final fare"
              value={negotiation.final !== null ? formatRWF(negotiation.final) : "—"}
            />
            <MiniStat
              label="Uplift"
              value={
                uplift === null ? "—" : `${uplift > 0 ? "+" : ""}${uplift}%`
              }
            />
            <MiniStat label="Duration" value={negotiation.duration} />
          </div>

          <div>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Offer chronology
            </p>
            <div className="mt-2 rounded-xl border border-border bg-surface/40 p-4">
              {negotiation.offers.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">
                  No offers exchanged.
                </p>
              ) : (
                negotiation.offers.map((o, i) => {
                  const prev = i > 0 ? negotiation.offers[i - 1].amount : null;
                  const delta = prev !== null ? o.amount - prev : undefined;
                  return (
                    <OfferBubble
                      key={`${o.round}-${o.from}-${i}`}
                      offer={o}
                      isCustomer={o.from === "customer"}
                      delta={delta}
                    />
                  );
                })
              )}
            </div>
          </div>

          {negotiation.failureReason ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-700">
                Why it failed
              </p>
              <p className="mt-1 text-xs text-red-700">
                {negotiation.failureReason}
              </p>
            </div>
          ) : null}

          {negotiation.notes ? (
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Ops notes
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{negotiation.notes}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Rounds</p>
              <p className="font-semibold text-foreground">{negotiation.rounds}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment</p>
              <p className="font-semibold text-foreground">
                {negotiation.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Vehicle</p>
              <p className="font-semibold text-foreground">
                {negotiation.vehicleType}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Started</p>
              <p className="font-semibold text-foreground">{negotiation.startedAt}</p>
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
              onClick={() => onViewRide(negotiation.id)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              View ride
            </button>
            <button
              type="button"
              onClick={() => onMessageCustomer(negotiation.id)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
            >
              Message customer
            </button>
            <button
              type="button"
              onClick={() => onMessageDriver(negotiation.id)}
              disabled={!negotiation.driver}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Message driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
