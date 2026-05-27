import { NextResponse } from "next/server";
import { backendGetProvisioning } from "../../_shared";

type RouteCtx = { params: Promise<{ token: string }> };

export async function GET(_request: Request, ctx: RouteCtx) {
  const { token } = await ctx.params;
  if (!token) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: "Missing token" } }, { status: 400 });
  }

  const { res, envelope } = await backendGetProvisioning(token);

  if (!res.ok) {
    return NextResponse.json(
      { error: envelope.error ?? { code: "UNAUTHORIZED", message: "Invalid or expired challenge" } },
      { status: res.status },
    );
  }

  const d = envelope.data;
  const data = {
    email: typeof d?.email === "string" ? d.email : undefined,
    full_name: typeof d?.full_name === "string" ? d.full_name : undefined,
    admin_role: typeof d?.admin_role === "string" ? d.admin_role : undefined,
    secret: typeof d?.secret === "string" ? d.secret : undefined,
    otpauth_url: typeof d?.otpauth_url === "string" ? d.otpauth_url : undefined,
  };

  return NextResponse.json({ data }, { status: 200 });
}
