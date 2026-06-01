import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    if (token) {
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
    return NextResponse.next();
  }

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    if (!token) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
