import type { ReferredDriver } from "./api";
import { getMockReferredDrivers } from "./mock-drivers";
import { getLocalApiDrivers } from "./local-drivers";
import { formatTransportType } from "./drivers";

function toReferredDriver(d: {
  id: string;
  full_name?: string | null;
  phone?: string;
  transport_type: string;
  vehicle_plate?: string;
  approval_status: string;
  created_at: string;
}): ReferredDriver {
  return {
    id: d.id,
    full_name: d.full_name ?? null,
    phone: d.phone,
    transport_type: d.transport_type,
    vehicle_plate: d.vehicle_plate,
    approval_status: d.approval_status,
    created_at: d.created_at,
  };
}

/** Resolve referred drivers from mock/local fixtures when the backend is unavailable. */
export function getLocalReferredDrivers(referrerId: string): ReferredDriver[] {
  const fromMock = getMockReferredDrivers(referrerId).map(toReferredDriver);

  const fromLocal = getLocalApiDrivers()
    .filter((d) => d.referred_by_driver_id === referrerId)
    .map(toReferredDriver);

  return [...fromMock, ...fromLocal];
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
