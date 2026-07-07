import type { Driver as ApiDriver, DriverDetail } from "./api";

const LIST_KEY = "taravelis_local_drivers";
const DETAIL_PREFIX = "taravelis_local_driver_";

export function isLocalDriverId(id: string): boolean {
  return id.startsWith("local-driver-");
}

export function getLocalApiDrivers(): ApiDriver[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as ApiDriver[]) : [];
  } catch {
    return [];
  }
}

export function getLocalDriverDetail(id: string): DriverDetail | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DETAIL_PREFIX + id);
    return raw ? (JSON.parse(raw) as DriverDetail) : null;
  } catch {
    return null;
  }
}

/** Update the approval status of an already-saved local driver (e.g. after approve/reject). */
export function updateLocalDriverStatus(id: string, status: string): void {
  if (typeof window === "undefined") return;
  try {
    const detail = getLocalDriverDetail(id);
    if (detail) {
      detail.approval_status = status;
      localStorage.setItem(DETAIL_PREFIX + id, JSON.stringify(detail));
    }

    const list = getLocalApiDrivers();
    const idx = list.findIndex((d) => d.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], approval_status: status };
      localStorage.setItem(LIST_KEY, JSON.stringify(list));
    }
  } catch {
    // Storage quota exceeded or unavailable — silently skip.
  }
}

export function saveLocalDriver(detail: DriverDetail): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DETAIL_PREFIX + detail.id, JSON.stringify(detail));

    const list = getLocalApiDrivers();
    if (!list.some((d) => d.id === detail.id)) {
      list.push({
        id: detail.id,
        full_name: detail.full_name ?? null,
        phone: detail.phone,
        transport_type: detail.transport_type,
        vehicle_plate: detail.vehicle_plate,
        approval_status: detail.approval_status,
        is_online: false,
        on_trip: false,
        city: detail.city ?? "Kigali",
        created_at: detail.created_at,
      } as ApiDriver);
      localStorage.setItem(LIST_KEY, JSON.stringify(list));
    }
  } catch {
    // Storage quota exceeded — silently skip; images may be too large.
  }
}
