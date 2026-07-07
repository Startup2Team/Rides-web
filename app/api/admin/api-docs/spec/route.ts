import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_ACCESS_COOKIE } from "@/lib/admin-session";
import spec from "@/lib/openapi.json";

// GET /api/admin/api-docs/spec
// Serves the OpenAPI spec to logged-in admins only (gated by the admin session
// cookie), so the API surface is never exposed to the public. The spec is
// bundled with the admin app; refresh lib/openapi.json when the API changes.
export async function GET() {
  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "admin session required" } },
      { status: 401 },
    );
  }
  return NextResponse.json(spec);
}
