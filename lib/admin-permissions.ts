/**
 * Admin role definitions and route permissions.
 * Names must match `admin_roles.name` in the database (migration 025).
 */

export type Permission =
  | "*"
  | "/admin"
  | "/admin/drivers"
  | "/admin/customers"
  | "/admin/live-rides"
  | "/admin/negotiations"
  | "/admin/heatmaps"
  | "/admin/revenue"
  | "/admin/analytics"
  | "/admin/reports"
  | "/admin/safety-center"
  | "/admin/support"
  | "/admin/inbox"
  | "/admin/notifications"
  | "/admin/packages"
  | "/admin/campaigns"
  | "/admin/partners"
  | "/admin/purchases"
  | "/admin/entitlements"
  | "/admin/audit-logs"
  | "/admin/profile"
  | "/admin/settings"
  | "/admin/team"
  | "/admin/packages"
  | "/admin/audit";

export type AdminRoleName =
  | "Super Admin"
  | "Operations Manager"
  | "Finance Manager"
  | "Support Staff"
  | "Analytics Staff";

export type RoleDefinition = {
  id: string;
  name: AdminRoleName;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
  /** Home route after login (must be in permissions). */
  homePath: Permission;
  readOnly?: boolean;
};

export const SIDEBAR_ITEMS: {
  href: Exclude<Permission, "*">;
  label: string;
  group: string;
}[] = [
  { href: "/admin", label: "Dashboard", group: "Overview" },
  { href: "/admin/drivers", label: "Drivers", group: "Operations" },
  { href: "/admin/customers", label: "Customers", group: "Operations" },
  { href: "/admin/live-rides", label: "Live Rides", group: "Operations" },
  { href: "/admin/negotiations", label: "Negotiations", group: "Operations" },
  { href: "/admin/heatmaps", label: "Heatmaps", group: "Operations" },
  { href: "/admin/revenue", label: "Revenue", group: "Insights" },
  { href: "/admin/analytics", label: "Analytics", group: "Insights" },
  { href: "/admin/reports", label: "Reports", group: "Insights" },
  { href: "/admin/safety-center", label: "Safety Center", group: "Trust" },
  { href: "/admin/support", label: "Support", group: "Trust" },
  { href: "/admin/inbox", label: "Inbox", group: "Trust" },
  { href: "/admin/notifications", label: "Notifications", group: "Trust" },
  { href: "/admin/packages", label: "Packages", group: "Monetization" },
  { href: "/admin/campaigns", label: "Campaigns", group: "Monetization" },
  { href: "/admin/partners", label: "Partners", group: "Monetization" },
  { href: "/admin/purchases", label: "Purchases", group: "Monetization" },
  { href: "/admin/entitlements", label: "Entitlements", group: "Monetization" },
  { href: "/admin/audit-logs", label: "Audit Logs", group: "Monetization" },
  { href: "/admin/profile", label: "Profile", group: "System" },
  { href: "/admin/settings", label: "System Settings", group: "System" },
  { href: "/admin/team", label: "Admins & Roles", group: "System" },
  { href: "/admin/packages", label: "Ride Packages", group: "System" },
  { href: "/admin/audit", label: "Audit Log", group: "System" },
];

/** Default roles — aligned with DB seed in migration 025. */
export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "super",
    name: "Super Admin",
    description: "Full access across every page, plus admin management.",
    permissions: ["*"],
    isSystem: true,
    homePath: "/admin",
  },
  {
    id: "analytics",
    name: "Analytics Staff",
    description: "Read-only analytics, reports, and heatmaps.",
    permissions: ["/admin", "/admin/analytics", "/admin/reports", "/admin/heatmaps"],
    homePath: "/admin",
    readOnly: true,
  },
  {
    id: "finance",
    name: "Finance Manager",
    description: "Revenue, commission, payouts, analytics, and financial reports.",
    permissions: [
      "/admin",
      "/admin/revenue",
      "/admin/analytics",
      "/admin/reports",
      "/admin/packages",
      "/admin/campaigns",
      "/admin/partners",
      "/admin/purchases",
      "/admin/audit-logs",
    ],
    homePath: "/admin",
  },
  {
    id: "ops",
    name: "Operations Manager",
    description: "Live operations — rides, drivers, customers, negotiations, heatmaps, safety, support, packages.",
    permissions: [
      "/admin",
      "/admin/drivers",
      "/admin/customers",
      "/admin/live-rides",
      "/admin/negotiations",
      "/admin/heatmaps",
      "/admin/safety-center",
      "/admin/support",
      "/admin/inbox",
      "/admin/notifications",
      "/admin/packages",
      "/admin/campaigns",
      "/admin/partners",
      "/admin/purchases",
      "/admin/entitlements",
      "/admin/audit-logs",
    ],
    homePath: "/admin",
  },
  {
    id: "support",
    name: "Support Staff",
    description: "Tickets, complaints, contact inbox, and entitlement adjustments — customer-facing only.",
    permissions: [
      "/admin",
      "/admin/support",
      "/admin/inbox",
      "/admin/notifications",
      "/admin/entitlements",
      "/admin/audit-logs",
    ],
    homePath: "/admin",
  },
];

