"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, StatCard } from "../_components";
import { getAuditLogs, type AuditLogEntry } from "@/lib/api";
import { useDevMocks } from "@/lib/backend-config";
import {
  MOCK_AUDIT,
  formatDateTime,
  type AuditAction,
  type AuditEntry,
} from "@/lib/packages-mock";

/**
 * Audit log viewer — append-only timeline of every admin action that wrote
 * to packages / campaigns / entitlements / purchases.
 *
 * Read-only. Source of truth for "who changed what, when, and why".
 */

type TargetFilter = "all" | "package" | "campaign" | "entitlement" | "purchase";

const TARGET_FILTERS: { value: TargetFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "package", label: "Packages" },
  { value: "campaign", label: "Campaigns" },
  { value: "entitlement", label: "Entitlements" },
  { value: "purchase", label: "Purchases" },
];

const ACTION_LABEL: Record<AuditAction, string> = {
  "package.create": "Created package",
  "package.version.create": "Created version",
  "package.version.schedule": "Scheduled version",
  "package.version.activate": "Activated version",
  "package.version.archive": "Archived version",
  "campaign.create": "Created campaign",
  "campaign.schedule": "Scheduled campaign",
  "campaign.activate": "Activated campaign",
  "campaign.expire": "Expired campaign",
  "campaign.archive": "Archived campaign",
  "entitlement.grant": "Granted rides",
  "entitlement.revoke": "Revoked rides",
  "purchase.reconcile": "Reconciled purchase",
};

const ACTION_TONE: Record<AuditAction, string> = {
  "package.create": "bg-primary/15 text-primary",
  "package.version.create": "bg-primary/15 text-primary",
  "package.version.schedule": "bg-blue-100 text-blue-700",
  "package.version.activate": "bg-emerald-100 text-emerald-700",
  "package.version.archive": "bg-muted text-muted-foreground",
  "campaign.create": "bg-primary/15 text-primary",
  "campaign.schedule": "bg-blue-100 text-blue-700",
  "campaign.activate": "bg-emerald-100 text-emerald-700",
  "campaign.expire": "bg-amber-100 text-amber-700",
  "campaign.archive": "bg-muted text-muted-foreground",
  "entitlement.grant": "bg-emerald-100 text-emerald-700",
  "entitlement.revoke": "bg-red-100 text-red-700",
  "purchase.reconcile": "bg-blue-100 text-blue-700",
};

