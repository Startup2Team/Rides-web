export type ApiEnvelope<T> = {
  data?: T;
  error?: { code: string; message: string };
};

export function readErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const e = (body as ApiEnvelope<unknown>).error;
    if (e?.message) return e.message;
  }
  return "Request failed";
}
