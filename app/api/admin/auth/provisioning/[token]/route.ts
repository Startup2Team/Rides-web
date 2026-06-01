import { NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";
import type { ApiEnvelope } from "@/lib/api-envelope";

type RouteCtx = { params: Promise<{ token: string }> };

// GET /api/admin/auth/provisioning/[token]
// challenge_token here IS the access_token (issued on login when 2FA not set up yet).
// We use it as a Bearer token to fetch the real TOTP setup data from the backend.
export async function GET(_request: Request, ctx: RouteCtx) {
  const { token } = await ctx.params;
  if (!token) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Missing token" } }, { status: 400 });
  }

  const url = `${getBackendOrigin()}/api/v1/admin/account/2fa/setup`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  let envelope: ApiEnvelope<{ secret?: string; otpauth_url?: string }> = {};
  try {
    envelope = await res.json();
  } catch {
    envelope = {};
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "UNAUTHORIZED", message: "Invalid or expired challenge" } },
      { status: res.status },
    );
  }

  const d = envelope.data;
  return NextResponse.json({
    data: {
      secret: d?.secret ?? "",
      otpauth_url: d?.otpauth_url ?? "",
    },
  });
}
