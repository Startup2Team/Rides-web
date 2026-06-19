/** Document API types — aligned with mobile driver onboarding + backend admin API. */

export type DocKey = "license" | "insurance" | "authorization";

export type DocFaces = [File | null, File | null];

export const DOC_LABELS: Record<
  DocKey,
  { label: string; hint: string; frontRequired: boolean }
> = {
  license: {
    label: "Driver's licence",
    hint: "Front and back faces — JPEG, PNG or PDF",
    frontRequired: true,
  },
  insurance: {
    label: "Vehicle insurance document",
    hint: "Front face required — JPEG, PNG or PDF",
    frontRequired: true,
  },
  authorization: {
    label: "Vehicle authorization / inspection certificate",
    hint: "Front face required — JPEG, PNG or PDF",
    frontRequired: true,
  },
};

export const DOC_API_TYPE: Record<DocKey, [string, string]> = {
  license: ["LICENCE_FRONT", "LICENCE_BACK"],
  insurance: ["VEHICLE_INSURANCE", "VEHICLE_INSURANCE_BACK"],
  authorization: ["VEHICLE_AUTHORIZATION", "VEHICLE_AUTHORIZATION_BACK"],
};

export type VehicleSlug = "moto" | "cab" | "hilux" | "fuso";

export const RWANDA_PLATE_PATTERNS = [
  { regex: /^R[A-Z]{2}\s\d{3}\s[A-Z]$/, label: "Private: RAA 000 A" },
  { regex: /^RAC\s\d{3}\s[A-Z]$/, label: "Commercial: RAC 000 A" },
  { regex: /^RAD\s\d{3}\s[A-Z]$/, label: "Motorcycle: RAD 000 A" },
];

export function validatePlate(plate: string): string | null {
  const cleaned = plate.trim().toUpperCase();
  if (!cleaned) return null;
  if (RWANDA_PLATE_PATTERNS.some((p) => p.regex.test(cleaned))) return null;
  if (cleaned.length >= 5) {
    return "Format not matched — verify Rwanda plate standards (RAD/RAC/RAA 000 A).";
  }
  return null;
}

export function minAgeDob(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
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
