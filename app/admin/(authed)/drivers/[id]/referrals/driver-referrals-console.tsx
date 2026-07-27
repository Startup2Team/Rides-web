"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, Card, StatCard } from "../../../_components";
import { getDriver, getDriverReferrals, type ReferredDriver } from "@/lib/api";
import { formatReferredDriverLine, referralCountLabel } from "@/lib/referrals";
import { formatTransportType, mapDriverDetailToVerify } from "@/lib/drivers";

type StatusFilter = "all" | "Pending" | "Approved" | "Rejected";
type DateFilter = "all" | "today" | "week" | "month";

function referredStatusLabel(status: string): string {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "Approved";
  if (s === "REJECTED") return "Rejected";
  if (s === "SUSPENDED") return "Suspended";
  return "Pending";
}

function statusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (s === "REJECTED") return "bg-rose-50 text-rose-700 ring-rose-100";
  if (s === "SUSPENDED") return "bg-red-50 text-red-700 ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-100";
}

export function DriverReferralsConsole({ driverId }: { driverId: string }) {
  const router = useRouter();
  const [referrerName, setReferrerName] = useState<string>("Driver");
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referrals, setReferrals] = useState<ReferredDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await getDriver(driverId);

      if (!detail) throw new Error("Driver not found");

      const verify = mapDriverDetailToVerify(detail);
      setReferrerName(verify.name);
      setReferralCount(verify.referralCount);

      const rows = await getDriverReferrals(driverId);
      setReferrals(rows);
    } catch (err) {
      setReferrals([]);
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return referrals.filter((r) => {
      if (statusFilter !== "all") {
        if (referredStatusLabel(r.approval_status) !== statusFilter) return false;
      }

      if (dateFilter !== "all" && r.created_at) {
        const t = new Date(r.created_at).getTime();
        if (dateFilter === "today" && now - t > 24 * 60 * 60 * 1000) return false;
        if (dateFilter === "week" && now - t > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateFilter === "month" && now - t > 30 * 24 * 60 * 60 * 1000) return false;
      }

      if (q) {
        const hay = formatReferredDriverLine(r).toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [referrals, query, statusFilter, dateFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [filtered],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/drivers?vehicle=moto");
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Referrals
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {referrerName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {referralCountLabel(referralCount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total referred"
          value={String(referralCount)}
          hint="drivers joined via this referrer"
          tone="primary"
        />
        <StatCard
          label="Showing"
          value={String(sorted.length)}
          hint={
            query || statusFilter !== "all" || dateFilter !== "all"
              ? "after filters"
              : "all referred drivers"
          }
        />
        <StatCard
          label="Latest join"
          value={
            sorted[0]?.created_at
              ? new Date(sorted[0].created_at).toLocaleDateString()
              : "—"
          }
          hint="most recent referred driver"
        />
      </div>

      <Card
        title="Referred drivers"
        action={
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, plate…"
              className="h-8 flex-1 sm:w-44 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="Pending">Pending review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">Joined: All time</option>
              <option value="today">Joined: Today</option>
              <option value="week">Joined: Last 7 days</option>
              <option value="month">Joined: Last 30 days</option>
            </select>
          </div>
        }
      >
        {error ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Loading referred drivers…
          </p>
        ) : referralCount === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            This driver has not referred anyone onto the platform yet.
          </p>
        ) : sorted.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No referred drivers match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Driver
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Vehicle
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((r) => {
                  const name = r.full_name?.trim() || r.phone || "Unknown driver";
                  return (
                    <tr key={r.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={name} />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {r.vehicle_plate ?? "—"}
                            </p>
                            {r.phone ? (
                              <p className="text-[10px] text-muted-foreground sm:hidden">{r.phone}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {r.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatTransportType(r.transport_type)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusBadgeClass(r.approval_status)}`}
                        >
                          {referredStatusLabel(r.approval_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/drivers/${r.id}`}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-muted/60"
                        >
                          Driver Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
