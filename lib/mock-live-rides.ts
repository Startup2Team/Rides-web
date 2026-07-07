/**
 * Mock live rides — demo fixtures for /admin/live-rides so the console and map
 * have something to show even when the backend has no active rides right now.
 * Reuses the same driver/customer identities as mock-drivers.ts / mock-customers.ts
 * so the data feels consistent across the admin panel.
 */

import type {
  Ride as ApiRide,
  RideDetail as ApiRideDetail,
  LiveRidesStats,
  LiveMapDriver,
} from "./api";

const ago = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

export function isMockLiveRideId(id: string): boolean {
  return MOCK_LIVE_RIDES.some((r) => r.id === id);
}

/* mock-live-ride-001 — Searching, no driver matched yet */
const RIDE_001: ApiRide = {
  id: "mock-live-ride-001",
  status: "SEARCHING",
  transport_type: "MOTO_BIKE",
  customer: { id: "mock-customer-004", name: "Claudine Mukamana", phone: "+250788004004" },
  driver: { id: null, name: null, phone: null, plate: null },
  pickup_address: "Kimironko Market",
  pickup_lat: -1.9506,
  pickup_lng: 30.1044,
  destination_address: "Kigali Convention Centre",
  dest_lat: -1.9457,
  dest_lng: 30.0919,
  agreed_fare: null,
  initial_fare: 2500,
  distance_km: null,
  created_at: ago(3),
  completed_at: null,
};

/* mock-live-ride-002 — Negotiating fare with a matched driver */
const RIDE_002: ApiRide = {
  id: "mock-live-ride-002",
  status: "NEGOTIATING",
  transport_type: "CAB_TAXI",
  customer: { id: "mock-customer-001", name: "Alice Uwase", phone: "+250788001001" },
  driver: { id: "mock-driver-002", name: "Amina Uwimana", phone: "+250722987654", plate: "RAC 118 G" },
  pickup_address: "Nyamirambo",
  pickup_lat: -1.976,
  pickup_lng: 30.041,
  destination_address: "Downtown Kigali",
  dest_lat: -1.9441,
  dest_lng: 30.0619,
  agreed_fare: null,
  initial_fare: 5000,
  distance_km: 6.2,
  created_at: ago(8),
  completed_at: null,
};

/* mock-live-ride-003 — Driver en route to pickup */
const RIDE_003: ApiRide = {
  id: "mock-live-ride-003",
  status: "DRIVER_EN_ROUTE",
  transport_type: "LIGHT_HILUX",
  customer: { id: "mock-customer-002", name: "Patrick Niyonzima", phone: "+250722002002" },
  driver: { id: "mock-driver-003", name: "Emmanuel Nkurunziza", phone: "+250788112233", plate: "RAC 201 H" },
  pickup_address: "Kigali Airport",
  pickup_lat: -1.9686,
  pickup_lng: 30.1395,
  destination_address: "Marriott Hotel",
  dest_lat: -1.9491,
  dest_lng: 30.0586,
  agreed_fare: 9000,
  initial_fare: 9000,
  distance_km: 12.4,
  created_at: ago(5),
  completed_at: null,
};

/* mock-live-ride-004 — Trip in progress */
const RIDE_004: ApiRide = {
  id: "mock-live-ride-004",
  status: "ON_TRIP",
  transport_type: "MOTO_BIKE",
  customer: { id: "mock-customer-003", name: "Eric Habimana", phone: "+250738003003" },
  driver: { id: "mock-driver-001", name: "Jean Pierre Hakizimana", phone: "+250781234567", plate: "RA 042 B" },
  pickup_address: "Remera",
  pickup_lat: -1.9558,
  pickup_lng: 30.1044,
  destination_address: "Gisozi",
  dest_lat: -1.9337,
  dest_lng: 30.0654,
  agreed_fare: 2000,
  initial_fare: 2000,
  distance_km: 4.1,
  created_at: ago(14),
  completed_at: null,
};

/**
 * Extra active rides (driver matched and moving — "Driver arriving" or "On trip")
 * so the Active rides tab has real volume to demo with, seeded programmatically
 * rather than hand-writing 18 near-duplicate literals.
 */
