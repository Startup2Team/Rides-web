"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../_components";
import { getMemberActivity, type AdminActivity } from "@/lib/api";

const FALLBACK: AdminActivity[] = [
  { id: "a1", action: "Signed in", detail: "via password + authenticator", ip: "41.74.198.12", created_at: "Just now" },
  { id: "a2", action: "Resolved INC-2847", detail: "SOS · marked safe after driver call", ip: "41.74.198.12", created_at: "12 min ago" },
  { id: "a3", action: "Suspended customer", detail: "Sandrine Uwimana · fraudulent chargeback", ip: "41.74.198.12", created_at: "1h ago" },
  { id: "a4", action: "Approved driver KYC", detail: "Florence Ingabire · Moto Bike", ip: "41.74.198.12", created_at: "2h ago" },
  { id: "a5", action: "Updated commission", detail: "Cab Taxi 15% → 16%", ip: "41.74.198.12", created_at: "Yesterday" },
  { id: "a6", action: "Ran payout batch", detail: "412 drivers · 2.6M RWF", ip: "41.74.198.12", created_at: "Yesterday" },
];

export function AdminActivityModal({
  admin,
  onClose,
  onBack,
}: {
  admin: { id: string; name: string; email: string } | null;
  onClose: () => void;
  onBack?: () => void;
}) {
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!admin) return;
    setLoading(true);
    getMemberActivity(admin.id)
      .then((res) => setActivity(res.activity ?? FALLBACK))
      .catch(() => setActivity(FALLBACK))
      .finally(() => setLoading(false));
  }, [admin]);

  useEffect(() => {
    if (!admin) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [admin, onClose]);

  if (!admin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            ) : null}
            <Avatar name={admin.name} />
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                {admin.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                Recent activity · {admin.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-surface" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          ) : (
            <ol className="space-y-3 border-l border-border pl-1">
              {activity.map((e) => (
                <li key={e.id} className="relative pl-6">
                  <span className="absolute left-1.5 top-1.5 block h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-xs font-semibold text-foreground">
                      {e.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {e.created_at}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {e.detail}
                    {e.ip ? (
                      <>
                        {" "}
                        <span className="font-mono opacity-70">· {e.ip}</span>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-border bg-surface/40 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
