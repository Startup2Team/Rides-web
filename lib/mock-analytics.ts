import type {
  ActivityCell,
  DailyRidePoint,
  DriverPerf,
  FunnelData,
  SatisfactionData,
  VehicleMixItem,
} from "./api";

function isoDay(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

/** Deterministic pseudo-random from seed — stable mock charts. */
function seeded(n: number, min: number, max: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  const f = x - Math.floor(x);
  return Math.round(min + f * (max - min));
}

/** Share of platform trips by vehicle — used to slice mock analytics. */
const VEHICLE_SHARE: Record<string, number> = {
  MOTO_BIKE: 1840 / 3435,
  CAB_TAXI: 1120 / 3435,
  LIGHT_HILUX: 380 / 3435,
  HEAVY_FUSO: 95 / 3435,
};

export const ANALYTICS_VEHICLES = [
  "MOTO_BIKE",
  "CAB_TAXI",
  "LIGHT_HILUX",
  "HEAVY_FUSO",
] as const;

export type AnalyticsVehicle = (typeof ANALYTICS_VEHICLES)[number];

export function isAnalyticsVehicle(v: string | null): v is AnalyticsVehicle {
  return v !== null && (ANALYTICS_VEHICLES as readonly string[]).includes(v);
}

function vehicleScale(vehicle?: string): number {
  if (!vehicle || !isAnalyticsVehicle(vehicle)) return 1;
  return VEHICLE_SHARE[vehicle] ?? 1;
}

function scaleDaily(points: DailyRidePoint[], scale: number): DailyRidePoint[] {
  if (scale >= 0.999) return points;
  return points.map((d) => ({
    ...d,
    total: Math.max(0, Math.round(d.total * scale)),
    completed: Math.max(0, Math.round(d.completed * scale)),
    cancelled: Math.max(0, Math.round(d.cancelled * scale)),
  }));
}

function scaleFunnel(f: FunnelData, scale: number): FunnelData {
  if (scale >= 0.999) return f;
  return {
    booked: Math.max(0, Math.round(f.booked * scale)),
    matched: Math.max(0, Math.round(f.matched * scale)),
    confirmed: Math.max(0, Math.round(f.confirmed * scale)),
    completed: Math.max(0, Math.round(f.completed * scale)),
    cancelled: Math.max(0, Math.round(f.cancelled * scale)),
  };
}

export function vehicleSharePct(vehicle: AnalyticsVehicle): number {
  return Math.round((VEHICLE_SHARE[vehicle] ?? 0) * 100);
}

export function mockRidesDaily(days: number, vehicle?: string, periodOffsetDays = 0): DailyRidePoint[] {
  return scaleDaily(mockRidesDailyPlatform(days, periodOffsetDays), vehicleScale(vehicle));
}

function mockRidesDailyPlatform(days: number, periodOffsetDays = 0): DailyRidePoint[] {
  const span = Math.min(Math.max(days, 1), 365);
  return Array.from({ length: span }, (_, i) => {
    const offset = span - 1 - i + periodOffsetDays;
    const weekday = new Date(isoDay(offset)).getDay();
    const weekend = weekday === 0 || weekday === 6;
    const base = weekend ? 420 : 680;
    const trend = periodOffsetDays > 0 ? -35 : 0;
    const completed = seeded(i + span + periodOffsetDays * 3, base - 80 + trend, base + 120 + trend);
    const cancelled = seeded(i + span * 2 + periodOffsetDays, 28, 95);
    return {
      day: isoDay(offset),
      total: completed + cancelled,
      completed,
      cancelled,
    };
  });
}

export function mockFunnel(days: number, vehicle?: string): FunnelData {
  return scaleFunnel(mockFunnelPlatform(days), vehicleScale(vehicle));
}

function mockFunnelPlatform(days: number, periodOffsetDays = 0): FunnelData {
  const daily = mockRidesDailyPlatform(days, periodOffsetDays);
  const booked = daily.reduce((s, d) => s + d.total, 0);
  const completed = daily.reduce((s, d) => s + d.completed, 0);
  const cancelled = daily.reduce((s, d) => s + d.cancelled, 0);
  const matched = Math.round(booked * 0.91);
  const confirmed = Math.round(booked * 0.84);
  return { booked, matched, confirmed, completed, cancelled };
}

export function mockVehicleMix(days: number, vehicle?: string): VehicleMixItem[] {
  const scale = Math.max(days, 1) / 30;
  const all: VehicleMixItem[] = [
    { transport_type: "MOTO_BIKE", rides: Math.round(1840 * scale), revenue: Math.round(920_000 * scale) },
    { transport_type: "CAB_TAXI", rides: Math.round(1120 * scale), revenue: Math.round(1_680_000 * scale) },
    { transport_type: "LIGHT_HILUX", rides: Math.round(380 * scale), revenue: Math.round(950_000 * scale) },
    { transport_type: "HEAVY_FUSO", rides: Math.round(95 * scale), revenue: Math.round(760_000 * scale) },
  ];
  if (vehicle && isAnalyticsVehicle(vehicle)) {
    return all.filter((v) => v.transport_type === vehicle);
  }
  return all;
}

export function mockActivityHeatmap(vehicle?: string): ActivityCell[] {
  const scale = vehicleScale(vehicle);
  if (scale >= 0.999) return MOCK_ACTIVITY_HEATMAP;
  return MOCK_ACTIVITY_HEATMAP.map((c) => ({
    ...c,
    count: Math.max(0, Math.round(c.count * scale)),
  }));
}

export function mockDriverPerformance(vehicle?: string): DriverPerf[] {
  const list = vehicle && isAnalyticsVehicle(vehicle)
    ? MOCK_DRIVER_PERFORMANCE.filter((d) => d.transport_type === vehicle)
    : MOCK_DRIVER_PERFORMANCE;
  return list.slice(0, 6);
}

export const MOCK_DRIVER_PERFORMANCE: DriverPerf[] = [
  {
    driver_id: "mock-driver-001",
    phone: "+250781000001",
    full_name: "Jean Pierre Hakizimana",
    transport_type: "MOTO_BIKE",
    total_rides: 248,
    acceptance_rate: 94,
    priority_tier: 1,
    earnings_30d: 485_000,
  },
  {
    driver_id: "mock-driver-011",
    phone: "+250781000011",
    full_name: "Amina Uwimana",
    transport_type: "CAB_TAXI",
    total_rides: 196,
    acceptance_rate: 91,
    priority_tier: 1,
    earnings_30d: 720_000,
  },
  {
    driver_id: "mock-driver-003",
    phone: "+250781000003",
    full_name: "Damascene Nsengimana",
    transport_type: "MOTO_BIKE",
    total_rides: 182,
    acceptance_rate: 89,
    priority_tier: 2,
    earnings_30d: 398_000,
  },
  {
    driver_id: "mock-driver-021",
    phone: "+250781000021",
    full_name: "Emmanuel Nkurunziza",
    transport_type: "LIGHT_HILUX",
    total_rides: 74,
    acceptance_rate: 96,
    priority_tier: 1,
    earnings_30d: 890_000,
  },
  {
    driver_id: "mock-driver-013",
    phone: "+250781000013",
    full_name: "Grace Ingabire",
    transport_type: "CAB_TAXI",
    total_rides: 168,
    acceptance_rate: 88,
    priority_tier: 2,
    earnings_30d: 612_000,
  },
  {
    driver_id: "mock-driver-005",
    phone: "+250781000005",
    full_name: "Theogene Ndayisenga",
    transport_type: "MOTO_BIKE",
    total_rides: 154,
    acceptance_rate: 92,
    priority_tier: 2,
    earnings_30d: 341_000,
  },
  {
    driver_id: "mock-driver-031",
    phone: "+250781000031",
    full_name: "Celestin Bizimungu",
    transport_type: "HEAVY_FUSO",
    total_rides: 52,
    acceptance_rate: 97,
    priority_tier: 1,
    earnings_30d: 1_120_000,
  },
];

export const MOCK_SATISFACTION: SatisfactionData = {
  completion_rate_pct: 87.4,
  total_rides_30d: 12_840,
  completed_rides_30d: 11_222,
};

/** Trip activity by weekday (0=Sun) and hour — Kigali rush patterns. */
export const MOCK_ACTIVITY_HEATMAP: ActivityCell[] = (() => {
  const cells: ActivityCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWeekday = day >= 1 && day <= 5;
      let count = 2;
      if (hour >= 7 && hour <= 9) count += isWeekday ? 28 : 12;
      if (hour >= 17 && hour <= 20) count += isWeekday ? 35 : 22;
      if (hour >= 12 && hour <= 14) count += 14;
      if (day === 6 && hour >= 10 && hour <= 16) count += 18;
      if (hour >= 0 && hour <= 5) count = Math.max(1, count - 4);
      cells.push({ day, hour, count: seeded(day * 100 + hour, count - 5, count + 8) });
    }
  }
  return cells;
})();
