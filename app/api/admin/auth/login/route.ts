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
  //   { pre_auth_token, two_factor_required: true }  — 2FA enabled → need verification
  //   { access_token,   two_factor_required: false } — 2FA not enabled → already signed in
  if (data.two_factor_required === true && data.pre_auth_token) {
    return NextResponse.json({
      data: { status: "totp_required", challenge_token: data.pre_auth_token },
    });
  }

  // 2FA is OPTIONAL: when it's not enabled the backend already returns a valid
  // access_token, so just sign the admin in. They can enable 2FA later from
  // their account settings. (We no longer force enrollment at login.)
  if (data.two_factor_required === false && data.access_token) {
    const response = NextResponse.json({ data: { status: "success" } });
    applyAdminTokenCookies(response, data.access_token);
    return response;
  }

  return NextResponse.json({ error: { code: "SERVER_ERROR", message: "Unexpected login response" } }, { status: 502 });
}
