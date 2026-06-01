import { NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";
import { applyAdminTokenCookies } from "../set-token-cookies";
import type { ApiEnvelope } from "@/lib/api-envelope";

// POST /api/admin/auth/enable-totp
// challenge_token IS the access_token issued on login (when 2FA not yet set up).
// Flow:
//   1. Fetch the TOTP secret from backend (GET /account/2fa/setup)
//   2. Enable 2FA with the verified code   (POST /account/2fa/enable)
//   3. Set the access_token cookie so the user is logged in
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

  const base = getBackendOrigin();

  // Step 1: get the pending TOTP secret for this admin
  const setupRes = await fetch(`${base}/api/v1/admin/account/2fa/setup`, {
    headers: { Authorization: `Bearer ${challenge_token}` },
    cache: "no-store",
  });

  let setupEnvelope: ApiEnvelope<{ secret?: string }> = {};
  try { setupEnvelope = await setupRes.json(); } catch { setupEnvelope = {}; }

  if (!setupRes.ok || !setupEnvelope.data?.secret) {
    return NextResponse.json(
      { error: setupEnvelope.error ?? { code: "SERVER_ERROR", message: "Could not load 2FA setup" } },
      { status: setupRes.status || 500 },
    );
  }

  const secret = setupEnvelope.data.secret;

  // Step 2: enable 2FA with the user-entered TOTP code
  const enableRes = await fetch(`${base}/api/v1/admin/account/2fa/enable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${challenge_token}`,
    },
    body: JSON.stringify({ secret, code: totp_code }),
    cache: "no-store",
  });

  let enableEnvelope: ApiEnvelope<{ two_factor_enabled?: boolean; backup_codes?: string[] }> = {};
  try { enableEnvelope = await enableRes.json(); } catch { enableEnvelope = {}; }

  if (!enableRes.ok) {
    return NextResponse.json(
      { error: enableEnvelope.error ?? { code: "BAD_REQUEST", message: "Invalid TOTP code" } },
      { status: enableRes.status || 400 },
    );
  }

  const backup_codes = enableEnvelope.data?.backup_codes ?? [];

  // 2FA enabled — set the access_token cookie and return backup codes
  const response = NextResponse.json({
    data: {
      status: "success",
      backup_codes,
    },
  });

  applyAdminTokenCookies(response, challenge_token);
  return response;
}
