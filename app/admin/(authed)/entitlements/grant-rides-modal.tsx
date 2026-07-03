"use client";

import { useEffect, useState } from "react";
import { grantEntitlement } from "@/lib/api";

/**
 * Modal for granting rides (or bonus rides) to a driver's specific vehicle
 * entitlement. Requires a reason — the reason is written to the audit log
 * along with the actor and the before/after balances.
 *
 * Wired to POST /admin/entitlements/grant. The entitlement id encodes both
 * identifiers as "driver_id:vehicle_type_id".
 */
export function GrantRidesModal({
  target,
  onClose,
  onGranted,
}: {
  target: {
    entitlementId: string;
    driverName: string;
    vehicleLabel: string;
  };
  onClose: () => void;
  onGranted: () => void;
}) {
  const [rides, setRides] = useState(0);
  const [bonusRides, setBonusRides] = useState(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Esc + body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, submitting]);

  const totalDelta = rides + bonusRides;
  const reasonTooShort = reason.trim().length < 10;
  const disabled = submitting || totalDelta <= 0 || reasonTooShort;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      const [driverId, vehicleTypeId] = target.entitlementId.split(":");
      await grantEntitlement(driverId, vehicleTypeId, rides, bonusRides, reason.trim());
      onGranted();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not grant rides. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="Grant rides"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              Grant rides
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {target.driverName}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {target.vehicleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="space-y-4 px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Counter
              label="Rides"
              value={rides}
              onChange={setRides}
              max={500}
              accent="text-primary"
              disabled={submitting}
            />
            <Counter
              label="Bonus rides"
              value={bonusRides}
              onChange={setBonusRides}
              max={500}
              accent="text-emerald-600"
              disabled={submitting}
            />
          </div>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Reason
              <span className="ml-1 normal-case tracking-normal text-amber-700">
                (required, ≥ 10 chars)
              </span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Compensation for app downtime on 18 Jun — ticket #4421"
              disabled={submitting}
              className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-border bg-card px-3 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary disabled:opacity-60 sm:text-sm"
            />
            {reason.length > 0 && reasonTooShort ? (
              <p className="mt-1 text-[11px] font-medium text-amber-700">
                A bit more context, please ({reason.length}/10).
              </p>
            ) : null}
          </label>

          {/* Audit reminder */}
          <aside className="rounded-xl bg-muted/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This grant will be appended to the entitlement transaction log
              and produce an{" "}
              <strong className="font-semibold text-foreground">audit entry</strong> with
              your email, the before/after balances, and the reason you wrote
              above. The action is idempotent: refresh-safe.
            </p>
          </aside>

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Granting…
              </>
            ) : (
              `Grant +${totalDelta}`
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  max,
  accent,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
  accent: string;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          aria-label={`Decrease ${label}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.max(0, Math.min(max, n)));
          }}
          disabled={disabled}
          aria-label={label}
          className={`block min-h-[44px] flex-1 rounded-lg border border-border bg-card text-center text-lg font-bold tabular-nums outline-none transition-colors focus:border-primary disabled:opacity-60 ${accent}`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
