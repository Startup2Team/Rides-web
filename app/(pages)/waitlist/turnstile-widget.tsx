"use client";

import Script from "next/script";
import { type Ref, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

// Cloudflare's published always-passing TEST site key — safe to ship as a
// placeholder default. Pacifique swaps in the real site key via this env var
// once the Turnstile widget is provisioned for rides.rw.
const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

type Props = {
  /** Called with the token once solved, and with "" if it expires. */
  onToken: (token: string) => void;
  /** Called once if the widget can't load/render — caller should degrade gracefully. */
  onUnavailable: () => void;
  /** React 19 supports `ref` as a plain prop on function components — no forwardRef needed. */
  ref?: Ref<TurnstileWidgetHandle>;
};

export type TurnstileWidgetHandle = {
  /**
   * Turnstile tokens are single-use — Cloudflare rejects a second submit
   * that reuses one. Call this after every submit attempt (success or
   * failure) so the widget issues a fresh challenge/token.
   */
  reset: () => void;
};

/**
 * Cloudflare Turnstile widget. Loads the script client-side and renders into
 * a container div; if the script fails to load or errors out, calls
 * onUnavailable so the form can proceed without a token instead of blocking
 * submission entirely.
 */
export function TurnstileWidget({ onToken, onUnavailable, ref }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const reactId = useId();
  const containerId = `turnstile-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    if (!scriptReady || unavailable) return;
    const container = containerRef.current;
    if (!container || !window.turnstile) {
      setUnavailable(true);
      onUnavailable();
      return;
    }
    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => {
        setUnavailable(true);
        onUnavailable();
      },
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady, unavailable]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
        // The consumed token is dead either way — clear it out of the
        // caller's state immediately so a resubmit can't reuse it while the
        // widget re-solves.
        onToken("");
      },
    }),
    [onToken],
  );

  if (unavailable) return null;

  return (
    <>
      <Script
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => {
          setUnavailable(true);
          onUnavailable();
        }}
      />
      <div ref={containerRef} id={containerId} />
    </>
  );
}
