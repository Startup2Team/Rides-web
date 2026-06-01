const COOKIE_NAME = "admin_ui_token";

/** Read the access token from the readable cookie set by the auth API routes. */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function clearToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

// Legacy — kept so existing imports don't break, no-ops for localStorage
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactor: boolean;
};

export function getAdminUser(): AdminUser | null {
  return null;
}

export function setToken(_token: string, _user: AdminUser): void {
  // tokens are now managed by the Next.js auth API routes via cookies
}
