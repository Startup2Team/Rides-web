import type { Driver as ApiDriver, DriverDetail } from "./api";
import type { VerifyDriver } from "@/app/admin/(authed)/drivers/verify-driver-modal";
import {
  validatePlate,
  validateRwandaNationalId,
  validateLicenseNumber,
} from "./driver-registration";
import { MOCK_DRIVERS } from "./mock-drivers";
import { getLocalDriverDetail } from "./local-drivers";

/** URL slug ?vehicle=moto → backend transport_type */
export const VEHICLE_SLUG_TO_TYPE: Record<string, string> = {
  moto: "MOTO_BIKE",
  rifani: "RIFANI",
  cab: "CAB_TAXI",
  hilux: "LIGHT_HILUX",
  fuso: "HEAVY_FUSO",
};

export const VEHICLE_SLUG_LABELS: Record<string, string> = {
  moto: "Moto Bikes",
  rifani: "Rifani",
  cab: "Cab Taxis",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
};

export type VehicleSlug = keyof typeof VEHICLE_SLUG_TO_TYPE;

export function vehicleTypeFromSlug(slug: string | null): string | undefined {
  if (!slug) return undefined;
  return VEHICLE_SLUG_TO_TYPE[slug];
}

export function isVehicleSlug(slug: string | null): slug is VehicleSlug {
  return slug !== null && slug in VEHICLE_SLUG_TO_TYPE;
}

export function formatTransportType(code: string): string {
  const map: Record<string, string> = {
    MOTO_BIKE: "Moto Bike",
    RIFANI: "Rifani",
    CAB_TAXI: "Cab Taxi",
    LIGHT_HILUX: "Light Hilux",
    HEAVY_FUSO: "Heavy Fuso",
  };
  return map[code] ?? code;
}

export type DriverStatus =
  | "Online"
  | "On trip"
  | "Offline"
  | "Pending"
  | "Suspended"
  | "Rejected";

export type DriverRow = {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  status: DriverStatus;
  acceptance: number | null;
  rating: number | null;
  lastActive: string;
  createdAt: string; // ISO — used for "applied" sort
  phone?: string;
  eligible?: boolean;
  referrals: number;
};

export function isDriverEligible(driver: {
  age?: number;
  date_of_birth?: string | null;
  national_id_number?: string | null;
  license_number?: string | null;
  vehicle_plate?: string | null;
  transport_type?: string | null;
}): boolean {
  const age = driver.age ?? ageFromDob(driver.date_of_birth);
  if (age < 18) return false;

  if (driver.national_id_number) {
    const cleanId = driver.national_id_number.replace(/\D/g, "");
    if (cleanId.length !== 16) return false;
  } else {
    return false;
  }

  if (driver.license_number) {
    const cleanLic = driver.license_number.trim().toUpperCase();
    if (!cleanLic.startsWith("DL-")) return false;
    const suffix = cleanLic.slice(3);
    if (suffix.length !== 16 || !/^[A-Z0-9]+$/.test(suffix)) return false;
  } else {
    return false;
  }

  if (driver.vehicle_plate && driver.vehicle_plate !== "—") {
    const cleanedPlate = driver.vehicle_plate.trim().toUpperCase();
    const type = (driver.transport_type ?? "").toLowerCase();
    const isMotoLike = type.includes("moto") || type.includes("rifani");
    const isMotoValid = /^R[A-Z] \d{3} [A-Z]$/.test(cleanedPlate);
    const isStdValid = /^R[A-Z]{2} \d{3} [A-Z]$/.test(cleanedPlate);
    if (isMotoLike ? !isMotoValid : !isStdValid) return false;
  } else {
    return false;
  }

  return true;
}

export function mapApprovalStatus(
  approvalStatus: string,
  isOnline: boolean,
  onTrip = false,
): DriverStatus {
  const s = approvalStatus.toUpperCase();
  if (s === "PENDING_REVIEW" || s === "PENDING") return "Pending";
  if (s === "REJECTED") return "Rejected";
  if (s === "SUSPENDED") return "Suspended";
  if (onTrip) return "On trip";
  if (isOnline) return "Online";
  if (s === "APPROVED" || s === "ACTIVE" || s === "APPROVED_NON_COMPLIANT") return "Offline";
  return "Offline";
}

