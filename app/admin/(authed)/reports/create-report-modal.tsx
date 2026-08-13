"use client";

import { useEffect, useState, useMemo } from "react";
import { EXPORT_TEMPLATES } from "./reports-templates";
import type { ReportFormat } from "./new-report-modal";
import { periodLabel, type Period } from "../_period-filter";

const PLACEHOLDERS: Record<string, { title: string; description: string }> = {
  "ops-daily": {
    title: "Ex: Ride Activity Report",
    description: "Ex: Describe the purpose of compiling this ride activity and cancellation audit log."
  },
  "support-resolution": {
    title: "Ex: Support Case Resolution Audit",
    description: "Ex: Describe the purpose of compiling these solved and closed support cases."
  },
  "ride-completion": {
    title: "Ex: Trip Completion Funnel Report",
    description: "Ex: Describe the purpose of compiling this request-to-complete funnel data."
  },
  "driver-performance": {
    title: "Ex: Driver Performance & Earnings Report",
    description: "Ex: Describe the purpose of compiling these driver metrics and earnings details."
  },
  "driver-registrations": {
    title: "Ex: Driver Registration & Verification Audit",
    description: "Ex: Describe the purpose of auditing driver sign-ups and approval backlogs."
  },
  "revenue-breakdown": {
    title: "Ex: Revenue & Volume Breakdown Report",
    description: "Ex: Describe the purpose of auditing gross earnings and volume by vehicle class."
  },
  "customer-overview": {
    title: "Ex: Customer Registry Overview",
    description: "Ex: Describe the purpose of compiling these customer registration and status records."
  },
  "negotiation-stats": {
    title: "Ex: Fare Negotiation Performance Report",
    description: "Ex: Describe the purpose of auditing negotiation rounds, outcomes, and uplifts."
  }
};

export function CreateReportModal({
  open,
  initialTemplateId,
  initialPeriod,
  initialFilters,
  generating = false,
  onClose,
  onGenerate,
}: {
  open: boolean;
  initialTemplateId?: string;
  initialPeriod?: Period;
  initialFilters?: Record<string, string>;
  generating?: boolean;
  onClose: () => void;
  onGenerate: (payload: {
    title: string;
    description: string;
    templateId: string;
    period: Period;
    customRange: { from: string; to: string } | null;
    filters: Record<string, string>;
    format: ReportFormat;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState(initialTemplateId ?? EXPORT_TEMPLATES[0]?.id ?? "");
  const [period, setPeriod] = useState<Period>(initialPeriod ?? "month");
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters ?? {});
  const format: ReportFormat = "PDF";

  const selectedTemplate = useMemo(() => {
    return EXPORT_TEMPLATES.find((t) => t.id === templateId) ?? EXPORT_TEMPLATES[0]!;
  }, [templateId]);

  const placeholders = useMemo(() => {
    return PLACEHOLDERS[templateId] ?? {
      title: "Ex: Custom Export Report",
      description: "Ex: Describe the target audience or internal purpose of compiling this report."
    };
  }, [templateId]);

  // Reset/initialize filters when template changes
  useEffect(() => {
    if (initialTemplateId && templateId === initialTemplateId && initialFilters) {
      setFilters(initialFilters);
      return;
    }
    const defaults: Record<string, string> = {};
    for (const f of selectedTemplate.filters ?? []) {
      defaults[f.id] = f.defaultValue ?? f.options[0]?.id ?? "all";
    }
    setFilters(defaults);
  }, [selectedTemplate, initialTemplateId, templateId, initialFilters]);

  // Reset wizard on open
  useEffect(() => {
    if (open) {
      const tId = initialTemplateId ?? EXPORT_TEMPLATES[0]?.id ?? "";
      setTitle("");
      setDescription("");
      setTemplateId(tId);
      setPeriod(initialPeriod ?? "month");
      setCustomRange(null);
      setFilters(initialFilters ?? {});
    }
  }, [open, initialTemplateId, initialPeriod, initialFilters]);

  // Escape key listener
  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit() {
    if (!title.trim()) return;
    onGenerate({
      title: title.trim(),
      description: description.trim(),
      templateId,
      period,
      customRange,
      filters,
      format,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all">
        {/* Header */}
        <div className="border-b border-border bg-surface/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Create Report</h2>
            <p className="text-xs text-muted-foreground">Enter a report name, review the details, and generate your report.</p>
          </div>
          <button
            type="button"
            disabled={generating}
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-surface text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="relative flex-1 overflow-y-auto p-6">
          {generating && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/85 backdrop-blur-sm">
              <span className="h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-3.5 text-xs font-semibold text-foreground">Compiling customized report...</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Preparing data rows and layout structure.</p>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Identity details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="report-title" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Report Title
                </label>
                <input
                  id="report-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={placeholders.title}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3.5 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              
              <div>
                <label htmlFor="report-desc" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  id="report-desc"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={placeholders.description}
                  className="w-full rounded-xl border border-border bg-surface p-3.5 text-xs text-foreground outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* Right Column: Parameters & Filters */}
            <div className="space-y-5 border-t border-border pt-5 md:border-t-0 md:pt-0 md:pl-6 md:border-l">
              {/* Period */}
              <div>
                <label htmlFor="report-period" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Reporting Period
                </label>
                <select
                  id="report-period"
                  value={period}
                  onChange={(e) => {
                    const val = e.target.value as Period;
                    setPeriod(val);
                    if (val !== "custom") setCustomRange(null);
                  }}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Date Range</option>
                </select>

                {period === "custom" && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">From</label>
                      <input
                        type="date"
                        value={customRange?.from ?? ""}
                        onChange={(e) => setCustomRange((prev) => ({ from: e.target.value, to: prev?.to ?? "" }))}
                        className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-foreground mb-1">To</label>
                      <input
                        type="date"
                        value={customRange?.to ?? ""}
                        onChange={(e) => setCustomRange((prev) => ({ from: prev?.from ?? "", to: e.target.value }))}
                        className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Filters */}
              {selectedTemplate.filters && selectedTemplate.filters.length > 0 && (
                <div className="space-y-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Filters
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedTemplate.filters.map((f) => (
                      <div key={f.id}>
                        <label className="block text-[11px] font-medium text-foreground mb-1">
                          {f.label}
                        </label>
                        <select
                          value={filters[f.id] ?? f.defaultValue ?? "all"}
                          onChange={(e) => setFilters((prev) => ({ ...prev, [f.id]: e.target.value }))}
                          className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
                        >
                          {f.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border bg-surface/30 px-6 py-4">
          <button
            type="button"
            disabled={!title.trim() || generating}
            onClick={handleSubmit}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-6 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
