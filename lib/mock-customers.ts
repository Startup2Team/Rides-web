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
  role_state: "active",
  is_suspended: false,
  total_rides: 34,
  total_spend: 187_000,
  rating: 4.8,
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
  role_state: "active",
  is_suspended: false,
  total_rides: 12,
  total_spend: 96_000,
  rating: 4.5,
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
  role_state: "suspended",
  is_suspended: true,
  suspension_until: ago(-30), // 30 days in the future
  total_rides: 5,
  total_spend: 21_000,
  rating: 2.9,
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
  role_state: "active",
  is_suspended: false,
  total_rides: 3,
  total_spend: 14_500,
  rating: 5.0,
  created_at: ago(14),
  last_seen_at: ago(1),
  recent_trips: [
    trip("t-004-1", 1,  "Kigali Airport", "Kimironko",   "LIGHT_HILUX", 8000, "COMPLETED", HILUX),
    trip("t-004-2", 5,  "Kimironko",      "CBD",         "MOTO_BIKE",   2500, "COMPLETED", MOTO),
    trip("t-004-3", 12, "CBD",            "Nyamirambo",  "MOTO_BIKE",   4000, "COMPLETED", MOTO),
  ],
};

export const MOCK_CUSTOMER_IDS = [
  "mock-customer-001",
  "mock-customer-002",
  "mock-customer-003",
  "mock-customer-004",
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
};

export const MOCK_API_CUSTOMERS: ApiCustomer[] = MOCK_CUSTOMER_IDS.map(
  (id) => {
    const d = MOCK_CUSTOMERS[id];
    return {
      id: d.id,
      full_name: d.full_name,
      phone: d.phone,
      email: d.email,
      role_state: d.role_state,
      is_suspended: d.is_suspended,
      suspension_until: d.suspension_until,
      total_rides: d.total_rides,
      total_spend: d.total_spend,
      rating: d.rating,
      created_at: d.created_at,
      last_seen_at: d.last_seen_at,
    };
  },
);
