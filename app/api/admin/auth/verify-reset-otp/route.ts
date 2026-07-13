import { NextResponse } from "next/server";
import { adminAuthUrl } from "@/lib/admin-backend-url";
import type { ApiEnvelope } from "@/lib/api-envelope";

// POST /api/admin/auth/verify-reset-otp
// Verifies the emailed OTP for a password-reset request and returns a
// short-lived reset_token used by /reset-password to actually set the new
// password. Separating verify from set mirrors the existing
// challenge_token pattern used by the sign-in 2FA flow.
export async function POST(request: Request) {
  let email = "";
  let otp_code = "";
  try {
    const body = (await request.json()) as { email?: string; otp_code?: string };
    email = typeof body.email === "string" ? body.email.trim() : "";
    otp_code = typeof body.otp_code === "string" ? body.otp_code.replace(/\D/g, "").trim() : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  if (!email || otp_code.length !== 6) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Email and 6-digit code are required" } },
      { status: 400 },
    );
  }

  const res = await fetch(adminAuthUrl("/verify-reset-otp"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code }),
    cache: "no-store",
  });

  let envelope: ApiEnvelope<{ reset_token?: string }> = {};
  try {
    envelope = (await res.json()) as ApiEnvelope<{ reset_token?: string }>;
  } catch {
    envelope = {};
  }

  if (!res.ok || !envelope.data?.reset_token) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "INVALID_CODE", message: "That code is incorrect or expired." } },
      { status: res.status || 400 },
    );
  }

  return NextResponse.json({ data: { reset_token: envelope.data.reset_token } });
}
