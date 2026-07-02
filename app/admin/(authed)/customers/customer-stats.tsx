"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getCustomersOverview, type CustomerOverview } from "@/lib/api";
import { MOCK_API_CUSTOMERS } from "@/lib/mock-customers";

import { useDevMocks } from "@/lib/backend-config";

function mockOverview(): CustomerOverview {
  const active = MOCK_API_CUSTOMERS.filter((c) => !c.is_suspended).length;
  const suspended = MOCK_API_CUSTOMERS.filter((c) => c.is_suspended).length;
  return {
    total: MOCK_API_CUSTOMERS.length,
    active,
    suspended,
    active_this_week: active,
  };
}

export function CustomerStats() {
  const [data, setData] = useState<CustomerOverview | null>(
    useDevMocks ? mockOverview() : null,
  );

  useEffect(() => {
    if (useDevMocks) return;
    getCustomersOverview()
      .then((res) => {
        setData({
          total: res.total + MOCK_API_CUSTOMERS.length,
          active: res.active + MOCK_API_CUSTOMERS.filter((c) => !c.is_suspended).length,
          suspended: res.suspended + MOCK_API_CUSTOMERS.filter((c) => c.is_suspended).length,
          active_this_week: res.active_this_week + MOCK_API_CUSTOMERS.filter((c) => !c.is_suspended).length,
        });
      })
      .catch(() => null);
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
