import { NextResponse } from "next/server";
import { adminAuthUrl } from "@/lib/admin-backend-url";
import type { ApiEnvelope } from "@/lib/api-envelope";

// POST /api/admin/auth/forgot-password
// Requests a one-time password reset code be emailed to the given address.
// Always proxies the backend's response as-is — the backend is expected to
// return a generic "sent" status regardless of whether the email exists, so
// this route never reveals account existence either.
export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = typeof body.email === "string" ? body.email.trim() : "";
  } catch {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Invalid JSON body" } }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Email is required" } }, { status: 400 });
  }

  const res = await fetch(adminAuthUrl("/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
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
      { error: envelope.error ?? { code: "SERVER_ERROR", message: "Could not send reset code." } },
      { status: res.status },
    );
  }

  return NextResponse.json({ data: { status: "sent" } });
}
