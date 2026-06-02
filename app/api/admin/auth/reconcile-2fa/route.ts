import { NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";
import type { ApiEnvelope } from "@/lib/api-envelope";

// POST /api/admin/auth/reconcile-2fa
// When login sent the user to 2FA setup but the account already has 2FA,
// exchange the interim access_token for a pre_auth_token and continue on verify step.
export async function POST(request: Request) {
  let challenge_token = "";
  try {
    const body = (await request.json()) as { challenge_token?: string };
    challenge_token = typeof body.challenge_token === "string" ? body.challenge_token.trim() : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  if (!challenge_token) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "challenge_token is required" } },
      { status: 400 },
    );
  }

  const res = await fetch(`${getBackendOrigin()}/api/v1/admin/auth/2fa/reissue`, {
    method: "POST",
    headers: { Authorization: `Bearer ${challenge_token}` },
    cache: "no-store",
  });

  let envelope: ApiEnvelope<{ pre_auth_token?: string }> = {};
  try {
    envelope = await res.json();
  } catch {
    envelope = {};
  }

  if (!res.ok || !envelope.data?.pre_auth_token) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "SERVER_ERROR", message: "Could not start 2FA verification" } },
      { status: res.status || 500 },
    );
  }

  return NextResponse.json({
    data: {
      status: "totp_required",
      challenge_token: envelope.data.pre_auth_token,
    },
  });
}
