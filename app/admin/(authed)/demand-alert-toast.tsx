"use client";

import Link from "next/link";
import { useAdminNotifications } from "@/context/admin-notifications-context";

export function DemandAlertToast() {
  const { latestToast, dismissToast } = useAdminNotifications();

  if (!latestToast || latestToast.source !== "demand") return null;

  const toneStyles =
    latestToast.tone === "danger"
      ? "border-red-200 bg-red-50/95 dark:border-red-900/50 dark:bg-red-950/90"
      : "border-amber-200 bg-amber-50/95 dark:border-amber-900/50 dark:bg-amber-950/90";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex max-w-sm flex-col gap-2">
      <div
        className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-2xl backdrop-blur ${toneStyles}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <span className="relative mt-0.5 flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/80">
              Live demand alert
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">{latestToast.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{latestToast.detail}</p>
            <div className="mt-2 flex items-center gap-3">
              <Link
                href={latestToast.href}
                onClick={dismissToast}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Open heatmap →
              </Link>
              <button
                type="button"
                onClick={dismissToast}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
