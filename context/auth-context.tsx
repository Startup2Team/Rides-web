"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { adminLogout } from "@/lib/api";
import { clearToken, getAdminUser, type AdminUser } from "@/lib/auth";

type AuthContextValue = {
  user: AdminUser | null;
  logout: () => Promise<void>;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  logout: async () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  const refreshUser = useCallback(() => {
    setUser(getAdminUser());
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      // ignore — still clear local state
    }
    clearToken();
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
