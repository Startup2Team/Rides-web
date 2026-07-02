import type { AdminCampaign, AdminEntitlementRow, Purchase } from "@/lib/api";
import type {
  Campaign,
  CampaignStatus,
  Entitlement,
  PurchaseSnapshot,
  PurchaseStatus,
  VehicleType,
} from "@/lib/packages-mock";

export function vehicleCodeToType(code: string): VehicleType {
  switch (code) {
    case "CAB_TAXI":
      return "cab";
    case "LIGHT_HILUX":
      return "hilux";
    case "HEAVY_FUSO":
      return "fuso";
    default:
      return "moto";
  }
}

export function mapApiPurchase(p: Purchase): PurchaseSnapshot {
  let provider: "mtn-momo" | "airtel-money" | null = null;
  if (p.payment_provider === "MTN") provider = "mtn-momo";
  else if (p.payment_provider === "AIRTEL") provider = "airtel-money";

  return {
    id: p.id,
    driverId: p.driver_id,
    driverName: p.driver_name,
    driverPhone: p.driver_phone,
    vehicleId: p.vehicle_id || "",
    vehicleType: vehicleCodeToType(p.vehicle_type_code),
    vehiclePlate: p.vehicle_plate,
    packageId: p.package_id,
    packageName: p.package_name,
    packageVersion: p.package_version,
    campaignId: p.campaign_id || null,
    campaignName: p.campaign_name || null,
    pricePaid: p.price_paid_rwf,
    ridesGranted: p.rides_granted,
    bonusRidesGranted: p.bonus_rides_granted,
    status: p.status.toLowerCase() as PurchaseStatus,
    paymentProvider: provider,
    paymentReference: p.payment_ref || null,
    createdAt: p.created_at,
    paidAt: p.paid_at || null,
  };
}

export function mapApiCampaign(c: AdminCampaign): Campaign {
  const status = c.status.toLowerCase() as CampaignStatus;
  let audience: Campaign["audience"] = "all";
  let vehicleTypes: VehicleType[] | null = null;

  if (c.type === "FIRST_PURCHASE") audience = "first-purchase";
  else if (c.type === "VEHICLE_TYPE" && c.target_vehicle_type_code) {
    audience = "vehicle-type";
    vehicleTypes = [vehicleCodeToType(c.target_vehicle_type_code)];
  }

  return {
    id: c.id,
    slug: c.code,
    name: c.name,
    description: c.description || "",
    status,
    audience,
    vehicleTypes,
    packageIds: c.target_package_id ? [c.target_package_id] : null,
    priceOverride: c.override_price_rwf,
    ridesOverride: c.override_rides,
    bonusRidesOverride: c.override_bonus_rides,
    startsAt: c.starts_at ?? new Date().toISOString(),
    endsAt: c.ends_at ?? new Date().toISOString(),
    createdAt: c.created_at,
    createdBy: c.created_by ?? "admin",
  };
}

export function mapApiEntitlement(row: AdminEntitlementRow): Entitlement {
  const vt = vehicleCodeToType(row.vehicle_type);
  return {
    id: row.id,
    driverId: row.driver_id,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    vehicleId: row.vehicle_id ?? "",
    vehicleType: vt,
    vehiclePlate: row.vehicle_plate,
    ridesRemaining: row.rides_remaining,
    bonusRidesRemaining: row.bonus_rides_remaining,
    totalGranted: row.total_granted,
    totalConsumed: row.total_consumed,
    transactions: (row.transactions ?? []).map((t) => ({
      id: t.id,
      entitlementId: t.entitlement_id,
      kind: t.kind as Entitlement["transactions"][number]["kind"],
      ridesDelta: t.rides_delta,
      bonusRidesDelta: t.bonus_rides_delta,
      ridesAfter: t.rides_after,
      bonusRidesAfter: t.bonus_rides_after,
      sourceRef: t.source_ref ?? "",
      reason: t.reason ?? "",
      performedBy: t.performed_by ?? "",
      createdAt: t.created_at,
    })),
  };
}
