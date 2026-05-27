import { NextResponse } from "next/server";
import { backendPostLogin } from "../_shared";
import { applyAdminTokenCookies } from "../set-token-cookies";

export async function POST(request: Request) {
  let challenge_token = "";
  let totp_code = "";
  try {
    const body = (await request.json()) as { challenge_token?: string; totp_code?: string };
    challenge_token =
      typeof body.challenge_token === "string" ? body.challenge_token.trim() : "";
    totp_code = typeof body.totp_code === "string" ? body.totp_code.replace(/\D/g, "").trim() : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  const { res, envelope } = await backendPostLogin("/verify-totp", {
    challenge_token,
    totp_code,
  });

  if (!res.ok || !envelope.data) {
    return NextResponse.json(
      {
        error: envelope.error ?? { code: "UNAUTHORIZED", message: "Invalid verification code" },
      },
      { status: res.status || 401 },
    );
  }

  const data = envelope.data;
  const access = data.access_token;
  const refresh = data.refresh_token;

  if (data.status !== "success" || !access || !refresh) {
    return NextResponse.json(
      {
        error: { code: "BAD_REQUEST", message: "Incomplete auth response from server" },
      },
      { status: 502 },
    );
  }

  const response = NextResponse.json(
    {
      data: {
        status: data.status,
        email: data.email,
        full_name: data.full_name,
        admin_role: data.admin_role,
        permissions: data.permissions ?? [],
      },
    },
    { status: 200 },
  );

  applyAdminTokenCookies(response, access, refresh);
  return response;
}
