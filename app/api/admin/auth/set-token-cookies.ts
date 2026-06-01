import type { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_UI_TOKEN_COOKIE,
  accessCookieMaxAgeSeconds,
  cookieBaseOptions,
} from "@/lib/admin-session";

/**
 * Sets two cookies on the API route response:
 *  - admin_access_token  (httpOnly) — read by proxy.ts for route protection
 *  - admin_ui_token      (readable) — read by lib/auth.ts getToken() for API Bearer headers
 */
export function applyAdminTokenCookies(
  response: NextResponse,
  accessToken: string,
): void {
  const base = cookieBaseOptions();
  const maxAge = accessCookieMaxAgeSeconds();

  // HTTP-only: checked by proxy.ts, not readable by JS
  response.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, { ...base, maxAge });

  // Readable: used by lib/api.ts to set Authorization header for backend calls
  response.cookies.set(ADMIN_UI_TOKEN_COOKIE, accessToken, {
    ...base,
    httpOnly: false,
    maxAge,
  });
}

export function clearAdminTokenCookies(response: NextResponse): void {
  const base = cookieBaseOptions();
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  response.cookies.set(ADMIN_UI_TOKEN_COOKIE, "", { ...base, httpOnly: false, maxAge: 0 });
}
