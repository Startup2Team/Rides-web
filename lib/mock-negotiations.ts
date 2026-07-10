import type {
  Negotiation,
  NegotiationsStats,
  RideDetail,
} from "./api";

type MockNegotiationSeed = Negotiation & {
  detail: RideDetail;
};

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

const seeds: MockNegotiationSeed[] = [
  {
    id: "NEG-2407-001",
    ride_id: "NEG-2407-001",
    status: "COMPLETED",
    transport_type: "MOTO_BIKE",
    pickup_address: "Kacyiru Convention Centre",
    destination_address: "Kimironko Market",
    customer: { phone: "+250788001001", name: "Alice Uwase" },
    driver: {
      phone: "+250781234567",
      name: "Jean Pierre Hakizimana",
      vehicle_type: "MOTO_BIKE",
      plate: "RA 042 B",
    },
    initial_fare: 1800,
    agreed_fare: 2200,
    uplift: 22,
    rounds: 3,
    created_at: minutesAgo(42),
    detail: {
      id: "NEG-2407-001",
      status: "COMPLETED",
      transport_type: "MOTO_BIKE",
      customer: { id: "mock-customer-001", phone: "+250788001001", name: "Alice Uwase" },
      driver: {
        id: "mock-driver-001",
        phone: "+250781234567",
        name: "Jean Pierre Hakizimana",
        plate: "RA 042 B",
      },
      pickup_address: "Kacyiru Convention Centre",
      destination_address: "Kimironko Market",
      agreed_fare: 2200,
      initial_fare: 1800,
      distance_km: 7.8,
      created_at: minutesAgo(42),
      completed_at: minutesAgo(35),
      negotiation_rounds: [
        { round: 1, proposed_by: "CUSTOMER", amount: 1800, response: null, at: minutesAgo(42) },
        { round: 2, proposed_by: "DRIVER", amount: 2500, response: null, at: minutesAgo(40) },
        { round: 3, proposed_by: "DRIVER", amount: 2200, response: "ACCEPTED", at: minutesAgo(35) },
      ],
      events: [],
    },
  },
  {
    id: "NEG-2407-002",
    ride_id: "NEG-2407-002",
    status: "NEGOTIATING",
    transport_type: "CAB_TAXI",
    pickup_address: "Kigali Heights",
    destination_address: "Kigali International Airport",
    customer: { phone: "+250722002002", name: "Patrick Niyonzima" },
    driver: {
      phone: "+250722987654",
      name: "Amina Uwimana",
      vehicle_type: "CAB_TAXI",
      plate: "RAC 118 G",
    },
    initial_fare: 9500,
    agreed_fare: null,
    uplift: 0,
    rounds: 3,
    created_at: minutesAgo(18),
    detail: {
      id: "NEG-2407-002",
      status: "NEGOTIATING",
      transport_type: "CAB_TAXI",
      customer: { id: "mock-customer-002", phone: "+250722002002", name: "Patrick Niyonzima" },
      driver: {
        id: "mock-driver-002",
        phone: "+250722987654",
        name: "Amina Uwimana",
        plate: "RAC 118 G",
      },
      pickup_address: "Kigali Heights",
      destination_address: "Kigali International Airport",
      agreed_fare: null,
      initial_fare: 9500,
      distance_km: 9.4,
      created_at: minutesAgo(18),
      completed_at: null,
      negotiation_rounds: [
        { round: 1, proposed_by: "CUSTOMER", amount: 9500, response: null, at: minutesAgo(18) },
        { round: 2, proposed_by: "DRIVER", amount: 12000, response: null, at: minutesAgo(16) },
        { round: 3, proposed_by: "CUSTOMER", amount: 10800, response: null, at: minutesAgo(14) },
      ],
      events: [],
    },
  },
  {
    id: "NEG-2407-003",
    ride_id: "NEG-2407-003",
    status: "CANCELLED",
    transport_type: "LIGHT_HILUX",
    pickup_address: "Nyabugogo Bus Park",
    destination_address: "Kabeza Industrial Zone",
    customer: { phone: "+250738003003", name: "Eric Habimana" },
    driver: {
      phone: "+250788112233",
      name: "Emmanuel Nkurunziza",
      vehicle_type: "LIGHT_HILUX",
      plate: "RAC 201 H",
    },
    initial_fare: 18000,
    agreed_fare: null,
    uplift: 0,
    rounds: 5,
    created_at: minutesAgo(95),
    detail: {
      id: "NEG-2407-003",
      status: "CANCELLED",
      transport_type: "LIGHT_HILUX",
      customer: { id: "mock-customer-003", phone: "+250738003003", name: "Eric Habimana" },
      driver: {
        id: "mock-driver-003",
        phone: "+250788112233",
        name: "Emmanuel Nkurunziza",
        plate: "RAC 201 H",
      },
      pickup_address: "Nyabugogo Bus Park",
      destination_address: "Kabeza Industrial Zone",
      agreed_fare: null,
      initial_fare: 18000,
      distance_km: 13.1,
      created_at: minutesAgo(95),
      completed_at: minutesAgo(87),
      negotiation_rounds: [
        { round: 1, proposed_by: "CUSTOMER", amount: 18000, response: null, at: minutesAgo(95) },
        { round: 2, proposed_by: "DRIVER", amount: 26000, response: null, at: minutesAgo(93) },
        { round: 3, proposed_by: "CUSTOMER", amount: 21000, response: null, at: minutesAgo(91) },
        { round: 4, proposed_by: "DRIVER", amount: 24500, response: null, at: minutesAgo(89) },
        { round: 5, proposed_by: "CUSTOMER", amount: 22000, response: "DECLINED", at: minutesAgo(87) },
      ],
      events: [],
    },
  },
  {
    id: "NEG-2407-004",
    ride_id: "NEG-2407-004",
    status: "DISPUTED",
    transport_type: "HEAVY_FUSO",
    pickup_address: "Gikondo Warehouse",
    destination_address: "Bugesera Construction Site",
    customer: { phone: "+250788004004", name: "Claudine Mukamana" },
    driver: {
      phone: "+250723445566",
      name: "Celestin Bizimungu",
      vehicle_type: "HEAVY_FUSO",
      plate: "RAC 388 F",
    },
    initial_fare: 48000,
    agreed_fare: 56000,
    uplift: 17,
    rounds: 4,
    created_at: minutesAgo(140),
    detail: {
      id: "NEG-2407-004",
      status: "DISPUTED",
      transport_type: "HEAVY_FUSO",
      customer: { id: "mock-customer-004", phone: "+250788004004", name: "Claudine Mukamana" },
      driver: {
        id: "mock-driver-004",
        phone: "+250723445566",
        name: "Celestin Bizimungu",
        plate: "RAC 388 F",
      },
      pickup_address: "Gikondo Warehouse",
      destination_address: "Bugesera Construction Site",
      agreed_fare: 56000,
      initial_fare: 48000,
      distance_km: 31.5,
      created_at: minutesAgo(140),
      completed_at: minutesAgo(129),
      negotiation_rounds: [
        { round: 1, proposed_by: "CUSTOMER", amount: 48000, response: null, at: minutesAgo(140) },
        { round: 2, proposed_by: "DRIVER", amount: 62000, response: null, at: minutesAgo(137) },
        { round: 3, proposed_by: "CUSTOMER", amount: 54000, response: null, at: minutesAgo(134) },
        { round: 4, proposed_by: "DRIVER", amount: 56000, response: "ACCEPTED", at: minutesAgo(129) },
      ],
      events: [],
    },
  },
  {
    id: "NEG-2407-005",
    ride_id: "NEG-2407-005",
    status: "COMPLETED",
    transport_type: "CAB_TAXI",
    pickup_address: "Remera Taxi Park",
    destination_address: "Kisimenti",
    customer: { phone: "+250782115509", name: "Divine Ishimwe" },
    driver: {
      phone: "+250781122334",
      name: "David Mugisha",
      vehicle_type: "CAB_TAXI",
      plate: "RAB 511 T",
    },
    initial_fare: 2500,
    agreed_fare: 2400,
    uplift: -4,
    rounds: 2,
    created_at: minutesAgo(210),
    detail: {
      id: "NEG-2407-005",
      status: "COMPLETED",
      transport_type: "CAB_TAXI",
      customer: { id: "mock-customer-005", phone: "+250782115509", name: "Divine Ishimwe" },
      driver: {
        id: "mock-driver-005",
        phone: "+250781122334",
        name: "David Mugisha",
        plate: "RAB 511 T",
      },
      pickup_address: "Remera Taxi Park",
      destination_address: "Kisimenti",
      agreed_fare: 2400,
      initial_fare: 2500,
      distance_km: 2.1,
      created_at: minutesAgo(210),
      completed_at: minutesAgo(207),
      negotiation_rounds: [
        { round: 1, proposed_by: "CUSTOMER", amount: 2500, response: null, at: minutesAgo(210) },
        { round: 2, proposed_by: "DRIVER", amount: 2400, response: "ACCEPTED", at: minutesAgo(207) },
      ],
      events: [],
    },
  },
];

