/**
 * Mock driver data for UI verification — no backend required.
 * One driver per vehicle type so every tab has data.
 * Navigate to /admin/drivers/mock-driver-001 (through 004) to open the review page.
 */

import type { Driver as ApiDriver, DriverDetail } from "./api";

/** Placeholder image with a label — works with DocFaceCard's isImage check. */
function img(label: string, bg: string): string {
  return `https://placehold.co/800x500/${bg}/ffffff.png?text=${encodeURIComponent(label)}`;
}

const ago = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

function docSet(uploadedAgo: number) {
  return [
    { document_type: "PROFILE_SELFIE",        file_url: img("PROFILE  SELFIE",       "4f46e5"), uploaded_at: ago(uploadedAgo) },
    { document_type: "NATIONAL_ID_FRONT",     file_url: img("NATIONAL  ID  FRONT",   "7c3aed"), uploaded_at: ago(uploadedAgo) },
    { document_type: "NATIONAL_ID_BACK",      file_url: img("NATIONAL  ID  BACK",    "6d28d9"), uploaded_at: ago(uploadedAgo) },
    { document_type: "LICENCE_FRONT",         file_url: img("LICENCE  FRONT",        "0369a1"), uploaded_at: ago(uploadedAgo) },
    { document_type: "LICENCE_BACK",          file_url: img("LICENCE  BACK",         "0284c7"), uploaded_at: ago(uploadedAgo) },
    { document_type: "VEHICLE_INSURANCE",     file_url: img("VEHICLE  INSURANCE",    "16a34a"), uploaded_at: ago(uploadedAgo) },
    { document_type: "VEHICLE_AUTHORIZATION", file_url: img("VEHICLE  AUTHORIZATION","b45309"), uploaded_at: ago(uploadedAgo) },
  ];
}

/* ── mock-driver-001 · MOTO_BIKE ── full docs + prior review round ──────── */
const MOCK_MOTO: DriverDetail = {
  id: "mock-driver-001",
  full_name: "Jean Pierre Hakizimana",
  phone: "+250781234567",
  transport_type: "MOTO_BIKE",
  vehicle_plate: "RA 042 B",
  national_id_number: "1 19950 7123456 7 89",
  license_number: "DL-1234567890ABCDEF",
  date_of_birth: "1995-06-15",
  city: "Kigali",
  address: { province: "Kigali City", district: "Gasabo", sector: "Kimironko", cell: "Kibagabaga", village: "Inganzo" },
  momo_provider: "MTN",
  momo_pay_code: "+250781234567",
  approval_status: "PENDING_REVIEW",
  created_at: ago(2),
  is_online: false,
  license_issued_date: "2022-06-15",
  license_expiry_date: "2028-06-15",
  insurance_issued_date: "2026-03-01",
  insurance_expiry_date: "2027-03-01",
  authorization_issued_date: "2026-03-14",
  authorization_expiry_date: "2027-03-14",
  documents: docSet(2),
  review_history: [
    {
      id: "hist-001",
      decided_at: ago(5),
      decided_by: "Admin — Claudette N.",
      decision: "more_info_requested",
      reason: "Insurance document is blurry — certificate number unreadable. Please resubmit.",
      document_decisions: [
        { document_type: "LICENCE_FRONT",    decision: "accepted",   comment: "Clear and valid." },
        { document_type: "LICENCE_BACK",     decision: "accepted",   comment: undefined },
        { document_type: "VEHICLE_INSURANCE",decision: "more_info",  comment: "Image too blurry." },
      ],
    },
  ],
};

/* ── mock-driver-002 · CAB_TAXI ── insurance back face missing ───────────── */
const MOCK_CAB: DriverDetail = {
  id: "mock-driver-002",
  full_name: "Amina Uwimana",
  phone: "+250722987654",
  transport_type: "CAB_TAXI",
  vehicle_plate: "RAC 118 G",
  national_id_number: "1 19900 7987654 3 21",
  license_number: "DL-9876543210ZYXWVU",
  date_of_birth: "1990-11-22",
  city: "Kigali",
  address: { province: "Kigali City", district: "Kicukiro", sector: "Niboye", cell: "Gatare", village: "Kamashashi" },
  momo_provider: "AIRTEL",
  momo_pay_code: "+250722987654",
  approval_status: "PENDING_REVIEW",
  created_at: ago(1),
  is_online: false,
  documents: [
    { document_type: "PROFILE_SELFIE",        file_url: img("PROFILE  SELFIE",     "7c3aed"), uploaded_at: ago(1) },
    { document_type: "NATIONAL_ID_FRONT",     file_url: img("NATIONAL  ID  FRONT", "7c3aed"), uploaded_at: ago(1) },
    // NATIONAL_ID_BACK intentionally missing — tests "not uploaded" placeholder
    { document_type: "LICENCE_FRONT",         file_url: img("LICENCE  FRONT",      "0369a1"), uploaded_at: ago(1) },
    { document_type: "LICENCE_BACK",          file_url: img("LICENCE  BACK",       "0284c7"), uploaded_at: ago(1) },
    { document_type: "VEHICLE_INSURANCE",     file_url: img("VEHICLE  INSURANCE",  "16a34a"), uploaded_at: ago(1) },
    { document_type: "VEHICLE_AUTHORIZATION", file_url: img("VEHICLE  AUTHORIZATION","b45309"), uploaded_at: ago(1) },
  ],
};

