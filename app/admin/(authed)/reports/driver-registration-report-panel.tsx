"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "../_components";
import { readCustomRange, readPeriod } from "../_period-filter";
import {
  buildDriverRegistrationReport,
  driverRegistrationPeriodLabel,
  type DriverRegistrationFilters,
  type DriverRegistrationRecord,
} from "@/lib/driver-registration-report";
import { getDriverRegistrationReport } from "@/lib/api";
import { downloadDriverRegistrationPdf } from "./generate-driver-registration-pdf";

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-primary/15 text-primary",
  "Pending verification": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  Suspended: "bg-muted text-muted-foreground",
};

export function DriverRegistrationReportPanel({
  onToast,
}: {
  onToast?: (msg: string) => void;
}) {
  const searchParams = useSearchParams();
  const period = readPeriod(searchParams);
  const customRange = readCustomRange(searchParams);
  const filters: DriverRegistrationFilters = { period, customRange };
  const periodLabel = driverRegistrationPeriodLabel(filters);

  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const report = useMemo(
    () => buildDriverRegistrationReport({ period, customRange }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on primitives, not the fresh customRange object identity
    [period, customRange?.from, customRange?.to],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return report.drivers;
    return report.drivers.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.fullName.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.vehiclePlate.toLowerCase().includes(q),
    );
  }, [report.drivers, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  async function handleGeneratePdf() {
    setGenerating(true);
    try {
      const payload = await getDriverRegistrationReport(filters).catch(() => report);
      downloadDriverRegistrationPdf(payload);
      onToast?.(`Driver Registration Report PDF downloaded · ${periodLabel}`);
    } finally {
      setGenerating(false);
    }
  }

  const summaryCards = [
    { label: "Total registered", value: report.summary.totalRegistered, tone: "text-foreground" },
    { label: "Approved", value: report.summary.approved, tone: "text-primary" },
    { label: "Pending verification", value: report.summary.pendingVerification, tone: "text-amber-600" },
    { label: "Rejected", value: report.summary.rejected, tone: "text-red-600" },
  ];

  return (
    <Card
      title="Driver Registration Report"
      action={
        <button
          type="button"
          disabled={generating}
          onClick={handleGeneratePdf}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/25 disabled:opacity-50"
        >
          {generating ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
          Download PDF
        </button>
      }
    >
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          All drivers who registered during{" "}
          <span className="font-semibold text-foreground">{periodLabel}</span>. Uses the date range from
          filters above — review the summary and table, then export a professional PDF for stakeholders.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-4">
        {summaryCards.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/40 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border-b border-border px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Insights preview</p>
        <ul className="mt-2 space-y-1.5">
          {report.insights.slice(0, 2).map((line, i) => (
            <li key={i} className="text-[11px] leading-relaxed text-foreground/90">
              · {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search driver name, ID, phone, plate…"
          className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary sm:max-w-xs"
        />
        <span className="text-[10px] text-muted-foreground">
          {filtered.length} driver{filtered.length === 1 ? "" : "s"} in period
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5">Driver ID</th>
              <th className="px-3 py-2.5">Full name</th>
              <th className="px-3 py-2.5">Contact</th>
              <th className="px-3 py-2.5">Vehicle</th>
              <th className="px-3 py-2.5">Plate</th>
              <th className="px-3 py-2.5">District</th>
              <th className="px-3 py-2.5">Registered</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No driver registrations in this period. Try &quot;Last 30 days&quot; or a custom range.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <DriverRow key={d.id} driver={d} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
              className="h-8 rounded-lg border border-border px-3 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function DriverRow({ driver: d }: { driver: DriverRegistrationRecord }) {
  return (
    <tr className="border-b border-border/60 hover:bg-primary/[0.02]">
      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] font-semibold">{d.id}</td>
      <td className="px-3 py-2.5 font-semibold text-foreground">{d.fullName}</td>
      <td className="px-3 py-2.5 text-muted-foreground">{d.phone}</td>
      <td className="px-3 py-2.5">{d.vehicleType}</td>
      <td className="px-3 py-2.5 font-mono text-[10px]">{d.vehiclePlate}</td>
      <td className="px-3 py-2.5">{d.district}</td>
      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{d.registeredAt}</td>
      <td className="px-3 py-2.5">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[d.verificationLabel] ?? "bg-muted text-muted-foreground"}`}
        >
          {d.verificationLabel}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <Link href={`/admin/drivers/${d.id}`} className="text-[10px] font-semibold text-primary hover:underline">
          Profile →
        </Link>
      </td>
    </tr>
  );
}
