"use client";

import { useEffect, useState } from "react";
import { notifyDriver } from "@/lib/api";

const REASON_OPTIONS = [
  { id: "general", label: "General Update" },
  { id: "document_expiry", label: "Document Expiry Notice" },
  { id: "account_warning", label: "Account Warning / Review" },
  { id: "inspection_notice", label: "Vehicle Inspection Notice" },
  { id: "payout_update", label: "Payout / Earnings Update" },
];

export function NotifyDriverModal({
  open,
  driverId,
  driverName,
  onClose,
  onSuccess,
}: {
  open: boolean;
  driverId: string;
  driverName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setMessage("");
      setReason("general");
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
    setError(null);

    if (!title.trim() || !message.trim()) {
      setError("Please fill out both the title and message.");
      return;
    }

    setLoading(true);
    try {
      await notifyDriver(driverId, {
        title: title.trim(),
        body: message.trim(),
        reason,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send notification to driver.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Direct Message</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              Notify {driverName ? driverName : "Driver"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          ) : null}

          <div>
            <label className="text-xs font-semibold text-foreground">Notice Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-2.5 text-sm outline-none focus:border-primary"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Document Renewal Notice"
              className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write direct message or push notification body for this driver..."
              className="mt-1.5 w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Push & Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
