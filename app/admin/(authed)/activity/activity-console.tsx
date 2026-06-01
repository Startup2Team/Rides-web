"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getRecentActivity, type RecentActivity } from "@/lib/api";

const PAGE_SIZE = 30;

const TYPE_GROUPS: { id: string; label: string; matches: string[] }[] = [
  { id: "all", label: "All", matches: [] },
  { id: "rides", label: "Rides", matches: ["ride."] },
  { id: "drivers", label: "Drivers", matches: ["driver."] },
  { id: "customers", label: "Customers", matches: ["customer."] },
  { id: "gps", label: "GPS", matches: ["gps."] },
];

function matchesGroup(eventType: string, prefixes: string[]): boolean {
  if (prefixes.length === 0) return true;
  return prefixes.some((p) => eventType.startsWith(p));
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      {children}
    </svg>
  );
}

function eventVisual(type: string): { icon: ReactNode; tone: "positive" | "neutral" | "warn" } {
  if (type === "ride.created") return { tone: "positive", icon: <Icon><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" fill="currentColor" /></Icon> };
  if (type === "ride.completed") return { tone: "positive", icon: <Icon><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></Icon> };
  if (type === "ride.cancelled") return { tone: "warn", icon: <Icon><circle cx="12" cy="12" r="10" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></Icon> };
  if (type.startsWith("ride.")) return { tone: "neutral", icon: <Icon><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></Icon> };
  if (type === "driver.went_online") return { tone: "positive", icon: <Icon><path d="M5 12a7 7 0 0 1 14 0" /><path d="M2 12a10 10 0 0 1 20 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></Icon> };
  if (type === "driver.went_offline") return { tone: "neutral", icon: <Icon><path d="M5 12a7 7 0 0 1 14 0" /><line x1="2" y1="2" x2="22" y2="22" /></Icon> };
  if (type.startsWith("driver.")) return { tone: "neutral", icon: <Icon><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></Icon> };
  if (type.startsWith("gps.")) return { tone: "warn", icon: <Icon><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /></Icon> };
  return { tone: "neutral", icon: <Icon><circle cx="12" cy="12" r="3" /></Icon> };
}

function eventLabel(a: RecentActivity): string {
  const name = a.actorName?.trim() || "";
  switch (a.type) {
    case "ride.created": return "New ride request";
    case "ride.completed": return name ? `${name} completed a trip` : "Ride completed";
    case "ride.cancelled": return "Ride cancelled";
    case "ride.negotiation_started": return "Fare negotiation started";
    case "driver.went_online": return name ? `${name} came online` : "Driver came online";
    case "driver.went_offline": return name ? `${name} went offline` : "Driver went offline";
    case "driver.declined_request": return name ? `${name} declined a request` : "Request declined";
    case "driver.auto_offline": return name ? `${name} auto-offlined` : "Driver auto-offlined";
    case "driver.priority_demoted": return name ? `${name} priority demoted` : "Priority demoted";
    case "gps.anomaly_detected": return "GPS anomaly detected";
    case "customer.cancel_warned": return name ? `${name} got cancel warning` : "Cancel warning issued";
    case "driver.document_submitted": return name ? `${name} submitted documents` : "Documents submitted";
    default: return a.type.replace(/[._]/g, " ");
  }
}

function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

export function ActivityConsole() {
  const [items, setItems] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [group, setGroup] = useState<string>("all");

  // Initial load + reload when group changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    setExhausted(false);
    getRecentActivity({ limit: PAGE_SIZE })
      .then((d) => setItems(d ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [group]); // group only affects client-side filter, but we still re-fetch fresh

  const filtered = items.filter((a) =>
    matchesGroup(a.type, TYPE_GROUPS.find((g) => g.id === group)?.matches ?? [])
  );

  const loadMore = async () => {
    if (loadingMore || exhausted || items.length === 0) return;
    setLoadingMore(true);
    try {
      const lastId = items[items.length - 1].id;
      const next = await getRecentActivity({ limit: PAGE_SIZE, beforeId: lastId });
      if (!next || next.length === 0) {
        setExhausted(true);
      } else {
        setItems((cur) => [...cur, ...next]);
        if (next.length < PAGE_SIZE) setExhausted(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {TYPE_GROUPS.map((g) => {
          const active = group === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={`inline-flex h-8 items-center rounded-full px-3 text-[11px] font-semibold transition-colors ${
                active
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {loading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-3 flex-1 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Could not load activity.
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[12px] text-muted-foreground">
            No events in this category yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((a) => {
              const v = eventVisual(a.type);
              return (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      v.tone === "positive" ? "bg-primary/15 text-primary"
                      : v.tone === "warn" ? "bg-amber-400/15 text-amber-600"
                      : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {v.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{eventLabel(a)}</p>
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      {a.type}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {fmtTimestamp(a.occurredAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && !error && items.length > 0 ? (
        <div className="flex justify-center">
          {exhausted ? (
            <span className="text-[11px] text-muted-foreground">No more events.</span>
          ) : (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-semibold text-foreground hover:bg-surface disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
