"use client";

import { StatCard } from "../_components";

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-4">
      <div className="h-2.5 w-24 rounded bg-muted/60" />
      <div className="mt-4 h-6 w-16 rounded bg-muted/60" />
      <div className="mt-2 h-2 w-32 rounded bg-muted/60" />
    </div>
  );
}

export function CustomerStats({
  total,
  active,
  suspended,
  loading = false,
}: {
  total: number;
  active: number;
  suspended: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Customers",
      value: total.toLocaleString(),
      hint: "all registered users",
    },
    {
      label: "Active Accounts",
      value: active.toLocaleString(),
      hint: "not suspended",
    },
    {
      label: "Suspended",
      value: suspended.toLocaleString(),
      hint: "restricted access",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
