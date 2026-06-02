"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getCustomersOverview, type CustomerOverview } from "@/lib/api";

export function CustomerStats() {
  const [data, setData] = useState<CustomerOverview | null>(null);

  useEffect(() => {
    getCustomersOverview().then(setData).catch(() => null);
  }, []);

  const stats = [
    {
      label: "Total Customers",
      value: data ? data.total.toLocaleString() : "—",
      hint: "all registered users",
    },
    {
      label: "Active This Week",
      value: data ? data.active_this_week.toLocaleString() : "—",
      hint: "placed ≥ 1 trip",
    },
    {
      label: "Active Accounts",
      value: data ? data.active.toLocaleString() : "—",
      hint: "not suspended",
    },
    {
      label: "Suspended",
      value: data ? data.suspended.toLocaleString() : "—",
      hint: "restricted access",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
