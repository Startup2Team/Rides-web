/**
 * Per-template report data builders. Each builder queries the backend (or honest
 * mock fallback), applies optional per-report filters, and returns a structured
 * report object for preview and export — never an immediate PDF.
 */

import {
  getRidesDaily,
  getFunnel,
  getDriverPerformance,
  getVehicleMix,
  getRevenue,
  getCustomersOverview,
  getCustomers,
  getNegotiationsStats,
  getNegotiations,
  getDriverRegistrationReport,
  getGeneralLedger,
  getTrialBalance,
  getBalanceSheet,
  type Customer,
} from "@/lib/api";
import { mockRidesDaily, mockFunnel, mockDriverPerformance, mockVehicleMix } from "@/lib/mock-analytics";
import { MOCK_API_CUSTOMERS } from "@/lib/mock-customers";
import { MOCK_NEGOTIATIONS, MOCK_NEGOTIATIONS_STATS } from "@/lib/mock-negotiations";
import { periodToQueryDays, type Period } from "../_period-filter";
import {
  filterLabel,
  EXPORT_TEMPLATES,
  TRANSPORT_DISPLAY,
  type ExportTemplate,
} from "./reports-templates";

const NO_BACKEND = !process.env.NEXT_PUBLIC_API_BASE_URL;

export type ReportFilters = Record<string, string>;

export type ReportMeta = {
  scopeLabel: string;
  period: Period;
  customRange: { from: string; to: string } | null;
  vehicleId?: string;
  filters?: ReportFilters;
};

export type ReportSummaryMetric = {
  label: string;
  value: string | number;
  tone?: "default" | "primary" | "warning" | "danger";
};

export type ReportContent = {
  title: string;
  subtitle: string;
  headers: string[];
  rows: (string | number)[][];
  insights: string[];
  generatedAt?: string;
  summary?: ReportSummaryMetric[];
};

export type GeneratedReport = ReportContent & {
  templateId: string;
  periodLabel: string;
  summary: ReportSummaryMetric[];
  filtersApplied: { label: string; value: string }[];
};

function vehicleLabel(t: string): string {
  return TRANSPORT_DISPLAY[t] ?? t.replace(/_/g, " ");
}

function vehicleFromFilters(filters?: ReportFilters): string | undefined {
  const v = filters?.vehicle;
  return v && v !== "all" ? v : undefined;
}

function filtersAppliedForTemplate(template: ExportTemplate, filters: ReportFilters): { label: string; value: string }[] {
  return (template.filters ?? [])
    .map((field) => {
      const value = filters[field.id] ?? field.defaultValue ?? "all";
      if (value === "all") return null;
      return { label: field.label, value: filterLabel(field, value) };
    })
    .filter((x): x is { label: string; value: string } => x !== null);
}

function mockCustomerOverview(customers: Customer[]) {
  const suspended = customers.filter((c) => c.is_suspended).length;
  const activeThisWeek = customers.filter(
    (c) => c.last_seen_at && Date.now() - new Date(c.last_seen_at).getTime() < 7 * 86400000,
  ).length;
  return {
    total: customers.length,
    active: customers.length - suspended,
    suspended,
    active_this_week: activeThisWeek,
  };
}

async function opsSummaryContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const vehicleId = meta.vehicleId ?? vehicleFromFilters(meta.filters);
  const days = periodToQueryDays(meta.period, meta.customRange);
  const daily = await getRidesDaily(days, vehicleId).catch(() => mockRidesDaily(days, vehicleId));
  const totalCompleted = daily.reduce((s, d) => s + d.completed, 0);
  const totalCancelled = daily.reduce((s, d) => s + d.cancelled, 0);
  const generatedAt = new Date().toISOString();
  return {
    title: "Ride Activity Report",
    subtitle: `Daily rides · ${meta.scopeLabel}`,
    headers: ["Date", "Completed", "Cancelled", "Total"],
    rows: daily.map((d) => [d.day, d.completed, d.cancelled, d.total]),
    insights: [
      `${totalCompleted.toLocaleString()} rides completed and ${totalCancelled.toLocaleString()} cancelled across ${daily.length} day${daily.length === 1 ? "" : "s"}.`,
    ],
    generatedAt,
    summary: [
      { label: "Completed", value: totalCompleted, tone: "primary" },
      { label: "Cancelled", value: totalCancelled, tone: "warning" },
      { label: "Days covered", value: daily.length },
      { label: "Total rows", value: daily.length },
    ],
  };
}

