"use client";

import { useEffect, useRef } from "react";

/** Renew at most this often, however much the admin clicks. */
const MIN_RENEW_INTERVAL_MS = 5 * 60_000;
/** Activity within this window counts as "still here" for the periodic check. */
const ACTIVE_WINDOW_MS = 10 * 60_000;
/** How often to consider renewing. */
const CHECK_INTERVAL_MS = 60_000;

/**
 * Keeps an active admin signed in.
 *
 * The backend session is an idle timeout (JWT_ADMIN_IDLE_MINUTES, 60 by default).
 * This hook renews it while there is real activity, so a working admin is never
 * bounced to the login screen mid-task, while an abandoned tab still expires.
 *
 * Deliberately does NOT renew on a timer alone — that would keep a session alive
 * forever on a forgotten monitor, which is the opposite of an idle timeout.
 */
export function useSessionRenewal(enabled: boolean) {
  const lastActivityRef = useRef(Date.now());
  const lastRenewRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events: (keyof DocumentEventMap)[] = [
      "pointerdown",
      "keydown",
      "wheel",
      "touchstart",
    ];
    events.forEach(e => document.addEventListener(e, markActivity, { passive: true }));

    const renewIfNeeded = () => {
      const now = Date.now();
      const activeRecently = now - lastActivityRef.current < ACTIVE_WINDOW_MS;
      const dueForRenewal = now - lastRenewRef.current > MIN_RENEW_INTERVAL_MS;
      if (!activeRecently || !dueForRenewal) return;

      lastRenewRef.current = now;
      void fetch("/api/admin/auth/renew", { method: "POST" }).catch(() => {
        // A failed renewal is not fatal: the existing token is still valid until
        // it expires, and the next request will redirect to login if it isn't.
      });
    };

    const interval = setInterval(renewIfNeeded, CHECK_INTERVAL_MS);

    // Coming back to the tab after a while is the moment a stale token bites.
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        markActivity();
        renewIfNeeded();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      events.forEach(e => document.removeEventListener(e, markActivity));
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, [enabled]);
}