export function normalizePermissions(raw: unknown): Permission[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<Permission>([
    "*",
    "/admin",
    "/admin/drivers",
    "/admin/customers",
    "/admin/live-rides",
    "/admin/negotiations",
    "/admin/heatmaps",
    "/admin/revenue",
    "/admin/analytics",
    "/admin/reports",
    "/admin/safety-center",
    "/admin/support",
    "/admin/inbox",
    "/admin/notifications",
    "/admin/packages",
    "/admin/campaigns",
    "/admin/partners",
    "/admin/purchases",
    "/admin/entitlements",
    "/admin/audit-logs",
    "/admin/profile",
    "/admin/settings",
    "/admin/team",
    "/admin/packages",
    "/admin/audit",
  ]);
  return raw.filter((p): p is Permission => typeof p === "string" && allowed.has(p as Permission));
}

export function roleByName(name: string | undefined | null): RoleDefinition | null {
  if (!name) return null;
  return ROLE_DEFINITIONS.find((r) => r.name === name) ?? null;
}

export function resolveRole(
  roleName: string | undefined | null,
  apiPermissions?: unknown,
): RoleDefinition | null {
  const fromName = roleByName(roleName);
  if (!fromName) return null;
  if (apiPermissions !== undefined && apiPermissions !== null) {
    const perms = normalizePermissions(apiPermissions);
    if (perms.length > 0) {
      return { ...fromName, permissions: perms };
    }
  }
  return fromName;
}

export function hasPermission(permissions: Permission[], href: string): boolean {
  if (permissions.includes("*")) return true;
  const base = href.split("?")[0] ?? href;
  if (base === "/admin/profile") {
    return (
      permissions.includes("/admin/profile") ||
      permissions.includes("/admin/settings") ||
      permissions.includes("/admin/audit")
    );
  }
  if (permissions.includes(base as Permission)) return true;
  if (base.startsWith("/admin/drivers/") && permissions.includes("/admin/drivers")) {
    return true;
  }
  return false;
}

/** Match current pathname (and optional query for drivers). */
export function canAccessPath(
  permissions: Permission[],
  pathname: string,
  searchParams?: URLSearchParams,
): boolean {
  if (permissions.includes("*")) return true;
  const base = pathname.split("?")[0] ?? pathname;
  if (!hasPermission(permissions, base)) return false;
  if (base === "/admin/drivers" && searchParams?.get("vehicle")) {
    return hasPermission(permissions, "/admin/drivers");
  }
  return true;
}

export function firstAllowedPath(permissions: Permission[]): string {
  if (permissions.includes("*")) return "/admin";
  for (const item of SIDEBAR_ITEMS) {
    if (hasPermission(permissions, item.href)) return item.href;
  }
  return "/admin/login";
}

export function postLoginPath(
  permissions: Permission[],
  requestedNext: string | null,
): string {
  const home = firstAllowedPath(permissions);
  if (
    requestedNext &&
    requestedNext.startsWith("/admin") &&
    !requestedNext.startsWith("/admin/login") &&
    canAccessPath(permissions, requestedNext.split("?")[0] ?? requestedNext)
  ) {
    return requestedNext;
  }
  const role = ROLE_DEFINITIONS.find((r) =>
    r.permissions.every((p) => permissions.includes(p) || permissions.includes("*")),
  );
  const def = role?.homePath ?? home;
  return hasPermission(permissions, def) ? def : home;
}

export function isReadOnlyRole(roleName: string | undefined | null): boolean {
  const r = roleByName(roleName);
  return r?.readOnly === true;
}

export function visibleSidebarItems(permissions: Permission[]) {
  return SIDEBAR_ITEMS.filter((item) => hasPermission(permissions, item.href));
}
