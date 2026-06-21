import { NextResponse } from "next/server";
import { adminAuthUrl } from "@/lib/admin-backend-url";
import { applyAdminTokenCookies } from "../set-token-cookies";
import type { ApiEnvelope } from "@/lib/api-envelope";

type BackendLoginData = {
  access_token?: string;
  pre_auth_token?: string;
  two_factor_required?: boolean;
};

export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    email = typeof body.email === "string" ? body.email.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  const res = await fetch(adminAuthUrl("/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  let envelope: ApiEnvelope<BackendLoginData> = {};
  try {
    envelope = (await res.json()) as ApiEnvelope<BackendLoginData>;
  } catch {
    envelope = {};
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "UNAUTHORIZED", message: "Sign in failed" } },
      { status: res.status },
    );
  }

  const data = envelope.data;
  if (!data) {
    return NextResponse.json({ error: { code: "SERVER_ERROR", message: "Empty response from server" } }, { status: 502 });
  }

  // Backend returns either:
  //   { access_token, two_factor_required: false }  — 2FA not set up yet → force setup
  //   { pre_auth_token, two_factor_required: true }  — 2FA exists → need verification
  if (data.two_factor_required === true && data.pre_auth_token) {
    return NextResponse.json({
      data: { status: "totp_required", challenge_token: data.pre_auth_token },
    });
  }

  if (data.two_factor_required === false && data.access_token) {
    // Dev: the backend skips 2FA and authenticates directly. Log straight in by
    // setting the session cookie — don't force the (production-only) 2FA
    // enrollment that would otherwise gate every dev login.
    if (process.env.NODE_ENV !== "production") {
      const response = NextResponse.json({ data: { status: "success" } });
      applyAdminTokenCookies(response, data.access_token);
      return response;
    }
    return NextResponse.json({
      data: { status: "totp_setup_required", challenge_token: data.access_token },
    });
  }

  return NextResponse.json({ error: { code: "SERVER_ERROR", message: "Unexpected login response" } }, { status: 502 });
}
