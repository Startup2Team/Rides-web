const TOKEN_KEY = "taravelis-admin-token";
const USER_KEY = "taravelis-admin-user";
const COOKIE_NAME = "taravelis-admin-session";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactor: boolean;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also set a cookie so proxy.ts can do server-side redirect checks
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function decodeToken(token: string): { sub: string; role_state: string; exp: number } | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}
