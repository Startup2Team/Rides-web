"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "../_components";
import {
  PeriodFilter,
  periodLabel,
  readCustomRange,
  readPeriod,
} from "../_period-filter";
import { exportGeneratedReport } from "./download-report";
import { generateReport, type GeneratedReport, type ReportMeta } from "./report-content";
import type { ReportFormat } from "./new-report-modal";
import { NewReportModal, type ReportTemplate } from "./new-report-modal";
import {
  buildScopeLabel,
  defaultReportFilters,
  EXPORT_TEMPLATES,
  filterLabel,
  REPORT_CATEGORIES,
  type ExportTemplate,
  type ReportCategory,
} from "./reports-templates";
import { deleteReport, generateReport as logReportToBackend, getReports, type BackendReport } from "@/lib/api";
import { MOCK_REPORTS } from "@/lib/mock-reports";

const PAGE_SIZE = 12;

const CATEGORY_STYLES: Record<ReportCategory, string> = {
  Operations: "bg-sky-50 text-sky-700 ring-sky-100",
  Drivers: "bg-violet-50 text-violet-700 ring-violet-100",
  Finance: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Customers: "bg-amber-50 text-amber-700 ring-amber-100",
  Negotiations: "bg-orange-50 text-orange-700 ring-orange-100",
};

const SUMMARY_TONES: Record<string, string> = {
  default: "text-foreground",
  primary: "text-primary",
  warning: "text-amber-600",
  danger: "text-red-600",
};

const FORMAT_STYLES: Record<ReportFormat, string> = {
  PDF: "bg-red-50 text-red-700 ring-red-100",
  CSV: "bg-sky-50 text-sky-700 ring-sky-100",
};

type DownloadRow = {
  id: string;
  templateId: string;
  name: string;
  category: ReportCategory;
  scope: string;
  format: ReportFormat;
  generatedAt: string;
  generatedAtMs: number;
  size: string;
  createdBy: string;
};

function readTemplateId(params: { get(k: string): string | null }): string {
  const id = params.get("type");
  return EXPORT_TEMPLATES.some((t) => t.id === id) ? id! : EXPORT_TEMPLATES[0]!.id;
}

function mapBackendReport(r: BackendReport): DownloadRow {
  const template = EXPORT_TEMPLATES.find((t) => t.id === r.template);
  const generatedAtMs = r.generated_at
    ? new Date(r.generated_at).getTime()
    : new Date(r.created_at).getTime();
  return {
    id: r.id,
    templateId: r.template,
    name: template?.name ?? r.template,
    category: template?.category ?? "Operations",
    scope: r.date_range ?? "—",
    format: (r.format as ReportFormat) ?? "PDF",
    generatedAt: new Date(generatedAtMs).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    generatedAtMs,
    size: r.file_size ?? "—",
    createdBy: r.created_by ?? "Admin",
  };
}

function newLocalReport(template: ExportTemplate, scope: string, format: ReportFormat): DownloadRow {
  const id = `RPT-${Date.now().toString(36).toUpperCase()}`;
  const now = Date.now();
  return {
    id,
    templateId: template.id,
    name: template.name,
    category: template.category,
    scope,
    format,
    generatedAt: new Date(now).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    generatedAtMs: now,
    size: format === "PDF" ? "~840 KB" : "~160 KB",
    createdBy: "You",
  };
}

