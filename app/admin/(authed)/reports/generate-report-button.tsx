"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { saveReport } from "@/lib/report-store";
import { generateReport as logReportToBackend } from "@/lib/api";
import { generateReport, type ReportMeta } from "./report-content";
import { EXPORT_TEMPLATES, buildScopeLabel } from "./reports-templates";
import { CreateReportModal } from "./create-report-modal";
import { exportGeneratedReport } from "./download-report";
import { periodLabel, type Period } from "../_period-filter";
import type { ReportFormat } from "./new-report-modal";

export function GenerateReportButton({
  templateId,
  meta,
  label = "Generate report",
  className,
}: {
  templateId: string;
  meta: ReportMeta;
  format?: "PDF" | "CSV";
  label?: string;
  className?: string;
}) {
  const { user, roleName } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleGenerateCustom(payload: {
    title: string;
    description: string;
    templateId: string;
    period: Period;
    customRange: { from: string; to: string } | null;
    filters: Record<string, string>;
    format: ReportFormat;
  }) {
    setBusy(true);
    try {
      const template = EXPORT_TEMPLATES.find((t) => t.id === payload.templateId) ?? EXPORT_TEMPLATES[0]!;
      const rangeLabel = periodLabel(payload.period, payload.customRange);
      
      const vehicleFilter = payload.filters.vehicle;
      const vehicle =
        vehicleFilter && vehicleFilter !== "all"
          ? (template.filters?.find((f) => f.id === "vehicle")?.options.find((o) => o.id === vehicleFilter)?.label ?? vehicleFilter)
          : undefined;
      const scopeLabel = buildScopeLabel({ range: rangeLabel, vehicle });

      const customMeta = {
        scopeLabel,
        period: payload.period,
        customRange: payload.customRange,
        filters: payload.filters,
      };

      // Compile report data
      const report = await generateReport(payload.templateId, customMeta);
      const customReport = {
        ...report,
        title: payload.title,
        subtitle: payload.description || report.subtitle,
      };

      const id = `RPT-${Date.now().toString(36).toUpperCase()}`;
      const metaInfo = {
        logoSrc: "/ridelogo-primary.png",
        generatedByName: user?.name,
        generatedByEmail: user?.email,
        generatedByRole: roleName ?? undefined,
      };

      // Save to local storage history
      saveReport({
        id,
        templateId: payload.templateId,
        name: payload.title,
        category: template.category,
        scope: scopeLabel,
        format: payload.format,
        generatedAtMs: Date.now(),
        createdBy: user?.name ?? "Admin",
        report: customReport,
        pdfMeta: metaInfo,
      });

      // Log report log to backend
      logReportToBackend({
        template: payload.templateId,
        format: payload.format,
        date_range: scopeLabel,
        created_by: user?.name ?? "Admin",
      }).catch(() => {});

      // Compile and download PDF immediately
      await exportGeneratedReport(customReport, `${payload.templateId}-${payload.title.toLowerCase().replace(/\s+/g, "-")}`, payload.format, metaInfo);
      
      setOpen(false);
      setToast(`Report "${payload.title}" downloaded!`);
    } catch {
      setOpen(false);
      setToast("Failed to generate report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {busy ? (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
        {busy ? "Generating…" : label}
      </button>

      <CreateReportModal
        open={open}
        initialTemplateId={templateId}
        initialPeriod={meta.period}
        initialFilters={meta.filters}
        generating={busy}
        onClose={() => setOpen(false)}
        onGenerate={handleGenerateCustom}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      )}
    </>
  );
}
