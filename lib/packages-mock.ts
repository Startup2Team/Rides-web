/**
 * Typed mock data for the Rides Package System admin portal.
 *
 * These shapes match the backend spec from the engineering scope doc.
 * When the real APIs land, swap data sources without changing components.
 *
 * Rules embedded in this data:
 *  - Package purchases are immutable (snapshots, not references).
 *  - Package changes affect future purchases only.
 *  - Campaign changes affect future purchases only.
 *  - Entitlements are vehicle-specific.
 *  - Every admin action produces an audit log entry.
 */

/* ───────────────────────────────────────────────────────────────────────── */
/* TYPES                                                                      */
/* ───────────────────────────────────────────────────────────────────────── */

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

export const MOCK_PACKAGES: RidesPackage[] = [
  {
    id: "pkg_moto_starter",
    slug: "moto-starter",
    name: "Moto Starter",
    vehicleType: "moto",
    description: "Entry pack for new moto drivers. Refill any time.",
    activeVersionId: "pv_moto_starter_v2",
    versions: [
      {
        id: "pv_moto_starter_v3",
        packageId: "pkg_moto_starter",
        version: 3,
        status: "scheduled",
        price: 7500,
        rides: 70,
        bonusRides: 20,
        scheduledFor: "2026-07-01T00:00:00Z",
        activatedAt: null,
        archivedAt: null,
        createdAt: "2026-06-15T09:24:00Z",
        createdBy: "ops@rides.rw",
        notes: "World Cup ramp — better value for new sign-ups.",
      },
      {
        id: "pv_moto_starter_v2",
        packageId: "pkg_moto_starter",
        version: 2,
        status: "active",
        price: 6000,
        rides: 60,
        bonusRides: 15,
        scheduledFor: null,
        activatedAt: "2026-05-01T00:00:00Z",
        archivedAt: null,
        createdAt: "2026-04-22T14:10:00Z",
        createdBy: "ops@rides.rw",
      },
      {
        id: "pv_moto_starter_v1",
        packageId: "pkg_moto_starter",
        version: 1,
        status: "archived",
        price: 5500,
        rides: 50,
        bonusRides: 10,
        scheduledFor: null,
        activatedAt: "2026-02-01T00:00:00Z",
        archivedAt: "2026-05-01T00:00:00Z",
        createdAt: "2026-01-15T11:00:00Z",
        createdBy: "founder@rides.rw",
      },
    ],
  },
  {
    id: "pkg_moto_pro",
    slug: "moto-pro",
    name: "Moto Pro",
    vehicleType: "moto",
    description: "High-volume pack for established moto drivers.",
    activeVersionId: "pv_moto_pro_v1",
    versions: [
      {
        id: "pv_moto_pro_v1",
        packageId: "pkg_moto_pro",
        version: 1,
        status: "active",
        price: 15000,
        rides: 150,
        bonusRides: 40,
        scheduledFor: null,
        activatedAt: "2026-03-15T00:00:00Z",
        archivedAt: null,
        createdAt: "2026-03-10T08:00:00Z",
        createdBy: "ops@rides.rw",
      },
    ],
  },
  {
    id: "pkg_cab_essential",
    slug: "cab-essential",
    name: "Cab Essential",
    vehicleType: "cab",
    description: "Daily-use pack for cab drivers.",
    activeVersionId: "pv_cab_essential_v1",
    versions: [
      {
        id: "pv_cab_essential_v1",
        packageId: "pkg_cab_essential",
        version: 1,
        status: "active",
        price: 12000,
        rides: 100,
        bonusRides: 25,
        scheduledFor: null,
        activatedAt: "2026-04-01T00:00:00Z",
        archivedAt: null,
        createdAt: "2026-03-25T10:00:00Z",
        createdBy: "ops@rides.rw",
      },
    ],
  },
  {
    id: "pkg_hilux_haul",
    slug: "hilux-haul",
    name: "Hilux Haul",
    vehicleType: "hilux",
    description: "Cargo and parcel pack for hilux pickup operators.",
    activeVersionId: "pv_hilux_haul_v1",
    versions: [
      {
        id: "pv_hilux_haul_v1",
        packageId: "pkg_hilux_haul",
        version: 1,
        status: "active",
        price: 18000,
        rides: 50,
        bonusRides: 10,
        scheduledFor: null,
        activatedAt: "2026-04-15T00:00:00Z",
        archivedAt: null,
        createdAt: "2026-04-10T09:00:00Z",
        createdBy: "ops@rides.rw",
      },
    ],
  },
  {
    id: "pkg_fuso_freight",
    slug: "fuso-freight",
    name: "Fuso Freight",
    vehicleType: "fuso",
    description: "Long-haul pack for fuso truck operators.",
    activeVersionId: "pv_fuso_freight_v1",
    versions: [
      {
        id: "pv_fuso_freight_v1",
        packageId: "pkg_fuso_freight",
        version: 1,
        status: "active",
        price: 35000,
        rides: 40,
        bonusRides: 8,
        scheduledFor: null,
        activatedAt: "2026-05-10T00:00:00Z",
        archivedAt: null,
        createdAt: "2026-05-05T11:00:00Z",
        createdBy: "ops@rides.rw",
      },
    ],
  },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "cmp_world_cup_2026",
    slug: "world-cup-2026",
    name: "World Cup 2026 Boost",
    description: "Bonus rides during the tournament window. All vehicle types.",
    status: "active",
    audience: "all",
    vehicleTypes: null,
    packageIds: null,
    priceOverride: null,
    ridesOverride: null,
    bonusRidesOverride: 10,
    startsAt: "2026-06-15T00:00:00Z",
    endsAt: "2026-07-20T23:59:59Z",
    createdAt: "2026-06-01T10:00:00Z",
    createdBy: "growth@rides.rw",
  },
  {
    id: "cmp_first_purchase",
    slug: "first-purchase",
    name: "First Purchase Discount",
    description: "20% off the first ever package purchase. Always-on.",
    status: "active",
    audience: "first-purchase",
    vehicleTypes: null,
    packageIds: null,
    priceOverride: null,
    ridesOverride: null,
    bonusRidesOverride: 5,
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: "2026-12-31T23:59:59Z",
    createdAt: "2025-12-15T08:00:00Z",
    createdBy: "founder@rides.rw",
  },
  {
    id: "cmp_weekend_boost",
    slug: "weekend-boost",
    name: "Weekend Boost (Cab)",
    description: "Cab drivers only — Fri/Sat/Sun bonus rides.",
    status: "scheduled",
    audience: "vehicle-type",
    vehicleTypes: ["cab"],
    packageIds: null,
    priceOverride: null,
    ridesOverride: null,
    bonusRidesOverride: 8,
    startsAt: "2026-06-26T00:00:00Z",
    endsAt: "2026-06-28T23:59:59Z",
    createdAt: "2026-06-18T15:00:00Z",
    createdBy: "growth@rides.rw",
  },
  {
    id: "cmp_moto_launch",
    slug: "moto-launch-promo",
    name: "Moto Launch Promo",
    description: "Promo for new moto drivers during onboarding push.",
    status: "expired",
    audience: "vehicle-type",
    vehicleTypes: ["moto"],
    packageIds: ["pkg_moto_starter"],
    priceOverride: 5000,
    ridesOverride: null,
    bonusRidesOverride: 12,
    startsAt: "2026-03-01T00:00:00Z",
    endsAt: "2026-04-30T23:59:59Z",
    createdAt: "2026-02-20T11:00:00Z",
    createdBy: "growth@rides.rw",
  },
];

