import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(ADMIN_ACCESS_COOKIE);

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
    const [safePath, safeSearch] = safe.split("?");
    url.pathname = safePath;
    url.search = safeSearch ? `?${safeSearch}` : "";
    
    const response = NextResponse.redirect(url);
    // Prevent browser from caching this redirect
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // Redirect unauthenticated users to login
  if (isAdminRoute && !isLoginPage && !hasSession) {
    const url = request.nextUrl.clone();
    const fullPath = pathname + (request.nextUrl.search ?? "");
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", fullPath);
    
    const response = NextResponse.redirect(url);
    // Prevent browser from caching this redirect
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
