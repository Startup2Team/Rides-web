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
import { clearToken } from "@/lib/auth";
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
  const [connError, setConnError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setConnError(null);
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
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isAuthErr = errMsg === "Unauthorized" || errMsg.toLowerCase().includes("unauthorized");
      if (isAuthErr) {
        setUser(null);
        setRoleName(null);
        setPermissions([]);
        setReadOnly(false);
      } else {
        setConnError(errMsg || "Failed to connect to the administration server.");
      }
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

  if (connError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Connection Failure
            </h1>
            <p className="text-sm text-muted-foreground">
              {connError}
            </p>
          </div>
          <button
            onClick={() => {
              setConnError(null);
              setReady(false);
              void refreshUser();
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

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
