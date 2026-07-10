"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../_components";
import { getSettings } from "@/lib/api";
import {
  DEFAULT_MAX_NEGOTIATION_ROUNDS,
  fareChatAtLimit,
  negotiationChatEnded,
  parseMaxRounds,
} from "@/lib/negotiation-rules";

export type NegotiationStatus = "Agreed" | "Failed" | "In progress" | "Disputed";

export type Offer = {
  round: number;
  from: "customer" | "driver";
  amount: number;
  time: string;
  response?: string | null;
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
  /** Agreed price when negotiation completed */
  final: number | null;
  rounds: number;
  status: NegotiationStatus;
  startedAt: string;
  duration: string;
  offers: Offer[];
  lastCustomerOffer: number | null;
  lastDriverOffer: number | null;
  priceGap: number | null;
  waitingOn: "customer" | "driver" | null;
  failureReason?: string;
  notes?: string;
  /** Internal filter key — transport_type code from API */
  _transportCode?: string;
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

function PriceHero({
  initial,
  agreed,
  status,
}: {
  initial: number;
  agreed: number | null;
  status: NegotiationStatus;
}) {
  const uplift =
    agreed !== null && initial > 0
      ? Math.round(((agreed - initial) / initial) * 100)
      : null;

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Price tracking
      </p>
      <div className="mt-3 flex items-center justify-center gap-3 sm:gap-6">
        <div className="text-center">
          <p className="text-[10px] font-medium text-muted-foreground">Rider opened at</p>
          <p className="mt-0.5 text-lg font-bold text-foreground">{formatRWF(initial)}</p>
        </div>
        <span className="text-xl text-muted-foreground" aria-hidden>
          →
        </span>
        <div className="text-center">
          <p className="text-[10px] font-medium text-muted-foreground">
            {status === "In progress" ? "Not agreed yet" : "Agreed price"}
          </p>
          <p className="mt-0.5 text-lg font-bold text-primary">
            {agreed !== null ? formatRWF(agreed) : "—"}
          </p>
        </div>
      </div>
      {uplift !== null ? (
        <p
          className={`mt-3 text-center text-xs font-semibold ${
            uplift > 0 ? "text-amber-600" : uplift < 0 ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {uplift > 0 ? "+" : ""}
          {uplift}% from rider&apos;s first offer
        </p>
      ) : status === "In progress" ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Still negotiating — see latest offers below.
        </p>
      ) : null}
    </div>
  );
}

function CommunicationPanel({
  status,
  rounds,
  maxRounds,
}: {
  status: NegotiationStatus;
  rounds: number;
  maxRounds: number;
}) {
  const ended = negotiationChatEnded(status);
  const atLimit = fareChatAtLimit(rounds, maxRounds);
  const used = Math.min(rounds, maxRounds);

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Fare chat &amp; phone call
      </p>

      {!ended ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-foreground">
            Up to{" "}
            <span className="font-bold">{maxRounds}</span> price offers in chat — then
            negotiation must finish.
          </p>
          <div className="flex items-center gap-2">
            {Array.from({ length: maxRounds }, (_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < used ? "bg-primary" : "bg-muted"
                }`}
                aria-hidden
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {used} of {maxRounds}
            </span>{" "}
            offers used
            {rounds > maxRounds ? (
              <span className="text-amber-700"> · {rounds} recorded (over limit)</span>
            ) : null}
          </p>
          {atLimit ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Chat is full. Parties must accept the last price or negotiation ends — then{" "}
              <span className="font-semibold">Call</span> unlocks so they can ring each other on
              their phone (outside the app).
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              No phone call yet — fare chat in the app only while negotiation is open.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Chat closed
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Phone call
            </span>
          </div>
          <p className="text-sm text-foreground">
            Negotiation ended — rider and driver see{" "}
            <span className="font-semibold">Call</span> to open their phone dialer (outside the
            app), not more fare chat in Taravelis.
          </p>
          {status === "Agreed" ? (
            <p className="text-xs text-muted-foreground">
              They can call from their own phone app to coordinate pickup even though the price is
              locked.
            </p>
          ) : status === "Failed" ? (
            <p className="text-xs text-muted-foreground">
              Useful if they still want to agree by phone after chat ran out or was declined.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SituationPanel({
  negotiation,
  maxRounds,
}: {
  negotiation: NegotiationDetail;
  maxRounds: number;
}) {
  const { status, lastCustomerOffer, lastDriverOffer, priceGap, waitingOn } = negotiation;

  if (status === "Agreed" && negotiation.final !== null) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
          Agreed
        </p>
        <p className="mt-1 text-sm text-foreground">
          Both parties locked in at{" "}
          <span className="font-bold">{formatRWF(negotiation.final)}</span> after{" "}
          {negotiation.rounds} round{negotiation.rounds === 1 ? "" : "s"}.
        </p>
      </div>
    );
  }

  if (status === "Failed") {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-700">
          No agreement
        </p>
        <p className="mt-1 text-sm text-red-800">
          {negotiation.failureReason ??
            "Negotiation ended without a shared agreed price."}
        </p>
        {lastCustomerOffer != null && lastDriverOffer != null ? (
          <p className="mt-2 text-xs text-red-700/90">
            Last positions: rider {formatRWF(lastCustomerOffer)} · driver{" "}
            {formatRWF(lastDriverOffer)}
            {priceGap != null ? ` (${formatRWF(priceGap)} apart)` : ""}
          </p>
        ) : null}
      </div>
    );
  }

  if (status === "Disputed") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800">
          Disputed agreed price
        </p>
        <p className="mt-1 text-sm text-amber-900">
          {negotiation.notes ??
            "A price was recorded but one party may disagree — review the offer thread."}
        </p>
        {negotiation.final !== null ? (
          <p className="mt-2 text-xs font-semibold text-amber-900">
            Recorded agreed price: {formatRWF(negotiation.final)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-800">
        In progress
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Rider last offer</p>
          <p className="text-sm font-bold text-foreground">
            {lastCustomerOffer != null ? formatRWF(lastCustomerOffer) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Driver last offer</p>
          <p className="text-sm font-bold text-foreground">
            {lastDriverOffer != null ? formatRWF(lastDriverOffer) : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Gap</p>
          <p className="text-sm font-bold text-foreground">
            {priceGap != null ? formatRWF(priceGap) : "—"}
          </p>
        </div>
      </div>
      {waitingOn ? (
        <p className="mt-2 text-xs text-sky-900">
          Waiting on{" "}
          <span className="font-semibold capitalize">{waitingOn}</span> to respond.
        </p>
      ) : null}
      {negotiation.rounds >= maxRounds ? (
        <p className="mt-2 text-xs font-medium text-amber-800">
          Fare chat limit reached — no more offers unless the last one is accepted.
        </p>
      ) : null}
    </div>
  );
}

function OfferBubble({
  offer,
  isCustomer,
  delta,
  isAccepted,
}: {
  offer: Offer;
  isCustomer: boolean;
  delta?: number;
  isAccepted?: boolean;
}) {
  return (
    <div className={`flex ${isCustomer ? "justify-start" : "justify-end"} mb-2`}>
      <div className={`flex max-w-[85%] flex-col ${isCustomer ? "items-start" : "items-end"}`}>
        <span className="mb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isCustomer ? "Rider" : "Driver"} · Round {offer.round}
          {isAccepted ? " · Accepted" : offer.response === "DECLINED" ? " · Declined" : ""}
        </span>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isCustomer
              ? "rounded-bl-sm bg-surface text-foreground ring-1 ring-border"
              : "rounded-br-sm bg-primary text-primary-foreground"
          } ${isAccepted ? "ring-2 ring-primary/40" : ""}`}
        >
          <p className="text-base font-bold tracking-tight">{formatRWF(offer.amount)}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>{offer.time}</span>
          {typeof delta === "number" && delta !== 0 ? (
            <span className={`font-semibold ${delta > 0 ? "text-amber-600" : "text-primary"}`}>
              {delta > 0 ? "+" : ""}
              {delta.toLocaleString()} RWF
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
}: {
  negotiation: NegotiationDetail | null;
  onClose: () => void;
}) {
  const [maxRounds, setMaxRounds] = useState(DEFAULT_MAX_NEGOTIATION_ROUNDS);

  useEffect(() => {
    getSettings()
      .then((settings) => {
        const rules = settings.negotiation as Record<string, unknown> | undefined;
        if (!rules) return;
        setMaxRounds(parseMaxRounds(rules.maxRounds));
      })
      .catch(() => {
        /* offline / mock — keep defaults */
      });
  }, []);

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

  const shortId =
    negotiation.id.length > 14 ? `${negotiation.id.slice(0, 12)}…` : negotiation.id;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="negotiation-detail-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="negotiation-modal-panel relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5">
        <div className="border-b border-border bg-surface/30 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Price negotiation
              </p>
              <h2
                id="negotiation-detail-title"
                className="mt-1 truncate text-lg font-bold tracking-tight text-foreground"
              >
                {negotiation.pickup} → {negotiation.destination}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                  {shortId}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[negotiation.status]}`}
                >
                  {negotiation.status}
                </span>
                <span className="text-[11px] text-muted-foreground">{negotiation.vehicleType}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <PriceHero
            initial={negotiation.initial}
            agreed={negotiation.final}
            status={negotiation.status}
          />

          <SituationPanel negotiation={negotiation} maxRounds={maxRounds} />

          <CommunicationPanel
            status={negotiation.status}
            rounds={negotiation.rounds}
            maxRounds={maxRounds}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Rider
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
            </div>
            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Driver
              </p>
              {negotiation.driver ? (
                <div className="mt-2 flex items-center gap-3">
                  <Avatar name={negotiation.driver.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {negotiation.driver.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {negotiation.driver.plate} · {negotiation.driver.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">No driver matched.</p>
              )}
            </div>
          </div>

          <div>
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Fare chat history
            </p>
            <div className="mt-2 rounded-xl border border-border bg-surface/40 p-4">
              {negotiation.offers.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground">No offers yet.</p>
              ) : (
                negotiation.offers.map((o, i) => {
                  const prev = i > 0 ? negotiation.offers[i - 1].amount : null;
                  const delta = prev !== null ? o.amount - prev : undefined;
                  const isAccepted = o.response === "ACCEPTED";
                  return (
                    <OfferBubble
                      key={`${o.round}-${o.from}-${i}`}
                      offer={o}
                      isCustomer={o.from === "customer"}
                      delta={delta}
                      isAccepted={isAccepted}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{negotiation.rounds}</span> rounds
            </span>
            <span>
              Started <span className="font-medium text-foreground">{negotiation.startedAt}</span>
            </span>
            {negotiation.duration !== "—" ? (
              <span>
                Duration{" "}
                <span className="font-medium text-foreground">{negotiation.duration}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <style>{`
        .negotiation-modal-panel {
          animation: negotiationModalIn 0.22s ease-out;
        }
        @keyframes negotiationModalIn {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
