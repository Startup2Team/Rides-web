"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "../_components";
import {
  PeriodFilter,
  periodLabel,
  readCustomRange,
  readPeriod,
  type Period,
} from "../_period-filter";
import { exportGeneratedReport } from "./download-report";
import { generateReport, type GeneratedReport, type ReportMeta } from "./report-content";
import type { ReportFormat } from "./new-report-modal";
import { NewReportModal, type ReportTemplate } from "./new-report-modal";
import { CreateReportModal } from "./create-report-modal";
import {
  buildScopeLabel,
  defaultReportFilters,
  EXPORT_TEMPLATES,
  REPORT_CATEGORIES,
  type ExportTemplate,
  type ReportCategory,
} from "./reports-templates";
import { deleteReport, generateReport as logReportToBackend, getReports, type BackendReport } from "@/lib/api";
import { MOCK_REPORTS } from "@/lib/mock-reports";
import { useAuth } from "@/context/auth-context";
import { saveReport, listSavedReports, getSavedReport, removeSavedReport } from "@/lib/report-store";

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
  hasContent?: boolean;
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

function newLocalReport(template: ExportTemplate, scope: string, format: ReportFormat, id: string): DownloadRow {
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
    hasContent: true,
  };
}

function mapSavedReport(r: ReturnType<typeof listSavedReports>[number]): DownloadRow {
  return {
    id: r.id,
    templateId: r.templateId,
    name: r.name,
    category: (r.category as ReportCategory) ?? "Operations",
    scope: r.scope,
    format: r.format,
    generatedAt: new Date(r.generatedAtMs).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    generatedAtMs: r.generatedAtMs,
    size: r.format === "PDF" ? "~840 KB" : "~160 KB",
    createdBy: r.createdBy,
    hasContent: true,
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

function readUrlFilters(template: ExportTemplate, searchParams: any): Record<string, string> {
  const out = defaultReportFilters(template);
  for (const f of template.filters ?? []) {
    const urlVal = searchParams.get(`f_${f.id}`);
    if (urlVal !== null) {
      out[f.id] = urlVal;
    }
  }
  return out;
}

export function ReportsConsole() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, roleName } = useAuth();

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
    readUrlFilters(selectedTemplate, searchParams),
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
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | ReportCategory>("all");

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
    const openmodal = searchParams.get("openmodal");
    if (openmodal === "true") {
      setReportFilters(readUrlFilters(selectedTemplate, searchParams));
    } else {
      setReportFilters(defaultReportFilters(selectedTemplate));
    }
    setGeneratedReport(null);
    setGeneratedForKey(null);
    setPreviewPage(1);
    setTableSearch("");
  }, [templateId, selectedTemplate, searchParams]);

  useEffect(() => {
    const local = listSavedReports().map(mapSavedReport);
    const localIds = new Set(local.map((r) => r.id));

    getReports({ limit: "50", offset: "0" })
      .then((res) => {
        const backend =
          (res.reports ?? []).length > 0
            ? res.reports!.map(mapBackendReport)
            : MOCK_REPORTS.map(mapBackendReport);
        setDownloads([...local, ...backend.filter((r) => !localIds.has(r.id))]);
      })
      .catch(() => setDownloads([...local, ...MOCK_REPORTS.map(mapBackendReport).filter((r) => !localIds.has(r.id))]))
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

  useEffect(() => {
    const openmodal = searchParams.get("openmodal");
    if (openmodal === "true") {
      setCreateOpen(true);
      // Clean query parameter from browser URL bar without reloading
      const next = new URLSearchParams(window.location.search);
      next.delete("openmodal");
      const qs = next.toString();
      window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    }
  }, [searchParams]);

  async function handleExport(format: ReportFormat) {
    if (!generatedReport || isStale) return;
    setExporting(true);
    try {
      const slug = scopeLabel.replace(/\s+/g, "-").replace(/·/g, "").toLowerCase();
      const id = `RPT-${Date.now().toString(36).toUpperCase()}`;
      const pdfMeta = {
        logoSrc: "/ridelogo-primary.png",
        generatedByName: user?.name,
        generatedByEmail: user?.email,
        generatedByRole: roleName ?? undefined,
      };
      await exportGeneratedReport(generatedReport, `${templateId}-${slug}`, format, pdfMeta);

      saveReport({
        id,
        templateId,
        name: selectedTemplate.name,
        category: selectedTemplate.category,
        scope: scopeLabel,
        format,
        generatedAtMs: Date.now(),
        createdBy: user?.name ?? "Admin",
        report: generatedReport,
        pdfMeta,
      });
      const row = newLocalReport(selectedTemplate, scopeLabel, format, id);
      setDownloads((prev) => [row, ...prev]);
      setToast(`${selectedTemplate.name} downloaded (${format})`);

      logReportToBackend({
        template: templateId,
        format,
        date_range: scopeLabel,
        created_by: user?.name ?? "Admin",
      }).catch(() => {});
    } finally {
      setExporting(false);
    }
  }

  async function redownload(row: DownloadRow) {
    const saved = getSavedReport(row.id);
    if (!saved) {
      setToast("Original file isn't available for re-download on this device.");
      return;
    }
    const slug = saved.scope.replace(/\s+/g, "-").replace(/·/g, "").toLowerCase();
    await exportGeneratedReport(saved.report, `${saved.templateId}-${slug}`, saved.format, saved.pdfMeta);
    setToast(`${saved.name} downloaded again`);
  }

  function removeDownload(id: string) {
    setDownloads((prev) => prev.filter((r) => r.id !== id));
    removeSavedReport(id);
    deleteReport(id).catch(() => {});
    setToast("Removed from download history");
  }

  function updateFilter(fieldId: string, value: string) {
    setReportFilters((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleCreateCustomReport(payload: {
    title: string;
    description: string;
    templateId: string;
    period: Period;
    customRange: { from: string; to: string } | null;
    filters: Record<string, string>;
    format: ReportFormat;
  }) {
    setCreateOpen(false);
    setGenerating(true);
    try {
      const template = EXPORT_TEMPLATES.find((t) => t.id === payload.templateId) ?? EXPORT_TEMPLATES[0]!;
      const rangeLabel = periodLabel(payload.period, payload.customRange);
      
      const vehicleFilter = payload.filters.vehicle;
      const vehicle =
        vehicleFilter && vehicleFilter !== "all"
          ? (template.filters?.find((f) => f.id === "vehicle")?.options.find((o) => o.id === vehicleFilter)?.label ?? vehicleFilter)
           : undefined;
      const scopeLabel = buildScopeLabel({ range: rangeLabel, vehicle });

      const meta = {
        scopeLabel,
        period: payload.period,
        customRange: payload.customRange,
        filters: payload.filters,
      };

      const report = await generateReport(payload.templateId, meta);
      const customReport: GeneratedReport = {
        ...report,
        title: payload.title,
        subtitle: payload.description || report.subtitle,
      };

      const id = `RPT-${Date.now().toString(36).toUpperCase()}`;
      const pdfMeta = {
        logoSrc: "/ridelogo-primary.png",
        generatedByName: user?.name,
        generatedByEmail: user?.email,
        generatedByRole: roleName ?? undefined,
      };

      // Auto-download PDF/CSV immediately!
      await exportGeneratedReport(customReport, `${payload.templateId}-${payload.title.toLowerCase().replace(/\s+/g, "-")}`, payload.format, pdfMeta);

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
        pdfMeta,
      });

      const row = {
        id,
        templateId: payload.templateId,
        name: payload.title,
        category: template.category,
        scope: scopeLabel,
        format: payload.format,
        generatedAt: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
        generatedAtMs: Date.now(),
        size: payload.format === "PDF" ? "~840 KB" : "~160 KB",
        createdBy: user?.name ?? "Admin",
        hasContent: true,
      };

      setDownloads((prev) => [row, ...prev]);
      setGeneratedReport(customReport);
      setGeneratedForKey(JSON.stringify({
        templateId: payload.templateId,
        period: payload.period,
        customRange: payload.customRange,
        reportFilters: payload.filters,
      }));
      setPreviewPage(1);
      setTableSearch("");
      setToast(`Custom report "${payload.title}" generated & exported!`);
    } catch {
      setToast("Failed to generate custom report.");
    } finally {
      setGenerating(false);
    }
  }

  const generatedAtDisplay = generatedReport?.generatedAt
    ? new Date(generatedReport.generatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 bg-card/40 p-5 rounded-2xl border">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.15em]">Tailored Exports</p>
          <h2 className="text-xl font-bold text-foreground mt-1">Stakeholder Data Delivery</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Generate customized snapshots for third-party partners and organizations.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Custom Report
        </button>
      </div>

      {/* Active Report Preview Card */}
      {generatedReport ? (
        <Card
          title="Report preview"
          action={
            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${CATEGORY_STYLES[selectedTemplate.category]}`}>
              {selectedTemplate.category}
            </span>
          }
          bodyClass="p-0"
        >
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
        </Card>
      ) : null}

      {/* Download history — primary list card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border bg-surface/30 px-5 py-4">
          <p className="text-xs font-semibold text-foreground">Saved reports & export history</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {downloads.length} past export{downloads.length === 1 ? "" : "s"} · Generate a new report from any dashboard page to see it here.
          </p>
        </div>

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
              No exports yet — generate a report from any dashboard page to see it here.
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
                      {r.hasContent ? (
                        <button
                          type="button"
                          onClick={() => redownload(r)}
                          aria-label="Download"
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                      ) : null}
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

      <CreateReportModal
        open={createOpen}
        initialTemplateId={templateId}
        initialPeriod={period}
        initialFilters={reportFilters}
        generating={generating}
        onClose={() => setCreateOpen(false)}
        onGenerate={handleCreateCustomReport}
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
