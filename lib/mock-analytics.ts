import type {
  ActivityCell,
  DailyRidePoint,
  DriverPerf,
  FunnelData,
  SatisfactionData,
  VehicleMixItem,
} from "./api";

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

export function vehicleSharePct(vehicle: AnalyticsVehicle): number {
  return 0;
}

export function mockRidesDaily(days: number, vehicle?: string, periodOffsetDays = 0): DailyRidePoint[] {
  return [];
}

export function mockFunnel(days: number, vehicle?: string): FunnelData {
  return { booked: 0, matched: 0, confirmed: 0, completed: 0, cancelled: 0 };
}

export function mockVehicleMix(days: number, vehicle?: string): VehicleMixItem[] {
  return [];
}

export function mockActivityHeatmap(vehicle?: string): ActivityCell[] {
  return [];
}

export function mockDriverPerformance(vehicle?: string): DriverPerf[] {
  return [];
}

export const MOCK_DRIVER_PERFORMANCE: DriverPerf[] = [];

export const MOCK_SATISFACTION: SatisfactionData = {
  completion_rate_pct: 0,
  total_rides_30d: 0,
  completed_rides_30d: 0,
};

export const MOCK_ACTIVITY_HEATMAP: ActivityCell[] = [];