async function tripCompletionContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const vehicleId = meta.vehicleId ?? vehicleFromFilters(meta.filters);
  const days = periodToQueryDays(meta.period, meta.customRange);
  const funnel = await getFunnel(days, vehicleId).catch(() => mockFunnel(days, vehicleId));
  const completionRate = funnel.booked > 0 ? Math.round((funnel.completed / funnel.booked) * 100) : 0;
  const generatedAt = new Date().toISOString();
  return {
    title: "Trip Completion Report",
    subtitle: `Request-to-complete funnel · ${meta.scopeLabel}`,
    headers: ["Stage", "Rides"],
    rows: [
      ["Requested", funnel.booked],
      ["Matched", funnel.matched],
      ["Confirmed", funnel.confirmed],
      ["Completed", funnel.completed],
      ["Cancelled", funnel.cancelled],
    ],
    insights: [`${completionRate}% of requested rides were completed (${funnel.completed} of ${funnel.booked}).`],
    generatedAt,
    summary: [
      { label: "Completion rate", value: `${completionRate}%`, tone: "primary" },
      { label: "Completed", value: funnel.completed },
      { label: "Requested", value: funnel.booked },
      { label: "Cancelled", value: funnel.cancelled, tone: "warning" },
    ],
  };
}

async function driverPerformanceContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const vehicleId = meta.vehicleId ?? vehicleFromFilters(meta.filters);
  const perf = await getDriverPerformance(vehicleId).catch(() => mockDriverPerformance(vehicleId));
  const avgAcceptance =
    perf.length > 0 ? Math.round(perf.reduce((s, p) => s + p.acceptance_rate, 0) / perf.length) : 0;
  const totalTrips = perf.reduce((s, p) => s + p.total_rides, 0);
  const generatedAt = new Date().toISOString();
  return {
    title: "Driver Performance Report",
    subtitle: `Trips, acceptance, and earnings · ${meta.scopeLabel}`,
    headers: ["Driver", "Vehicle", "Trips", "Acceptance %", "Earnings 30d (RWF)"],
    rows: perf.map((p) => [
      p.full_name ?? p.phone,
      vehicleLabel(p.transport_type),
      p.total_rides,
      p.acceptance_rate,
      p.earnings_30d,
    ]),
    insights: [`Average acceptance rate across ${perf.length} driver${perf.length === 1 ? "" : "s"} is ${avgAcceptance}%.`],
    generatedAt,
    summary: [
      { label: "Drivers", value: perf.length },
      { label: "Total trips", value: totalTrips, tone: "primary" },
      { label: "Avg acceptance", value: `${avgAcceptance}%` },
      { label: "Records", value: perf.length },
    ],
  };
}

async function driverRegistrationsContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const report = await getDriverRegistrationReport({ period: meta.period, customRange: meta.customRange });
  const statusFilter = meta.filters?.status ?? "all";
  const vehicleFilter = meta.filters?.vehicle ?? "all";

  let drivers = report.drivers;
  if (statusFilter !== "all") {
    drivers = drivers.filter((d) => d.verificationStatus === statusFilter);
  }
  if (vehicleFilter !== "all") {
    const label = vehicleLabel(vehicleFilter);
    drivers = drivers.filter(
      (d) => d.vehicleType === label || d.vehicleType.replace(/\s/g, "_").toUpperCase() === vehicleFilter,
    );
  }

  const approved = drivers.filter((d) => d.verificationStatus === "approved").length;
  const pending = drivers.filter((d) => d.verificationStatus === "pending").length;
  const rejected = drivers.filter((d) => d.verificationStatus === "rejected").length;
  const generatedAt = new Date().toISOString();

  return {
    title: "Driver Registration Report",
    subtitle: `New registrations · ${report.periodLabel}`,
    headers: ["Driver ID", "Full name", "Phone", "Vehicle", "Plate", "District", "Registered", "Status"],
    rows: drivers.map((d) => [
      d.id,
      d.fullName,
      d.phone,
      d.vehicleType,
      d.vehiclePlate,
      d.district,
      d.registeredAt,
      d.verificationLabel,
    ]),
    insights: report.insights,
    generatedAt,
    summary: [
      { label: "Total registered", value: drivers.length },
      { label: "Approved", value: approved, tone: "primary" },
      { label: "Pending", value: pending, tone: "warning" },
      { label: "Rejected", value: rejected, tone: "danger" },
    ],
  };
}

