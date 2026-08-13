"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ReportGeneratedModal({
  open,
  reportName,
  onClose,
}: {
  open: boolean;
  reportName: string;
  onClose: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="mt-4 text-sm font-semibold text-foreground">Report generated successfully</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">{reportName}</span> is saved and ready. Download it
          anytime from the Reports page — its design and layout stay exactly as generated.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 flex-1 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/reports")}
            className="h-9 flex-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Reports
          </button>
        </div>
      </div>
    </div>
  );
}
