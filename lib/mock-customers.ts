import type { Customer as ApiCustomer, CustomerDetail, CustomerTrip } from "./api";

const ago = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();

function trip(
  id: string,
  daysAgo: number,
  from: string,
  to: string,
  type: string,
  fare: number,
  status: "COMPLETED" | "CANCELLED",
  driver: { id: string; name: string; phone: string; plate: string },
): CustomerTrip {
  return {
    id,
    status,
    transport_type: type,
    agreed_fare: fare,
    pickup_address: from,
    destination_address: to,
    created_at: ago(daysAgo),
    driver_id: driver.id,
    driver_name: driver.name,
    driver_phone: driver.phone,
    vehicle_plate: driver.plate,
  };
}

// Reference mock drivers so the customer history links to real profiles
const MOTO  = { id: "mock-driver-001", name: "Jean Pierre Hakizimana", phone: "+250781234567", plate: "RA 042 B" };
const CAB   = { id: "mock-driver-002", name: "Amina Uwimana",          phone: "+250722987654", plate: "RAC 118 G" };
const HILUX = { id: "mock-driver-003", name: "Emmanuel Nkurunziza",    phone: "+250788112233", plate: "RAC 201 H" };
const FUSO  = { id: "mock-driver-004", name: "Celestin Bizimungu",     phone: "+250723445566", plate: "RAC 388 F" };

/* ── mock-customer-001 ── frequent rider ──────────────────────────────────── */
const CUST_001: CustomerDetail = {
  id: "mock-customer-001",
  full_name: "Alice Uwase",
  phone: "+250788001001",
  email: "alice.uwase@gmail.com",
  photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Kimironko, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 34,
  total_spend: 187_000,
  created_at: ago(180),
  last_seen_at: ago(0, 3),
  recent_trips: [
    trip("t-001-1", 0, "Kimironko Market", "Kigali Convention Centre", "MOTO_BIKE", 2500, "COMPLETED", MOTO),
    trip("t-001-2", 1, "Kigali Convention Centre", "Nyamirambo", "CAB_TAXI", 5500, "COMPLETED", CAB),
    trip("t-001-3", 3, "Remera", "Gisozi", "MOTO_BIKE", 2000, "COMPLETED", MOTO),
    trip("t-001-4", 5, "Kimironko", "Airport", "CAB_TAXI", 8000, "COMPLETED", CAB),
    trip("t-001-5", 7, "Downtown Kigali", "Kacyiru", "MOTO_BIKE", 3000, "CANCELLED", MOTO),
    trip("t-001-6", 10, "Gikondo", "Nyabugogo", "LIGHT_HILUX", 4500, "COMPLETED", HILUX),
    trip("t-001-7", 14, "Kimironko", "CBD", "MOTO_BIKE", 2500, "COMPLETED", MOTO),
    trip("t-001-8", 18, "Kacyiru", "Remera", "CAB_TAXI", 4000, "COMPLETED", CAB),
  ],
};

/* ── mock-customer-002 ── business traveller ──────────────────────────────── */
const CUST_002: CustomerDetail = {
  id: "mock-customer-002",
  full_name: "Patrick Niyonzima",
  phone: "+250722002002",
  email: "p.niyonzima@rwandatel.rw",
  photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Nyarutarama, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 12,
  total_spend: 96_000,
  created_at: ago(90),
  last_seen_at: ago(2),
  recent_trips: [
    trip("t-002-1", 2,  "Kigali Heights",  "Norrsken House",    "CAB_TAXI",    6000, "COMPLETED", CAB),
    trip("t-002-2", 4,  "Norrsken House",  "RDB Office",        "CAB_TAXI",    5500, "COMPLETED", CAB),
    trip("t-002-3", 6,  "Kigali Airport",  "Marriott Hotel",    "LIGHT_HILUX", 9000, "COMPLETED", HILUX),
    trip("t-002-4", 9,  "Marriott Hotel",  "Kigali Arena",      "CAB_TAXI",    4500, "COMPLETED", CAB),
    trip("t-002-5", 12, "Kigali Arena",    "Kigali Airport",    "CAB_TAXI",    9000, "COMPLETED", CAB),
    trip("t-002-6", 15, "RDB Office",      "Kigali Heights",    "MOTO_BIKE",   3000, "CANCELLED", MOTO),
  ],
};