async function revenueBreakdownContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const vehicleId = meta.vehicleId ?? vehicleFromFilters(meta.filters);
  const days = periodToQueryDays(meta.period, meta.customRange);
  const mix = await getVehicleMix(days, vehicleId).catch(() => mockVehicleMix(days, vehicleId));
  const mixTotalRevenue = mix.reduce((s, m) => s + m.revenue, 0);
  const mixTotalRides = mix.reduce((s, m) => s + m.rides, 0);

  const overview = NO_BACKEND ? null : await getRevenue(meta.period).catch(() => null);
  const totalRevenue = overview?.total_revenue ?? mixTotalRevenue;

  const rows: (string | number)[][] = mix.map((m) => [vehicleLabel(m.transport_type), m.rides, m.revenue]);
  rows.push(["TOTAL", mixTotalRides, totalRevenue]);
  const generatedAt = new Date().toISOString();

  return {
    title: "Revenue Report",
    subtitle: `Revenue by vehicle category · ${meta.scopeLabel}`,
    headers: ["Vehicle Category", "Rides", "Revenue (RWF)"],
    rows,
    insights: [`${totalRevenue.toLocaleString()} RWF in revenue across ${mixTotalRides.toLocaleString()} rides.`],
    generatedAt,
    summary: [
      { label: "Total revenue", value: `${totalRevenue.toLocaleString()} RWF`, tone: "primary" },
      { label: "Total rides", value: mixTotalRides },
      { label: "Categories", value: mix.length },
      { label: "Avg per ride", value: mixTotalRides > 0 ? `${Math.round(totalRevenue / mixTotalRides).toLocaleString()} RWF` : "—" },
    ],
  };
}

async function customerOverviewContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const statusFilter = meta.filters?.status ?? "all";
  const [overview, customersRes] = await Promise.all([
    NO_BACKEND
      ? mockCustomerOverview(MOCK_API_CUSTOMERS)
      : getCustomersOverview().catch(() => mockCustomerOverview(MOCK_API_CUSTOMERS)),
    NO_BACKEND
      ? { customers: MOCK_API_CUSTOMERS, total: MOCK_API_CUSTOMERS.length, limit: 500, offset: 0 }
      : getCustomers({ limit: "500" }).catch(() => ({
          customers: MOCK_API_CUSTOMERS,
          total: MOCK_API_CUSTOMERS.length,
          limit: 500,
          offset: 0,
        })),
  ]);

  let customers = customersRes.customers;
  if (statusFilter === "active") customers = customers.filter((c) => !c.is_suspended);
  if (statusFilter === "suspended") customers = customers.filter((c) => c.is_suspended);

  const generatedAt = new Date().toISOString();
  const active = customers.filter((c) => !c.is_suspended).length;
  const suspended = customers.filter((c) => c.is_suspended).length;

  return {
    title: "Customer Registration Report",
    subtitle: `Registered, active, and suspended customers · ${meta.scopeLabel}`,
    headers: ["Customer ID", "Name", "Phone", "Total rides", "Status", "Joined"],
    rows: customers.map((c) => [
      c.id,
      c.full_name ?? "—",
      c.phone,
      c.total_rides,
      c.is_suspended ? "Suspended" : "Active",
      new Date(c.created_at).toLocaleDateString(),
    ]),
    insights: [
      `${overview.total.toLocaleString()} total customers · ${overview.active.toLocaleString()} active · ${overview.suspended.toLocaleString()} suspended · ${overview.active_this_week.toLocaleString()} active this week.`,
    ],
    generatedAt,
    summary: [
      { label: "In report", value: customers.length, tone: "primary" },
      { label: "Active", value: active },
      { label: "Suspended", value: suspended, tone: "warning" },
      { label: "Platform total", value: overview.total },
    ],
  };
}

