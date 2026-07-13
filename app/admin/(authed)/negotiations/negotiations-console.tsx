"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader, Avatar, Card } from "../_components";
import { NegotiationsStatsCards } from "./negotiations-stats";
import {
  PeriodFilter,
  periodLabel,
  readCustomRange,
  readPeriod,
  timestampInPeriod,
} from "../_period-filter";
import {
  NegotiationModal,
  type NegotiationDetail,
  type NegotiationStatus,
  type Offer,
} from "./negotiation-modal";
import {
  getNegotiations,
  getNegotiation,
  type Negotiation as ApiNegotiation,
  type RideDetail as ApiRideDetail,
  NO_BACKEND,
} from "@/lib/api";
import { MOCK_NEGOTIATIONS, MOCK_NEGOTIATION_DETAILS } from "@/lib/mock-negotiations";
import {
  type CommFilter,
  communicationMode,
  matchesCommFilter,
} from "@/lib/negotiation-rules";
import { GenerateReportButton } from "../reports/generate-report-button";
import type { ReportMeta } from "../reports/report-content";

const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike", CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux", HEAVY_FUSO: "Heavy Fuso",
};
function toVehicleLabel(code: string): string {
  return TRANSPORT_DISPLAY[code] ?? code;
}

function mapNegStatus(s: string): NegotiationStatus {
  if (s === "Agreed" || s === "COMPLETED") return "Agreed";
  if (s === "Failed" || s === "CANCELLED") return "Failed";
  if (s === "Disputed" || s === "DISPUTED") return "Disputed";
  return "In progress";
}

function mapApiNegotiation(n: ApiNegotiation): Negotiation {
  const custName = n.customer?.name ?? n.customer?.phone ?? "Unknown";
  const driverName = n.driver?.name ?? null;
  return {
    id: n.id,
    customer: { name: custName, phone: n.customer?.phone ?? "", rating: 0 },
    driver: driverName
      ? {
          name: driverName,
          phone: n.driver?.phone ?? "",
          vehicleType: toVehicleLabel(n.transport_type),
          plate: n.driver?.plate ?? "—",
          rating: 0,
        }
      : null,
    pickup: n.pickup_address,
    destination: n.destination_address,
    vehicleType: toVehicleLabel(n.transport_type),
    initial: n.initial_fare ?? 0,
    final: n.agreed_fare ?? null,
    rounds: n.rounds,
    status: mapNegStatus(n.status),
    startedAt: new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    duration: "—",
    offers: [],
    lastCustomerOffer: null,
    lastDriverOffer: null,
    priceGap: null,
    waitingOn: null,
    _transportCode: n.transport_type,
    createdAt: new Date(n.created_at).getTime(),
  };
}

type Negotiation = NegotiationDetail & { _transportCode: string; createdAt: number };

