"use client";

import { useState } from "react";

type Period = "today" | "week" | "month" | "custom";

const periods: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "custom", label: "Custom" },
];

export function PeriodFilter() {
  const [selected, setSelected] = useState<Period>("today");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {periods.map((p) => {
        const active = selected === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={`inline-flex h-8 items-center rounded-full px-3 text-[11px] font-semibold transition-colors ${
              active
                ? "border border-primary/30 bg-primary/10 text-primary"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
