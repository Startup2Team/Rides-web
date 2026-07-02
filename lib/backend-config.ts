/** True when the admin UI should call the Go API (default in local dev). */
export const hasBackend = Boolean(process.env.NEXT_PUBLIC_API_URL);

/**
 * Optional explicit mock mode for demos without an API.
 * Set NEXT_PUBLIC_DEV_MOCKS=true only when NEXT_PUBLIC_API_URL is unset.
 */
export const useDevMocks =
  !hasBackend && process.env.NEXT_PUBLIC_DEV_MOCKS === "true";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
