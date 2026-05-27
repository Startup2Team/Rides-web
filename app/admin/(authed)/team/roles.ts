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
  | "/admin/settings"
  | "/admin/team";

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
};

export const SIDEBAR_ITEMS: { href: Exclude<Permission, "*">; label: string; group: string }[] = [
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
  { href: "/admin/settings", label: "System Settings", group: "System" },
  { href: "/admin/team", label: "Admins & Roles", group: "System" },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: "super",
    name: "Super Admin",
    description: "Full access across every page, plus admin management.",
    permissions: ["*"],
    isSystem: true,
  },
  {
    id: "ops",
    name: "Operations Manager",
    description: "Live operations — rides, drivers, customers, negotiations, heatmaps, safety, support.",
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
    ],
  },
  {
    id: "finance",
    name: "Finance Manager",
    description: "Revenue, commission, payouts, and financial reports.",
    permissions: ["/admin", "/admin/revenue", "/admin/reports"],
  },
  {
    id: "support",
    name: "Support Staff",
    description: "Tickets, complaints, contact inbox — customer-facing only.",
    permissions: ["/admin", "/admin/support", "/admin/inbox"],
  },
  {
    id: "analytics",
    name: "Analytics Staff",
    description: "Read-only analytics and reports.",
    permissions: ["/admin", "/admin/analytics", "/admin/reports"],
  },
];

export function hasPermission(role: Role, href: string): boolean {
  if (role.permissions.includes("*")) return true;
  return role.permissions.includes(href as Permission);
}

export function visibleSidebarCount(role: Role): number {
  if (role.permissions.includes("*")) return SIDEBAR_ITEMS.length;
  return role.permissions.length;
}