/* ── mock-customer-003 ── suspended customer ──────────────────────────────── */
const CUST_003: CustomerDetail = {
  id: "mock-customer-003",
  full_name: "Eric Habimana",
  phone: "+250738003003",
  email: null,
  photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Nyamirambo, Kigali",
  role_state: "suspended",
  is_suspended: true,
  suspension_until: ago(-30), // 30 days in the future
  total_rides: 5,
  total_spend: 21_000,
  created_at: ago(60),
  last_seen_at: ago(20),
  recent_trips: [
    trip("t-003-1", 20, "Nyabugogo",  "Kicukiro",   "MOTO_BIKE", 3000, "COMPLETED", MOTO),
    trip("t-003-2", 22, "Kicukiro",   "Remera",      "MOTO_BIKE", 2500, "CANCELLED", MOTO),
    trip("t-003-3", 25, "CBD",        "Nyamirambo",  "MOTO_BIKE", 3500, "COMPLETED", MOTO),
    trip("t-003-4", 28, "Nyamirambo", "Gisozi",      "CAB_TAXI",  6000, "COMPLETED", CAB),
    trip("t-003-5", 30, "Gisozi",     "Nyabugogo",   "MOTO_BIKE", 2500, "CANCELLED", MOTO),
  ],
};

/* ── mock-customer-004 ── new user / light usage ─────────────────────────── */
const CUST_004: CustomerDetail = {
  id: "mock-customer-004",
  full_name: "Claudine Mukamana",
  phone: "+250788004004",
  email: "claudine.m@yahoo.com",
  photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Kacyiru, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 3,
  total_spend: 14_500,
  created_at: ago(14),
  last_seen_at: ago(1),
  recent_trips: [
    trip("t-004-1", 1,  "Kigali Airport", "Kimironko",   "LIGHT_HILUX", 8000, "COMPLETED", HILUX),
    trip("t-004-2", 5,  "Kimironko",      "CBD",         "MOTO_BIKE",   2500, "COMPLETED", MOTO),
    trip("t-004-3", 12, "CBD",            "Nyamirambo",  "MOTO_BIKE",   4000, "COMPLETED", MOTO),
  ],
};

/* ── mock-customer-005 ── active user ─────────────────────────────────────── */
const CUST_005: CustomerDetail = {
  id: "mock-customer-005",
  full_name: "David Mugisha",
  phone: "+250788005005",
  email: "d.mugisha@gmail.com",
  photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Gisozi, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 18,
  total_spend: 85_000,
  created_at: ago(120),
  last_seen_at: ago(2),
  recent_trips: [
    trip("t-005-1", 2, "Kacyiru", "Nyarutarama", "CAB_TAXI", 4500, "COMPLETED", CAB),
    trip("t-005-2", 4, "Nyarutarama", "Kimihurura", "MOTO_BIKE", 2000, "COMPLETED", MOTO),
  ],
};

/* ── mock-customer-006 ── active user ─────────────────────────────────────── */
const CUST_006: CustomerDetail = {
  id: "mock-customer-006",
  full_name: "Esperance Mutoni",
  phone: "+250788006006",
  email: "mutoni.esp@gmail.com",
  photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Remera, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 8,
  total_spend: 32_000,
  created_at: ago(45),
  last_seen_at: ago(3),
  recent_trips: [
    trip("t-006-1", 3, "Remera", "Nyarutarama", "MOTO_BIKE", 1800, "COMPLETED", MOTO),
    trip("t-006-2", 7, "Gikondo", "Kimironko", "CAB_TAXI", 6500, "COMPLETED", CAB),
  ],
};

/* ── mock-customer-007 ── frequent user ───────────────────────────────────── */
const CUST_007: CustomerDetail = {
  id: "mock-customer-007",
  full_name: "Jean de Dieu Nsengimana",
  phone: "+250788007007",
  email: "jdd.nsengimana@yahoo.fr",
  photo_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Gikondo, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 24,
  total_spend: 142_000,
  created_at: ago(150),
  last_seen_at: ago(1, 4),
  recent_trips: [
    trip("t-007-1", 1, "CBD", "Kigali Heights", "CAB_TAXI", 5000, "COMPLETED", CAB),
    trip("t-007-2", 3, "Kigali Heights", "Remera", "CAB_TAXI", 4500, "COMPLETED", CAB),
  ],
};

