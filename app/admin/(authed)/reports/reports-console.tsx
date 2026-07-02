"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "../_components";
import {
  NewReportModal,
  type ReportFormat,
  type ReportTemplate,
} from "./new-report-modal";
import { downloadReport } from "./download-report";
import {
  getReports,
  getScheduledReports,
  generateReport,
  createScheduledReport,
  toggleScheduledReport,
  deleteReport as apiDeleteReport,
  downloadAdminReportFile,
  type BackendReport,
  type BackendScheduled,
} from "@/lib/api";

type ReportStatus = "Ready" | "Generating" | "Failed" | "Queued";

type Report = {
  id: string;
  name: string;
  templateId: string;
  generatedAt: string;
  generatedBy: string;
  format: ReportFormat;
  size: string;
  status: ReportStatus;
  range: string;
};

type Schedule = {
  id: string;
  name: string;
  templateId: string;
  frequency: string;
  nextRun: string;
  lastRun: string;
  recipients: string[];
  format: ReportFormat;
  active: boolean;
};

const templates: ReportTemplate[] = [
  {
    id: "ops-daily",
    name: "Daily Operations Report",
    description: "Snapshot of rides, revenue, drivers, customers — last 24h.",
    category: "Operations",
    formats: ["PDF", "Excel"],
  },
  {
    id: "driver-performance",
    name: "Driver Performance",
    description: "Acceptance, completion, rating per driver.",
    category: "Drivers",
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    id: "revenue-breakdown",
    name: "Revenue Breakdown",
    description: "Earnings, commission, payouts split by vehicle category.",
    category: "Finance",
    formats: ["PDF", "Excel"],
  },
  {
    id: "negotiation-stats",
    name: "Negotiation Statistics",
    description: "Round counts, outcomes, fare uplift trends.",
    category: "Negotiations",
    formats: ["PDF", "CSV"],
  },
  {
    id: "customer-cohort",
    name: "Customer Cohort Retention",
    description: "Sign-up cohorts and 1/7/30-day return rates.",
    category: "Customers",
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    id: "ride-completion",
    name: "Ride Completion Rate",
    description: "Funnel from request to completed trip, per region.",
    category: "Operations",
    formats: ["PDF", "Excel"],
  },
];

function mapReport(r: BackendReport): Report {
  const statusMap: Record<string, ReportStatus> = {
    PENDING: "Generating", READY: "Ready", FAILED: "Failed",
  };
  const template = templates.find((t) => t.id === r.template);
  return {
    id: r.id,
    name: template ? `${template.name} — ${r.date_range || "Custom"}` : `${r.template} — ${r.date_range || "Custom"}`,
    templateId: r.template,
    generatedAt: r.generated_at
      ? new Date(r.generated_at).toLocaleString()
      : new Date(r.created_at).toLocaleString(),
    generatedBy: r.created_by ?? "System",
    format: (r.format as ReportFormat) ?? "PDF",
    size: r.file_size ?? "—",
    status: statusMap[r.status] ?? "Ready",
    range: r.date_range ?? "—",
  };
}

function mapSchedule(s: BackendScheduled): Schedule {
  const template = templates.find((t) => t.id === s.template);
  return {
    id: s.id,
    name: template?.name ?? s.template,
    templateId: s.template,
    frequency: s.frequency,
    nextRun: s.next_run ? new Date(s.next_run).toLocaleString() : "—",
    lastRun: "—",
    recipients: Array.isArray(s.recipients) ? s.recipients : [],
    format: (s.format as ReportFormat) ?? "PDF",
    active: s.is_active,
  };
}

const statusStyles: Record<ReportStatus, string> = {
  Ready: "bg-primary/15 text-primary",
  Generating: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Failed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  Queued: "bg-muted text-muted-foreground",
};

const formatColors: Record<ReportFormat, string> = {
  PDF: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  CSV: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Excel: "bg-primary/15 text-primary",
};

type Tab = "recent" | "scheduled";
type FormatFilter = "all" | ReportFormat;

const PAGE_SIZE = 6;

function categoryIcon(category: ReportTemplate["category"]) {
  switch (category) {
    case "Operations":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case "Drivers":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
        </svg>
      );
    case "Finance":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "Customers":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "Negotiations":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  }
}

