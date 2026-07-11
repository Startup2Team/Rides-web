"use client";

import { useEffect, useState } from "react";
import { grantEntitlement } from "@/lib/api";

/**
 * Modal for granting rides (or bonus rides) to a driver's specific vehicle
 * entitlement. Requires a reason — the reason is written to the audit log.
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
    currentRides: number;
    currentBonus: number;
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/45 backdrop-blur-[4px] transition-opacity"
      />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-label="Grant rides"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl border border-border bg-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.25)] overflow-hidden transform transition-all duration-300 scale-100"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border bg-muted/10 px-6 py-5">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Grant Rides
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
              {target.driverName}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground font-medium">
              {target.vehicleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Counters Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Counter
              label="Standard rides"
              value={rides}
              onChange={setRides}
              max={500}
              accent="text-primary focus-within:border-primary/50"
              inputAccent="text-primary"
              disabled={submitting}
            />
            <Counter
              label="Bonus rides"
              value={bonusRides}
              onChange={setBonusRides}
              max={500}
              accent="text-emerald-600 focus-within:border-emerald-600/50"
              inputAccent="text-emerald-600"
              disabled={submitting}
            />
          </div>

          {/* Live Balance Preview Box */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5 text-primary" aria-hidden>
                <path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
              </svg>
              New Balance Preview
            </p>
            <div className="grid grid-cols-2 gap-4 divide-x divide-border">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Standard rides</p>
                <p className="mt-1 text-base font-bold text-foreground">
                  {target.currentRides} → <span className={rides > 0 ? "text-primary text-lg" : ""}>{target.currentRides + rides}</span>
                </p>
              </div>
              <div className="pl-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bonus rides</p>
                <p className="mt-1 text-base font-bold text-foreground">
                  {target.currentBonus} → <span className={bonusRides > 0 ? "text-emerald-600 text-lg" : ""}>{target.currentBonus + bonusRides}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Reason for change
              </span>
              <span className={`text-[10px] font-semibold ${reasonTooShort ? "text-amber-600" : "text-emerald-600"}`}>
                {reason.trim().length} / 10 chars min
              </span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Provide context (e.g. Compensation for App downtime on ticket #2210)"
              disabled={submitting}
              className="mt-2 block min-h-[44px] w-full rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
            />
          </label>

          {/* Audit Alert Box */}
          <aside className="rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/10 p-3.5 flex items-start gap-2.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              This action is logged. It appends a permanent{" "}
              <strong className="font-semibold text-blue-900 dark:text-blue-200">audit record</strong> linking your account email, before/after balances, and the reason.
            </p>
          </aside>

          {errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-border bg-muted/5 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <span className="mr-2.5 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                Processing…
              </>
            ) : (
              `Confirm Grant +${totalDelta}`
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
  inputAccent,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  max: number;
  accent: string;
  inputAccent: string;
  disabled?: boolean;
}) {
  const presets = [5, 10, 25, 50];
  return (
    <div className={`rounded-2xl border border-border bg-muted/20 p-3 transition-colors ${accent}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          aria-label={`Decrease ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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
          className={`block h-10 w-12 flex-1 rounded-xl border border-border bg-card text-center text-base font-bold tabular-nums outline-none transition-colors disabled:opacity-60 ${inputAccent}`}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      {/* Preset Badges */}
      <div className="mt-3 flex flex-wrap gap-1">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(Math.min(max, value + preset))}
            disabled={disabled}
            className="flex-1 min-w-[28px] py-1 text-[9px] font-bold rounded-lg bg-card hover:bg-muted text-foreground border border-border transition-colors text-center shadow-sm"
          >
            +{preset}
          </button>
        ))}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            disabled={disabled}
            className="px-2 py-1 text-[9px] font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-colors shadow-sm"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
