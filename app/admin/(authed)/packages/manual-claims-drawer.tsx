"use client";

import { useEffect, useState } from "react";
import {
  approveManualClaim,
  getAdminManualClaims,
  rejectManualClaim,
  type ManualClaim,
} from "@/lib/api";

export function ManualClaimsDrawer({
  open,
  onClose,
  onStatusUpdate,
}: {
  open: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<string>("submitted");
  const [claims, setClaims] = useState<ManualClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadClaims = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminManualClaims(statusFilter, 100);
      setClaims(res.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load manual claims");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void loadClaims();
    }
  }, [open, statusFilter]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleApprove = async (claim: ManualClaim) => {
    setActionLoadingId(claim.id);
    try {
      await approveManualClaim(claim.id);
      setToast(`Claim for ${claim.package_name} approved! FCM push sent to driver.`);
      onStatusUpdate?.();
      void loadClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve claim");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async (claim: ManualClaim) => {
    if (!rejectionReason.trim()) return;
    setActionLoadingId(claim.id);
    try {
      await rejectManualClaim(claim.id, rejectionReason.trim());
      setToast(`Claim rejected. Driver notified via FCM push.`);
      setRejectingId(null);
      setRejectionReason("");
      onStatusUpdate?.();
      void loadClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject claim");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-3xl border-l border-border bg-card p-6 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>💳 Manual Package Payment Claims</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and approve manual MoMo paycode / bank transfer claims submitted by drivers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-border py-3">
          {[
            { id: "submitted", label: "Pending Review" },
            { id: "approved", label: "Approved" },
            { id: "rejected", label: "Rejected" },
            { id: "all", label: "All Claims" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Claims List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-muted-foreground">
              Loading claims...
            </div>
          ) : claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-3 text-2xl">📋</div>
              <p className="mt-2 text-xs font-semibold text-foreground">No claims found</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                No manual package payment claims match status &ldquo;{statusFilter}&rdquo;.
              </p>
            </div>
          ) : (
            claims.map((c) => {
              const isPending = c.status === "submitted";
              const isApproved = c.status === "approved";
              const isRejected = c.status === "rejected";
              const isRejectingThis = rejectingId === c.id;
              const isActioningThis = actionLoadingId === c.id;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-background p-4 shadow-xs transition-all hover:border-primary/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {c.package_name || "Ride Package"}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isRejected
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Driver ID: <span className="font-mono text-foreground font-medium">{c.driver_id}</span>
                        {c.vehicle_type && <span className="ml-2">({c.vehicle_type})</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-extrabold text-primary">
                        FRw {c.expected_amount_rwf ? c.expected_amount_rwf.toLocaleString() : "0"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {c.submitted_at ? new Date(c.submitted_at).toLocaleString() : new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-xl bg-muted/30 p-2.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Payment Method
                      </span>
                      <span className="font-semibold text-foreground">
                        {c.provider || "Manual Claim"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-2.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Payer Phone
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {c.payer_phone_number || "—"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-2.5 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Ref / Transaction ID
                      </span>
                      <span className="font-mono font-semibold text-foreground truncate block">
                        {c.transaction_reference || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Proof Receipt Image Preview Button */}
                  {c.proof_image_id && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/40 p-2.5">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <span>🖼️ Receipt Proof Image:</span>
                        <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[160px]">
                          {c.proof_image_id}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImageUrl(
                            `/api/v1/uploads/objects/${c.proof_image_id}`
                          )
                        }
                        className="rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-primary border border-border hover:bg-muted"
                      >
                        View Receipt
                      </button>
                    </div>
                  )}

                  {/* Rejection Reason Display */}
                  {c.rejection_reason && (
                    <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                      <span className="font-semibold">Rejection Reason:</span> {c.rejection_reason}
                    </div>
                  )}

                  {/* Reject Form Inline */}
                  {isRejectingThis && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50/50 p-3 space-y-2">
                      <label className="block text-xs font-semibold text-red-800">
                        Reason for Rejection (sent via FCM push to driver):
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Invalid reference code, Amount mismatch, Duplicate claim..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full rounded-xl border border-red-200 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="rounded-lg border border-input bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isActioningThis || !rejectionReason.trim()}
                          onClick={() => handleConfirmReject(c)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isActioningThis ? "Rejecting..." : "Confirm Rejection"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar for Pending Claims */}
                  {isPending && !isRejectingThis && (
                    <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(c.id);
                          setRejectionReason("");
                        }}
                        disabled={isActioningThis}
                        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Reject Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(c)}
                        disabled={isActioningThis}
                        className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isActioningThis ? "Approving..." : "Approve & Grant Credits"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Receipt Image Preview Lightbox */}
        {previewImageUrl && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreviewImageUrl(null)}
          >
            <div
              className="relative max-w-2xl max-h-[85vh] rounded-2xl border border-border bg-card p-4 shadow-2xl flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-2 border-b border-border mb-3">
                <span className="text-xs font-bold text-foreground">Receipt Proof Image</span>
                <button
                  onClick={() => setPreviewImageUrl(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  ✕
                </button>
              </div>
              <img
                src={previewImageUrl}
                alt="Payment Receipt Proof"
                className="max-h-[70vh] w-auto object-contain rounded-xl border border-border"
                onError={() => setError("Could not load receipt image.")}
              />
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-foreground">{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
