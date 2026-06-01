import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "taravelis-admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(COOKIE_NAME);

  // Protect all /admin routes except /admin/login
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isAdminRoute && !isLoginPage && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Already logged in — redirect away from login page
  if (isLoginPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
