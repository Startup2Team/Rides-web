export type VehicleType = "moto" | "cab" | "hilux" | "fuso";

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  moto: "Moto",
  cab: "Cab",
  hilux: "Hilux",
  fuso: "Fuso",
};

export const VEHICLE_ORDER: VehicleType[] = ["moto", "cab", "hilux", "fuso"];

/* ── Package ─────────────────────────────────────────────────────────────── */

export type PackageVersionStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "archived";

export type PackageVersion = {
  id: string;
  packageId: string;
  version: number;
  status: PackageVersionStatus;
  /** Price in RWF */
  price: number;
  rides: number;
  bonusRides: number;
  /** ISO date string — when this version is scheduled to go live (null if active or draft) */
  scheduledFor: string | null;
  /** ISO date string — when this version became active (null if not yet active) */
  activatedAt: string | null;
  /** ISO date string — when this version was archived (null if not archived) */
  archivedAt: string | null;
  /** ISO date string — created at */
  createdAt: string;
  /** Email of admin who created this version */
  createdBy: string;
  notes?: string;
};

export type RidesPackage = {
  id: string;
  /** Internal slug e.g. "moto-starter" */
  slug: string;
  name: string;
  vehicleType: VehicleType;
  description: string;
  /** All versions of this package, newest first */
  versions: PackageVersion[];
  /** Convenience — the version with status "active" if any */
  activeVersionId: string | null;
};

/* ── Campaign ────────────────────────────────────────────────────────────── */

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "expired"
  | "archived";

export type CampaignAudience = "all" | "first-purchase" | "vehicle-type";

export type Campaign = {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: CampaignStatus;
  audience: CampaignAudience;
  /** When audience = "vehicle-type", restricts to these vehicles */
  vehicleTypes: VehicleType[] | null;
  /** When set, restricts campaign to these specific package IDs */
  packageIds: string[] | null;
  /** Optional fixed price override (RWF) */
  priceOverride: number | null;
  /** Optional extra rides on top of the package's rides */
  ridesOverride: number | null;
  /** Optional extra bonus rides on top of the package's bonus */
  bonusRidesOverride: number | null;
  /** ISO date — campaign window start */
  startsAt: string;
  /** ISO date — campaign window end */
  endsAt: string;
  /** ISO date — when admin created the campaign */
  createdAt: string;
  createdBy: string;
};

/* ── Purchase ────────────────────────────────────────────────────────────── */

export type PurchaseStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired";

export type PurchaseSnapshot = {
  id: string;
  /** Driver who purchased */
  driverId: string;
  driverName: string;
  driverPhone: string;
  /** Vehicle this purchase applies to */
  vehicleId: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  /** Immutable snapshot of package at time of purchase */
  packageId: string;
  packageName: string;
  packageVersion: number;
  /** Immutable snapshot of campaign at time of purchase (if any) */
  campaignId: string | null;
  campaignName: string | null;
  /** Immutable snapshot of pricing */
  pricePaid: number;
  ridesGranted: number;
  bonusRidesGranted: number;
  /** Payment + status */
  status: PurchaseStatus;
  /** Mobile money provider used */
  paymentProvider: "mtn-momo" | "airtel-money" | null;
  paymentReference: string | null;
  /** ISO dates */
  createdAt: string;
  paidAt: string | null;
};

/* ── Entitlement ─────────────────────────────────────────────────────────── */

export type EntitlementTransactionKind =
  | "purchase-grant"
  | "ride-deduction"
  | "admin-grant"
  | "admin-revoke";

export type EntitlementTransaction = {
  id: string;
  entitlementId: string;
  kind: EntitlementTransactionKind;
  ridesDelta: number;
  bonusRidesDelta: number;
  /** Balance after this transaction */
  ridesAfter: number;
  bonusRidesAfter: number;
  /** Source reference (purchase id, ride id, admin email) */
  sourceRef: string;
  reason?: string;
  /** Admin who performed the action (admin-grant / admin-revoke only) */
  performedBy?: string;
  createdAt: string;
};

export type Entitlement = {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleId: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  ridesRemaining: number;
  bonusRidesRemaining: number;
  /** Total rides ever granted (purchases + admin grants) */
  totalGranted: number;
  /** Total rides ever consumed */
  totalConsumed: number;
  /** Transactions, newest first */
  transactions: EntitlementTransaction[];
};

/* ── Audit Log ───────────────────────────────────────────────────────────── */

export type AuditAction =
  | "package.create"
  | "package.version.create"
  | "package.version.schedule"
  | "package.version.activate"
  | "package.version.archive"
  | "campaign.create"
  | "campaign.schedule"
  | "campaign.activate"
  | "campaign.expire"
  | "campaign.archive"
  | "entitlement.grant"
  | "entitlement.revoke"
  | "purchase.reconcile";

export type AuditEntry = {
  id: string;
  actor: string;
  actorRole: string;
  action: AuditAction;
  /** Resource type and id this action targeted */
  targetType: "package" | "campaign" | "purchase" | "entitlement";
  targetId: string;
  targetLabel: string;
  /** Serialised before/after for compare view; null if create */
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason?: string;
  createdAt: string;
};

/* ───────────────────────────────────────────────────────────────────────── */
/* MOCK DATA                                                                  */
/* ───────────────────────────────────────────────────────────────────────── */

export const MOCK_PACKAGES: RidesPackage[] = [];
export const MOCK_CAMPAIGNS: Campaign[] = [];
export const MOCK_PURCHASES: PurchaseSnapshot[] = [];
export const MOCK_ENTITLEMENTS: Entitlement[] = [];
export const MOCK_AUDIT: AuditEntry[] = [];

/* ───────────────────────────────────────────────────────────────────────── */
/* HELPERS                                                                    */
/* ───────────────────────────────────────────────────────────────────────── */

export function formatRWF(amount: number): string {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getActiveVersion(pkg: RidesPackage): PackageVersion | null {
  if (!pkg.activeVersionId) return null;
  return pkg.versions.find((v) => v.id === pkg.activeVersionId) ?? null;
}
