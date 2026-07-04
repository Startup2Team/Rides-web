"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Card, StatCard } from "../_components";
import {
  VEHICLE_LABELS,
  formatDateTime,
  type Entitlement,
  type EntitlementTransaction,
  type EntitlementTransactionKind,
} from "@/lib/packages-mock";
import { getAdminEntitlements } from "@/lib/api";
import { GrantRidesModal } from "./grant-rides-modal";

type GrantTarget = {
  entitlementId: string;
  driverName: string;
  vehicleLabel: string;
} | null;

const TXN_LABEL: Record<EntitlementTransactionKind, string> = {
  "purchase-grant": "Purchase",
  "ride-deduction": "Ride",
  "admin-grant": "Admin grant",
  "admin-revoke": "Admin revoke",
};

const TXN_COLOUR: Record<EntitlementTransactionKind, string> = {
  "purchase-grant": "text-primary",
  "ride-deduction": "text-muted-foreground",
  "admin-grant": "text-emerald-600",
  "admin-revoke": "text-red-600",
};

export function EntitlementsConsole() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [grantTarget, setGrantTarget] = useState<GrantTarget>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    getAdminEntitlements()
      .then(setEntitlements)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load entitlements"));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!query.trim()) return entitlements;
    const q = query.toLowerCase().trim();
    return entitlements.filter((e) =>
      [e.driverName, e.driverPhone, e.vehiclePlate]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [entitlements, query]);

  const openEntitlement = openId
    ? entitlements.find((e) => e.id === openId) ?? null
    : null;

  /* Stats */
  const totalRides = entitlements.reduce((s, e) => s + e.ridesRemaining, 0);
  const totalBonus = entitlements.reduce((s, e) => s + e.bonusRidesRemaining, 0);
  const driversWithLowBalance = entitlements.filter(
    (e) => e.ridesRemaining + e.bonusRidesRemaining < 10,
  ).length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active drivers" value={String(entitlements.length)} tone="primary" />
        <StatCard label="Rides remaining" value={totalRides.toLocaleString()} />
        <StatCard
          label="Bonus rides remaining"
          value={totalBonus.toLocaleString()}
          hint="Across all drivers"
        />
        <StatCard
          label="Low-balance drivers"
          value={String(driversWithLowBalance)}
          tone={driversWithLowBalance > 0 ? "alert" : "default"}
          hint="< 10 rides left"
        />
      </div>

      <Card>
        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search driver by name, phone or plate…"
              className="block min-h-[44px] w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3 text-right">Rides left</th>
                <th className="px-4 py-3 text-right">Bonus left</th>
                <th className="px-4 py-3 text-right">Granted (lifetime)</th>
                <th className="px-4 py-3 text-right">Consumed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No drivers match this search.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const lowBalance = e.ridesRemaining + e.bonusRidesRemaining < 10;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setOpenId(e.id)}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={e.driverName} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{e.driverName}</p>
                            <p className="text-xs text-muted-foreground">{e.driverPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {VEHICLE_LABELS[e.vehicleType]}
                          </span>
                          <span className="mt-1 font-mono text-[11px] text-muted-foreground">
                            {e.vehiclePlate}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`font-bold tabular-nums ${lowBalance ? "text-amber-600" : "text-foreground"}`}>
                          {e.ridesRemaining}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-emerald-600">
                        +{e.bonusRidesRemaining}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                        {e.totalGranted}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-muted-foreground">
                        {e.totalConsumed}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setGrantTarget({
                              entitlementId: e.id,
                              driverName: e.driverName,
                              vehicleLabel: `${VEHICLE_LABELS[e.vehicleType]} · ${e.vehiclePlate}`,
                            });
                          }}
                          className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          + Grant
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail drawer */}
      {openEntitlement ? (
        <DetailDrawer
          entitlement={openEntitlement}
          onClose={() => setOpenId(null)}
          onGrant={() =>
            setGrantTarget({
              entitlementId: openEntitlement.id,
              driverName: openEntitlement.driverName,
              vehicleLabel: `${VEHICLE_LABELS[openEntitlement.vehicleType]} · ${openEntitlement.vehiclePlate}`,
            })
          }
        />
      ) : null}

      {/* Grant modal */}
      {grantTarget ? (
        <GrantRidesModal
          target={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={() => {
            setGrantTarget(null);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function DetailDrawer({
  entitlement,
  onClose,
  onGrant,
}: {
  entitlement: Entitlement;
  onClose: () => void;
  onGrant: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label={`Entitlement — ${entitlement.driverName}`}
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <Avatar name={entitlement.driverName} />
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {entitlement.driverName}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entitlement.driverPhone}
              </p>
              <p className="mt-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {VEHICLE_LABELS[entitlement.vehicleType]}
                </span>
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                  {entitlement.vehiclePlate}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Balances */}
          <section className="rounded-2xl border border-border bg-muted/20 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Current balances
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Big label="Rides remaining" value={String(entitlement.ridesRemaining)} />
              <Big
                label="Bonus rides remaining"
                value={`+${entitlement.bonusRidesRemaining}`}
                valueClass="text-emerald-600"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <p>Total granted: <strong className="text-foreground">{entitlement.totalGranted}</strong></p>
              <p>Total consumed: <strong className="text-foreground">{entitlement.totalConsumed}</strong></p>
            </div>
          </section>

          {/* Actions */}
          <section className="flex gap-2">
            <button
              type="button"
              onClick={onGrant}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              + Grant rides
            </button>
            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              − Revoke rides
            </button>
          </section>

          {/* Transaction log */}
          <section>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Transaction history
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Every balance change comes from one of these transactions.
            </p>
            <ol className="mt-4 space-y-2.5">
              {entitlement.transactions.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-center text-xs text-muted-foreground">
                  No transactions yet.
                </li>
              ) : (
                entitlement.transactions.map((t) => <TxnRow key={t.id} txn={t} />)
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function TxnRow({ txn }: { txn: EntitlementTransaction }) {
  const sign = (n: number) => (n > 0 ? `+${n}` : String(n));
  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${TXN_COLOUR[txn.kind]}`}>
            {TXN_LABEL[txn.kind]}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDateTime(txn.createdAt)}
            {txn.performedBy ? ` · ${txn.performedBy}` : ""}
          </p>
        </div>
        <div className="text-right text-xs tabular-nums">
          {txn.ridesDelta !== 0 ? (
            <p className="font-bold text-foreground">{sign(txn.ridesDelta)} rides</p>
          ) : null}
          {txn.bonusRidesDelta !== 0 ? (
            <p className="font-semibold text-emerald-600">
              {sign(txn.bonusRidesDelta)} bonus
            </p>
          ) : null}
          <p className="mt-0.5 text-muted-foreground">
            → {txn.ridesAfter} / +{txn.bonusRidesAfter}
          </p>
        </div>
      </div>
      {txn.reason ? (
        <p className="mt-2 border-t border-border pt-2 text-xs italic text-muted-foreground">
          “{txn.reason}”
        </p>
      ) : null}
      <p className="mt-2 border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
        ref: {txn.sourceRef}
      </p>
    </li>
  );
}

function Big({
  label,
  value,
  valueClass = "text-foreground",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
