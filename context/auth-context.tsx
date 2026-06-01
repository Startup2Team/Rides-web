"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAccount, type AdminAccount } from "@/lib/api";

export type AuthUser = Pick<AdminAccount, "id" | "name" | "email" | "role_name" | "two_factor">;

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const account = await getAccount();
      setUser({
        id: account.id,
        name: account.name,
        email: account.email,
        role_name: account.role_name,
        two_factor: account.two_factor,
      });
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      // Call the Next.js API route which clears the HTTP-only cookie
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    window.location.href = "/admin/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