/* ── mock-customer-008 ── suspended user ──────────────────────────────────── */
const CUST_008: CustomerDetail = {
  id: "mock-customer-008",
  full_name: "Marie Claire Uwineza",
  phone: "+250788008008",
  email: "mc.uwineza@outlook.com",
  photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Nyabugogo, Kigali",
  role_state: "suspended",
  is_suspended: true,
  suspension_until: ago(-15),
  total_rides: 2,
  total_spend: 7_500,
  created_at: ago(30),
  last_seen_at: ago(15),
  recent_trips: [
    trip("t-008-1", 15, "Nyamirambo", "Nyabugogo", "MOTO_BIKE", 2500, "COMPLETED", MOTO),
    trip("t-008-2", 20, "Nyabugogo", "Kimironko", "CAB_TAXI", 5000, "CANCELLED", CAB),
  ],
};

/* ── mock-customer-009 ── power user ──────────────────────────────────────── */
const CUST_009: CustomerDetail = {
  id: "mock-customer-009",
  full_name: "Olivier Kwizera",
  phone: "+250788009009",
  email: "o.kwizera@gmail.com",
  photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Kibagabaga, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 52,
  total_spend: 310_000,
  created_at: ago(240),
  last_seen_at: ago(0, 1),
  recent_trips: [
    trip("t-009-1", 0, "Kimironko Market", "Kibagabaga", "MOTO_BIKE", 1500, "COMPLETED", MOTO),
    trip("t-009-2", 1, "Kibagabaga", "CBD", "CAB_TAXI", 7000, "COMPLETED", CAB),
  ],
};

/* ── mock-customer-010 ── regular user ────────────────────────────────────── */
const CUST_010: CustomerDetail = {
  id: "mock-customer-010",
  full_name: "Solange Umuhoza",
  phone: "+250788010010",
  email: "solange.umuhoza@hotmail.com",
  photo_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&h=150&q=80",
  location: "Kiyovu, Kigali",
  role_state: "active",
  is_suspended: false,
  total_rides: 11,
  total_spend: 48_000,
  created_at: ago(60),
  last_seen_at: ago(5),
  recent_trips: [
    trip("t-010-1", 5, "Kacyiru", "Gisozi", "MOTO_BIKE", 2200, "COMPLETED", MOTO),
    trip("t-010-2", 8, "Gisozi", "Remera", "CAB_TAXI", 5000, "COMPLETED", CAB),
  ],
};

export const MOCK_CUSTOMER_IDS = [
  "mock-customer-001",
  "mock-customer-002",
  "mock-customer-003",
  "mock-customer-004",
  "mock-customer-005",
  "mock-customer-006",
  "mock-customer-007",
  "mock-customer-008",
  "mock-customer-009",
  "mock-customer-010",
] as const;

export type MockCustomerId = (typeof MOCK_CUSTOMER_IDS)[number];

export function isMockCustomerId(id: string): id is MockCustomerId {
  return MOCK_CUSTOMER_IDS.includes(id as MockCustomerId);
}

export const MOCK_CUSTOMERS: Record<MockCustomerId, CustomerDetail> = {
  "mock-customer-001": CUST_001,
  "mock-customer-002": CUST_002,
  "mock-customer-003": CUST_003,
  "mock-customer-004": CUST_004,
  "mock-customer-005": CUST_005,
  "mock-customer-006": CUST_006,
  "mock-customer-007": CUST_007,
  "mock-customer-008": CUST_008,
  "mock-customer-009": CUST_009,
  "mock-customer-010": CUST_010,
};

export const MOCK_API_CUSTOMERS: ApiCustomer[] = MOCK_CUSTOMER_IDS.map(
  (id) => {
    const d = MOCK_CUSTOMERS[id];
    return {
      id: d.id,
      full_name: d.full_name,
      phone: d.phone,
      email: d.email,
      photo_url: d.photo_url,
      location: d.location,
      role_state: d.role_state,
      is_suspended: d.is_suspended,
      suspension_until: d.suspension_until,
      total_rides: d.total_rides,
      total_spend: d.total_spend,
      created_at: d.created_at,
      last_seen_at: d.last_seen_at,
    };
  },
);