export function mapApiDriver(d: ApiDriver): DriverRow {
  // acceptance_rate is stored as 0–100 in the DB (not 0–1), so just round it.
  // Pending drivers have no rides yet — the DB default of 100 is meaningless.
  const isPending =
    d.approval_status?.toUpperCase() === "PENDING_REVIEW" ||
    d.approval_status?.toUpperCase() === "PENDING";
  const pct =
    !isPending && d.acceptance_rate != null
      ? Math.round(d.acceptance_rate)
      : null;
  const name =
    d.full_name?.trim() ||
    (d.phone ? d.phone : "Unknown driver");
  const onTrip = Boolean(d.on_trip);

  let fullDetail: any = null;
  if (d.id.startsWith("local-driver-")) {
    fullDetail = getLocalDriverDetail(d.id);
  } else if (d.id in MOCK_DRIVERS) {
    fullDetail = MOCK_DRIVERS[d.id as keyof typeof MOCK_DRIVERS];
  }
  const isNonCompliant = d.approval_status?.toUpperCase() === "APPROVED_NON_COMPLIANT";
  const eligible = isNonCompliant ? false : (fullDetail ? isDriverEligible(fullDetail) : true);

  return {
    id: d.id,
    name,
    vehicle: formatTransportType(d.transport_type),
    plate: d.vehicle_plate ?? "—",
    status: mapApprovalStatus(d.approval_status, Boolean(d.is_online), onTrip),
    acceptance: pct,
    rating: (d as { rating?: number }).rating ?? null,
    lastActive: d.created_at
      ? new Date(d.created_at).toLocaleDateString()
      : "—",
    createdAt: d.created_at ?? "",
    phone: d.phone,
    eligible,
    referrals: d.referral_count ?? 0,
  };
}

function ageFromDob(dob: string | null | undefined): number {
  if (!dob) return 0;
  const born = new Date(dob);
  if (Number.isNaN(born.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const m = today.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  return age;
}

function formatLocation(detail: DriverDetail): string {
  const a = detail.address;
  const parts = [a?.village, a?.cell, a?.sector, a?.district, a?.province, detail.city]
    .filter(Boolean)
    .map((p) => String(p));
  return parts.join(", ") || detail.city || "—";
}

function mapMomoProvider(raw: string | null | undefined): "MTN MoMo" | "Airtel Money" {
  const u = (raw ?? "").toUpperCase();
  if (u.includes("AIRTEL")) return "Airtel Money";
  return "MTN MoMo";
}

export function slugToTransportType(slug: string): string {
  return VEHICLE_SLUG_TO_TYPE[slug] ?? slug.toUpperCase();
}

export function mapDriverDetailToVerify(
  detail: DriverDetail,
  row?: Pick<DriverRow, "name" | "vehicle" | "plate">,
): VerifyDriver {
  const name =
    detail.full_name?.trim() ||
    row?.name ||
    detail.phone ||
    "Driver";
  return {
    id: detail.id,
    name,
    vehicle: row?.vehicle ?? formatTransportType(detail.transport_type),
    plate: detail.vehicle_plate ?? row?.plate ?? "—",
    approvalStatus: detail.approval_status ?? "pending",
    kyc: {
      phone: detail.phone ?? "",
      dob: detail.date_of_birth
        ? new Date(detail.date_of_birth).toLocaleDateString()
        : "—",
      age: ageFromDob(detail.date_of_birth),
      location: formatLocation(detail),
      nationalIdNumber: detail.national_id_number ?? undefined,
      licenseNumber: detail.license_number ?? "—",
      submittedAt: detail.created_at
        ? new Date(detail.created_at).toLocaleString()
        : "—",
      momoProvider: mapMomoProvider(detail.momo_provider),
      momoCode: detail.momo_pay_code ?? "",
      licenseIssuedDate: detail.license_issued_date
        ? new Date(detail.license_issued_date).toLocaleDateString()
        : undefined,
      licenseExpiryDate: detail.license_expiry_date
        ? new Date(detail.license_expiry_date).toLocaleDateString()
        : undefined,
      insuranceIssuedDate: detail.insurance_issued_date
        ? new Date(detail.insurance_issued_date).toLocaleDateString()
        : undefined,
      insuranceExpiryDate: detail.insurance_expiry_date
        ? new Date(detail.insurance_expiry_date).toLocaleDateString()
        : undefined,
      authorizationIssuedDate: detail.authorization_issued_date
        ? new Date(detail.authorization_issued_date).toLocaleDateString()
        : undefined,
      authorizationExpiryDate: detail.authorization_expiry_date
        ? new Date(detail.authorization_expiry_date).toLocaleDateString()
        : undefined,
    },
    documents: detail.documents,
    referralCount: detail.referral_count ?? 0,
    reviewHistory: detail.review_history?.map((h) => ({
      id: h.id,
      decidedAt: h.decided_at,
      decidedBy: h.decided_by,
      decision: h.decision,
      reason: h.reason,
      documentDecisions: h.document_decisions?.map((d) => ({
        documentType: d.document_type,
        decision: d.decision,
        comment: d.comment,
      })),
    })),
  };
}

export type DriversOverviewStats = {
  total: number;
  online: number;
  onTrip: number;
  pending: number;
  suspended: number;
  totalReferrals: number;
};

export function computeOverviewFromDrivers(
  drivers: ApiDriver[],
  total?: number,
): DriversOverviewStats {
  const rows = drivers.map(mapApiDriver);
  return {
    total: total ?? drivers.length,
    online: rows.filter((d) => d.status === "Online").length,
    onTrip: rows.filter((d) => d.status === "On trip").length,
    pending: rows.filter((d) => d.status === "Pending").length,
    suspended: rows.filter((d) => d.status === "Suspended").length,
    totalReferrals: rows.reduce((sum, d) => sum + d.referrals, 0),
  };
}