export const MOCK_PURCHASES: PurchaseSnapshot[] = [
  {
    id: "purch_24abc01",
    driverId: "drv_001",
    driverName: "Jean Uwamahoro",
    driverPhone: "+250 788 123 456",
    vehicleId: "veh_001",
    vehicleType: "moto",
    vehiclePlate: "RAD 849 A",
    packageId: "pkg_moto_starter",
    packageName: "Moto Starter",
    packageVersion: 2,
    campaignId: "cmp_world_cup_2026",
    campaignName: "World Cup 2026 Boost",
    pricePaid: 6000,
    ridesGranted: 60,
    bonusRidesGranted: 25,
    status: "paid",
    paymentProvider: "mtn-momo",
    paymentReference: "MP260619.1015.A12345",
    createdAt: "2026-06-19T10:14:00Z",
    paidAt: "2026-06-19T10:15:32Z",
  },
  {
    id: "purch_24abc02",
    driverId: "drv_002",
    driverName: "Aïsha Mukamana",
    driverPhone: "+250 788 234 567",
    vehicleId: "veh_002",
    vehicleType: "cab",
    vehiclePlate: "RAC 412 B",
    packageId: "pkg_cab_essential",
    packageName: "Cab Essential",
    packageVersion: 1,
    campaignId: null,
    campaignName: null,
    pricePaid: 12000,
    ridesGranted: 100,
    bonusRidesGranted: 25,
    status: "paid",
    paymentProvider: "airtel-money",
    paymentReference: "AT260619.0922.B98765",
    createdAt: "2026-06-19T09:21:11Z",
    paidAt: "2026-06-19T09:22:48Z",
  },
  {
    id: "purch_24abc03",
    driverId: "drv_003",
    driverName: "Patrick Ndayisaba",
    driverPhone: "+250 788 345 678",
    vehicleId: "veh_003",
    vehicleType: "hilux",
    vehiclePlate: "RAC 778 C",
    packageId: "pkg_hilux_haul",
    packageName: "Hilux Haul",
    packageVersion: 1,
    campaignId: null,
    campaignName: null,
    pricePaid: 18000,
    ridesGranted: 50,
    bonusRidesGranted: 10,
    status: "pending",
    paymentProvider: "mtn-momo",
    paymentReference: "MP260619.1138.C24680",
    createdAt: "2026-06-19T11:37:00Z",
    paidAt: null,
  },
  {
    id: "purch_24abc04",
    driverId: "drv_004",
    driverName: "Claude Habimana",
    driverPhone: "+250 788 456 789",
    vehicleId: "veh_004",
    vehicleType: "moto",
    vehiclePlate: "RAD 220 D",
    packageId: "pkg_moto_starter",
    packageName: "Moto Starter",
    packageVersion: 2,
    campaignId: "cmp_first_purchase",
    campaignName: "First Purchase Discount",
    pricePaid: 4800,
    ridesGranted: 60,
    bonusRidesGranted: 20,
    status: "paid",
    paymentProvider: "mtn-momo",
    paymentReference: "MP260618.1612.D13579",
    createdAt: "2026-06-18T16:11:09Z",
    paidAt: "2026-06-18T16:12:14Z",
  },
  {
    id: "purch_24abc05",
    driverId: "drv_005",
    driverName: "Eric Ntwari",
    driverPhone: "+250 788 567 890",
    vehicleId: "veh_005",
    vehicleType: "fuso",
    vehiclePlate: "RAC 990 E",
    packageId: "pkg_fuso_freight",
    packageName: "Fuso Freight",
    packageVersion: 1,
    campaignId: null,
    campaignName: null,
    pricePaid: 35000,
    ridesGranted: 40,
    bonusRidesGranted: 8,
    status: "failed",
    paymentProvider: "airtel-money",
    paymentReference: "AT260618.1414.E54321",
    createdAt: "2026-06-18T14:13:45Z",
    paidAt: null,
  },
  {
    id: "purch_24abc06",
    driverId: "drv_006",
    driverName: "Sarah Ingabire",
    driverPhone: "+250 788 678 901",
    vehicleId: "veh_006",
    vehicleType: "moto",
    vehiclePlate: "RAD 661 F",
    packageId: "pkg_moto_pro",
    packageName: "Moto Pro",
    packageVersion: 1,
    campaignId: "cmp_world_cup_2026",
    campaignName: "World Cup 2026 Boost",
    pricePaid: 15000,
    ridesGranted: 150,
    bonusRidesGranted: 50,
    status: "paid",
    paymentProvider: "mtn-momo",
    paymentReference: "MP260617.1820.F86420",
    createdAt: "2026-06-17T18:19:21Z",
    paidAt: "2026-06-17T18:20:55Z",
  },
];

