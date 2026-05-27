import type { LoginResult } from "./types";
import { adminAuthUrl, getBackendOrigin } from "@/lib/admin-backend-url";
import type { ApiEnvelope } from "@/lib/api-envelope";

export async function backendPostLogin(
  pathname: "/login" | "/verify-totp" | "/enable-totp",
  body: Record<string, string>,
): Promise<{ res: Response; envelope: ApiEnvelope<LoginResult> }> {
  const res = await fetch(adminAuthUrl(pathname), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let envelope: ApiEnvelope<LoginResult> = {};
  try {
    envelope = (await res.json()) as ApiEnvelope<LoginResult>;
  } catch {
    envelope = {};
  }

  return { res, envelope };
}

export async function backendGetProvisioning(
  challengeToken: string,
): Promise<{ res: Response; envelope: ApiEnvelope<Record<string, unknown>> }> {
  const encoded = encodeURIComponent(challengeToken);
  const url = `${getBackendOrigin()}/api/v1/admin/auth/challenge/${encoded}/provisioning`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  let envelope: ApiEnvelope<Record<string, unknown>> = {};
  try {
    envelope = (await res.json()) as ApiEnvelope<Record<string, unknown>>;
  } catch {
    envelope = {};
  }
  return { res, envelope };
}
