/**
 * Mock driver data for UI verification — no backend required.
 * Seeds 10 drivers per vehicle type so every tab has realistic data.
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

const NAMES_BY_CAT: Record<string, string[]> = {
  MOTO_BIKE: [
    "Jean Pierre Hakizimana",
    "Eric Mutanguha",
    "Damascene Nsengimana",
    "Innocent Ndahimana",
    "Theogene Ndayisenga",
    "Emmanuel Mugisha",
    "Olivier Niyonisenga",
    "Claude Uwiringiyimana",
    "Bosco Ndikumana",
    "Justin Habimana",
  ],
  CAB_TAXI: [
    "Amina Uwimana",
    "Liliane Mutoni",
    "Grace Ingabire",
    "Marie Jeanne Mukamana",
    "Divine Kanyange",
    "Charlotte Uwamahoro",
    "Beata Mukamurenzi",
    "Sandrine Uwera",
    "Alice Umutoniwase",
    "Diane Uwase",
  ],
  LIGHT_HILUX: [
    "Emmanuel Nkurunziza",
    "Patrick Mugabo",
    "Felicien Ndahayo",
    "Christian Gakwaya",
    "Robert Kayitare",
    "David Murenzi",
    "Alphonse Munyentwari",
    "Charles Nkurikiye",
    "Rene Bizimana",
    "Francois X. Niyomugabo",
  ],
  HEAVY_FUSO: [
    "Celestin Bizimungu",
    "Pascal Niyibizi",
    "Valens Nsabimana",
    "Augustin Habiyaremye",
    "Anastase Munyaneza",
    "Joseph Gasana",
    "Dominique Ntawukuriryayo",
    "Laurent Nsengiyumva",
    "Jean de Dieu Ndagijimana",
    "Gabriel Habyarimana",
  ],
  RIFANI: [
    "Faustin Ntakirutimana",
    "Lambert Mugisha",
    "Gaspard Ndababonye",
    "Anicet Uwumukiza",
    "Alexis Nsanzimana",
    "Sylvestre Nsabimana",
    "Bernard Ndayisaba",
    "Serge Munyakazi",
    "Pauline Mukashema",
    "Jean Bosco Rwigema",
  ],
};

const categories = ["MOTO_BIKE", "CAB_TAXI", "LIGHT_HILUX", "HEAVY_FUSO", "RIFANI"] as const;

const MOCK_DRIVERS_LIST: DriverDetail[] = [];

categories.forEach((cat, catIdx) => {
  const names = NAMES_BY_CAT[cat];
  names.forEach((name, nameIdx) => {
    const driverNum = catIdx * 10 + nameIdx + 1; // 1 to 50
    const padNum = String(driverNum).padStart(3, "0");
    const id = `mock-driver-${padNum}`;
    
    // Plate number generation
    let plate = "";
    if (cat === "MOTO_BIKE") {
      plate = `RA ${100 + nameIdx} ${String.fromCharCode(65 + nameIdx)}`;
    } else if (cat === "RIFANI") {
      plate = `RD ${200 + nameIdx} ${String.fromCharCode(65 + nameIdx)}`;
    } else if (cat === "CAB_TAXI") {
      plate = `RAB ${300 + nameIdx} ${String.fromCharCode(65 + nameIdx)}`;
    } else if (cat === "LIGHT_HILUX") {
      plate = `RAC ${400 + nameIdx} ${String.fromCharCode(65 + nameIdx)}`;
    } else if (cat === "HEAVY_FUSO") {
      plate = `RAD ${500 + nameIdx} ${String.fromCharCode(65 + nameIdx)}`;
    }

    // National ID: 16 digits grouped as X XXXXX XXXXXXX X XX
    const birthYear = 1980 + (driverNum % 25);
    const nid = `1 ${birthYear}0 7${String(1000000 + driverNum).slice(1)} 7 ${String(80 + nameIdx)}`;

    // Licence number: DL-16 alphanum chars
    const license = `DL-${padNum}AB${String(1000000000 + driverNum).slice(1)}`;

    const isOnline = nameIdx === 0 || nameIdx === 4;
    const onTrip = nameIdx === 4;
    
    let approvalStatus = "PENDING_REVIEW";
    if (nameIdx === 2 || nameIdx === 3) approvalStatus = "APPROVED";
    if (nameIdx === 7) approvalStatus = "REJECTED";
    if (nameIdx === 8) approvalStatus = "SUSPENDED";

    const detail: DriverDetail = {
      id,
      full_name: name,
      phone: `+25078${String(1000000 + driverNum).slice(1)}`,
      transport_type: cat,
      vehicle_plate: plate,
      national_id_number: nid,
      license_number: license,
      date_of_birth: `${birthYear}-05-${String(1 + (nameIdx % 28)).padStart(2, "0")}`,
      city: "Kigali",
      address: {
        province: catIdx % 2 === 0 ? "Kigali City" : "Eastern Province",
        district: catIdx % 2 === 0 ? "Gasabo" : "Rwamagana",
        sector: "Kimironko",
        cell: "Kibagabaga",
        village: "Inganzo",
      },
      momo_provider: nameIdx % 2 === 0 ? "MTN" : "AIRTEL",
      momo_pay_code: `+25078${String(1000000 + driverNum).slice(1)}`,
      approval_status: approvalStatus,
      created_at: ago(catIdx + 1),
      is_online: isOnline,
      license_issued_date: `${birthYear + 20}-01-10`,
      license_expiry_date: `${birthYear + 26}-01-10`,
      insurance_issued_date: "2026-03-01",
      insurance_expiry_date: "2027-03-01",
      authorization_issued_date: "2026-03-14",
      authorization_expiry_date: "2027-03-14",
      documents: docSet(catIdx + 1),
      review_history: nameIdx === 0 ? [
        {
          id: `hist-${padNum}`,
          decided_at: ago(5),
          decided_by: "Admin — Claudette N.",
          decision: "more_info_requested",
          reason: "Insurance document is blurry. Please resubmit.",
          document_decisions: [
            { document_type: "LICENCE_FRONT", decision: "accepted" },
            { document_type: "VEHICLE_INSURANCE", decision: "more_info" },
          ],
        }
      ] : undefined,
    };
    
    MOCK_DRIVERS_LIST.push(detail);
  });
});

const REFERRALS_PER_DRIVER = 10;

const REFERRAL_FIRST_NAMES = [
  "Alice", "Benjamin", "Chantal", "Denis", "Esther", "Fabrice", "Gisele", "Henri",
  "Immaculee", "James", "Keza", "Leon", "Mariam", "Noella", "Olivier", "Pascaline",
  "Quentin", "Rosine", "Samuel", "Theoneste", "Uwineza", "Viateur", "Winnie", "Xavier",
  "Yvette", "Zawadi", "Aline", "Bruce", "Clement", "Diane",
];

const REFERRAL_LAST_NAMES = [
  "Mukamana", "Habimana", "Niyonsaba", "Uwizeye", "Bizimana", "Murekatete", "Nshimiyimana",
  "Uwimana", "Gasana", "Mugisha", "Nyirahabimana", "Hategekimana", "Irakoze", "Kamanzi",
  "Mbarushimana", "Niyitegeka", "Rukundo", "Sibomana", "Twagirumukiza", "Uwamahoro",
];

const MOCK_REFERRED_LIST: DriverDetail[] = [];

function plateForReferred(cat: string, referrerIdx: number, refIdx: number): string {
  const n = referrerIdx * 10 + refIdx;
  const letter = String.fromCharCode(65 + (refIdx % 26));
  if (cat === "MOTO_BIKE") return `RA ${600 + n} ${letter}`;
  if (cat === "RIFANI") return `RD ${600 + n} ${letter}`;
  if (cat === "CAB_TAXI") return `RAB ${600 + n} ${letter}`;
  if (cat === "LIGHT_HILUX") return `RAC ${600 + n} ${letter}`;
  return `RAD ${600 + n} ${letter}`;
}

function approvalForReferred(refIdx: number): string {
  if (refIdx % 9 === 0) return "REJECTED";
  if (refIdx % 5 === 0) return "PENDING_REVIEW";
  return "APPROVED";
}

MOCK_DRIVERS_LIST.forEach((referrer, referrerIdx) => {
  const referrerPad = referrer.id.replace("mock-driver-", "");

  for (let refIdx = 1; refIdx <= REFERRALS_PER_DRIVER; refIdx++) {
    const seed = referrerIdx * 10 + refIdx;
    const first = REFERRAL_FIRST_NAMES[seed % REFERRAL_FIRST_NAMES.length];
    const last = REFERRAL_LAST_NAMES[(seed + refIdx) % REFERRAL_LAST_NAMES.length];
    const refPad = String(refIdx).padStart(2, "0");
    const id = `mock-referred-${referrerPad}-${refPad}`;
    const phoneSuffix = String(2000000 + seed).slice(1);

    MOCK_REFERRED_LIST.push({
      id,
      full_name: `${first} ${last}`,
      phone: `+25079${phoneSuffix}`,
      transport_type: referrer.transport_type,
      vehicle_plate: plateForReferred(referrer.transport_type, referrerIdx, refIdx),
      approval_status: approvalForReferred(refIdx),
      created_at: ago(2 + ((seed * 3) % 88)),
      city: referrer.city ?? "Kigali",
      referred_by_driver_id: referrer.id,
      license_number: `DL-REF${referrerPad}${refPad}`,
      documents: docSet(1 + (refIdx % 5)),
    });
  }

  referrer.referral_count = REFERRALS_PER_DRIVER;
});

export function getMockReferredDrivers(referrerId: string): DriverDetail[] {
  return MOCK_REFERRED_LIST.filter((d) => d.referred_by_driver_id === referrerId);
}

export function getMockDriverById(id: string): DriverDetail | undefined {
  return (
    MOCK_DRIVERS_LIST.find((d) => d.id === id) ??
    MOCK_REFERRED_LIST.find((d) => d.id === id)
  );
}

export function isMockReferredId(id: string): boolean {
  return id.startsWith("mock-referred-");
}

export const MOCK_DRIVER_IDS = [
  "mock-driver-001", "mock-driver-002", "mock-driver-003", "mock-driver-004", "mock-driver-005",
  "mock-driver-006", "mock-driver-007", "mock-driver-008", "mock-driver-009", "mock-driver-010",
  "mock-driver-011", "mock-driver-012", "mock-driver-013", "mock-driver-014", "mock-driver-015",
  "mock-driver-016", "mock-driver-017", "mock-driver-018", "mock-driver-019", "mock-driver-020",
  "mock-driver-021", "mock-driver-022", "mock-driver-023", "mock-driver-024", "mock-driver-025",
  "mock-driver-026", "mock-driver-027", "mock-driver-028", "mock-driver-029", "mock-driver-030",
  "mock-driver-031", "mock-driver-032", "mock-driver-033", "mock-driver-034", "mock-driver-035",
  "mock-driver-036", "mock-driver-037", "mock-driver-038", "mock-driver-039", "mock-driver-040",
  "mock-driver-041", "mock-driver-042", "mock-driver-043", "mock-driver-044", "mock-driver-045",
  "mock-driver-046", "mock-driver-047", "mock-driver-048", "mock-driver-049", "mock-driver-050",
] as const;

export type MockDriverId = (typeof MOCK_DRIVER_IDS)[number];

export function isMockDriverId(id: string): id is MockDriverId {
  return MOCK_DRIVER_IDS.includes(id as MockDriverId);
}

export const MOCK_DRIVERS: Record<MockDriverId, DriverDetail> = MOCK_DRIVERS_LIST.reduce((acc, d) => {
  acc[d.id as MockDriverId] = d;
  return acc;
}, {} as Record<MockDriverId, DriverDetail>);

export const MOCK_API_DRIVERS: ApiDriver[] = MOCK_DRIVERS_LIST.map((d, idx) => ({
  id: d.id,
  full_name: d.full_name,
  phone: d.phone,
  transport_type: d.transport_type,
  vehicle_plate: d.vehicle_plate,
  approval_status: d.approval_status,
  is_online: d.is_online,
  on_trip: idx % 10 === 4,
  city: d.city,
  created_at: d.created_at,
  referral_count: d.referral_count,
  referred_by_driver_id: d.referred_by_driver_id,
}));

const MOCK_STATUS_KEY = "taravelis_mock_driver_status";

function loadMockStatusOverrides(): Partial<Record<MockDriverId, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MOCK_STATUS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<MockDriverId, string>>) : {};
  } catch {
    return {};
  }
}

function applyMockStatus(id: MockDriverId, status: string): void {
  MOCK_DRIVERS[id].approval_status = status;
  const apiRow = MOCK_API_DRIVERS.find((d) => d.id === id);
  if (apiRow) apiRow.approval_status = status;
}

export function setMockDriverStatus(id: MockDriverId, status: string): void {
  applyMockStatus(id, status);
  if (typeof window === "undefined") return;
  try {
    const overrides = loadMockStatusOverrides();
    overrides[id] = status;
    localStorage.setItem(MOCK_STATUS_KEY, JSON.stringify(overrides));
  } catch {
    // Storage unavailable — the in-memory change above still applies for this session.
  }
}

// Re-apply any status changes from a previous session now that both fixture arrays exist.
for (const [id, status] of Object.entries(loadMockStatusOverrides())) {
  if (status) applyMockStatus(id as MockDriverId, status);
}
