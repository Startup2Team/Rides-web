/**
 * Shared "the admin is still here" signal.
 *
 * Deliberately its own module with no "use client" directive: both the renewal
 * hook (a client component) and the API client import it, and lib/api.ts must
 * stay importable from server code. Putting this in the hook file would drag a
 * client-only module into every server component that touches the API client.
 */

let lastActivityAt = Date.now();

/**
 * Records that the admin is still working.
 *
 * Called by the renewal hook's input listeners AND by the API client on every
 * accepted backend call. Input alone was not enough: reading a page — reviewing
 * driver documents, watching the live map — fires no pointer or key events, so
 * a working admin was declared idle and signed out mid-task.
 *
 * Gated on document visibility so a forgotten background tab polling on a timer
 * cannot hold a session open indefinitely, which is the entire point of an idle
 * timeout. A visible but abandoned screen remains bounded by
 * JWT_ADMIN_SESSION_MAX_HOURS.
 */
export function markSessionActivity(): void {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  lastActivityAt = Date.now();
}

export function millisSinceLastActivity(): number {
  return Date.now() - lastActivityAt;
}
