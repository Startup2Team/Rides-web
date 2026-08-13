import type { Ride as ApiRide, RideDetail as ApiRideDetail, LiveRidesStats, RidesResponse } from "./api";

const ago = (minutes: number) => {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
};

// ── Mock Active Rides ────────────────────────────────────────────────────────

const RIDE_001: ApiRide = {
  id: "live-ride-001",
  status: "ON_TRIP",
  transport_type: "CAB_TAXI",
  customer: {
    id: "mock-customer-001",
    phone: "+250788001001",
    name: "Alice Uwase",
  },
  driver: {
    id: "mock-driver-002",
    phone: "+250722987654",
    name: "Amina Uwimana",
    plate: "RAC 118 G",
  },
  pickup_address: "Kimironko Market",
  destination_address: "Kigali Heights",
  agreed_fare: 4500,
  initial_fare: 5000,
  distance_km: 7.2,
  created_at: ago(15),
  completed_at: null,
};

const RIDE_002: ApiRide = {
  id: "live-ride-002",
  status: "DRIVER_EN_ROUTE",
  transport_type: "MOTO_BIKE",
  customer: {
    id: "mock-customer-002",
    phone: "+250722002002",
    name: "Patrick Niyonzima",
  },
  driver: {
    id: "mock-driver-001",
    phone: "+250781234567",
    name: "Jean Pierre Hakizimana",
    plate: "RA 042 B",
  },
  pickup_address: "Kigali Heights",
  destination_address: "Norrsken House",
  agreed_fare: 1500,
  initial_fare: 1500,
  distance_km: 3.1,
  created_at: ago(5),
  completed_at: null,
};

const RIDE_003: ApiRide = {
  id: "live-ride-003",
  status: "NEGOTIATING",
  transport_type: "LIGHT_HILUX",
  customer: {
    id: "mock-customer-004",
    phone: "+250788004004",
    name: "Claudine Mukamana",
  },
  driver: {
    id: "mock-driver-003",
    phone: "+250788112233",
    name: "Emmanuel Nkurunziza",
    plate: "RAC 201 H",
  },
  pickup_address: "Kigali Airport",
  destination_address: "Marriott Hotel",
  agreed_fare: null,
  initial_fare: 7000,
  distance_km: 11.5,
  created_at: ago(3),
  completed_at: null,
};

const RIDE_004: ApiRide = {
  id: "live-ride-004",
  status: "SEARCHING",
  transport_type: "HEAVY_FUSO",
  customer: {
    id: "mock-customer-003", // Clara Umutoni
    phone: "+250788998899",
    name: "Clara Umutoni",
  },
  driver: {
    id: null,
    phone: null,
    name: null,
    plate: null,
  },
  pickup_address: "Nyabugogo Bus Park",
  destination_address: "Remera Giporoso",
  agreed_fare: null,
  initial_fare: 25000,
  distance_km: 9.8,
  created_at: ago(2),
  completed_at: null,
};

export const MOCK_LIVE_RIDES: ApiRide[] = [RIDE_001, RIDE_002, RIDE_003, RIDE_004];

// ── Mock Ride Details ────────────────────────────────────────────────────────

const DETAIL_001: ApiRideDetail = {
  ...RIDE_001,
  negotiation_rounds: [
    { round: 1, proposed_by: "CUSTOMER", amount: 4000, response: "REJECTED", at: ago(15) },
    { round: 2, proposed_by: "DRIVER", amount: 5000, response: "REJECTED", at: ago(14) },
    { round: 3, proposed_by: "CUSTOMER", amount: 4500, response: "ACCEPTED", at: ago(14) },
  ],
  events: [
    { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(15) },
    { type: "NEGOTIATION_ACCEPTED", actor_role: "CUSTOMER", at: ago(14) },
    { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: ago(13) },
    { type: "DRIVER_ARRIVED", actor_role: "DRIVER", at: ago(10) },
    { type: "TRIP_STARTED", actor_role: "DRIVER", at: ago(8) },
  ],
};

const DETAIL_002: ApiRideDetail = {
  ...RIDE_002,
  negotiation_rounds: [],
  events: [
    { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(5) },
    { type: "DRIVER_MATCHED", actor_role: "SYSTEM", at: ago(4) },
    { type: "DRIVER_EN_ROUTE", actor_role: "DRIVER", at: ago(3) },
  ],
};

const DETAIL_003: ApiRideDetail = {
  ...RIDE_003,
  negotiation_rounds: [
    { round: 1, proposed_by: "CUSTOMER", amount: 7000, response: "REJECTED", at: ago(2) },
    { round: 2, proposed_by: "DRIVER", amount: 8500, response: "REJECTED", at: ago(1) },
    { round: 3, proposed_by: "CUSTOMER", amount: 8000, response: "PENDING", at: ago(0) },
  ],
  events: [
    { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(3) },
    { type: "NEGOTIATION_COUNTERED", actor_role: "CUSTOMER", at: ago(2) },
    { type: "NEGOTIATION_COUNTERED", actor_role: "DRIVER", at: ago(1) },
    { type: "NEGOTIATION_COUNTERED", actor_role: "CUSTOMER", at: ago(0) },
  ],
};

const DETAIL_004: ApiRideDetail = {
  ...RIDE_004,
  negotiation_rounds: [],
  events: [
    { type: "RIDE_REQUESTED", actor_role: "CUSTOMER", at: ago(2) },
    { type: "SEARCHING_DRIVERS", actor_role: "SYSTEM", at: ago(1) },
  ],
};

export const MOCK_LIVE_RIDE_DETAILS: Record<string, ApiRideDetail> = {
  "live-ride-001": DETAIL_001,
  "live-ride-002": DETAIL_002,
  "live-ride-003": DETAIL_003,
  "live-ride-004": DETAIL_004,
};

// ── Mock Live Ride Stats ─────────────────────────────────────────────────────

export const MOCK_LIVE_RIDES_STATS: LiveRidesStats = {
  total: 34,
  searching: 5,
  negotiating: 8,
  driver_en_route: 12,
  on_trip: 9,
};
