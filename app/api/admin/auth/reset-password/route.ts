import { NextResponse } from "next/server";
import { adminAuthUrl } from "@/lib/admin-backend-url";
import type { ApiEnvelope } from "@/lib/api-envelope";

// POST /api/admin/auth/reset-password
// Finalizes a password reset using the reset_token issued by
// /verify-reset-otp. On success the user is sent back to sign in with their
// new password (2FA is mandatory in this app, so we don't auto-sign-in here).
export async function POST(request: Request) {
  let reset_token = "";
  let new_password = "";
  try {
    const body = (await request.json()) as { reset_token?: string; new_password?: string };
    reset_token = typeof body.reset_token === "string" ? body.reset_token.trim() : "";
    new_password = typeof body.new_password === "string" ? body.new_password : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  if (!reset_token || new_password.length < 8) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "A valid reset session and an 8+ character password are required" } },
      { status: 400 },
    );
  }

  const res = await fetch(adminAuthUrl("/reset-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reset_token, new_password }),
    cache: "no-store",
  });

  let envelope: ApiEnvelope<{ status?: string }> = {};
  try {
    envelope = (await res.json()) as ApiEnvelope<{ status?: string }>;
  } catch {
    envelope = {};
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "SERVER_ERROR", message: "Could not reset password." } },
      { status: res.status },
    );
  }

  return NextResponse.json({ data: { status: "success" } });
}