type AgreedSeedConfig = {
  id: string;
  transport_type: Negotiation["transport_type"];
  pickup: string;
  destination: string;
  customer: { phone: string; name: string };
  driver: { phone: string; name: string; plate: string };
  initial_fare: number;
  agreed_fare: number;
  rounds: number;
  minutesAgo: number;
  durationMin: number;
};

function buildAgreedSeed(c: AgreedSeedConfig): MockNegotiationSeed {
  const uplift =
    c.initial_fare > 0
      ? Math.round(((c.agreed_fare - c.initial_fare) / c.initial_fare) * 100)
      : 0;
  const created = minutesAgo(c.minutesAgo);
  const completed = minutesAgo(c.minutesAgo - c.durationMin);
  const offers: RideDetail["negotiation_rounds"] = [];
  let amount = c.initial_fare;
  for (let r = 1; r <= c.rounds; r++) {
    const isLast = r === c.rounds;
    const fromCustomer = r % 2 === 1;
    if (isLast) amount = c.agreed_fare;
    else if (fromCustomer) amount = c.initial_fare;
    else amount = Math.round(c.agreed_fare * (1 + (c.rounds - r) * 0.08));
    offers.push({
      round: r,
      proposed_by: fromCustomer ? "CUSTOMER" : "DRIVER",
      amount,
      response: isLast ? "ACCEPTED" : null,
      at: minutesAgo(c.minutesAgo - (c.rounds - r) * 2),
    });
  }
  if (offers.length === 0) {
    offers.push({
      round: 1,
      proposed_by: "CUSTOMER",
      amount: c.initial_fare,
      response: null,
      at: created,
    });
  }

  return {
    id: c.id,
    ride_id: c.id,
    status: "COMPLETED",
    transport_type: c.transport_type,
    pickup_address: c.pickup,
    destination_address: c.destination,
    customer: c.customer,
    driver: { ...c.driver, vehicle_type: c.transport_type },
    initial_fare: c.initial_fare,
    agreed_fare: c.agreed_fare,
    uplift,
    rounds: c.rounds,
    created_at: created,
    detail: {
      id: c.id,
      status: "COMPLETED",
      transport_type: c.transport_type,
      customer: {
        id: `mock-customer-${c.id.slice(-3)}`,
        phone: c.customer.phone,
        name: c.customer.name,
      },
      driver: {
        id: `mock-driver-${c.id.slice(-3)}`,
        phone: c.driver.phone,
        name: c.driver.name,
        plate: c.driver.plate,
      },
      pickup_address: c.pickup,
      destination_address: c.destination,
      agreed_fare: c.agreed_fare,
      initial_fare: c.initial_fare,
      distance_km: 4 + c.rounds * 1.5,
      created_at: created,
      completed_at: completed,
      negotiation_rounds: offers,
      events: [],
    },
  };
}