export const MOCK_ENTITLEMENTS: Entitlement[] = [
  {
    id: "ent_001",
    driverId: "drv_001",
    driverName: "Jean Uwamahoro",
    driverPhone: "+250 788 123 456",
    vehicleId: "veh_001",
    vehicleType: "moto",
    vehiclePlate: "RAD 849 A",
    ridesRemaining: 48,
    bonusRidesRemaining: 25,
    totalGranted: 60,
    totalConsumed: 12,
    transactions: [
      {
        id: "txn_001_06",
        entitlementId: "ent_001",
        kind: "ride-deduction",
        ridesDelta: -1,
        bonusRidesDelta: 0,
        ridesAfter: 48,
        bonusRidesAfter: 25,
        sourceRef: "ride_24fa01",
        createdAt: "2026-06-20T08:14:00Z",
      },
      {
        id: "txn_001_05",
        entitlementId: "ent_001",
        kind: "ride-deduction",
        ridesDelta: -1,
        bonusRidesDelta: 0,
        ridesAfter: 49,
        bonusRidesAfter: 25,
        sourceRef: "ride_24f9z3",
        createdAt: "2026-06-20T07:01:00Z",
      },
      {
        id: "txn_001_04",
        entitlementId: "ent_001",
        kind: "purchase-grant",
        ridesDelta: 60,
        bonusRidesDelta: 25,
        ridesAfter: 60,
        bonusRidesAfter: 25,
        sourceRef: "purch_24abc01",
        createdAt: "2026-06-19T10:15:32Z",
      },
    ],
  },
  {
    id: "ent_002",
    driverId: "drv_002",
    driverName: "Aïsha Mukamana",
    driverPhone: "+250 788 234 567",
    vehicleId: "veh_002",
    vehicleType: "cab",
    vehiclePlate: "RAC 412 B",
    ridesRemaining: 92,
    bonusRidesRemaining: 23,
    totalGranted: 100,
    totalConsumed: 8,
    transactions: [
      {
        id: "txn_002_03",
        entitlementId: "ent_002",
        kind: "ride-deduction",
        ridesDelta: -1,
        bonusRidesDelta: -1,
        ridesAfter: 92,
        bonusRidesAfter: 23,
        sourceRef: "ride_24fa02",
        createdAt: "2026-06-20T07:45:00Z",
      },
      {
        id: "txn_002_02",
        entitlementId: "ent_002",
        kind: "purchase-grant",
        ridesDelta: 100,
        bonusRidesDelta: 25,
        ridesAfter: 100,
        bonusRidesAfter: 25,
        sourceRef: "purch_24abc02",
        createdAt: "2026-06-19T09:22:48Z",
      },
    ],
  },
  {
    id: "ent_004",
    driverId: "drv_004",
    driverName: "Claude Habimana",
    driverPhone: "+250 788 456 789",
    vehicleId: "veh_004",
    vehicleType: "moto",
    vehiclePlate: "RAD 220 D",
    ridesRemaining: 55,
    bonusRidesRemaining: 22,
    totalGranted: 65,
    totalConsumed: 8,
    transactions: [
      {
        id: "txn_004_03",
        entitlementId: "ent_004",
        kind: "admin-grant",
        ridesDelta: 5,
        bonusRidesDelta: 2,
        ridesAfter: 65,
        bonusRidesAfter: 22,
        sourceRef: "support@rides.rw",
        reason: "Compensation for app downtime 18 Jun 2026.",
        performedBy: "support@rides.rw",
        createdAt: "2026-06-19T15:30:00Z",
      },
      {
        id: "txn_004_02",
        entitlementId: "ent_004",
        kind: "purchase-grant",
        ridesDelta: 60,
        bonusRidesDelta: 20,
        ridesAfter: 60,
        bonusRidesAfter: 20,
        sourceRef: "purch_24abc04",
        createdAt: "2026-06-18T16:12:14Z",
      },
    ],
  },
];

