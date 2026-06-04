import {
  type Permission,
  ROLE_DEFINITIONS,
  SIDEBAR_ITEMS,
  hasPermission as hasPermissionForRole,
} from "@/lib/admin-permissions";

export type { Permission };

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem?: boolean;
};

export { SIDEBAR_ITEMS };

export const DEFAULT_ROLES: Role[] = ROLE_DEFINITIONS.map((r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  permissions: r.permissions,
  isSystem: r.isSystem,
}));

export function hasPermission(role: Role, href: string): boolean {
  return hasPermissionForRole(role.permissions, href);
}

export function visibleSidebarCount(role: Role): number {
  if (role.permissions.includes("*")) return SIDEBAR_ITEMS.length;
  return role.permissions.length;
}
