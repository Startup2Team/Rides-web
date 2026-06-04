"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAccount, getRoles, type AdminAccount } from "@/lib/api";
import {
  type Permission,
  resolveRole,
  roleByName,
  type AdminRoleName,
} from "@/lib/admin-permissions";

export type AuthUser = Pick<
  AdminAccount,
  "id" | "name" | "email" | "role_id" | "role_name" | "two_factor"
>;

type AuthContextValue = {
  user: AuthUser | null;
  roleName: AdminRoleName | null;
  permissions: Permission[];
  readOnly: boolean;
  ready: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  roleName: null,
  permissions: ["*"],
  readOnly: false,
  ready: false,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roleName, setRoleName] = useState<AdminRoleName | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>(["*"]);
  const [readOnly, setReadOnly] = useState(false);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const account = await getAccount();
      let apiPerms: unknown;
      try {
        const rolesRes = await getRoles();
        const match = rolesRes.roles?.find((r) => r.id === account.role_id);
        apiPerms = match?.permissions;
      } catch {
        apiPerms = undefined;
      }
      const role = resolveRole(account.role_name, apiPerms) ?? roleByName(account.role_name);
      setUser({
        id: account.id,
        name: account.name,
        email: account.email,
        role_id: account.role_id,
        role_name: account.role_name,
        two_factor: account.two_factor,
      });
      setRoleName((role?.name as AdminRoleName) ?? null);
      setPermissions(role?.permissions ?? ["*"]);
      setReadOnly(role?.readOnly === true);
    } catch {
      setUser(null);
      setRoleName(null);
      setPermissions([]);
      setReadOnly(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setRoleName(null);
    setPermissions([]);
    window.location.href = "/admin/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, roleName, permissions, readOnly, ready, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
