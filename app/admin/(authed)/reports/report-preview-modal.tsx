"use client";

import { useState, useMemo, useEffect } from "react";
import type { GeneratedReport } from "./report-content";
import { exportGeneratedReport } from "./download-report";
import { EXPORT_TEMPLATES } from "./reports-templates";

interface ReportPreviewModalProps {
  open: boolean;
  report: GeneratedReport | null;
  onClose: () => void;
  generatedByName?: string;
  generatedByEmail?: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  Operations: "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-900/30",
  Drivers: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-900/30",
  Finance: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-900/30",
  Customers: "bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:ring-indigo-900/30",
  Negotiations: "bg-purple-50 text-purple-700 ring-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:ring-purple-900/30",
};

const SUMMARY_TONES = {
  default: "text-foreground",
  primary: "text-primary",
  warning: "text-warning",
  danger: "text-danger",
};

export function ReportPreviewModal({
  open,
  report,
  onClose,
  generatedByName,
  generatedByEmail,
}: ReportPreviewModalProps) {
  const [tableSearch, setTableSearch] = useState("");
  const [previewPage, setPreviewPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const category = useMemo(() => {
    return report ? EXPORT_TEMPLATES.find((t) => t.id === report.templateId)?.category : undefined;
  }, [report]);

  // Reset page and search when report changes
  useEffect(() => {
    setTableSearch("");
    setPreviewPage(1);
  }, [report]);

  // Escape key and overflow handling
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

  const filteredRows = useMemo(() => {
    if (!report) return [];
    if (!tableSearch) return report.rows;
    const query = tableSearch.toLowerCase();
    return report.rows.filter((row) =>
      row.some((cell) => String(cell).toLowerCase().includes(query))
    );
  }, [report, tableSearch]);

  if (!open || !report) return null;

  const PAGE_SIZE = 10;

  const totalPreviewPages = Math.ceil(filteredRows.length / PAGE_SIZE) || 1;
  const safePreviewPage = Math.min(previewPage, totalPreviewPages);
  const previewStart = (safePreviewPage - 1) * PAGE_SIZE;
  const previewRows = filteredRows.slice(previewStart, previewStart + PAGE_SIZE);

  async function handleDownload() {
    if (!report) return;
    setExporting(true);
    try {
      const pdfMeta = {
        logoSrc: "/ridelogo-primary.png",
        generatedByName,
        generatedByEmail,
      };
      await exportGeneratedReport(
        report,
        `${report.templateId}-${report.title.toLowerCase().replace(/\s+/g, "-")}`,
        "PDF",
        pdfMeta
      );
    } catch (e) {
      alert("Failed to export PDF.");
    } finally {
      setExporting(false);
    }
  }

  const generatedAtDisplay = report.generatedAt
    ? new Date(report.generatedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all">
        {/* Header */}
        <div className="border-b border-border bg-surface/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Report Preview</h2>
            <p className="text-xs text-muted-foreground">Review the compiled snapshot and verify details before export.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-surface text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4.5 w-4.5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-4 bg-surface/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-foreground">{report.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{report.subtitle}</p>
                </div>
                {category && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset ${CATEGORY_STYLES[category] ?? "bg-surface ring-border"}`}>
                    {category}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                <span>
                  Period: <span className="font-semibold text-foreground">{report.periodLabel}</span>
                </span>
                {generatedAtDisplay ? (
                  <span>
                    Generated: <span className="font-semibold text-foreground">{generatedAtDisplay}</span>
                  </span>
                ) : null}
                {report.filtersApplied.length > 0 ? (
                  <span>
                    Filters:{" "}
                    <span className="font-semibold text-foreground">
                      {report.filtersApplied.map((f) => `${f.label}: ${f.value}`).join(" · ")}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-4 bg-surface/5">
              {report.summary.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface/40 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  <p className={`mt-1 text-xl font-bold ${SUMMARY_TONES[s.tone ?? "default"]}`}>
                    {typeof s.value === "number" ? s.value.toLocaleString("en-US") : s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Insights */}
            {report.insights.length > 0 ? (
              <div className="border-b border-border px-5 py-3 bg-surface/10">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Insights</p>
                <ul className="mt-2 space-y-1.5">
                  {report.insights.map((line, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-foreground/90">
                      · {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Search and Records bar */}
            <div className="flex flex-col gap-2 border-b border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between bg-surface/5">
              <input
                type="search"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search in report data…"
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary sm:max-w-xs"
              />
              <span className="text-[10px] text-muted-foreground">
                {filteredRows.length} record{filteredRows.length === 1 ? "" : "s"} · {report.headers.length} columns
              </span>
            </div>

            {/* Data Table */}
            <div className="max-h-[16rem] overflow-auto">
              <table className="w-full min-w-[640px] text-left text-[11px]">
                <thead className="sticky top-0 bg-surface/95 backdrop-blur z-[5]">
                  <tr>
                    {report.headers.map((h) => (
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
                        colSpan={report.headers.length}
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

            {/* Pagination */}
            {filteredRows.length > PAGE_SIZE ? (
              <div className="flex items-center justify-between border-t border-border px-5 py-3 bg-surface/5">
                <p className="text-xs text-muted-foreground">
                  {previewStart + 1}–{Math.min(previewStart + PAGE_SIZE, filteredRows.length)} of {filteredRows.length} (export includes all rows)
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface/30 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
          
          <button
            type="button"
            disabled={exporting}
            onClick={handleDownload}
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
        </div>
      </div>
    </div>
  );
}
