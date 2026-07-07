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

  // 2FA is MANDATORY. A 2FA-off admin gets an access_token; in production we
  // force them into 2FA setup (QR + setup key) before the dashboard. Dev skips
  // the wall so testing isn't gated behind an authenticator.
  if (data.access_token) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({
        data: { status: "totp_setup_required", challenge_token: data.access_token },
      });
    }
    const response = NextResponse.json({ data: { status: "success" } });
    applyAdminTokenCookies(response, data.access_token);
    return response;
  }

  // A 2FA-on admin gets a pre-auth token → show the verify-code screen.
  if (data.two_factor_required === true && data.pre_auth_token) {
    return NextResponse.json({
      data: { status: "totp_required", challenge_token: data.pre_auth_token },
    });
  }

  return NextResponse.json({ error: { code: "SERVER_ERROR", message: "Unexpected login response" } }, { status: 502 });
}