const extraAgreed: AgreedSeedConfig[] = [
  {
    id: "NEG-2407-006",
    transport_type: "MOTO_BIKE",
    pickup: "Kigali City Tower",
    destination: "Nyamirambo",
    customer: { phone: "+250788006006", name: "Grace Umutoni" },
    driver: { phone: "+250781006006", name: "Fabrice Ndayisenga", plate: "RA 106 M" },
    initial_fare: 1200,
    agreed_fare: 1200,
    rounds: 1,
    minutesAgo: 28,
    durationMin: 4,
  },
  {
    id: "NEG-2407-007",
    transport_type: "CAB_TAXI",
    pickup: "KBC Roundabout",
    destination: "Gisozi",
    customer: { phone: "+250788007007", name: "Olivier Nshimiyimana" },
    driver: { phone: "+250781007007", name: "Chantal Uwera", plate: "RAC 707 C" },
    initial_fare: 3200,
    agreed_fare: 3500,
    rounds: 2,
    minutesAgo: 65,
    durationMin: 8,
  },
  {
    id: "NEG-2407-008",
    transport_type: "LIGHT_HILUX",
    pickup: "Sonatubes",
    destination: "Kanombe",
    customer: { phone: "+250788008008", name: "Innocent Mugabo" },
    driver: { phone: "+250781008008", name: "Sandrine Uwase", plate: "RAC 808 H" },
    initial_fare: 8500,
    agreed_fare: 9200,
    rounds: 3,
    minutesAgo: 110,
    durationMin: 12,
  },
  {
    id: "NEG-2407-009",
    transport_type: "HEAVY_FUSO",
    pickup: "Kigali Special Economic Zone",
    destination: "Rwamagana District",
    customer: { phone: "+250788009009", name: "Protais Habiyakare" },
    driver: { phone: "+250781009009", name: "Jean Claude Niyonsaba", plate: "RAC 909 F" },
    initial_fare: 42000,
    agreed_fare: 45000,
    rounds: 2,
    minutesAgo: 155,
    durationMin: 18,
  },
  {
    id: "NEG-2407-010",
    transport_type: "MOTO_BIKE",
    pickup: "CHUK Hotel",
    destination: "Kacyiru Sector Office",
    customer: { phone: "+250788010010", name: "Mariam Keza" },
    driver: { phone: "+250781010010", name: "Eric Niyonsenga", plate: "RA 010 M" },
    initial_fare: 900,
    agreed_fare: 1100,
    rounds: 2,
    minutesAgo: 190,
    durationMin: 6,
  },
  {
    id: "NEG-2407-011",
    transport_type: "CAB_TAXI",
    pickup: "Amahoro Stadium",
    destination: "Kimironko",
    customer: { phone: "+250788011011", name: "Bosco Iradukunda" },
    driver: { phone: "+250781011011", name: "Aline Mukamana", plate: "RAC 111 C" },
    initial_fare: 2800,
    agreed_fare: 3000,
    rounds: 3,
    minutesAgo: 240,
    durationMin: 10,
  },
  {
    id: "NEG-2407-012",
    transport_type: "LIGHT_HILUX",
    pickup: "Giporoso",
    destination: "Masaka",
    customer: { phone: "+250788012012", name: "Vestine Nyirahabimana" },
    driver: { phone: "+250781012012", name: "Théophile Nkurunziza", plate: "RAC 212 H" },
    initial_fare: 14000,
    agreed_fare: 13500,
    rounds: 1,
    minutesAgo: 320,
    durationMin: 5,
  },
  {
    id: "NEG-2407-013",
    transport_type: "MOTO_BIKE",
    pickup: "UTC Kigali",
    destination: "Remera",
    customer: { phone: "+250788013013", name: "Yves Habimana" },
    driver: { phone: "+250781013013", name: "Diane Uwimana", plate: "RA 313 M" },
    initial_fare: 1600,
    agreed_fare: 1900,
    rounds: 3,
    minutesAgo: 380,
    durationMin: 14,
  },
];

