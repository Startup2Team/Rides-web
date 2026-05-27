/**
 * Origin of the Go API (no path), e.g. http://localhost:8080
 */
export function getBackendOrigin(): string {
  const u = process.env.BACKEND_ORIGIN?.trim();
  if (u) return u.replace(/\/$/, "");
  return "http://localhost:8080";
}

export function adminAuthUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendOrigin()}/api/v1/admin/auth${p}`;
}