function mergeDetail(base: Negotiation, detail: ApiRideDetail): Negotiation {
  const offers: Offer[] = (detail.negotiation_rounds ?? []).map((r, i) => ({
    round: r.round ?? i + 1,
    from: (r.proposed_by === "DRIVER" ? "driver" : "customer") as "customer" | "driver",
    amount: r.amount,
    time: new Date(r.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    response: r.response,
  }));

  const lastCustomer = [...offers].reverse().find((o) => o.from === "customer");
  const lastDriver = [...offers].reverse().find((o) => o.from === "driver");
  const priceGap =
    lastCustomer && lastDriver
      ? Math.abs(lastCustomer.amount - lastDriver.amount)
      : null;
  const lastOffer = offers.at(-1);
  const waitingOn: NegotiationDetail["waitingOn"] =
    base.status === "In progress" && lastOffer
      ? lastOffer.from === "customer"
        ? "driver"
        : "customer"
      : null;

  let duration = "—";
  if (detail.completed_at) {
    const ms = new Date(detail.completed_at).getTime() - new Date(detail.created_at).getTime();
    const mins = Math.round(ms / 60000);
    duration = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  const lastRound = detail.negotiation_rounds?.at(-1);
  let failureReason: string | undefined;
  if (base.status === "Failed") {
    if (lastRound?.response === "DECLINED") {
      const decliner = lastRound.proposed_by === "CUSTOMER" ? "Driver" : "Rider";
      failureReason = `${decliner} declined ${formatRWF(lastRound.amount)} on the final round.`;
    } else {
      failureReason = "Negotiation ended without both parties accepting the same price.";
    }
  }

  let notes: string | undefined;
  if (base.status === "Disputed") {
    notes =
      "Agreed price is on record but flagged — confirm rider and driver match on the amount.";
  }

  return {
    ...base,
    offers,
    rounds: offers.length || base.rounds,
    duration,
    final: detail.agreed_fare ?? base.final,
    lastCustomerOffer: lastCustomer?.amount ?? null,
    lastDriverOffer: lastDriver?.amount ?? null,
    priceGap,
    waitingOn,
    failureReason,
    notes,
  };
}

const VEHICLE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All vehicles" },
  { id: "MOTO_BIKE", label: "Moto Bike" },
  { id: "CAB_TAXI", label: "Cab Taxi" },
  { id: "LIGHT_HILUX", label: "Light Hilux" },
  { id: "HEAVY_FUSO", label: "Heavy Fuso" },
];

const COMM_FILTERS: { id: CommFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chat", label: "Chat" },
  { id: "call", label: "Call" },
];

function sortSimplest(list: Negotiation[]): Negotiation[] {
  return [...list].sort((a, b) => {
    if (a.rounds !== b.rounds) return a.rounds - b.rounds;
    return b.createdAt - a.createdAt;
  });
}

type ViewMode = "grid" | "table";
const PAGE_SIZE = 8;

function formatRWF(n: number) {
  return `${n.toLocaleString("en-US")} RWF`;
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const btn = (mode: ViewMode, label: string, icon: React.ReactNode) => {
    const active = value === mode;
    return (
      <button
        type="button"
        onClick={() => onChange(mode)}
        aria-label={label}
        aria-pressed={active}
        className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
          active
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {icon}
      </button>
    );
  };
  return (
    <div className="flex items-center rounded-lg border border-border bg-surface p-0.5">
      {btn(
        "grid",
        "Grid view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>,
      )}
      {btn(
        "table",
        "Table view",
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>,
      )}
    </div>
  );
}

function NegotiationCard({
  negotiation,
  onOpen,
}: {
  negotiation: Negotiation;
  onOpen: () => void;
}) {
  const uplift =
    negotiation.final !== null
      ? Math.round(
          ((negotiation.final - negotiation.initial) / negotiation.initial) * 100,
        )
      : null;
  const mode = communicationMode(negotiation.status);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-foreground">
          {negotiation.id}
        </span>
        {negotiation.final !== null ? (
          <span className="text-xs font-bold text-primary">
            {formatRWF(negotiation.final)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-start gap-2">
        <div className="mt-0.5 flex flex-col items-center">
          <span className="block h-2 w-2 rounded-full bg-primary" />
          <span className="my-0.5 block h-4 w-px bg-border" />
          <span className="block h-2 w-2 rounded-full bg-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {negotiation.pickup}
          </p>
          <p className="mt-2 truncate text-xs font-semibold text-foreground">
            {negotiation.destination}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface/50 p-2.5">
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rider offer → Agreed
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {formatRWF(negotiation.initial)} →{" "}
            {negotiation.final !== null ? formatRWF(negotiation.final) : "—"}
          </p>
          {uplift !== null ? (
            <p
              className={`text-[10px] font-semibold ${
                uplift > 0
                  ? "text-amber-600"
                  : uplift < 0
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {uplift > 0 ? "+" : ""}
              {uplift}% · {negotiation.rounds} rounds
            </p>
          ) : (
            <p className="text-[10px] font-semibold text-muted-foreground">
              {negotiation.rounds} rounds
            </p>
          )}
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {mode}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle · Duration
          </p>
          <p className="mt-0.5 truncate text-xs font-bold text-foreground">
            {negotiation.vehicleType}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {negotiation.duration}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={negotiation.customer.name} tone="neutral" size="sm" />
          <span className="truncate text-[11px] text-foreground">
            {negotiation.customer.name.split(" ")[0]}
          </span>
        </div>
        {negotiation.driver ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={negotiation.driver.name} size="sm" />
            <span className="truncate text-[11px] text-foreground">
              {negotiation.driver.name.split(" ")[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            No driver
          </span>
        )}
      </div>
    </button>
  );
}

export function NegotiationsConsole() {
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const customRange = readCustomRange(searchParams);
  const periodText = periodLabel(period, customRange);

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [commFilter, setCommFilter] = useState<CommFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    setPage(1);
  }, [period, customRange?.from, customRange?.to, commFilter]);

  useEffect(() => {
    getNegotiations({ limit: "100", offset: "0" })
      .then((res) => {
        const rows = res.negotiations?.length ? res.negotiations : (NO_BACKEND ? MOCK_NEGOTIATIONS : []);
        setNegotiations(rows.map(mapApiNegotiation));
      })
      .catch(() => setNegotiations(NO_BACKEND ? MOCK_NEGOTIATIONS.map(mapApiNegotiation) : []));
  }, []);

  const openNegotiation = (id: string) => {
    setViewingId(id);
    getNegotiation(id)
      .then((detail) => {
        setNegotiations((prev) =>
          prev.map((n) => (n.id === id ? mergeDetail(n, detail) : n))
        );
      })
      .catch(() => {
        if (!NO_BACKEND) return;
        const detail = MOCK_NEGOTIATION_DETAILS[id];
        if (!detail) return;
        setNegotiations((prev) =>
          prev.map((n) => (n.id === id ? mergeDetail(n, detail) : n))
        );
      });
  };

  const filtered = useMemo(() => {
    return negotiations.filter((n) => {
      if (!matchesCommFilter(n, commFilter)) return false;
      if (!timestampInPeriod(n.createdAt, period, customRange)) return false;
      if (vehicleFilter !== "all" && n._transportCode !== vehicleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          n.id.toLowerCase().includes(q) ||
          n.customer.name.toLowerCase().includes(q) ||
          (n.driver?.name.toLowerCase().includes(q) ?? false) ||
          n.pickup.toLowerCase().includes(q) ||
          n.destination.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [negotiations, commFilter, period, customRange, vehicleFilter, query]);

  const sorted = useMemo(() => sortSimplest(filtered), [filtered]);
  const listTitle = commFilter === "all" ? "Agreed prices" : "Negotiations";

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, sorted.length);
  const paginated = sorted.slice(start, end);

  const viewing = viewingId ? negotiations.find((n) => n.id === viewingId) ?? null : null;

  const reportMeta: ReportMeta = useMemo(
    () => ({
      scopeLabel: periodText,
      period,
      customRange,
      filters: { vehicle: vehicleFilter, status: "all" },
    }),
    [periodText, period, customRange, vehicleFilter],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Fare negotiations"
        subtitle="Clean agreed prices between riders and drivers — rider offer, final fare, and who was involved."
        action={<GenerateReportButton templateId="negotiation-stats" meta={reportMeta} />}
      />

      <NegotiationsStatsCards />

      <Card
      title={listTitle}
      action={
        <div className="flex items-center gap-2">
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      }
    >
        <div className="flex flex-col gap-2 border-b border-border px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Period
              </p>
              <div className="mt-1.5">
                <PeriodFilter />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground sm:text-right">
              {periodText} · both parties agreed · fewest rounds first
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-border px-3 py-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
              {COMM_FILTERS.map((c) => {
                const active = commFilter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCommFilter(c.id);
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
              {VEHICLE_FILTERS.map((v) => {
                const active = vehicleFilter === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVehicleFilter(v.id);
                      setPage(1);
                    }}
                    className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <input
              type="search"
              placeholder="Search ID, rider, driver, route…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="h-8 w-full rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary lg:w-64"
            />
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="p-4">
            {paginated.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                {period === "custom" && !customRange
                  ? "Pick a start and end date, then click Apply."
                  : `No negotiations match ${periodText.toLowerCase()} and your filters.`}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginated.map((n) => (
                  <NegotiationCard
                    key={n.id}
                    negotiation={n}
                    onOpen={() => openNegotiation(n.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Route
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Parties
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Rider offer
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Agreed
                </th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Offers
                </th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    {period === "custom" && !customRange
                      ? "Pick a start and end date, then click Apply."
                      : `No negotiations match ${periodText.toLowerCase()} and your filters.`}
                  </td>
                </tr>
              ) : (
                paginated.map((n) => {
                  const uplift =
                    n.final !== null
                      ? Math.round(((n.final - n.initial) / n.initial) * 100)
                      : null;
                  return (
                    <tr
                      key={n.id}
                      className="cursor-pointer hover:bg-surface/50"
                      onClick={() => openNegotiation(n.id)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                        {n.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-foreground">
                          {n.pickup} → {n.destination}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {n.vehicleType}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={n.customer.name} tone="neutral" size="sm" />
                          <span className="text-xs text-foreground">
                            {n.customer.name}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {n.driver ? (
                            <>
                              <Avatar name={n.driver.name} size="sm" />
                              <span className="text-[11px] text-muted-foreground">
                                {n.driver.name}
                              </span>
                            </>
                          ) : (
                            <span className="pl-9 text-[11px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatRWF(n.initial)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {n.final !== null ? (
                          <div>
                            <div>{formatRWF(n.final)}</div>
                            {uplift !== null ? (
                              <div
                                className={`text-[10px] font-semibold ${
                                  uplift > 0
                                    ? "text-amber-600"
                                    : uplift < 0
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {uplift > 0 ? "+" : ""}
                                {uplift}%
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {n.rounds}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {communicationMode(n.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {sorted.length === 0 ? 0 : start + 1}–{end}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{sorted.length}</span>{" "}
            {commFilter === "all" ? "agreed prices" : "negotiations"}
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
              of{" "}
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

      <NegotiationModal negotiation={viewing} onClose={() => setViewingId(null)} />
    </div>
  );
}
