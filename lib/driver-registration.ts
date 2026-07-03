/** Document API types — aligned with mobile driver onboarding + backend admin API. */

export type DocKey = "national_id" | "license" | "insurance" | "authorization";

export type DocFaces = [File | null, File | null];

export const DOC_LABELS: Record<
  DocKey,
  { label: string; hint: string; frontRequired: boolean; backRequired: boolean; twoFaces: boolean }
> = {
  national_id: {
    label: "National ID",
    hint: "Both front and back faces required — JPEG, PNG or PDF",
    frontRequired: true,
    backRequired: true,
    twoFaces: true,
  },
  license: {
    label: "Driver's licence",
    hint: "Both front and back faces required — JPEG, PNG or PDF",
    frontRequired: true,
    backRequired: true,
    twoFaces: true,
  },
  insurance: {
    label: "Vehicle insurance document",
    hint: "Single-face document — JPEG, PNG or PDF",
    frontRequired: true,
    backRequired: false,
    twoFaces: false,
  },
  authorization: {
    label: "Vehicle authorization / inspection certificate",
    hint: "Single-face document — JPEG, PNG or PDF",
    frontRequired: true,
    backRequired: false,
    twoFaces: false,
  },
};

export const DOC_API_TYPE: Record<DocKey, string[]> = {
  national_id: ["NATIONAL_ID_FRONT", "NATIONAL_ID_BACK"],
  license: ["LICENCE_FRONT", "LICENCE_BACK"],
  insurance: ["VEHICLE_INSURANCE"],
  authorization: ["VEHICLE_AUTHORIZATION"],
};

export type VehicleSlug = "moto" | "rifani" | "cab" | "hilux" | "fuso";

// Moto & Rifani : RX XXX X  — R + 1 letter + 3 digits + 1 letter  (e.g. RA 042 B)
const PLATE_MOTO = /^R[A-Z] \d{3} [A-Z]$/;
// Cab / Hilux / Fuso : RXX XXX X  — R + 2 letters + 3 digits + 1 letter  (e.g. RAC 118 G)
const PLATE_STD  = /^R[A-Z]{2} \d{3} [A-Z]$/;

export function validatePlate(plate: string, vehicleSlug?: VehicleSlug): string | null {
  const cleaned = plate.trim().toUpperCase();
  if (!cleaned) return null;
  const isMotoLike = vehicleSlug === "moto" || vehicleSlug === "rifani";
  if (isMotoLike ? PLATE_MOTO.test(cleaned) : PLATE_STD.test(cleaned)) return null;
  if (cleaned.length >= 4) {
    return isMotoLike
      ? "Format: RX XXX X — R + 1 letter + 3 digits + 1 letter (e.g. RA 042 B)"
      : "Format: RXX XXX X — R + 2 letters + 3 digits + 1 letter (e.g. RAC 118 G)";
  }
  return null;
}

export function minAgeDob(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Auto-format a Rwanda NID as the user types.
 * Groups: X XXXXX XXXXXXX X XX  (1·5·7·1·2 = 16 digits)
 * Only digits are allowed; non-digit characters are stripped.
 */
export function formatRwandaNationalId(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 16);
  const parts = [d.slice(0, 1), d.slice(1, 6), d.slice(6, 13), d.slice(13, 14), d.slice(14, 16)];
  return parts.filter(Boolean).join(" ");
}

/**
 * Auto-format a Rwanda plate number as the user types.
 * Moto / Rifani  → RX XXX X  (2 letters · 3 digits · 1 letter = 6 alphanum chars)
 * Others         → RXX XXX X (3 letters · 3 digits · 1 letter = 7 alphanum chars)
 */