const KIGALI_PLACES: { name: string; lat: number; lng: number }[] = [
  { name: "Kimironko Market", lat: -1.9506, lng: 30.1044 },
  { name: "Kabuga", lat: -1.9631, lng: 30.1922 },
  { name: "Kigali Convention Centre", lat: -1.9457, lng: 30.0919 },
  { name: "Nyamirambo", lat: -1.976, lng: 30.041 },
  { name: "Downtown Kigali", lat: -1.9441, lng: 30.0619 },
  { name: "Kigali Airport", lat: -1.9686, lng: 30.1395 },
  { name: "Marriott Hotel", lat: -1.9491, lng: 30.0586 },
  { name: "Remera", lat: -1.9558, lng: 30.1044 },
  { name: "Gisozi", lat: -1.9337, lng: 30.0654 },
  { name: "Kacyiru", lat: -1.9394, lng: 30.0906 },
  { name: "Gikondo", lat: -1.9781, lng: 30.0736 },
  { name: "Nyabugogo", lat: -1.9436, lng: 30.0561 },
  { name: "Kicukiro", lat: -1.9878, lng: 30.1005 },
  { name: "Kanombe", lat: -1.9647, lng: 30.1364 },
  { name: "Batsinda", lat: -1.9089, lng: 30.0508 },
  { name: "Rwandex", lat: -1.9578, lng: 30.0692 },
  { name: "Nyanza (Kicukiro)", lat: -1.9962, lng: 30.1147 },
  { name: "Kagugu", lat: -1.9098, lng: 30.0742 },
];

const ACTIVE_RIDE_PEOPLE: { customer: string; customerPhone: string; driver: string; driverPhone: string; plate: string }[] = [
  { customer: "Eric Nsengimana", customerPhone: "+250788100201", driver: "Vincent Habyarimana", driverPhone: "+250722100201", plate: "RAD 210 K" },
  { customer: "Diane Mutesi", customerPhone: "+250788100202", driver: "Christine Uwineza", driverPhone: "+250722100202", plate: "RAB 045 L" },
  { customer: "Fabrice Ntawukuriryayo", customerPhone: "+250788100203", driver: "Olivier Rwigamba", driverPhone: "+250722100203", plate: "RAC 332 M" },
  { customer: "Solange Ingabire", customerPhone: "+250788100204", driver: "Yvonne Umutoni", driverPhone: "+250722100204", plate: "RAE 118 N" },
  { customer: "Aime Bizimana", customerPhone: "+250788100205", driver: "Divine Mukamurenzi", driverPhone: "+250722100205", plate: "RAF 067 P" },
  { customer: "Patrick Nzeyimana", customerPhone: "+250788100206", driver: "Grace Iradukunda", driverPhone: "+250722100206", plate: "RAG 289 Q" },
  { customer: "Josiane Nyiraneza", customerPhone: "+250788100207", driver: "Alexis Twagirayezu", driverPhone: "+250722100207", plate: "RAH 154 R" },
  { customer: "Emmanuel Sibomana", customerPhone: "+250788100208", driver: "Chantal Uwamahoro", driverPhone: "+250722100208", plate: "RAI 076 S" },
  { customer: "Beatrice Mukashema", customerPhone: "+250788100209", driver: "Innocent Hakizimana", driverPhone: "+250722100209", plate: "RAJ 203 T" },
  { customer: "Theogene Nkurunziza", customerPhone: "+250788100210", driver: "Providence Ishimwe", driverPhone: "+250722100210", plate: "RAK 312 U" },
  { customer: "Sandrine Uwase", customerPhone: "+250788100211", driver: "Bosco Ndayisenga", driverPhone: "+250722100211", plate: "RAL 095 V" },
  { customer: "Claude Mugisha", customerPhone: "+250788100212", driver: "Esperance Nyirahabimana", driverPhone: "+250722100212", plate: "RAM 187 W" },
  { customer: "Immaculee Uwamariya", customerPhone: "+250788100213", driver: "Gervais Sebahire", driverPhone: "+250722100213", plate: "RAN 244 X" },
  { customer: "Damascene Bizimungu", customerPhone: "+250788100214", driver: "Beata Nyirasafari", driverPhone: "+250722100214", plate: "RAO 059 Y" },
  { customer: "Winnie Mukandayisenga", customerPhone: "+250788100215", driver: "Faustin Uwizeyimana", driverPhone: "+250722100215", plate: "RAP 321 Z" },
  { customer: "Ange Kwizera", customerPhone: "+250788100216", driver: "Jean Damascene Habimana", driverPhone: "+250722100216", plate: "RAQ 178 A" },
  { customer: "Nadia Uwera", customerPhone: "+250788100217", driver: "Pascal Nsanzimana", driverPhone: "+250722100217", plate: "RAR 088 B" },
  { customer: "Prince Mugabo", customerPhone: "+250788100218", driver: "Alice Nirere", driverPhone: "+250722100218", plate: "RAS 264 C" },
];