export const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "aud_24z01",
    actor: "ops@rides.rw",
    actorRole: "Operations",
    action: "package.version.create",
    targetType: "package",
    targetId: "pkg_moto_starter",
    targetLabel: "Moto Starter — v3",
    before: null,
    after: { price: 7500, rides: 70, bonusRides: 20, scheduledFor: "2026-07-01" },
    reason: "World Cup ramp",
    createdAt: "2026-06-15T09:24:00Z",
  },
  {
    id: "aud_24z02",
    actor: "growth@rides.rw",
    actorRole: "Growth",
    action: "campaign.schedule",
    targetType: "campaign",
    targetId: "cmp_weekend_boost",
    targetLabel: "Weekend Boost (Cab)",
    before: { status: "draft" },
    after: { status: "scheduled", startsAt: "2026-06-26", endsAt: "2026-06-28" },
    createdAt: "2026-06-18T15:00:00Z",
  },
  {
    id: "aud_24z03",
    actor: "support@rides.rw",
    actorRole: "Support",
    action: "entitlement.grant",
    targetType: "entitlement",
    targetId: "ent_004",
    targetLabel: "Claude Habimana · Moto RAD 220 D",
    before: { ridesRemaining: 50, bonusRidesRemaining: 20 },
    after: { ridesRemaining: 55, bonusRidesRemaining: 22 },
    reason: "Compensation for app downtime 18 Jun 2026.",
    createdAt: "2026-06-19T15:30:00Z",
  },
  {
    id: "aud_24z04",
    actor: "ops@rides.rw",
    actorRole: "Operations",
    action: "package.version.archive",
    targetType: "package",
    targetId: "pkg_moto_starter",
    targetLabel: "Moto Starter — v1",
    before: { status: "active" },
    after: { status: "archived", archivedAt: "2026-05-01" },
    reason: "Superseded by v2.",
    createdAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "aud_24z05",
    actor: "growth@rides.rw",
    actorRole: "Growth",
    action: "campaign.create",
    targetType: "campaign",
    targetId: "cmp_world_cup_2026",
    targetLabel: "World Cup 2026 Boost",
    before: null,
    after: {
      status: "active",
      audience: "all",
      bonusRidesOverride: 10,
      startsAt: "2026-06-15",
      endsAt: "2026-07-20",
    },
    createdAt: "2026-06-01T10:00:00Z",
  },
];

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
