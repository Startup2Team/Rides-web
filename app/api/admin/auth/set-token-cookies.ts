import type { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  accessCookieMaxAgeSeconds,
  cookieBaseOptions,
  refreshCookieMaxAgeSeconds,
} from "@/lib/admin-session";

/** Attach httpOnly JWT cookies to an API route response (tokens never exposed in JSON body). */
export function applyAdminTokenCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  const base = cookieBaseOptions();
  response.cookies.set(ADMIN_ACCESS_COOKIE, accessToken, {
    ...base,
    maxAge: accessCookieMaxAgeSeconds(),
  });
  response.cookies.set(ADMIN_REFRESH_COOKIE, refreshToken, {
    ...base,
    maxAge: refreshCookieMaxAgeSeconds(),
  });
}
