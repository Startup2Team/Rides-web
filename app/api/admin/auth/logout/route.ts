import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_UI_TOKEN_COOKIE,
  cookieBaseOptions,
} from "@/lib/admin-session";
import { getBackendOrigin } from "@/lib/admin-backend-url";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const isLocal = searchParams.get("local") === "true";

  if (!isLocal) {
    // Forward logout to backend (invalidates Redis session)
    const jar = await cookies();
    const accessToken = jar.get(ADMIN_ACCESS_COOKIE)?.value;
    if (accessToken) {
      try {
        await fetch(`${getBackendOrigin()}/api/v1/admin/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
      } catch {
        // ignore — still clear cookies
      }
    }
  }

  const res = NextResponse.json({ ok: true });
  const base = cookieBaseOptions();
  res.cookies.set(ADMIN_ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(ADMIN_REFRESH_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(ADMIN_UI_TOKEN_COOKIE, "", { ...base, httpOnly: false, maxAge: 0 });
  return res;
}
