import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie name must match lib/admin-session.ts ADMIN_ACCESS_COOKIE
const COOKIE_NAME = "admin_access_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(COOKIE_NAME);

  const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // Redirect authenticated users away from the login page
  if (isLoginPage && hasSession) {
    const next = request.nextUrl.searchParams.get("next");
    const safe =
      next && next.startsWith("/admin") && !next.startsWith("/admin/login")
        ? next
        : "/admin";
    const url = request.nextUrl.clone();
    url.pathname = safe;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to login
  if (isAdminRoute && !isLoginPage && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