export function AuditLogsConsole() {
  const [entries, setEntries] = useState<AuditEntry[]>(useDevMocks ? MOCK_AUDIT : []);
  const [loading, setLoading] = useState(!useDevMocks);
  const [error, setError] = useState<string | null>(null);
  const [targetFilter, setTargetFilter] = useState<TargetFilter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (useDevMocks) return;
    let active = true;
    getAuditLogs({ limit: 200, offset: 0 })
      .then((res) => {
        if (!active) return;
        setEntries(res.entries.map(mapAuditEntry));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (targetFilter !== "all" && e.targetType !== targetFilter) return false;
        if (query.trim()) {
          const q = query.toLowerCase().trim();
          const haystack = [e.actor, e.actorRole, e.targetLabel, e.reason ?? ""]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [entries, targetFilter, query]);

  const openEntry = openId ? entries.find((e) => e.id === openId) ?? null : null;

  /* Stats — last 24h activity */
  const day = 1000 * 60 * 60 * 24;
  const now = Date.now();
  const last24h = entries.filter(
    (e) => now - new Date(e.createdAt).getTime() < day,
  ).length;
  const last7d = entries.filter(
    (e) => now - new Date(e.createdAt).getTime() < day * 7,
  ).length;
  const uniqueActors = new Set(entries.map((e) => e.actor)).size;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground animate-pulse">Loading audit logs...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total entries" value={String(entries.length)} tone="primary" />
        <StatCard label="Last 24 hours" value={String(last24h)} />
        <StatCard label="Last 7 days" value={String(last7d)} />
        <StatCard label="Unique actors" value={String(uniqueActors)} />
      </div>

      <Card>
        <div className="space-y-3 border-b border-border px-4 py-3">
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by actor, target, or reason…"
              className="block min-h-[44px] w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TARGET_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTargetFilter(f.value)}
                className={chipClass(targetFilter === f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <ol className="divide-y divide-border">
          {filtered.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-muted-foreground">
              No audit entries match these filters.
            </li>
          ) : (
            filtered.map((entry) => (
              <li
                key={entry.id}
                onClick={() => setOpenId(entry.id)}
                className="cursor-pointer transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start gap-4 px-4 py-4">
                  {/* Time column */}
                  <div className="w-32 shrink-0">
                    <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>

                  {/* Action + target */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ACTION_TONE[entry.action]}`}
                      >
                        {ACTION_LABEL[entry.action as AuditAction] ?? entry.action}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {entry.targetLabel}
                      </span>
                    </div>
                    {entry.reason ? (
                      <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">
                        “{entry.reason}”
                      </p>
                    ) : null}
                  </div>

                  {/* Actor */}
                  <div className="hidden w-48 shrink-0 text-right sm:block">
                    <p className="text-xs font-medium text-foreground">{entry.actor}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {entry.actorRole}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ol>

        {filtered.length > 0 ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <p>{filtered.length} of {entries.length} entries</p>
            <p>Append-only · sorted newest first</p>
          </div>
        ) : null}
      </Card>

      {openEntry ? (
        <AuditDetailDrawer entry={openEntry} onClose={() => setOpenId(null)} />
      ) : null}
      </>
      )}
    </div>
  );
}

function AuditDetailDrawer({
  entry,
  onClose,
}: {
  entry: AuditEntry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label="Audit log entry"
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${ACTION_TONE[entry.action]}`}
            >
              {ACTION_LABEL[entry.action as AuditAction] ?? entry.action}
            </span>
            <h2 className="mt-3 text-lg font-bold tracking-tight text-foreground">
              {entry.targetLabel}
            </h2>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {entry.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Actor */}
          <Section title="Actor">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <KV label="Email" value={entry.actor} mono />
              <KV label="Role" value={entry.actorRole} />
              <KV label="Performed" value={formatDateTime(entry.createdAt)} />
              <KV label="Target" value={entry.targetType} />
            </dl>
          </Section>

          {/* Reason */}
          {entry.reason ? (
            <Section title="Reason given">
              <p className="rounded-xl bg-muted/40 px-4 py-3 text-sm italic text-foreground">
                “{entry.reason}”
              </p>
            </Section>
          ) : null}

          {/* Diff */}
          <Section title="Change">
            <div className="grid gap-3 sm:grid-cols-2">
              <DiffPanel label="Before" data={entry.before} accent="muted" />
              <DiffPanel label="After" data={entry.after} accent="primary" />
            </div>
          </Section>

          {/* Reminder */}
          <aside className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Audit entries are <strong className="text-foreground">append-only</strong>.
              They cannot be edited or deleted from the UI — corrections happen by
              writing a new entry that supersedes the previous one.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-0.5 text-sm font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function DiffPanel({
  label,
  data,
  accent,
}: {
  label: string;
  data: Record<string, unknown> | null;
  accent: "muted" | "primary";
}) {
  const border = accent === "primary" ? "border-primary/30" : "border-border";
  const bg = accent === "primary" ? "bg-primary/[0.04]" : "bg-muted/20";
  return (
    <div className={`rounded-xl border ${border} ${bg} p-3`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {data === null ? (
        <p className="mt-2 text-xs italic text-muted-foreground">— (didn't exist)</p>
      ) : (
        <dl className="mt-2 space-y-1.5">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px_1fr] gap-2 text-xs">
              <dt className="font-mono text-[10px] text-muted-foreground">{k}</dt>
              <dd className="font-mono text-[11px] text-foreground">
                {typeof v === "object" ? JSON.stringify(v) : String(v)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function chipClass(active: boolean) {
  return `inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-muted/70"
  }`;
}

function mapTargetType(t?: string): AuditEntry["targetType"] {
  const key = (t ?? "").toLowerCase();
  if (key.includes("campaign")) return "campaign";
  if (key.includes("entitlement")) return "entitlement";
  if (key.includes("purchase")) return "purchase";
  return "package";
}

function mapAuditEntry(e: AuditLogEntry): AuditEntry {
  return {
    id: String(e.id),
    actor: e.admin_name ?? "Admin",
    actorRole: e.admin_role ?? "",
    action: e.action as AuditAction,
    targetType: mapTargetType(e.target_type),
    targetId: e.target_id ?? "",
    targetLabel: e.detail ?? e.target_id ?? "",
    before: null,
    after: e.metadata ?? null,
    reason: e.detail,
    createdAt: e.occurred_at,
  };
}
