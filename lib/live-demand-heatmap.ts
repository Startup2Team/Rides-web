/**
 * Live demand heatmap — clusters waiting ride requests by pickup location.
 * Many riders at the same pickup → one hot zone with higher weight (for drivers).
 */

import type { Ride as ApiRide, HeatZone } from "./api";

export type LiveDemandCluster = {
  lat: number;
  lng: number;
  /** Riders waiting at this pickup cluster */
  riderCount: number;
  pickupLabel: string;
  rideIds: string[];
  avgFare: number;
};

export type LiveDemandHeatZone = HeatZone & {
  pickupLabel: string;
  waitingRiders: number;
};

const ON_TRIP = new Set(["ON_TRIP", "COMPLETED", "CANCELLED"]);

/** Ride is waiting for a driver (same rule as Online riders tab). */
export function isWaitingRide(status: string): boolean {
  return !ON_TRIP.has(status);
}

function normalizePickupKey(address: string): string {
  return address.trim().toLowerCase();
}

/** Group waiting rides by pickup address; average coords when multiple share a place. */
export function clusterWaitingRides(rides: ApiRide[]): LiveDemandCluster[] {
  const buckets = new Map<
    string,
    { lat: number; lng: number; count: number; rides: ApiRide[] }
  >();

  for (const ride of rides) {
    if (!isWaitingRide(ride.status)) continue;
    if (ride.pickup_lat == null || ride.pickup_lng == null) continue;

    const key = normalizePickupKey(ride.pickup_address || `${ride.pickup_lat},${ride.pickup_lng}`);
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.lat += ride.pickup_lat;
      existing.lng += ride.pickup_lng;
      existing.rides.push(ride);
    } else {
      buckets.set(key, {
        lat: ride.pickup_lat,
        lng: ride.pickup_lng,
        count: 1,
        rides: [ride],
      });
    }
  }

  return Array.from(buckets.values()).map(({ lat, lng, count, rides }) => {
    const fares = rides
      .map((r) => r.agreed_fare ?? r.initial_fare ?? 0)
      .filter((f) => f > 0);
    return {
      lat: lat / count,
      lng: lng / count,
      riderCount: count,
      pickupLabel: rides[0].pickup_address,
      rideIds: rides.map((r) => r.id),
      avgFare:
        fares.length > 0 ? fares.reduce((a, b) => a + b, 0) / fares.length : 0,
    };
  });
}

export function clustersToHeatZones(clusters: LiveDemandCluster[]): LiveDemandHeatZone[] {
  if (clusters.length === 0) return [];
  const maxCount = Math.max(1, ...clusters.map((c) => c.riderCount));
  return clusters.map((c) => ({
    lat: c.lat,
    lng: c.lng,
    demand: Math.round((c.riderCount / maxCount) * 100),
    trips: c.riderCount,
    avg_fare: Math.round(c.avgFare),
    pickupLabel: c.pickupLabel,
    waitingRiders: c.riderCount,
  }));
}

export function clustersToHeatLayerData(
  clusters: LiveDemandCluster[],
): [number, number, number][] {
  if (clusters.length === 0) return [];
  const maxCount = Math.max(1, ...clusters.map((c) => c.riderCount));
  return clusters.map((c) => [c.lat, c.lng, c.riderCount / maxCount] as [number, number, number]);
}