function FormatIcon({ format }: { format: ReportFormat }) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold uppercase ring-1 ring-inset ${FORMAT_STYLES[format]}`}
    >
      {format}
    </span>
  );
}

export function ReportsConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const period = readPeriod(searchParams);
  const customRange = readCustomRange(searchParams);
  const rangeLabel = periodLabel(period, customRange);
  const templateId = readTemplateId(searchParams);

  const selectedTemplate = EXPORT_TEMPLATES.find((t) => t.id === templateId) ?? EXPORT_TEMPLATES[0]!;

  const setUrlParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set(key, value);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const [reportFilters, setReportFilters] = useState<Record<string, string>>(() =>
    defaultReportFilters(selectedTemplate),
  );
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [generatedForKey, setGeneratedForKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [tableSearch, setTableSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const configKey = useMemo(
    () => JSON.stringify({ templateId, period, customRange, reportFilters }),
    [templateId, period, customRange, reportFilters],
  );

  const isStale = generatedReport !== null && generatedForKey !== configKey;

  const scopeLabel = useMemo(() => {
    const vehicleFilter = reportFilters.vehicle;
    const vehicle =
      vehicleFilter && vehicleFilter !== "all"
        ? (selectedTemplate.filters?.find((f) => f.id === "vehicle")?.options.find((o) => o.id === vehicleFilter)?.label ?? vehicleFilter)
        : undefined;
    return buildScopeLabel({ range: rangeLabel, vehicle });
  }, [rangeLabel, reportFilters.vehicle, selectedTemplate.filters]);

  const reportMeta: ReportMeta = useMemo(
    () => ({
      scopeLabel,
      period,
      customRange,
      filters: reportFilters,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on primitives, not the fresh customRange object identity
    [scopeLabel, period, customRange?.from, customRange?.to, reportFilters],
  );

  const modalTemplates: ReportTemplate[] = useMemo(
    () =>
      EXPORT_TEMPLATES.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        formats: t.formats,
      })),
    [],
  );

  useEffect(() => {
    setReportFilters(defaultReportFilters(selectedTemplate));
    setGeneratedReport(null);
    setGeneratedForKey(null);
    setPreviewPage(1);
    setTableSearch("");
  }, [templateId, selectedTemplate]);

  useEffect(() => {
    getReports({ limit: "50", offset: "0" })
      .then((res) => {
        const list =
          (res.reports ?? []).length > 0
            ? res.reports!.map(mapBackendReport)
            : MOCK_REPORTS.map(mapBackendReport);
        setDownloads(list);
      })
      .catch(() => setDownloads(MOCK_REPORTS.map(mapBackendReport)))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredRows = useMemo(() => {
    if (!generatedReport) return [];
    const q = tableSearch.trim().toLowerCase();
    if (!q) return generatedReport.rows;
    return generatedReport.rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(q)),
    );
  }, [generatedReport, tableSearch]);

  const totalPreviewPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePreviewPage = Math.min(previewPage, totalPreviewPages);
  const previewStart = (safePreviewPage - 1) * PAGE_SIZE;
  const previewRows = filteredRows.slice(previewStart, previewStart + PAGE_SIZE);

  useEffect(() => {
    setPreviewPage(1);
  }, [tableSearch, generatedReport?.templateId]);

  const filteredHistory = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    return downloads
      .filter((r) => {
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.scope.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.generatedAtMs - a.generatedAtMs);
  }, [downloads, historyQuery]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, historyTotalPages);
  const historyStart = (safeHistoryPage - 1) * PAGE_SIZE;
  const historyPaginated = filteredHistory.slice(historyStart, historyStart + PAGE_SIZE);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const report = await generateReport(templateId, reportMeta);
      setGeneratedReport(report);
      setGeneratedForKey(configKey);
      setPreviewPage(1);
      setTableSearch("");
      setToast(`${selectedTemplate.name} generated — review the preview below`);
    } catch {
      setToast("Failed to generate report. Check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExport(format: ReportFormat) {
    if (!generatedReport || isStale) return;
    setExporting(true);
    try {
      const slug = scopeLabel.replace(/\s+/g, "-").replace(/·/g, "").toLowerCase();
      exportGeneratedReport(generatedReport, `${templateId}-${slug}`, format);
      const row = newLocalReport(selectedTemplate, scopeLabel, format);
      setDownloads((prev) => [row, ...prev]);
      setToast(`${selectedTemplate.name} downloaded (${format})`);

      logReportToBackend({
        template: templateId,
        format,
        date_range: scopeLabel,
        created_by: "Admin",
      }).catch(() => {});
    } finally {
      setExporting(false);
    }
  }

  function removeDownload(id: string) {
    setDownloads((prev) => prev.filter((r) => r.id !== id));
    deleteReport(id).catch(() => {});
    setToast("Removed from download history");
  }

  function updateFilter(fieldId: string, value: string) {
    setReportFilters((prev) => ({ ...prev, [fieldId]: value }));
  }

  const generatedAtDisplay = generatedReport?.generatedAt
    ? new Date(generatedReport.generatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl" aria-hidden />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Report generation</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/90">
              Select a report type, set the period and filters, then click{" "}
              <span className="font-semibold text-foreground">Generate Report</span>. Review the preview before
              exporting — the PDF matches exactly what you see on screen.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="inline-flex h-9 shrink-0 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            View analytics →
          </Link>
        </div>
      </div>

      {/* Step 1–3: Configuration */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-surface/30 px-5 py-4">
          <p className="text-xs font-semibold text-foreground">Configure report</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Step 1 — report type · Step 2 — period · Step 3 — optional filters
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label htmlFor="report-type" className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              1. Report type
            </label>
            <select
              id="report-type"
              value={templateId}
              onChange={(e) => setUrlParam("type", e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground outline-none focus:border-primary sm:max-w-md"
            >
              {REPORT_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
                const templates = EXPORT_TEMPLATES.filter((t) => t.category === cat.id);
                if (templates.length === 0) return null;
                return (
                  <optgroup key={cat.id} label={cat.label}>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{selectedTemplate.description}</p>
            <span
              className={`mt-2 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${CATEGORY_STYLES[selectedTemplate.category]}`}
            >
              {selectedTemplate.category}
            </span>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              2. Reporting period
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PeriodFilter />
              <span className="text-[11px] text-muted-foreground">
                Scope: <span className="font-semibold text-foreground">{rangeLabel}</span>
              </span>
            </div>
          </div>

          {(selectedTemplate.filters?.length ?? 0) > 0 ? (
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                3. Optional filters
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {selectedTemplate.filters!.map((field) => (
                  <div key={field.id}>
                    <label
                      htmlFor={`filter-${field.id}`}
                      className="mb-1.5 block text-[11px] font-medium text-foreground"
                    >
                      {field.label}
                    </label>
                    <select
                      id={`filter-${field.id}`}
                      value={reportFilters[field.id] ?? field.defaultValue ?? "all"}
                      onChange={(e) => updateFilter(field.id, e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">No additional filters for this report type.</p>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-foreground">
              {isStale ? (
                <span className="font-medium text-amber-600">Filters changed — regenerate to update the preview.</span>
              ) : generatedReport ? (
                <span>Report ready for export.</span>
              ) : (
                <span>Configure options above, then generate.</span>
              )}
            </p>
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Generating…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Step 4–6: Preview */}
      <Card
        title="Report preview"
        action={
          generatedReport ? (
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${CATEGORY_STYLES[selectedTemplate.category]}`}>
              {selectedTemplate.category}
            </span>
          ) : null
        }
        bodyClass="p-0"
      >
        {!generatedReport ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7" aria-hidden>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No report generated yet</p>
            <p className="mt-1 max-w-sm text-[11px] text-muted-foreground">
              Select your options above and click Generate Report. A structured preview with summary metrics and
              detailed data will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="border-b border-border px-5 py-4">
              <p className="text-base font-semibold text-foreground">{generatedReport.title}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{generatedReport.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                <span>
                  Period: <span className="font-semibold text-foreground">{generatedReport.periodLabel}</span>
                </span>
                {generatedAtDisplay ? (
                  <span>
                    Generated: <span className="font-semibold text-foreground">{generatedAtDisplay}</span>
                  </span>
                ) : null}
                {generatedReport.filtersApplied.length > 0 ? (
                  <span>
                    Filters:{" "}
                    <span className="font-semibold text-foreground">
                      {generatedReport.filtersApplied.map((f) => `${f.label}: ${f.value}`).join(" · ")}
                    </span>
                  </span>
                ) : null}
              </div>
              {isStale ? (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                  Configuration has changed since this report was generated. Regenerate to refresh, or export this
                  snapshot as-is.
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-4">
              {generatedReport.summary.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface/40 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className={`mt-1 text-xl font-bold ${SUMMARY_TONES[s.tone ?? "default"]}`}>
                    {typeof s.value === "number" ? s.value.toLocaleString("en-US") : s.value}
                  </p>
                </div>
              ))}
            </div>

            {generatedReport.insights.length > 0 ? (
              <div className="border-b border-border px-5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Insights</p>
                <ul className="mt-2 space-y-1.5">
                  {generatedReport.insights.map((line, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-foreground/90">
                      · {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search in report data…"
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary sm:max-w-xs"
              />
              <span className="text-[10px] text-muted-foreground">
                {filteredRows.length} record{filteredRows.length === 1 ? "" : "s"} · {generatedReport.headers.length}{" "}
                columns
              </span>
            </div>

            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full min-w-[640px] text-left text-[11px]">
                <thead className="sticky top-0 bg-surface/95 backdrop-blur">
                  <tr>
                    {generatedReport.headers.map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap border-b border-border px-3 py-2.5 font-semibold text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={generatedReport.headers.length}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        {tableSearch ? "No rows match your search." : "No data available for this report."}
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border/60 last:border-0 hover:bg-primary/[0.02]">
                        {row.map((cell, ci) => (
                          <td key={ci} className="whitespace-nowrap px-3 py-2.5 text-foreground">
                            {typeof cell === "number" ? cell.toLocaleString("en-US") : cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredRows.length > PAGE_SIZE ? (
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <p className="text-xs text-muted-foreground">
                  {previewStart + 1}–{Math.min(previewStart + PAGE_SIZE, filteredRows.length)} of {filteredRows.length}{" "}
                  (export includes all rows)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePreviewPage === 1}
                    onClick={() => setPreviewPage(safePreviewPage - 1)}
                    className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={safePreviewPage === totalPreviewPages}
                    onClick={() => setPreviewPage(safePreviewPage + 1)}
                    className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-muted-foreground">
                Export uses the exact data shown above — no second fetch.
              </p>
              <div className="flex gap-2">
                {selectedTemplate.formats.includes("CSV") ? (
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={() => handleExport("CSV")}
                    className="inline-flex h-9 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground hover:border-primary/30 disabled:opacity-40"
                  >
                    Export CSV
                  </button>
                ) : null}
                {selectedTemplate.formats.includes("PDF") ? (
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={() => handleExport("PDF")}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 disabled:opacity-40"
                  >
                    {exporting ? (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                    Download PDF
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setScheduleOpen(true)}
                  className="inline-flex h-9 items-center rounded-xl border border-border px-4 text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Download history — secondary */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setHistoryOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface/40"
        >
          <div>
            <p className="text-xs font-semibold text-foreground">Download history</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {downloads.length} past export{downloads.length === 1 ? "" : "s"}
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`h-4 w-4 text-muted-foreground transition-transform ${historyOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {historyOpen ? (
          <div className="border-t border-border">
            <div className="border-b border-border px-4 py-3">
              <input
                type="search"
                value={historyQuery}
                onChange={(e) => {
                  setHistoryQuery(e.target.value);
                  setHistoryPage(1);
                }}
                placeholder="Search name, ID, scope…"
                className="h-8 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary sm:max-w-xs"
              />
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-12">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                No exports yet — generate and download your first report above.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {historyPaginated.map((r) => (
                    <li key={r.id}>
                      <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4">
                        <FormatIcon format={r.format} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                            <span
                              className={`rounded px-1 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${CATEGORY_STYLES[r.category]}`}
                            >
                              {r.category}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {r.scope} · {r.generatedAt} · {r.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDownload(r.id)}
                          aria-label="Remove"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {filteredHistory.length > PAGE_SIZE ? (
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      {historyStart + 1}–{Math.min(historyStart + PAGE_SIZE, filteredHistory.length)} of{" "}
                      {filteredHistory.length}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setHistoryPage(Math.max(1, safeHistoryPage - 1))}
                        disabled={safeHistoryPage === 1}
                        className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryPage(Math.min(historyTotalPages, safeHistoryPage + 1))}
                        disabled={safeHistoryPage === historyTotalPages}
                        className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      <NewReportModal
        open={scheduleOpen}
        templates={modalTemplates}
        initialTemplateId={templateId}
        onClose={() => setScheduleOpen(false)}
        onGenerate={() => {
          setScheduleOpen(false);
          setToast("Scheduled report saved (demo)");
        }}
      />

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