const ACTIVE_RIDE_TRANSPORT_TYPES = ["MOTO_BIKE", "CAB_TAXI", "LIGHT_HILUX", "HEAVY_FUSO"];

function midpoint(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

const EXTRA_ACTIVE_RIDES: ApiRide[] = ACTIVE_RIDE_PEOPLE.map((people, i) => {
  const pickup = KIGALI_PLACES[i];
  const dest = KIGALI_PLACES[(i + 9) % KIGALI_PLACES.length];
  const status = i % 2 === 0 ? "DRIVER_EN_ROUTE" : "ON_TRIP";
  const transportType = ACTIVE_RIDE_TRANSPORT_TYPES[i % ACTIVE_RIDE_TRANSPORT_TYPES.length];
  const fare = 1500 + i * 350;
  const id = `mock-live-ride-${String(i + 5).padStart(3, "0")}`;
  return {
    id,
    status,
    transport_type: transportType,
    customer: { id: `${id}-customer`, name: people.customer, phone: people.customerPhone },
    driver: { id: `${id}-driver`, name: people.driver, phone: people.driverPhone, plate: people.plate },
    pickup_address: pickup.name,
    pickup_lat: pickup.lat,
    pickup_lng: pickup.lng,
    destination_address: dest.name,
    dest_lat: dest.lat,
    dest_lng: dest.lng,
    agreed_fare: fare,
    initial_fare: fare,
    distance_km: 3 + (i % 10),
    created_at: ago(4 + i * 2),
    completed_at: null,
  };
});

export const MOCK_LIVE_RIDES: ApiRide[] = [RIDE_001, RIDE_002, RIDE_003, RIDE_004, ...EXTRA_ACTIVE_RIDES];

const BASE_RIDE_DETAILS: Record<string, ApiRideDetail> = {
  "mock-live-ride-001": {
    ...RIDE_001,
    negotiation_rounds: [],
    events: [{ type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(3) }],
  },
  "mock-live-ride-002": {
    ...RIDE_002,
    negotiation_rounds: [
      { round: 1, proposed_by: "CUSTOMER", amount: 4000, response: "COUNTERED", at: ago(7) },
      { round: 2, proposed_by: "DRIVER", amount: 5500, response: null, at: ago(6) },
    ],
    events: [
      { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(8) },
      { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: ago(7) },
      { type: "NEGOTIATION_STARTED", actor_role: "SYSTEM", at: ago(7) },
    ],
  },
  "mock-live-ride-003": {
    ...RIDE_003,
    negotiation_rounds: [],
    events: [
      { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(6) },
      { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: ago(5) },
      { type: "DRIVER_EN_ROUTE", actor_role: "SYSTEM", at: ago(5) },
    ],
  },
  "mock-live-ride-004": {
    ...RIDE_004,
    negotiation_rounds: [],
    events: [
      { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(15) },
      { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: ago(14) },
      { type: "TRIP_STARTED", actor_role: "SYSTEM", at: ago(12) },
    ],
  },
};

const EXTRA_RIDE_DETAILS: Record<string, ApiRideDetail> = Object.fromEntries(
  EXTRA_ACTIVE_RIDES.map((r) => [
    r.id,
    {
      ...r,
      negotiation_rounds: [],
      events:
        r.status === "ON_TRIP"
          ? [
              { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: r.created_at },
              { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: r.created_at },
              { type: "TRIP_STARTED", actor_role: "SYSTEM", at: r.created_at },
            ]
          : [
              { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: r.created_at },
              { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: r.created_at },
              { type: "DRIVER_EN_ROUTE", actor_role: "SYSTEM", at: r.created_at },
            ],
    },
  ]),
);

export const MOCK_LIVE_RIDE_DETAILS: Record<string, ApiRideDetail> = {
  ...BASE_RIDE_DETAILS,
  ...EXTRA_RIDE_DETAILS,
};

export const MOCK_LIVE_RIDES_STATS: LiveRidesStats = {
  total: MOCK_LIVE_RIDES.length,
  searching: MOCK_LIVE_RIDES.filter((r) => r.status === "SEARCHING").length,
  negotiating: MOCK_LIVE_RIDES.filter((r) => r.status === "NEGOTIATING").length,
  driver_en_route: MOCK_LIVE_RIDES.filter(
    (r) => r.status === "DRIVER_EN_ROUTE" || r.status === "DRIVER_ARRIVED",
  ).length,
  on_trip: MOCK_LIVE_RIDES.filter((r) => r.status === "ON_TRIP").length,
};

/**
 * Real-ish Kigali coordinates for driver positions on the live map.
 * The first three belong to the mock rides above; the rest are online drivers
 * with no active ride, so the map can show idle/available drivers too.
 */
const EXTRA_ACTIVE_DRIVER_POSITIONS: LiveMapDriver[] = EXTRA_ACTIVE_RIDES.map((r) => {
  const pickup = { lat: r.pickup_lat!, lng: r.pickup_lng! };
  const dest = { lat: r.dest_lat!, lng: r.dest_lng! };
  // "Driver arriving" → still approaching pickup; "On trip" → somewhere between pickup and drop-off.
  const pos = r.status === "ON_TRIP" ? midpoint(pickup, dest) : { lat: pickup.lat + 0.004, lng: pickup.lng + 0.004 };
  return { id: r.driver.id!, lat: pos.lat, lng: pos.lng, isOnline: true, onTrip: r.status === "ON_TRIP" };
});

export const MOCK_LIVE_MAP_DRIVERS: LiveMapDriver[] = [
  { id: "mock-driver-002", lat: -1.976, lng: 30.041, isOnline: true, onTrip: false },
  { id: "mock-driver-003", lat: -1.9686, lng: 30.1395, isOnline: true, onTrip: false },
  { id: "mock-driver-001", lat: -1.9558, lng: 30.1044, isOnline: true, onTrip: true },
  // Idle — online and available, not tied to any of the rides above.
  { id: "mock-driver-004", lat: -1.9441, lng: 30.0619, isOnline: true, onTrip: false },
  { id: "mock-idle-driver-001", lat: -1.9706, lng: 30.0888, isOnline: true, onTrip: false },
  ...EXTRA_ACTIVE_DRIVER_POSITIONS,
];

export type MockOnlineDriver = {
  id: string;
  name: string;
  phone: string;
  transportType: string;
  plate: string;
  lat: number;
  lng: number;
  onTrip: boolean;
};

/** Online drivers — identity + live position — for the "Online drivers" tab's demo data. */
export const MOCK_ONLINE_DRIVERS: MockOnlineDriver[] = [
  { id: "mock-driver-001", name: "Jean Pierre Hakizimana", phone: "+250781234567", transportType: "MOTO_BIKE", plate: "RA 042 B", lat: -1.9558, lng: 30.1044, onTrip: true },
  { id: "mock-driver-002", name: "Amina Uwimana", phone: "+250722987654", transportType: "CAB_TAXI", plate: "RAC 118 G", lat: -1.976, lng: 30.041, onTrip: false },
  { id: "mock-driver-003", name: "Emmanuel Nkurunziza", phone: "+250788112233", transportType: "LIGHT_HILUX", plate: "RAC 201 H", lat: -1.9686, lng: 30.1395, onTrip: false },
  { id: "mock-driver-004", name: "Celestin Bizimungu", phone: "+250723445566", transportType: "HEAVY_FUSO", plate: "RAC 388 F", lat: -1.9441, lng: 30.0619, onTrip: false },
  { id: "mock-idle-driver-001", name: "David Mugisha", phone: "+250781122334", transportType: "MOTO_BIKE", plate: "RA 077 K", lat: -1.9706, lng: 30.0888, onTrip: false },
];