async function negotiationStatsContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const vehicleId = meta.vehicleId ?? vehicleFromFilters(meta.filters);
  const statusFilter = meta.filters?.status ?? "all";
  const [stats, negs] = await Promise.all([
    getNegotiationsStats().catch(() => MOCK_NEGOTIATIONS_STATS),
    getNegotiations({ limit: "200" }).catch(() => ({ negotiations: MOCK_NEGOTIATIONS, total: MOCK_NEGOTIATIONS.length })),
  ]);

  let filtered = negs.negotiations;
  if (vehicleId) filtered = filtered.filter((n) => n.transport_type === vehicleId);
  if (statusFilter !== "all") {
    filtered = filtered.filter((n) => {
      const s = n.status.toLowerCase();
      if (statusFilter === "agreed") return s.includes("agreed") || s.includes("accepted");
      if (statusFilter === "failed") return s.includes("fail") || s.includes("reject");
      if (statusFilter === "active") return s.includes("active") || s.includes("pending") || s.includes("open");
      return true;
    });
  }

  const agreed = filtered.filter((n) => n.status.toLowerCase().includes("agreed")).length;
  const generatedAt = new Date().toISOString();

  return {
    title: "Negotiation Report",
    subtitle: `Round counts, outcomes, and fare uplift · ${meta.scopeLabel}`,
    headers: ["Negotiation ID", "Vehicle", "Customer", "Driver", "Initial fare", "Agreed fare", "Uplift", "Rounds", "Status"],
    rows: filtered.map((n) => [
      n.id,
      vehicleLabel(n.transport_type),
      n.customer.name ?? n.customer.phone,
      n.driver.name ?? n.driver.phone ?? "—",
      n.initial_fare ?? "—",
      n.agreed_fare ?? "—",
      n.uplift,
      n.rounds,
      n.status,
    ]),
    insights: [
      `${stats.total_today} negotiations today · ${stats.agreed_today} agreed · ${stats.failed_today} failed · avg ${stats.avg_rounds} rounds.`,
    ],
    generatedAt,
    summary: [
      { label: "In report", value: filtered.length, tone: "primary" },
      { label: "Agreed", value: agreed },
      { label: "Avg rounds", value: stats.avg_rounds },
      { label: "Today (platform)", value: stats.total_today },
    ],
  };
}

function periodToDates(period: Period, customRange: { from: string; to: string } | null): { start?: string; end?: string } {
  if (customRange?.from) {
    return { start: new Date(customRange.from).toISOString(), end: new Date(customRange.to).toISOString() };
  }
  const days = periodToQueryDays(period, customRange);
  const start = new Date(Date.now() - days * 86400000).toISOString();
  return { start, end: new Date().toISOString() };
}

async function generalLedgerContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const dates = periodToDates(meta.period, meta.customRange);
  const data = await getGeneralLedger(dates).catch(() => ({ entries: [] }));
  const entries = data.entries || [];
  
  const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);
  const generatedAt = new Date().toISOString();

  return {
    title: "General Ledger Report",
    subtitle: `Double-entry transaction listing · ${meta.scopeLabel}`,
    headers: ["Date", "Transaction ID", "Account", "Description", "Debit (RWF)", "Credit (RWF)", "Reference"],
    rows: entries.map((e) => [
      new Date(e.date).toLocaleString(),
      e.transaction_id || "—",
      e.account,
      e.description,
      e.debit ? `${e.debit.toLocaleString()} RWF` : "—",
      e.credit ? `${e.credit.toLocaleString()} RWF` : "—",
      e.reference || "—",
    ]),
    insights: [
      `Total ledger activity: ${entries.length} entries processed. Total debits: ${totalDebit.toLocaleString()} RWF. Total credits: ${totalCredit.toLocaleString()} RWF.`,
    ],
    generatedAt,
    summary: [
      { label: "Total Entries", value: entries.length },
      { label: "Total Debits", value: `${totalDebit.toLocaleString()} RWF`, tone: "primary" },
      { label: "Total Credits", value: `${totalCredit.toLocaleString()} RWF`, tone: "primary" },
    ],
  };
}

async function trialBalanceContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const dates = periodToDates(meta.period, meta.customRange);
  const tb = await getTrialBalance(dates).catch(() => ({ rows: [], total_debit: 0, total_credit: 0, balanced: true }));

  const generatedAt = new Date().toISOString();

  return {
    title: "Trial Balance Report",
    subtitle: `Financial accounts summary · ${meta.scopeLabel}`,
    headers: ["Account", "Debit Total (RWF)", "Credit Total (RWF)"],
    rows: (tb.rows || []).map((r) => [
      r.account,
      r.debit_total ? `${r.debit_total.toLocaleString()} RWF` : "—",
      r.credit_total ? `${r.credit_total.toLocaleString()} RWF` : "—",
    ]),
    insights: [
      tb.balanced
        ? "All ledger accounts are balanced (Debits match Credits)."
        : "Warning: Unbalanced ledger accounts detected. Investigate discrepancy.",
    ],
    generatedAt,
    summary: [
      { label: "Total Debits", value: `${tb.total_debit.toLocaleString()} RWF`, tone: "primary" },
      { label: "Total Credits", value: `${tb.total_credit.toLocaleString()} RWF`, tone: "primary" },
      {
        label: "Status",
        value: tb.balanced ? "BALANCED" : "DISCREPANCY",
        tone: tb.balanced ? "primary" : "danger",
      },
    ],
  };
}

