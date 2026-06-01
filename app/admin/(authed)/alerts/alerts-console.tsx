"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { getDashboardAlerts, type DashboardAlert } from "@/lib/api";

const KINDS: { id: "" | "incident" | "ticket"; label: string }[] = [
  { id: "", label: "All" },
  { id: "incident", label: "Safety incidents" },
  { id: "ticket", label: "Support tickets" },
];

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      {children}
    </svg>
  );
}

function alertIcon(a: DashboardAlert) {
  if (a.title.toLowerCase().includes("sos")) {
    return (
      <Icon>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        <line x1="12" y1="10" x2="12" y2="14" />
      </Icon>
    );
  }
  if (a.kind === "ticket") {
    return (
      <Icon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="14" x2="13" y2="14" />
      </Icon>
    );
  }
  return (
    <Icon>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </Icon>
  );
}

function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function destinationHref(a: DashboardAlert): string {
  return a.kind === "incident" ? "/admin/safety-center" : "/admin/support";
}

export function AlertsConsole() {
  const [items, setItems] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState<"" | "incident" | "ticket">("");

  useEffect(() => {
    setLoading(true);
    setError(false);
    getDashboardAlerts({ limit: 50, kind: kind || undefined })
      .then((d) => setItems(d ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [kind]);

  const counts = {
    all: items.length,
    incident: items.filter((a) => a.kind === "incident").length,
    ticket: items.filter((a) => a.kind === "ticket").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {KINDS.map((k) => {
          const active = kind === k.id;
          const count =
            k.id === "" ? counts.all : k.id === "incident" ? counts.incident : counts.ticket;
          return (
            <button
              key={k.id || "all"}
              type="button"
              onClick={() => setKind(k.id)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-colors ${
                active
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {k.label}
              {active && count > 0 ? (
                <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold">{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {loading ? (
          <ul className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="px-4 py-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/5 rounded bg-muted" />
                    <div className="h-2 w-1/2 rounded bg-muted" />
                    <div className="h-6 w-20 rounded bg-muted" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Could not load alerts.
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-semibold text-foreground">All clear</p>
            <p className="text-[11px] text-muted-foreground">No open alerts.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={`${a.kind}:${a.id}`} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      a.tone === "danger"
                        ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200"
                        : a.tone === "warn"
                        ? "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200"
                        : "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                    }`}
                  >
                    {alertIcon(a)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                          {a.title}
                        </p>
                        {a.severity ? (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              a.tone === "danger" ? "bg-red-50 text-red-700"
                              : a.tone === "warn" ? "bg-amber-50 text-amber-700"
                              : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {a.severity}
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {fmtTimestamp(a.occurredAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                      {a.detail || "—"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={destinationHref(a)}
                        className={
                          a.tone === "danger"
                            ? "rounded-md bg-red-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-red-700"
                            : "rounded-md border border-border bg-card px-3 py-1 text-[11px] font-medium text-foreground hover:bg-surface"
                        }
                      >
                        {a.tone === "danger" ? "Respond" : "View"}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">
                        Opens {a.kind === "incident" ? "Safety center" : "Support"}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
