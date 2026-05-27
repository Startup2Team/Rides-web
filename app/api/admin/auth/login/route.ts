import { NextResponse } from "next/server";
import { backendPostLogin } from "../_shared";
import type { LoginResult } from "../types";

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

  const { res, envelope } = await backendPostLogin("/login", { email, password });

  const data = envelope.data;

  const safe: Partial<LoginResult> = {};
  if (data) {
    safe.status = data.status;
    safe.challenge_token = data.challenge_token;
    safe.email = data.email;
    safe.full_name = data.full_name;
    safe.admin_role = data.admin_role;
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "UNAUTHORIZED", message: "Sign in failed" } },
      { status: res.status },
    );
  }

  return NextResponse.json({ data: safe }, { status: 200 });
}
