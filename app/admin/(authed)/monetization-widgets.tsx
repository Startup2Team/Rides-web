"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { hasPermission } from "@/lib/admin-permissions";
import {
  getAdminPurchases,
  getAdminEntitlements,
  getAdminCampaigns,
  type PurchaseSnapshot,
  type Entitlement,
  type Campaign,
} from "@/lib/api";

const VEHICLE_LABELS: Record<string, string> = {
  moto: "Moto Bike",
  cab: "Cab Taxi",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
};

function formatRWF(amount: number): string {
  return `${amount.toLocaleString()} RWF`;
}

export function MonetizationGrid() {
  const { permissions } = useAuth();
  const showRevenue = hasPermission(permissions, "/admin/purchases");
  const showRecent = hasPermission(permissions, "/admin/purchases");
  const showCampaigns = hasPermission(permissions, "/admin/campaigns");
  const showLowBalance = hasPermission(permissions, "/admin/entitlements");

  if (!showRevenue && !showRecent && !showCampaigns && !showLowBalance) {
    return null;
  }

  return (
    <section className="mt-8 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Monetization & Driver Packages
          </h2>
          <p className="text-xs text-muted-foreground">
            Live overview of package sales, low balances, and promotional campaigns.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {showRevenue ? <PackageRevenueWidget /> : null}
        {showRecent ? <RecentPurchasesWidget /> : null}
        {showLowBalance ? <LowBalanceDriversWidget /> : null}
        {showCampaigns ? <ActiveCampaignsWidget /> : null}
      </div>
    </section>
  );
}

export function PackageRevenueWidget() {
  const [purchases, setPurchases] = useState<PurchaseSnapshot[]>([]);

  useEffect(() => {
    void getAdminPurchases().then(setPurchases).catch(() => setPurchases([]));
  }, []);

  const paid = purchases.filter((p) => p.status === "paid" || p.status === "completed" || p.status === "COMPLETED");
  const totalRevenue = paid.reduce((s, p) => s + (p.pricePaid ?? p.amountRwf ?? 0), 0);

  const byPackage = new Map<string, { name: string; revenue: number; count: number }>();
  for (const p of paid) {
    const price = p.pricePaid ?? p.amountRwf ?? 0;
    const existing = byPackage.get(p.packageId);
    if (existing) {
      existing.revenue += price;
      existing.count += 1;
    } else {
      byPackage.set(p.packageId, { name: p.packageName, revenue: price, count: 1 });
    }
  }
  const top = [...byPackage.values()].sort((a, b) => b.revenue - a.revenue)[0] ?? null;
  const sharePct = top && totalRevenue > 0 ? Math.round((top.revenue / totalRevenue) * 100) : 0;

  return (
    <WidgetShell title="Package revenue" pill="Live">
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {formatRWF(totalRevenue)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {paid.length} paid {paid.length === 1 ? "purchase" : "purchases"}
      </p>

      {top ? (
        <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Top seller
          </p>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {top.name}
            </p>
            <p className="shrink-0 text-xs font-bold tabular-nums text-primary">
              {sharePct}%
            </p>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {formatRWF(top.revenue)} · {top.count} {top.count === 1 ? "sale" : "sales"}
          </p>
        </div>
      ) : null}

      <Link
        href="/admin/purchases"
        className="mt-auto inline-flex items-center gap-1 self-start pt-3 text-[11px] font-semibold text-primary hover:underline"
      >
        View all purchases <Chevron />
      </Link>
    </WidgetShell>
  );
}

export function RecentPurchasesWidget() {
  const [purchases, setPurchases] = useState<PurchaseSnapshot[]>([]);

  useEffect(() => {
    void getAdminPurchases().then(setPurchases).catch(() => setPurchases([]));
  }, []);

  const recent = [...purchases]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <WidgetShell title="Recent purchases" pill="Live" growBody>
      {recent.length === 0 ? (
        <EmptyState label="No purchases yet." />
      ) : (
        <ol className="-mx-1 space-y-1">
          {recent.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
              <PurchaseStatusDot status={p.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {p.driverName}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {p.packageName} · {VEHICLE_LABELS[p.vehicleType ?? "moto"] ?? p.vehicleType}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {formatRWF(p.pricePaid ?? p.amountRwf ?? 0)}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.status}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link
        href="/admin/purchases"
        className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-primary hover:underline"
      >
        See all <Chevron />
      </Link>
    </WidgetShell>
  );
}

export function LowBalanceDriversWidget() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  useEffect(() => {
    void getAdminEntitlements().then(setEntitlements).catch(() => setEntitlements([]));
  }, []);

  const lowBalance = entitlements
    .filter((e) => e.ridesRemaining + e.bonusRidesRemaining < 10)
    .sort(
      (a, b) =>
        a.ridesRemaining + a.bonusRidesRemaining - (b.ridesRemaining + b.bonusRidesRemaining),
    )
    .slice(0, 5);

  return (
    <WidgetShell
      title="Low-balance drivers"
      pill="Needs attention"
      pillTone="warn"
      growBody
    >
      {lowBalance.length === 0 ? (
        <EmptyState label="Every active driver has enough rides. 🎉" />
      ) : (
        <ol className="-mx-1 space-y-1">
          {lowBalance.map((e) => {
            const total = e.ridesRemaining + e.bonusRidesRemaining;
            return (
              <li key={e.id} className="flex items-center gap-3 rounded-xl px-1 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200">
                  <span className="text-xs font-bold">{total}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {e.driverName}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {VEHICLE_LABELS[e.vehicleType] ?? e.vehicleType} · {e.vehiclePlate ?? "—"}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                  {total} left
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <Link
        href="/admin/entitlements"
        className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-primary hover:underline"
      >
        Open entitlement tools <Chevron />
      </Link>
    </WidgetShell>
  );
}

export function ActiveCampaignsWidget() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    void getAdminCampaigns().then(setCampaigns).catch(() => setCampaigns([]));
  }, []);

  const active = campaigns.filter((c) => c.status === "active");
  const scheduled = campaigns.filter((c) => c.status === "scheduled");
  const featured: Campaign[] = [...active, ...scheduled].slice(0, 4);

  return (
    <WidgetShell title="Campaigns" pill={`${active.length} live`} growBody>
      {featured.length === 0 ? (
        <EmptyState label="No active or scheduled campaigns." />
      ) : (
        <ul className="-mx-1 space-y-1">
          {featured.map((c) => (
            <li key={c.id} className="rounded-xl px-1 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {c.description || "Active campaign"}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  {c.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/admin/campaigns"
        className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-semibold text-primary hover:underline"
      >
        Manage campaigns <Chevron />
      </Link>
    </WidgetShell>
  );
}

function WidgetShell({
  title,
  pill,
  pillTone = "neutral",
  growBody,
  children,
}: {
  title: string;
  pill?: string;
  pillTone?: "neutral" | "warn" | "success";
  growBody?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
        {pill ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              pillTone === "warn"
                ? "bg-amber-100 text-amber-700"
                : pillTone === "success"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {pill}
          </span>
        ) : null}
      </div>
      <div className={growBody ? "flex flex-1 flex-col justify-between" : ""}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{label}</p>;
}

function PurchaseStatusDot({ status }: { status: string }) {
  const isPaid = status === "paid" || status === "completed" || status === "COMPLETED";
  const isPending = status === "pending" || status === "PENDING";
  return (
    <span
      className={`h-2 w-2 rounded-full ${
        isPaid ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-rose-500"
      }`}
    />
  );
}

function Chevron() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
