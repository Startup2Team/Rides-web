import { NextRequest, NextResponse } from "next/server";
import { getBackendOrigin } from "@/lib/admin-backend-url";

/**
 * Same-origin proxy for driver KYC document images.
 *
 * The backend stores file_urls against its public (ngrok) host, but ngrok's free
 * tier serves an HTML interstitial to browser <img> requests — which can't send
 * the skip header — so rendering those URLs directly fails. This route fetches
 * the object from the backend's real origin (localhost:8080) server-side and
 * streams it back same-origin, so the admin panel renders documents reliably
 * regardless of the tunnel. Constrained to the documents/ prefix.
 *
 * GET /api/admin/document-image?key=documents/<id>.jpg
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")?.trim() ?? "";
  if (!key.startsWith("documents/") || key.includes("..")) {
    return NextResponse.json({ error: "invalid key" }, { status: 400 });
  }

  const upstream = `${getBackendOrigin()}/api/v1/uploads/objects/${key}`;
  let res: Response;
  try {
    res = await fetch(upstream, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "upstream unreachable" }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: "not found" }, { status: res.status });
  }

  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300",
    },
  });
}
