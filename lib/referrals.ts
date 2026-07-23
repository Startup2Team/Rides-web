import type { ReferredDriver } from "./api";
import { formatTransportType } from "./drivers";

/** Fallback helper when offline — returns empty list without mock arrays. */
export function getLocalReferredDrivers(_referrerId: string): ReferredDriver[] {
  return [];
}

export function referralCountLabel(count: number): string {
  if (count === 0) return "No referrals yet";
  if (count === 1) return "1 driver referred";
  return `${count} drivers referred`;
}

export function formatReferredDriverLine(d: ReferredDriver): string {
  const name = d.full_name?.trim() || d.phone || "Unknown driver";
  const vehicle = formatTransportType(d.transport_type);
  const plate = d.vehicle_plate ?? "—";
  return `${name} · ${vehicle} · ${plate}`;
}
