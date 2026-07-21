/**
 * Driver Registration Report — shared types and query logic.
 *
 * Real data path: GET /admin/drivers (already exists), filtered client-side by
 * created_at within the requested period — see getDriverRegistrationReport in ./api.
 * Mock path (buildDriverRegistrationReport) is the honest fallback when the
 * backend is unreachable or unconfigured.
 */

import { timestampInPeriod, type Period } from "@/app/admin/(authed)/_period-filter";
import type { Driver, DriverDetail } from "./api";

export type DriverRegistrationFilters = {
  period: Period;
  customRange: { from: string; to: string } | null;
};

export type VerificationBucket = "approved" | "pending" | "rejected";

export type DriverRegistrationRecord = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehiclePlate: string;
  district: string;
  city: string;
  licenseNumber: string;
  momoProvider: string;
  registeredAt: string;
  registeredAtMs: number;
  verificationStatus: VerificationBucket;
  verificationLabel: string;
  rawApprovalStatus: string;
};

export type DriverRegistrationSummary = {
  totalRegistered: number;
  approved: number;
  pendingVerification: number;
  rejected: number;
};

export type DriverRegistrationReport = {
  periodLabel: string;
  generatedAt: string;
  summary: DriverRegistrationSummary;
  drivers: DriverRegistrationRecord[];
  insights: string[];
};

const TRANSPORT_LABELS: Record<string, string> = {
  MOTO_BIKE: "Moto Bike",
  CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO: "Heavy Fuso",
  RIFANI: "Rifani",
};

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  custom: "Custom range",
};

export function driverRegistrationPeriodLabel(filters: DriverRegistrationFilters): string {
  if (filters.period === "custom" && filters.customRange) {
    return `${filters.customRange.from} to ${filters.customRange.to}`;
  }
  return PERIOD_LABELS[filters.period];
}

export function bucketVerificationStatus(status: string): VerificationBucket {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "approved";
  if (s === "REJECTED") return "rejected";
  return "pending";
}

export function verificationLabel(status: string): string {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "Approved";
  if (s === "REJECTED") return "Rejected";
  if (s === "SUSPENDED") return "Suspended";
  if (s === "PENDING_REVIEW") return "Pending verification";
  return status.replace(/_/g, " ");
}

/** Minimal shape both the `Driver` list-summary and full `DriverDetail` satisfy. */
type DriverLike = Pick<
  DriverDetail,
  | "id"
  | "full_name"
  | "phone"
  | "transport_type"
  | "vehicle_plate"
  | "approval_status"
  | "created_at"
  | "city"
  | "license_number"
  | "momo_provider"
  | "address"
>;

function mapDriver(d: DriverLike): DriverRegistrationRecord {
  const bucket = bucketVerificationStatus(d.approval_status);
  return {
    id: d.id,
    fullName: d.full_name ?? "—",
    phone: d.phone ?? "—",
    email: "—",
    vehicleType: TRANSPORT_LABELS[d.transport_type] ?? d.transport_type,
    vehiclePlate: d.vehicle_plate ?? "—",
    district: d.address?.district ?? "—",
    city: d.city ?? "Kigali",
    licenseNumber: d.license_number ?? "—",
    momoProvider: d.momo_provider ?? "—",
    registeredAt: new Date(d.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    registeredAtMs: new Date(d.created_at).getTime(),
    verificationStatus: bucket,
    verificationLabel: verificationLabel(d.approval_status),
    rawApprovalStatus: d.approval_status,
  };
}

function buildInsights(
  summary: DriverRegistrationSummary,
  drivers: DriverRegistrationRecord[],
  periodLabel: string,
): string[] {
  const lines: string[] = [];
  const approvalRate =
    summary.totalRegistered > 0
      ? Math.round((summary.approved / summary.totalRegistered) * 100)
      : 0;

  lines.push(
    `${summary.totalRegistered} driver${summary.totalRegistered === 1 ? "" : "s"} registered during ${periodLabel.toLowerCase()}. ${summary.approved} approved (${approvalRate}%), ${summary.pendingVerification} pending verification, ${summary.rejected} rejected.`,
  );

  if (summary.pendingVerification > 0) {
    lines.push(
      `${summary.pendingVerification} application${summary.pendingVerification === 1 ? "" : "s"} still require document review — prioritize clearing the backlog to onboard capacity faster.`,
    );
  }

  const byVehicle = drivers.reduce<Record<string, number>>((acc, d) => {
    acc[d.vehicleType] = (acc[d.vehicleType] ?? 0) + 1;
    return acc;
  }, {});
  const topVehicle = Object.entries(byVehicle).sort((a, b) => b[1] - a[1])[0];
  if (topVehicle) {
    lines.push(
      `Most registrations were for ${topVehicle[0]} (${topVehicle[1]} driver${topVehicle[1] === 1 ? "" : "s"}). Align fleet onboarding and verification staffing with this demand.`,
    );
  }

  if (summary.rejected > 0) {
    lines.push(
      `${summary.rejected} rejection${summary.rejected === 1 ? "" : "s"} — review common rejection reasons in driver settings to reduce repeat failures.`,
    );
  }

  if (summary.totalRegistered === 0) {
    lines.push("No new driver registrations in this period. Consider referral campaigns or reduced onboarding friction.");
  }

  return lines;
}

function buildReportFromDrivers(
  drivers: DriverLike[],
  filters: DriverRegistrationFilters,
): DriverRegistrationReport {
  const periodLabel = driverRegistrationPeriodLabel(filters);
  const generatedAt = new Date().toLocaleString([], { dateStyle: "long", timeStyle: "short" });

  const records = drivers
    .filter((d) => timestampInPeriod(new Date(d.created_at).getTime(), filters.period, filters.customRange))
    .map(mapDriver)
    .sort((a, b) => b.registeredAtMs - a.registeredAtMs);

  const summary: DriverRegistrationSummary = {
    totalRegistered: records.length,
    approved: records.filter((d) => d.verificationStatus === "approved").length,
    pendingVerification: records.filter((d) => d.verificationStatus === "pending").length,
    rejected: records.filter((d) => d.verificationStatus === "rejected").length,
  };

  return {
    periodLabel,
    generatedAt,
    summary,
    drivers: records,
    insights: buildInsights(summary, records, periodLabel),
  };
}

/** Real-data path — call with the `drivers` array from `getDrivers()`. */
export function buildDriverRegistrationReportFromDrivers(
  drivers: Driver[],
  filters: DriverRegistrationFilters,
): DriverRegistrationReport {
  return buildReportFromDrivers(drivers, filters);
}

/** Default path — pass drivers array directly or fallback to empty list. */
export function buildDriverRegistrationReport(filters: DriverRegistrationFilters, drivers: Driver[] = []): DriverRegistrationReport {
  return buildReportFromDrivers(drivers, filters);
}