const allSeeds: MockNegotiationSeed[] = [
  ...seeds,
  ...extraAgreed.map(buildAgreedSeed),
];

export const MOCK_NEGOTIATIONS: Negotiation[] = allSeeds.map((seed) => ({
  id: seed.id,
  ride_id: seed.ride_id,
  status: seed.status,
  transport_type: seed.transport_type,
  pickup_address: seed.pickup_address,
  destination_address: seed.destination_address,
  customer: seed.customer,
  driver: seed.driver,
  initial_fare: seed.initial_fare,
  agreed_fare: seed.agreed_fare,
  uplift: seed.uplift,
  rounds: seed.rounds,
  created_at: seed.created_at,
}));

export const MOCK_NEGOTIATION_DETAILS: Record<string, RideDetail> = Object.fromEntries(
  allSeeds.map((seed) => [seed.id, seed.detail]),
);

export const MOCK_NEGOTIATIONS_STATS: NegotiationsStats = {
  total_today: MOCK_NEGOTIATIONS.length,
  agreed_today: MOCK_NEGOTIATIONS.filter((n) => n.status === "COMPLETED").length,
  failed_today: MOCK_NEGOTIATIONS.filter((n) => n.status === "CANCELLED").length,
  avg_rounds:
    MOCK_NEGOTIATIONS.reduce((total, n) => total + n.rounds, 0) /
    MOCK_NEGOTIATIONS.length,
};
