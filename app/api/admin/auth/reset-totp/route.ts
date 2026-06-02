import { NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";

// POST /api/admin/auth/reset-totp
// Used during the login flow (totp_verify step) to re-enroll an authenticator.
// challenge_token IS the pre_auth_token from login — sent in the body, not as a session JWT.
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

  if (!challenge_token) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "challenge_token is required" } },
      { status: 400 },
    );
  }

  const res = await fetch(`${getBackendOrigin()}/api/v1/admin/auth/totp/reset-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pre_auth_token: challenge_token, code: totp_code }),
    cache: "no-store",
  });

  let envelope: { data?: { secret?: string; qr_code_url?: string; backup_codes?: string[] }; error?: { code?: string; message?: string } } = {};
  try {
    envelope = await res.json();
  } catch {
    envelope = {};
  }

  if (!res.ok) {
    const fallback =
      envelope.error?.code === "TOKEN_EXPIRED" || envelope.error?.code === "INVALID_PRE_AUTH_TOKEN"
        ? { code: envelope.error.code, message: "Sign-in session expired. Go back and sign in again." }
        : { code: "UNAUTHORIZED", message: "Invalid TOTP code" };
    return NextResponse.json(
      { error: envelope.error ?? fallback },
      { status: res.status || 400 },
    );
  }

  return NextResponse.json({ data: envelope.data });
}
