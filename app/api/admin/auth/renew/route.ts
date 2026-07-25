import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin-session";
import { getBackendOrigin } from "@/lib/admin-backend-url";
import { applyAdminTokenCookies } from "../set-token-cookies";

/**
 * Slides the admin session forward.
 *
 * The console calls this while the admin is active, so the token lifetime behaves
 * as an idle timeout: keep working and you stay signed in, go idle past
 * JWT_ADMIN_IDLE_MINUTES and the next navigation lands on the login screen.
 *
 * Runs server-side because the access token is HttpOnly — the browser can't read
 * it, and the refreshed one has to be written back as a cookie.
 */
export async function POST() {
  const jar = await cookies();
  const accessToken = jar.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "no session" } },
      { status: 401 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${getBackendOrigin()}/api/v1/admin/auth/renew`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    // Network blip: keep the current session rather than signing the admin out.
    return NextResponse.json({ renewed: false }, { status: 503 });
  }

  if (!upstream.ok) {
    // 401 here is a genuine expiry (or the session hit its absolute ceiling).
    return NextResponse.json({ renewed: false }, { status: upstream.status });
  }

  const envelope = (await upstream.json().catch(() => null)) as
    | { data?: { access_token?: string } }
    | null;
  const token = envelope?.data?.access_token;
  if (!token) {
    return NextResponse.json({ renewed: false }, { status: 502 });
  }

  const res = NextResponse.json({ renewed: true });
  applyAdminTokenCookies(res, token);
  return res;
}
