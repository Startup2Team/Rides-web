"use client";

import { useEffect, useState } from "react";

export type ReportFormat = "PDF" | "CSV" | "Excel";

export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  category: "Operations" | "Drivers" | "Finance" | "Customers" | "Negotiations";
  formats: ReportFormat[];
};

type DateRange = "today" | "7d" | "30d" | "month" | "quarter" | "custom";

const dateRangeLabels: Record<DateRange, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  month: "This month",
  quarter: "This quarter",
  custom: "Custom",
};

type Frequency = "once" | "daily" | "weekly" | "monthly";

const freqLabels: Record<Frequency, string> = {
  once: "One-time",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export function NewReportModal({
  open,
  templates,
  initialTemplateId,
  onClose,
  onGenerate,
}: {
  open: boolean;
  templates: ReportTemplate[];
  initialTemplateId?: string;
  onClose: () => void;
  onGenerate: (payload: {
    templateId: string;
    range: DateRange;
    format: ReportFormat;
    frequency: Frequency;
    recipients: string[];
  }) => void;
}) {
  const [templateId, setTemplateId] = useState(
    initialTemplateId ?? templates[0]?.id ?? "",
  );
  const [range, setRange] = useState<DateRange>("30d");
  const [format, setFormat] = useState<ReportFormat>("PDF");
  const [frequency, setFrequency] = useState<Frequency>("once");
  const [recipients, setRecipients] = useState<string>("");

  useEffect(() => {
    if (open && initialTemplateId) setTemplateId(initialTemplateId);
  }, [open, initialTemplateId]);

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

  const activeTemplate = templates.find((t) => t.id === templateId);
  const allowedFormats = activeTemplate?.formats ?? ["PDF", "CSV", "Excel"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              New report
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pick a template, set the range, and choose a format. Optionally
              schedule a recurring run.
            </p>
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

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Template
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {templates.map((t) => {
                const active = t.id === templateId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {t.name}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.category}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Date range
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {(Object.keys(dateRangeLabels) as DateRange[]).map((r) => {
                const active = range === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "border border-border bg-card text-foreground hover:bg-surface"
                    }`}
                  >
                    {dateRangeLabels[r]}
                  </button>
                );
              })}
            </div>
            {range === "custom" ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="date"
                  className="h-9 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
                />
                <input
                  type="date"
                  className="h-9 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Format
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              {(["PDF", "CSV", "Excel"] as ReportFormat[]).map((f) => {
                const allowed = allowedFormats.includes(f);
                const active = format === f;
                return (
                  <button
                    key={f}
                    type="button"
                    disabled={!allowed}
                    onClick={() => setFormat(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : allowed
                          ? "border border-border bg-card text-foreground hover:bg-surface"
                          : "border border-border bg-card text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Frequency
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {(Object.keys(freqLabels) as Frequency[]).map((f) => {
                const active = frequency === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "border border-border bg-card text-foreground hover:bg-surface"
                    }`}
                  >
                    {freqLabels[f]}
                  </button>
                );
              })}
            </div>
          </div>

          {frequency !== "once" ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Email recipients
              </p>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="ops@rides.io, finance@rides.io"
                className="mt-2 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Comma-separated. Reports will be attached to each run.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!templateId}
            onClick={() =>
              onGenerate({
                templateId,
                range,
                format,
                frequency,
                recipients: recipients
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {frequency === "once" ? "Generate report" : "Schedule report"}
          </button>
        </div>
      </div>
    </div>
  );
}
