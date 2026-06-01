import { NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";

// POST /api/admin/auth/reset-totp
// Used during the login flow (totp_verify step) to re-enroll an authenticator.
// challenge_token IS the pre-auth access_token (Bearer) for this admin.
// Calls POST /api/v1/admin/auth/totp/reset on the backend.
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

  const res = await fetch(`${getBackendOrigin()}/api/v1/admin/auth/totp/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${challenge_token}`,
    },
    body: JSON.stringify({ code: totp_code }),
    cache: "no-store",
  });

  let envelope: { data?: { secret?: string; qr_code_url?: string; backup_codes?: string[] }; error?: { code?: string; message?: string } } = {};
  try {
    envelope = await res.json();
  } catch {
    envelope = {};
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "UNAUTHORIZED", message: "Invalid TOTP code" } },
      { status: res.status || 400 },
    );
  }

  return NextResponse.json({ data: envelope.data });
}
