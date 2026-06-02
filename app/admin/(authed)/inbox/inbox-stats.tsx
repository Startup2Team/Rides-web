"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../_components";
import { getInboxStats, type InboxStats } from "@/lib/api";

export function InboxStatsCards() {
  const [data, setData] = useState<InboxStats | null>(null);

  useEffect(() => {
    getInboxStats().then(setData).catch(() => null);
  }, []);

  const stats = [
    { label: "New Messages", value: data ? String(data.new) : "—", hint: "awaiting reply" },
    { label: "Replied (7d)", value: data ? String(data.replied_7d) : "—", hint: "this week" },
    { label: "Spam", value: data ? String(data.spam) : "—", hint: "filtered out" },
    { label: "Total Inbox", value: data ? String(data.new + data.replied_7d) : "—", hint: "new + recent replies" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
