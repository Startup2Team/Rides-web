"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, StatCard, StatusPill, Avatar } from "../_components";
import { VEHICLE_LABELS, formatDateTime, formatRWF, type VehicleType } from "@/lib/packages-mock";
import {
  approveManualPaymentClaim,
  getManualPaymentClaims,
  type ManualClaimStatus,
  type ManualPaymentClaim,
} from "@/lib/api";
import { RejectClaimModal } from "./reject-claim-modal";

type StatusFilter = "submitted" | "needs_clarification" | "approved" | "rejected" | "expired" | "all";

const STATUS_TONE: Record<ManualClaimStatus, "success" | "warn" | "danger" | "neutral" | "info"> = {
  submitted: "warn",
  needs_clarification: "warn",
  approved: "success",
  rejected: "danger",
  created: "neutral",
  cancelled: "neutral",
  expired: "neutral",
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "submitted", label: "Awaiting review" },
  { value: "needs_clarification", label: "Needs clarification" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "all", label: "All statuses" },
];

function providerLabel(p: string): string {
  const s = p.toLowerCase();
  if (s.includes("mtn")) return "MTN MoMo";
  if (s.includes("airtel")) return "Airtel Money";
  return p || "—";
}

function vehicleLabel(code: string): string {
  const key = code?.toLowerCase() as VehicleType;
  return VEHICLE_LABELS[key] ?? (code ? code.toUpperCase() : "—");
}

/** Human "time to expiry" — negative → "Expired", otherwise "in 2h 15m". */
function formatTimeToExpiry(iso: string): { text: string; tone: "urgent" | "soon" | "normal" | "past" } {
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return { text: "—", tone: "normal" };
  if (ms <= 0) return { text: "Expired", tone: "past" };
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const text = h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
  const tone = mins <= 15 ? "urgent" : mins <= 60 ? "soon" : "normal";
  return { text, tone };
}

function looksLikeImage(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|heic)(\?|$)/i.test(url);
}

export function PackagePaymentsConsole() {
  const [claims, setClaims] = useState<ManualPaymentClaim[]>([]);
  const [status, setStatus] = useState<StatusFilter>("submitted");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ManualPaymentClaim | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    getManualPaymentClaims(status)
      .then(setClaims)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load payment claims"))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!query.trim()) return claims;
    const q = query.toLowerCase().trim();
    return claims.filter((c) =>
      [
        c.driver_id,
        c.package_name,
        c.payer_phone_number,
        c.transaction_reference ?? "",
        c.merchant_code_snapshot,
        c.vehicle_type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [claims, query]);

  /* Stats — derived from the currently loaded (filtered-by-status) set */
  const awaitingCount = claims.filter((c) => c.status === "submitted").length;
  const totalExpected = claims.reduce((s, c) => s + c.expected_amount_rwf, 0);
  const expiringSoon = claims.filter((c) => {
    if (c.status !== "submitted") return false;
    const ms = new Date(c.expires_at).getTime() - Date.now();
    return ms > 0 && ms <= 60 * 60 * 1000;
  }).length;

  async function handleApprove(claim: ManualPaymentClaim) {
    setError(null);
    setNotice(null);
    setApprovingId(claim.id);
    try {
      await approveManualPaymentClaim(claim.id);
      setNotice(`Approved payment for ${claim.package_name} — ride credits granted and the driver was notified.`);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not approve this claim. Please try again.");
    } finally {
      setApprovingId(null);
    }
  }

  const canReview = (c: ManualPaymentClaim) => c.status === "submitted";

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline">Dismiss</button>
        </div>
      )}

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Awaiting review" value={String(awaitingCount)} tone={awaitingCount > 0 ? "alert" : "default"} />
        <StatCard label="Expiring < 1h" value={String(expiringSoon)} tone={expiringSoon > 0 ? "alert" : "default"} />
        <StatCard label="Expected value" value={formatRWF(totalExpected)} tone="primary" hint="Across loaded claims" />
        <StatCard label="Loaded claims" value={String(claims.length)} />
      </div>

      {/* Filters */}
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
              placeholder="Search by driver id, package, payer phone or transaction ref…"
              className="block min-h-[44px] w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary sm:text-sm"
            />
          </div>

          <label className="block sm:max-w-xs">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Driver · Vehicle</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3 text-right">Expected</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Proof</th>
                <th className="px-4 py-3 whitespace-nowrap">Submitted</th>
                <th className="px-4 py-3 whitespace-nowrap">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary align-[-1px]" />
                    Loading payment claims…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {query.trim()
                      ? "No claims match this search."
                      : status === "submitted"
                      ? "No claims are awaiting review. You’re all caught up."
                      : "No claims with this status."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const expiry = formatTimeToExpiry(c.expires_at);
                  const busy = approvingId === c.id;
                  return (
                    <tr key={c.id} className="align-top transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.driver_id} size="sm" tone="neutral" />
                          <div className="min-w-0">
                            <p className="font-mono text-[11px] text-muted-foreground" title={c.driver_id}>
                              {c.driver_id.slice(0, 8)}…
                            </p>
                            <span className="mt-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              {vehicleLabel(c.vehicle_type)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-foreground">{c.package_name}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">v{c.version}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold tabular-nums text-foreground">
                        {formatRWF(c.expected_amount_rwf)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">{providerLabel(c.provider)}</p>
                        <p className="mt-0.5">{c.payer_phone_number || "—"}</p>
                        {c.transaction_reference ? (
                          <p className="mt-0.5 font-mono text-[10px]" title="Transaction reference">
                            ref: {c.transaction_reference}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[10px] italic">no reference</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <ProofCell url={c.proof_image_id} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                        {c.submitted_at ? formatDateTime(c.submitted_at) : "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <span
                          className={
                            expiry.tone === "past"
                              ? "font-semibold text-muted-foreground"
                              : expiry.tone === "urgent"
                              ? "font-semibold text-red-600"
                              : expiry.tone === "soon"
                              ? "font-semibold text-amber-600"
                              : "text-muted-foreground"
                          }
                        >
                          {expiry.text}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusPill
                          status={c.status.replace(/_/g, " ").toUpperCase()}
                          tone={STATUS_TONE[c.status]}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        {canReview(c) ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(c)}
                              disabled={busy}
                              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                            >
                              {busy ? (
                                <>
                                  <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                                  Approving…
                                </>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectTarget(c)}
                              disabled={busy}
                              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-right text-[11px] text-muted-foreground">
                            {c.status === "rejected" && c.rejection_reason ? (
                              <span title={c.rejection_reason}>Reviewed</span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 ? (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <p>{filtered.length} of {claims.length} claims</p>
            <button
              type="button"
              onClick={refresh}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Refresh
            </button>
          </div>
        ) : null}
      </Card>

      {rejectTarget ? (
        <RejectClaimModal
          claim={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => {
            setRejectTarget(null);
            setNotice("Claim rejected — the driver was notified and can resubmit.");
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function ProofCell({ url }: { url: string | null }) {
  const [open, setOpen] = useState(false);
  if (!url) {
    return <span className="text-[11px] italic text-muted-foreground">No proof</span>;
  }
  if (!looksLikeImage(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-semibold text-primary hover:underline"
      >
        Open file ↗
      </a>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View payment proof"
        className="block overflow-hidden rounded-lg border border-border transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <img src={url} alt="Payment proof" className="h-12 w-12 object-cover" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close proof preview"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
          />
          <div className="relative max-h-[85vh] max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold text-foreground">Payment proof</span>
              <div className="flex items-center gap-3">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-primary hover:underline">
                  Open full ↗
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <img src={url} alt="Payment proof" className="max-h-[75vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