/* ── mock-driver-003 · LIGHT_HILUX ── full docs, first-time submission ───── */
const MOCK_HILUX: DriverDetail = {
  id: "mock-driver-003",
  full_name: "Emmanuel Nkurunziza",
  phone: "+250788112233",
  transport_type: "LIGHT_HILUX",
  vehicle_plate: "RAC 201 H",
  national_id_number: "1 19880 7112233 4 56",
  license_number: "DL-ABCDEF1234567890",
  date_of_birth: "1988-03-20",
  city: "Kigali",
  address: { province: "Kigali City", district: "Nyarugenge", sector: "Gitega", cell: "Biryogo", village: "Agaciro" },
  momo_provider: "MTN",
  momo_pay_code: "+250788112233",
  approval_status: "PENDING_REVIEW",
  created_at: ago(3),
  is_online: false,
  license_issued_date: "2023-01-10",
  license_expiry_date: "2029-01-10",
  insurance_issued_date: "2026-06-30",
  insurance_expiry_date: "2027-06-30",
  authorization_issued_date: "2026-06-30",
  authorization_expiry_date: "2027-06-30",
  documents: docSet(3),
};

/* ── mock-driver-004 · HEAVY_FUSO ── full docs, first-time submission ────── */
const MOCK_FUSO: DriverDetail = {
  id: "mock-driver-004",
  full_name: "Celestin Bizimungu",
  phone: "+250723445566",
  transport_type: "HEAVY_FUSO",
  vehicle_plate: "RAC 388 F",
  national_id_number: "1 19830 7445566 7 88",
  license_number: "DL-FUSO9876543210AB",
  date_of_birth: "1983-09-05",
  city: "Kigali",
  address: { province: "Eastern Province", district: "Rwamagana", sector: "Kigabiro", cell: "Cyasemakamba", village: "Rugaragara" },
  momo_provider: "AIRTEL",
  momo_pay_code: "+250723445566",
  approval_status: "PENDING_REVIEW",
  created_at: ago(4),
  is_online: false,
  license_issued_date: "2021-09-05",
  license_expiry_date: "2027-09-05",
  insurance_issued_date: "2025-12-31",
  insurance_expiry_date: "2026-12-31",
  authorization_issued_date: "2025-12-31",
  authorization_expiry_date: "2026-12-31",
  documents: docSet(4),
};

export const MOCK_DRIVER_IDS = [
  "mock-driver-001",
  "mock-driver-002",
  "mock-driver-003",
  "mock-driver-004",
] as const;
export type MockDriverId = (typeof MOCK_DRIVER_IDS)[number];

export function isMockDriverId(id: string): id is MockDriverId {
  return MOCK_DRIVER_IDS.includes(id as MockDriverId);
}

export const MOCK_DRIVERS: Record<MockDriverId, DriverDetail> = {
  "mock-driver-001": MOCK_MOTO,
  "mock-driver-002": MOCK_CAB,
  "mock-driver-003": MOCK_HILUX,
  "mock-driver-004": MOCK_FUSO,
};

/** Raw API-shaped records — injected into the drivers list and overview stats. */
export const MOCK_API_DRIVERS: ApiDriver[] = [
  {
    id: "mock-driver-001",
    full_name: "Jean Pierre Hakizimana",
    phone: "+250781234567",
    transport_type: "MOTO_BIKE",
    vehicle_plate: "RA 042 B",
    approval_status: "PENDING_REVIEW",
    is_online: false,
    on_trip: false,
    city: "Kigali",
    created_at: ago(2),
  },
  {
    id: "mock-driver-002",
    full_name: "Amina Uwimana",
    phone: "+250722987654",
    transport_type: "CAB_TAXI",
    vehicle_plate: "RAC 118 G",
    approval_status: "PENDING_REVIEW",
    is_online: false,
    on_trip: false,
    city: "Kigali",
    created_at: ago(1),
  },
  {
    id: "mock-driver-003",
    full_name: "Emmanuel Nkurunziza",
    phone: "+250788112233",
    transport_type: "LIGHT_HILUX",
    vehicle_plate: "RAC 201 H",
    approval_status: "PENDING_REVIEW",
    is_online: false,
    on_trip: false,
    city: "Kigali",
    created_at: ago(3),
  },
  {
    id: "mock-driver-004",
    full_name: "Celestin Bizimungu",
    phone: "+250723445566",
    transport_type: "HEAVY_FUSO",
    vehicle_plate: "RAC 388 F",
    approval_status: "PENDING_REVIEW",
    is_online: false,
    on_trip: false,
    city: "Kigali",
    created_at: ago(4),
  },
];