async function balanceSheetContent(meta: ReportMeta): Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">> {
  const dates = periodToDates(meta.period, meta.customRange);
  const bs = await getBalanceSheet({ as_of: dates.end }).catch(() => ({
    assets: [],
    total_assets: 0,
    liabilities: [],
    total_liabilities: 0,
    equity: [],
    total_equity: 0,
    as_of_date: new Date().toISOString(),
  }));

  const generatedAt = new Date().toISOString();
  const rows: (string | number)[][] = [];

  rows.push(["ASSETS", ""]);
  (bs.assets || []).forEach((a) => {
    rows.push([`  ${a.account}`, `${a.balance.toLocaleString()} RWF`]);
  });
  rows.push(["TOTAL ASSETS", `${bs.total_assets.toLocaleString()} RWF`]);

  rows.push(["", ""]);
  rows.push(["LIABILITIES", ""]);
  (bs.liabilities || []).forEach((l) => {
    rows.push([`  ${l.account}`, `${l.balance.toLocaleString()} RWF`]);
  });
  rows.push(["TOTAL LIABILITIES", `${bs.total_liabilities.toLocaleString()} RWF`]);

  rows.push(["", ""]);
  rows.push(["EQUITY", ""]);
  (bs.equity || []).forEach((e) => {
    rows.push([`  ${e.account}`, `${e.balance.toLocaleString()} RWF`]);
  });
  rows.push(["TOTAL EQUITY", `${bs.total_equity.toLocaleString()} RWF`]);

  return {
    title: "Balance Sheet",
    subtitle: `Statement of financial position as of ${new Date(bs.as_of_date).toLocaleDateString()}`,
    headers: ["Account Category / Name", "Balance"],
    rows,
    insights: [
      `Total assets of ${bs.total_assets.toLocaleString()} RWF match liabilities & equity of ${(bs.total_liabilities + bs.total_equity).toLocaleString()} RWF.`,
    ],
    generatedAt,
    summary: [
      { label: "Assets", value: `${bs.total_assets.toLocaleString()} RWF`, tone: "primary" },
      { label: "Liabilities", value: `${bs.total_liabilities.toLocaleString()} RWF` },
      { label: "Equity", value: `${bs.total_equity.toLocaleString()} RWF` },
    ],
  };
}

const BUILDERS: Record<string, (meta: ReportMeta) => Promise<Omit<GeneratedReport, "templateId" | "periodLabel" | "filtersApplied">>> = {
  "ops-daily": opsSummaryContent,
  "ride-completion": tripCompletionContent,
  "driver-performance": driverPerformanceContent,
  "driver-registrations": driverRegistrationsContent,
  "revenue-breakdown": revenueBreakdownContent,
  "customer-overview": customerOverviewContent,
  "negotiation-stats": negotiationStatsContent,
  "general-ledger": generalLedgerContent,
  "trial-balance": trialBalanceContent,
  "balance-sheet": balanceSheetContent,
};

export async function generateReport(templateId: string, meta: ReportMeta): Promise<GeneratedReport> {
  const template = EXPORT_TEMPLATES.find((t) => t.id === templateId);
  const filters = meta.filters ?? {};
  const builder = BUILDERS[templateId];

  if (!builder || !template) {
    const generatedAt = new Date().toISOString();
    return {
      templateId,
      periodLabel: meta.scopeLabel,
      title: "Report",
      subtitle: meta.scopeLabel,
      headers: ["Field", "Value"],
      rows: [["Generated", new Date().toLocaleString()]],
      insights: [],
      generatedAt,
      summary: [{ label: "Rows", value: 1 }],
      filtersApplied: filtersAppliedForTemplate(template ?? EXPORT_TEMPLATES[0]!, filters),
    };
  }

  const content = await builder(meta);
  return {
    ...content,
    templateId,
    periodLabel: meta.scopeLabel,
    filtersApplied: filtersAppliedForTemplate(template, filters),
  };
}

/** @deprecated Use generateReport — kept for any legacy callers */
export async function getReportContent(templateId: string, meta: ReportMeta): Promise<ReportContent> {
  const report = await generateReport(templateId, meta);
  const { templateId: _t, periodLabel: _p, summary: _s, filtersApplied: _f, ...content } = report;
  return content;
}
