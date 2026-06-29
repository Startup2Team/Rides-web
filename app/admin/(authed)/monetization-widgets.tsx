"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { hasPermission } from "@/lib/admin-permissions";
import {
  MOCK_CAMPAIGNS,
  MOCK_ENTITLEMENTS,
  MOCK_PACKAGES,
  MOCK_PURCHASES,
  VEHICLE_LABELS,
  formatRWF,
  type Campaign,
  type PurchaseSnapshot,
} from "@/lib/packages-mock";

/* ───────────────────────────────────────────────────────────────────────── */
/* MonetizationGrid — composite widget for dashboards.                        */
/* Each child widget is gated by the relevant permission, so a role only      */
/* sees the widgets they have access to. Custom roles get the right view     */
/* automatically.                                                             */
/* ───────────────────────────────────────────────────────────────────────── */

export function MonetizationGrid() {
  const { permissions } = useAuth();
  const showRevenue = hasPermission(permissions, "/admin/purchases");
  const showRecent = hasPermission(permissions, "/admin/purchases");
  const showCampaigns = hasPermission(permissions, "/admin/campaigns");
  const showLowBalance = hasPermission(permissions, "/admin/entitlements");

  const visibleCount = [showRevenue, showRecent, showCampaigns, showLowBalance]
    .filter(Boolean).length;

  if (visibleCount === 0) return null;

  // Adapt grid columns to the number of visible widgets so they always fill nicely.
  const colsClass =
    visibleCount >= 4
      ? "lg:grid-cols-4"
      : visibleCount === 3
      ? "lg:grid-cols-3"
      : visibleCount === 2
      ? "lg:grid-cols-2"
      : "lg:grid-cols-1";

  return (
    <section aria-label="Monetization overview">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Monetization
        </h2>
        <p className="text-[11px] text-muted-foreground">
          Packages · Campaigns · Purchases · Entitlements
        </p>
      </div>
      <div className={`grid gap-4 sm:grid-cols-2 ${colsClass}`}>
        {showRevenue ? <PackageRevenueWidget /> : null}
        {showRecent ? <RecentPurchasesWidget /> : null}
        {showCampaigns ? <ActiveCampaignsWidget /> : null}
        {showLowBalance ? <LowBalanceDriversWidget /> : null}
      </div>
    </section>
  );
}

/**
 * Monetization dashboard widgets — wired to mock data today, swap to API
 * later when the package/campaign/entitlement endpoints ship.
 *
 * Same visual conventions as the existing dashboard widgets:
 * - `rounded-2xl border border-border bg-card` shell
 * - Hover lift + soft primary glow
 * - Header with title + small status pill
 * - Empty-state messaging
 */

/* ───────────────────────────────────────────────────────────────────────── */
/* 1. PackageRevenueWidget                                                    */
/*    Compact revenue summary from package purchases. Finance + Ops + Super.  */
/* ───────────────────────────────────────────────────────────────────────── */

export function PackageRevenueWidget() {
  const paid = MOCK_PURCHASES.filter((p) => p.status === "paid");
  const totalRevenue = paid.reduce((s, p) => s + p.pricePaid, 0);

  // Top-selling package by revenue
  const byPackage = new Map<string, { name: string; revenue: number; count: number }>();
  for (const p of paid) {
    const existing = byPackage.get(p.packageId);
    if (existing) {
      existing.revenue += p.pricePaid;
      existing.count += 1;
    } else {
      byPackage.set(p.packageId, { name: p.packageName, revenue: p.pricePaid, count: 1 });
    }
  }
  const top = [...byPackage.values()].sort((a, b) => b.revenue - a.revenue)[0] ?? null;
  const sharePct = top && totalRevenue > 0
    ? Math.round((top.revenue / totalRevenue) * 100)
    : 0;

  return (
    <WidgetShell title="Package revenue" pill="Today">
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

/* ───────────────────────────────────────────────────────────────────────── */
/* 2. RecentPurchasesWidget                                                   */
/*    Latest purchases — driver, package, status pill. Ops + Finance + Super. */
/* ───────────────────────────────────────────────────────────────────────── */

export function RecentPurchasesWidget() {
  const recent = [...MOCK_PURCHASES]
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
                  {p.packageName} · {VEHICLE_LABELS[p.vehicleType]}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {formatRWF(p.pricePaid)}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {purchaseStatusLabel(p)}
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

/* ───────────────────────────────────────────────────────────────────────── */
/* 3. LowBalanceDriversWidget                                                 */
/*    Drivers with <10 total rides left. Support + Ops + Super.               */
/* ───────────────────────────────────────────────────────────────────────── */

export function LowBalanceDriversWidget() {
  const lowBalance = MOCK_ENTITLEMENTS
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
                    {VEHICLE_LABELS[e.vehicleType]} · {e.vehiclePlate}
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

/* ───────────────────────────────────────────────────────────────────────── */
/* 4. ActiveCampaignsWidget                                                   */
/*    Active + scheduled campaigns. Finance + Ops + Super.                    */
/* ───────────────────────────────────────────────────────────────────────── */

export function ActiveCampaignsWidget() {
  const active = MOCK_CAMPAIGNS.filter((c) => c.status === "active");
  const scheduled = MOCK_CAMPAIGNS.filter((c) => c.status === "scheduled");
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
                    {audienceLabel(c)}
                  </p>
                </div>
                <CampaignBadge status={c.status} />
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

/* ───────────────────────────────────────────────────────────────────────── */
/* PRESENTATIONAL HELPERS                                                     */
/* ───────────────────────────────────────────────────────────────────────── */

function WidgetShell({
  title,
  pill,
  pillTone = "default",
  children,
  growBody,
}: {
  title: string;
  pill?: string;
  pillTone?: "default" | "warn";
  children: React.ReactNode;
  growBody?: boolean;
}) {
  const pillClass =
    pillTone === "warn"
      ? "bg-amber-100 text-amber-700"
      : "bg-primary/15 text-primary";
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {pill ? (
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${pillClass}`}>
            {pill}
          </span>
        ) : null}
      </div>
      <div className={`flex flex-col p-4 ${growBody ? "flex-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="flex flex-1 items-center justify-center py-8 text-center text-[11px] text-muted-foreground">
      {label}
    </p>
  );
}

function PurchaseStatusDot({ status }: { status: PurchaseSnapshot["status"] }) {
  const cls =
    status === "paid"
      ? "bg-emerald-500 ring-emerald-200"
      : status === "pending"
      ? "bg-amber-500 ring-amber-200"
      : status === "failed"
      ? "bg-red-500 ring-red-200"
      : "bg-zinc-400 ring-zinc-200";
  return (
    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${cls}`} aria-hidden />
  );
}

function purchaseStatusLabel(p: PurchaseSnapshot): string {
  if (p.status === "paid") return "Paid";
  if (p.status === "pending") return "Pending";
  if (p.status === "failed") return "Failed";
  if (p.status === "cancelled") return "Cancelled";
  return "Expired";
}

function CampaignBadge({ status }: { status: Campaign["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Live
      </span>
    );
  }
  if (status === "scheduled") {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">
        Scheduled
      </span>
    );
  }
  return null;
}

function audienceLabel(c: Campaign): string {
  if (c.audience === "all") return "All drivers";
  if (c.audience === "first-purchase") return "First purchase only";
  if (c.vehicleTypes && c.vehicleTypes.length > 0) {
    return c.vehicleTypes.map((v) => VEHICLE_LABELS[v]).join(" · ");
  }
  return "Custom audience";
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