export function formatRwandaPlate(raw: string, vehicleSlug?: VehicleSlug): string {
  const s = raw.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const isMotoLike = vehicleSlug === "moto" || vehicleSlug === "rifani";
  const prefixLen = isMotoLike ? 2 : 3;
  const chars = s.slice(0, prefixLen + 4); // prefix + 3 digits + 1 letter
  const prefix = chars.slice(0, prefixLen);
  const digits = chars.slice(prefixLen, prefixLen + 3);
  const suffix = chars.slice(prefixLen + 3, prefixLen + 4);
  let out = prefix;
  if (digits) out += " " + digits;
  if (suffix) out += " " + suffix;
  return out;
}

/** Plate placeholder showing the expected format for the given vehicle type. */
export function platePlaceholder(vehicleSlug?: VehicleSlug): string {
  return vehicleSlug === "moto" || vehicleSlug === "rifani" ? "RA 000 B" : "RAC 000 A";
}

/** Rwanda NID is exactly 16 digits (spaces allowed, stripped before check). */
export function validateRwandaNationalId(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 16) {
    return `National ID must be 16 digits — got ${digits.length}`;
  }
  return null;
}

/** Full name: at least two words, letters only (no digits or special chars). */
export function validateFullName(raw: string): string | null {
  const name = raw.trim();
  if (name.length < 3) return "Name is too short";
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(name)) return "Name must contain letters only";
  if (name.split(/\s+/).filter(Boolean).length < 2) return "Enter first and last name";
  return null;
}

/**
 * Rwanda driving licence: DL- prefix + exactly 16 alphanumeric chars (19 total).
 */
export function validateLicenseNumber(raw: string): string | null {
  const v = raw.trim().toUpperCase();
  if (!v.startsWith("DL-")) return 'Licence number must start with "DL-"';
  const num = v.slice(3);
  if (num.length !== 16) return `16 characters required after "DL-" — got ${num.length}`;
  if (!/^[A-Z0-9]+$/.test(num)) return "Only letters and digits allowed after the DL- prefix";
  return null;
}

/** Passenger seats: 1–20. */
export function validatePassengerSeats(raw: string): string | null {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1) return "Enter at least 1 seat";
  if (n > 20) return "Maximum 20 passenger seats";
  return null;
}

/** Load capacity in kg: 100 kg – 30 000 kg. */
export function validateLoadCapacity(raw: string): string | null {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 100) return "Enter at least 100 kg";
  if (n > 30000) return "Maximum load capacity is 30 000 kg";
  return null;
}

const RWANDA_MOBILE_LENGTH = 10;

const MTN_PREFIX = "078";
const AIRTEL_PREFIXES = ["072", "073"] as const;
const ALL_RWANDA_MOBILE_PREFIXES = [MTN_PREFIX, ...AIRTEL_PREFIXES];

/** Strip non-digits and optional +250 country code → local 10-digit form. */
export function normalizeRwandaMobilePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length === 12) {
    return digits.slice(3);
  }
  return digits;
}

export function validateRwandaMobilePhone(
  raw: string,
  opts?: { provider?: "mtn" | "airtel"; label?: string },
): string | null {
  const digits = normalizeRwandaMobilePhone(raw);
  const label = opts?.label ?? "Phone number";

  if (!digits) return `${label} is required`;
  if (digits.length !== RWANDA_MOBILE_LENGTH) {
    return `${label} must be exactly 10 digits including the prefix (e.g. 0781234567)`;
  }

  const allowed =
    opts?.provider === "mtn"
      ? [MTN_PREFIX]
      : opts?.provider === "airtel"
        ? [...AIRTEL_PREFIXES]
        : ALL_RWANDA_MOBILE_PREFIXES;

  if (!allowed.some((p) => digits.startsWith(p))) {
    if (opts?.provider === "mtn") {
      return "MTN numbers must start with 078";
    }
    if (opts?.provider === "airtel") {
      return "Airtel numbers must start with 072 or 073";
    }
    return "Must start with 078 (MTN), 072 or 073 (Airtel)";
  }

  return null;
}

export function rwandaMobilePlaceholder(provider?: "mtn" | "airtel"): string {
  if (provider === "mtn") return "0781234567";
  if (provider === "airtel") return "0721234567";
  return "0781234567";
}
