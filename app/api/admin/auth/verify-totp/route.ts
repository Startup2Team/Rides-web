import { NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";
import { applyAdminTokenCookies } from "../set-token-cookies";
import type { ApiEnvelope } from "@/lib/api-envelope";

type BackendVerifyData = { access_token?: string };

export async function POST(request: Request) {
  let challenge_token = "";
  let totp_code = "";
  try {
    const body = (await request.json()) as { challenge_token?: string; totp_code?: string };
    challenge_token = typeof body.challenge_token === "string" ? body.challenge_token.trim() : "";
    totp_code = typeof body.totp_code === "string" ? body.totp_code.replace(/\D/g, "").trim() : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  if (!challenge_token || !totp_code) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "challenge_token and totp_code are required" } }, { status: 400 });
  }

  // Backend endpoint: POST /api/v1/admin/auth/2fa/verify
  const url = `${getBackendOrigin()}/api/v1/admin/auth/2fa/verify`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pre_auth_token: challenge_token, code: totp_code }),
    cache: "no-store",
  });

  let envelope: ApiEnvelope<BackendVerifyData> = {};
  try {
    envelope = await res.json();
  } catch {
    envelope = {};
  }

  if (!res.ok || !envelope.data?.access_token) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "UNAUTHORIZED", message: "Invalid verification code" } },
      { status: res.status || 401 },
    );
  }

  const access = envelope.data.access_token;
  const response = NextResponse.json({ data: { status: "success" } });
  applyAdminTokenCookies(response, access);
  return response;
}
