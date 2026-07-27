"use client";

import { useEffect, useState } from "react";
import { rejectManualPaymentClaim, type ManualPaymentClaim } from "@/lib/api";
import { formatRWF } from "@/lib/packages-mock";

/**
 * Modal for rejecting a submitted manual payment claim. A reason is required
 * (recorded on the claim + audit log). An optional clarification message is
 * shown to the driver before they resubmit — use it to tell them exactly what
 * to fix (e.g. "The transaction reference doesn't match our records").
 *
 * Wired to POST /admin/package-payments/manual-claims/{id}/reject with
 * { reason, clarification_message }.
 */
export function RejectClaimModal({
  claim,
  onClose,
  onRejected,
}: {
  claim: ManualPaymentClaim;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [clarification, setClarification] = useState("");
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

  const reasonTooShort = reason.trim().length < 5;
  const disabled = submitting || reasonTooShort;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await rejectManualPaymentClaim(claim.id, reason.trim(), clarification.trim() || undefined);
      onRejected();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not reject this claim. Please try again.",
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
        aria-label="Reject payment claim"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-700">
              Reject payment
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
              {claim.package_name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatRWF(claim.expected_amount_rwf)} · {claim.payer_phone_number}
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
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Reason
              <span className="ml-1 normal-case tracking-normal text-amber-700">
                (required, internal)
              </span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Transaction reference not found in MoMo statement"
              disabled={submitting}
              className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-border bg-card px-3 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary disabled:opacity-60 sm:text-sm"
            />
            {reason.length > 0 && reasonTooShort ? (
              <p className="mt-1 text-[11px] font-medium text-amber-700">
                A bit more context, please ({reason.trim().length}/5).
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Message to driver
              <span className="ml-1 normal-case tracking-normal text-muted-foreground/80">
                (optional)
              </span>
            </span>
            <textarea
              value={clarification}
              onChange={(e) => setClarification(e.target.value)}
              rows={2}
              placeholder="Shown to the driver before they resubmit — tell them exactly what to fix."
              disabled={submitting}
              className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-border bg-card px-3 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary disabled:opacity-60 sm:text-sm"
            />
          </label>

          <aside className="rounded-xl bg-muted/40 p-3">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Rejecting does <strong className="font-semibold text-foreground">not</strong> grant
              any ride credits. The driver is notified and may resubmit their proof. This decision
              is recorded in the audit log with your account and the reason above.
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
            className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Rejecting…
              </>
            ) : (
              "Reject claim"
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