export function ReportsConsole() {
  const [reports, setReports] = useState<Report[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [tab, setTab] = useState<Tab>("recent");

  useEffect(() => {
    getReports({ limit: "50", offset: "0" })
      .then((res) => setReports((res.reports ?? []).map(mapReport)))
      .catch(() => null);
    getScheduledReports()
      .then((res) => setSchedules((res.scheduled ?? []).map(mapSchedule)))
      .catch(() => null);
  }, []);
  const [query, setQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [presetTemplateId, setPresetTemplateId] = useState<string | undefined>();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (formatFilter !== "all" && r.format !== formatFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.range.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, formatFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filteredReports.length);
  const paginated = filteredReports.slice(start, end);

  function openModal(templateId?: string) {
    setPresetTemplateId(templateId);
    setModalOpen(true);
  }

  async function handleGenerate(payload: {
    templateId: string;
    range: string;
    format: ReportFormat;
    frequency: string;
    recipients: string[];
  }) {
    const template = templates.find((t) => t.id === payload.templateId);
    if (!template) return;
    setModalOpen(false);

    if (payload.frequency === "once") {
      try {
        const rep = await generateReport({
          template: payload.templateId,
          format: payload.format,
          date_range: payload.range,
        });
        setReports((prev) => [mapReport(rep), ...prev]);
        setToast(`${template.name} generation started`);
      } catch {
        setToast(`Failed to start ${template.name}`);
      }
    } else {
      try {
        const sr = await createScheduledReport({
          template: payload.templateId,
          format: payload.format,
          frequency: payload.frequency,
          recipients: payload.recipients,
        });
        setSchedules((prev) => [mapSchedule(sr), ...prev]);
        setToast(`Schedule created for ${template.name}`);
        setTab("scheduled");
      } catch {
        setToast(`Failed to create schedule for ${template.name}`);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title="Quick generate"
        bodyClass="p-4"
        action={
          <button
            type="button"
            onClick={() => openModal()}
            className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            + New custom report
          </button>
        }
      >
        <p className="text-xs text-muted-foreground">
          Pick a template to generate instantly or schedule recurring runs.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.slice(0, 6).map((t) => (
            <div
              key={t.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {categoryIcon(t.category)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {t.name}
                    </p>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {t.formats.map((f) => (
                    <span
                      key={f}
                      className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${formatColors[f]}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openModal(t.id)}
                  className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                >
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={tab === "recent" ? "Report inbox" : "Scheduled reports"}
        action={
          <div className="flex items-center gap-2">
            {tab === "recent" ? (
              <>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
                  {(["all", "PDF", "CSV", "Excel"] as FormatFilter[]).map((f) => {
                    const active = formatFilter === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setFormatFilter(f);
                          setPage(1);
                        }}
                        className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          active
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f === "all" ? "All formats" : f}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="search"
                  placeholder="Search reports…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 w-56 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </>
            ) : null}
          </div>
        }
      >
        <div className="flex items-center gap-1 border-b border-border px-3 py-2">
          {(
            [
              { id: "recent", label: "Recent", count: reports.length },
              { id: "scheduled", label: "Scheduled", count: schedules.length },
            ] as { id: Tab; label: string; count: number }[]
          ).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    active
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {tab === "recent" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 text-left font-semibold">Report</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Range</th>
                    <th className="px-4 py-2.5 text-left font-semibold">
                      Generated by
                    </th>
                    <th className="px-4 py-2.5 text-left font-semibold">When</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Format</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Size</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                    <th className="px-4 py-2.5 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No reports match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r) => (
                      <tr key={r.id} className="hover:bg-surface/50">
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-foreground">
                            {r.name}
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {r.id}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {r.range}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {r.generatedBy}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {r.generatedAt}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${formatColors[r.format]}`}
                          >
                            {r.format}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {r.size}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[r.status]}`}
                          >
                            {r.status === "Generating" ? (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
                              </span>
                            ) : null}
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                          {r.status === "Ready" ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const fromApi = await downloadAdminReportFile(r.id, r.id).catch(() => false);
                                if (!fromApi) {
                                  downloadReport({ templateId: r.templateId, format: r.format, filename: r.id });
                                }
                                setToast(`Downloaded ${r.id}`);
                              }}
                              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                            >
                              Download
                            </button>
                          ) : r.status === "Failed" ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setReports((prev) => prev.map((x) => x.id === r.id ? { ...x, status: "Generating" } : x));
                                setToast(`Retrying ${r.id}`);
                                try {
                                  const rep = await generateReport({ template: r.templateId, format: r.format, date_range: r.range });
                                  setReports((prev) => prev.map((x) => x.id === r.id ? mapReport(rep) : x));
                                } catch { /* ignore */ }
                              }}
                              className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                            >
                              Retry
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Working…</span>
                          )}
                          <button
                            type="button"
                            onClick={async () => {
                              setReports((prev) => prev.filter((x) => x.id !== r.id));
                              try { await apiDeleteReport(r.id); } catch { /* ignore */ }
                            }}
                            className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-2 text-xs text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredReports.length === 0 ? 0 : start + 1}–{end}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {filteredReports.length}
                </span>{" "}
                reports
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-xs text-muted-foreground">
                  Page{" "}
                  <span className="font-semibold text-foreground">{safePage}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-semibold">Schedule</th>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Frequency
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold">Next run</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Recipients</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Format</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Active</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No scheduled reports yet.
                    </td>
                  </tr>
                ) : (
                  schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-foreground">
                          {s.name}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          last run {s.lastRun}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {s.frequency}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {s.nextRun}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">
                        {s.recipients.length === 0 ? (
                          <span className="italic">No recipients</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {s.recipients.map((r) => (
                              <span
                                key={r}
                                className="rounded bg-muted px-1.5 py-0.5 text-foreground"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${formatColors[s.format]}`}
                        >
                          {s.format}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={async () => {
                            setSchedules((prev) =>
                              prev.map((x) => x.id === s.id ? { ...x, active: !x.active } : x)
                            );
                            setToast(s.active ? `${s.name} paused` : `${s.name} resumed`);
                            try { await toggleScheduledReport(s.id); } catch { /* revert */ }
                          }}
                          role="switch"
                          aria-checked={s.active}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            s.active ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                              s.active ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setToast(`Running ${s.name} now`)}
                            className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                          >
                            Run now
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setSchedules((prev) => prev.filter((x) => x.id !== s.id));
                              setToast(`${s.name} schedule removed`);
                            }}
                            className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3.5 w-3.5"
                              aria-hidden
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <NewReportModal
        open={modalOpen}
        templates={templates}
        initialTemplateId={presetTemplateId}
        onClose={() => setModalOpen(false)}
        onGenerate={(payload) =>
          handleGenerate({
            ...payload,
            range: ({
              today: "Today",
              "7d": "Last 7 days",
              "30d": "Last 30 days",
              month: "This month",
              quarter: "This quarter",
              custom: "Custom range",
            } as Record<string, string>)[payload.range] ?? "Custom range",
          })
        }
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

