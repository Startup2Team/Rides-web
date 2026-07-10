"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type Period = "today" | "week" | "month" | "custom";

const periods: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "custom", label: "Custom" },
];

export function periodToDays(p: Period): number {
  switch (p) {
    case "week": return 7;
    case "month": return 30;
    default: return 1;
  }
}

type Readable = URLSearchParams | { get(k: string): string | null };
export function readPeriod(params: Readable): Period {
  const v = params.get("period");
  return v === "week" || v === "month" || v === "custom" ? v : "today";
}

export function readCustomRange(params: Readable): { from: string; to: string } | null {
  const from = params.get("from");
  const to = params.get("to");
  if (from && to && /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { from, to };
  }
  return null;
}

function formatShortDate(iso: string): string {
  // iso = YYYY-MM-DD — parse as local date to avoid TZ surprises in labels
  const [y, m, d] = iso.split("-").map((s) => parseInt(s, 10));
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function periodLabel(p: Period, range: { from: string; to: string } | null): string {
  if (p === "custom" && range) {
    return `${formatShortDate(range.from)} – ${formatShortDate(range.to)}`;
  }
  switch (p) {
    case "week": return "This Week";
    case "month": return "This Month";
    case "custom": return "Custom";
    default: return "Today";
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = readPeriod(searchParams);
  const existingRange = readCustomRange(searchParams);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [from, setFrom] = useState(existingRange?.from ?? "");
  const [to, setTo] = useState(existingRange?.to ?? "");
  const [error, setError] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!popoverOpen) return;
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopoverOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [popoverOpen]);

  // Keep local inputs in sync with URL changes (e.g., back/forward)
  useEffect(() => {
    setFrom(existingRange?.from ?? "");
    setTo(existingRange?.to ?? "");
  }, [existingRange?.from, existingRange?.to]);

  const setStandardPeriod = (p: Period) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("from");
    next.delete("to");
    if (p === "today") next.delete("period");
    else next.set("period", p);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const applyCustom = () => {
    setError(null);
    if (!from || !to) {
      setError("Pick both a start and end date.");
      return;
    }
    if (from > to) {
      setError("Start date must be on or before end date.");
      return;
    }
    if (from > today()) {
      setError("Start date can't be in the future.");
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.set("period", "custom");
    next.set("from", from);
    next.set("to", to);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    setPopoverOpen(false);
  };

  const onClick = (p: Period) => {
    if (p === "custom") {
      setPopoverOpen((v) => !v);
      return;
    }
    setPopoverOpen(false);
    setStandardPeriod(p);
  };

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      {periods.map((p) => {
        const active = selected === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onClick(p.id)}
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

      {popoverOpen ? (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-border bg-card p-3 shadow-xl"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Custom range
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-medium text-muted-foreground">From</span>
              <input
                type="date"
                value={from}
                max={to || today()}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 block h-9 w-full rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-medium text-muted-foreground">To</span>
              <input
                type="date"
                value={to}
                min={from || undefined}
                max={today()}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 block h-9 w-full rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setPopoverOpen(false)}
              className="h-7 rounded-md px-2.5 text-[11px] font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCustom}
              disabled={!from || !to}
              className="h-7 rounded-md bg-primary px-3 text-[11px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
