"use client";

import { useEffect, useState } from "react";

export function SuspendModal({
  open,
  targetId,
  targetName,
  userType = "driver",
  onClose,
  onConfirm,
}: {
  open: boolean;
  targetId: string;
  targetName?: string;
  userType?: "driver" | "customer";
  onClose: () => void;
  onConfirm: (id: string, reason: string, durationHours: number) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [durationHours, setDurationHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setDurationHours(24);
      setError(null);
      setLoading(false);
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for suspension.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(targetId, reason.trim(), durationHours);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Suspend {userType === "driver" ? "Driver" : "Customer"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {targetName ? `Targeting: ${targetName}` : `ID: ${targetId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Suspension Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder={`Enter the reason for suspending this ${userType} (e.g. Document verification failed, Safety dispute, Violation of terms)...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Duration (Hours)
            </label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours (1 Day)</option>
              <option value={48}>48 Hours (2 Days)</option>
              <option value={72}>72 Hours (3 Days)</option>
              <option value={168}>7 Days</option>
              <option value={720}>30 Days</option>
            </select>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
              ⚡ Instant Push Notification: Upon confirmation, a live high-priority FCM push notification & in-app notice will be sent immediately (in 0 seconds) to the {userType}'s mobile phone screen with this reason.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-input bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Suspending..." : "Confirm & Send Instant Push"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
