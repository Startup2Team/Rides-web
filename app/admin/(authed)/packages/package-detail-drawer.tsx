"use client";

import { useEffect } from "react";
import { StatusPill } from "../_components";
export function versionStatusTone(status: string): "success" | "warn" | "info" | "neutral" {
  const tones: Record<string, "success" | "warn" | "info" | "neutral"> = {
    active: "success",
    scheduled: "info",
    draft: "warn",
    archived: "neutral",
  };
  return tones[status] || "neutral";
}
import {
  VEHICLE_LABELS,
  formatDate,
  formatDateTime,
  formatRWF,
  getActiveVersion,
  type PackageVersion,
  type RidesPackage,
} from "@/lib/packages-mock";

/**
 * Slide-in drawer showing every version of a package with full timeline.
 * Read-only for now — write actions (create version, schedule, activate, archive)
 * will hit the package-version APIs in Phase 2 of backend integration.
 */
export function PackageDetailDrawer({
  pkg,
  onClose,
}: {
  pkg: RidesPackage;
  onClose: () => void;
}) {
  // Esc + body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const active = getActiveVersion(pkg);
  const scheduled = pkg.versions.filter((v) => v.status === "scheduled");
  const sortedVersions = [...pkg.versions].sort((a, b) => b.version - a.version);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-label={`Package details — ${pkg.name}`}
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {VEHICLE_LABELS[pkg.vehicleType]}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {pkg.slug}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {pkg.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {pkg.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Active + scheduled comparison */}
          {active && scheduled.length > 0 ? (
            <ComparisonBlock current={active} next={scheduled[0]} />
          ) : null}

          {/* Hero card — active version snapshot */}
          {active ? (
            <section className="mt-6 rounded-2xl border border-border bg-muted/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Active version
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-foreground">
                    v{active.version}
                  </p>
                </div>
                <StatusPill status="Active" tone="success" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <Metric label="Price" value={formatRWF(active.price)} />
                <Metric label="Rides" value={String(active.rides)} />
                <Metric
                  label="Bonus"
                  value={`+${active.bonusRides}`}
                  valueClass="text-emerald-600"
                />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Activated {active.activatedAt ? formatDate(active.activatedAt) : "—"} by {active.createdBy}
              </p>
            </section>
          ) : (
            <section className="mt-6 rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center">
              <p className="text-sm font-semibold text-foreground">
                No active version
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This package has no version currently serving the catalogue.
              </p>
            </section>
          )}

          {/* Version timeline */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Version timeline
              </h3>
              <button
                type="button"
                disabled
                title="Create-version flow ships with backend Phase 2"
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                + New version
              </button>
            </div>
            <ol className="mt-4 space-y-3">
              {sortedVersions.map((v) => (
                <VersionRow key={v.id} version={v} />
              ))}
            </ol>
          </section>

          {/* Immutability reminder */}
          <aside className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Immutability rule
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
              Version changes apply only to <strong>future</strong> purchases.
              Existing entitlements use the package snapshot they were sold
              against and are never re-priced or re-granted.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ComparisonBlock({
  current,
  next,
}: {
  current: PackageVersion;
  next: PackageVersion;
}) {
  const deltas = {
    price: next.price - current.price,
    rides: next.rides - current.rides,
    bonus: next.bonusRides - current.bonusRides,
  };
  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
            <polyline points="3 6 9 12 3 18" />
            <polyline points="21 6 15 12 21 18" />
          </svg>
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
          Comparison · current vs scheduled
        </p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        New version goes live{" "}
        <strong className="text-foreground">
          {next.scheduledFor ? formatDate(next.scheduledFor) : "—"}
        </strong>
        . Existing purchases on v{current.version} stay unchanged.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Delta label="Price" current={formatRWF(current.price)} next={formatRWF(next.price)} delta={deltas.price} format="rwf" />
        <Delta label="Rides" current={String(current.rides)} next={String(next.rides)} delta={deltas.rides} format="num" />
        <Delta label="Bonus" current={`+${current.bonusRides}`} next={`+${next.bonusRides}`} delta={deltas.bonus} format="num" />
      </div>
    </section>
  );
}

function Delta({
  label,
  current,
  next,
  delta,
  format,
}: {
  label: string;
  current: string;
  next: string;
  delta: number;
  format: "rwf" | "num";
}) {
  const positive = delta > 0;
  const negative = delta < 0;
  const tone = positive ? "text-emerald-600" : negative ? "text-red-600" : "text-muted-foreground";
  const sign = positive ? "+" : "";
  const display = format === "rwf" ? `${sign}${delta.toLocaleString()}` : `${sign}${delta}`;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground line-through">{current}</p>
      <p className="text-sm font-bold tabular-nums text-foreground">{next}</p>
      {delta !== 0 ? (
        <p className={`mt-1 text-[11px] font-semibold ${tone}`}>{display}</p>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground">no change</p>
      )}
    </div>
  );
}

function VersionRow({ version }: { version: PackageVersion }) {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold text-foreground">
            v{version.version}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Created {formatDate(version.createdAt)} by {version.createdBy}
          </p>
        </div>
        <StatusPill
          status={statusLabel(version.status)}
          tone={versionStatusTone(version.status)}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3 text-xs">
        <KV label="Price" value={formatRWF(version.price)} />
        <KV label="Rides" value={String(version.rides)} />
        <KV
          label="Bonus"
          value={`+${version.bonusRides}`}
          valueClass="text-emerald-600"
        />
      </div>
      {(version.scheduledFor || version.activatedAt || version.archivedAt) ? (
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
          {version.scheduledFor ? (
            <p>📅 Scheduled for {formatDateTime(version.scheduledFor)}</p>
          ) : null}
          {version.activatedAt ? (
            <p>▶ Activated {formatDateTime(version.activatedAt)}</p>
          ) : null}
          {version.archivedAt ? (
            <p>⊘ Archived {formatDateTime(version.archivedAt)}</p>
          ) : null}
        </div>
      ) : null}
      {version.notes ? (
        <p className="mt-3 border-t border-border pt-3 text-xs italic text-muted-foreground">
          “{version.notes}”
        </p>
      ) : null}
    </li>
  );
}

function Metric({ label, value, valueClass = "text-foreground" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold tracking-tight tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function KV({ label, value, valueClass = "text-foreground" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 font-semibold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

function statusLabel(status: PackageVersion["status"]): string {
  return {
    active: "Active",
    scheduled: "Scheduled",
    draft: "Draft",
    archived: "Archived",
  }[status];
}
