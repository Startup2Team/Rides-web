import type {
  Ride as ApiRide,
  RideDetail as ApiRideDetail,
  LiveRidesStats,
  LiveMapDriver,
} from "./api";

export function isMockLiveRideId(id: string): boolean {
  return false;
}

export const MOCK_LIVE_RIDES: ApiRide[] = [];

export const MOCK_LIVE_RIDE_DETAILS: Record<string, ApiRideDetail> = {};

export const MOCK_LIVE_RIDES_STATS: LiveRidesStats = {
  total: 0,
  searching: 0,
  negotiating: 0,
  driver_en_route: 0,
  on_trip: 0,
};

export const MOCK_LIVE_MAP_DRIVERS: LiveMapDriver[] = [];

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

export const MOCK_ONLINE_DRIVERS: MockOnlineDriver[] = [];

export function nearestKigaliPlace(lat: number, lng: number): string {
  return "Kigali";
}
