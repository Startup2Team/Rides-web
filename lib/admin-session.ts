/**
 * HttpOnly cookie names for admin JWTs (set by Next Route Handlers).
 * Must not be exposed to client bundles except as string constants for Route Handlers / middleware.
 */

export const ADMIN_ACCESS_COOKIE = "admin_access_token";
export const ADMIN_REFRESH_COOKIE = "admin_refresh_token";
/** Non-httpOnly version — readable by JS so lib/api.ts can set Authorization headers. */
export const ADMIN_UI_TOKEN_COOKIE = "admin_ui_token";

/** Max cookie age (falls back match typical backend defaults). */
export function accessCookieMaxAgeSeconds(): number {
  const m = parseInt(process.env.JWT_ACCESS_EXPIRY_MINUTES ?? "15", 10);
  return Number.isFinite(m) && m > 0 ? m * 60 : 15 * 60;
}

export function refreshCookieMaxAgeSeconds(): number {
  const d = parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS ?? "30", 10);
  return Number.isFinite(d) && d > 0 ? d * 86400 : 30 * 86400;
}

export function cookieBaseOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}
