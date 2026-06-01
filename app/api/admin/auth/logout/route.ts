import { NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  cookieBaseOptions,
} from "@/lib/admin-session";

/** Clear auth cookies (e.g. topbar logout later). */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  const base = cookieBaseOptions();
  res.cookies.set(ADMIN_ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(ADMIN_REFRESH_COOKIE, "", { ...base, maxAge: 0 });
  return res;
}
