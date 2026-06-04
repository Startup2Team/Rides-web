import type { Driver as ApiDriver, DriverDetail } from "./api";
import type { VerifyDriver } from "@/app/admin/(authed)/drivers/verify-driver-modal";

/** URL slug ?vehicle=moto → backend transport_type */
export const VEHICLE_SLUG_TO_TYPE: Record<string, string> = {
  moto: "MOTO_BIKE",
  cab: "CAB_TAXI",
  hilux: "LIGHT_HILUX",
  fuso: "HEAVY_FUSO",
};

export const VEHICLE_SLUG_LABELS: Record<string, string> = {
  moto: "Moto Bikes",
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
  | "Suspended";

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
};

export function mapApprovalStatus(
  approvalStatus: string,
  isOnline: boolean,
  onTrip = false,
): DriverStatus {
  const s = approvalStatus.toUpperCase();
  if (s === "PENDING_REVIEW" || s === "PENDING") return "Pending";
  if (s === "REJECTED" || s === "SUSPENDED") return "Suspended";
  if (onTrip) return "On trip";
  if (isOnline) return "Online";
  if (s === "APPROVED" || s === "ACTIVE") return "Offline";
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
    kyc: {
      phone: detail.phone ?? "",
      dob: detail.date_of_birth
        ? new Date(detail.date_of_birth).toLocaleDateString()
        : "—",
      age: ageFromDob(detail.date_of_birth),
      location: formatLocation(detail),
      licenseNumber: detail.license_number ?? "—",
      submittedAt: detail.created_at
        ? new Date(detail.created_at).toLocaleString()
        : "—",
      momoProvider: mapMomoProvider(detail.momo_provider),
      momoCode: detail.momo_pay_code ?? "",
    },
    documents: detail.documents,
  };
}

export type DriversOverviewStats = {
  total: number;
  online: number;
  onTrip: number;
  pending: number;
  suspended: number;
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
  };
}
