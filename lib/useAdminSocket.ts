"use client";

import { useEffect } from "react";

export type AdminSocketEvent = {
  type: string;
  payload: Record<string, unknown>;
};

export function useAdminSocket(onEvent?: (event: AdminSocketEvent) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";
    const wsUrl = rawBaseUrl.replace(/^http/, "ws") + "/ws/admin";

    let socket: WebSocket | null = null;
    let isComponentMounted = true;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    function connect() {
      if (!isComponentMounted) return;
      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("[ADMIN:WS] ⚡ Connected to Web Admin WebSocket stream!");
        };

        socket.onmessage = (msg) => {
          try {
            const data: AdminSocketEvent = JSON.parse(msg.data);
            if (data && onEvent) {
              onEvent(data);
            }
          } catch (e) {
            console.warn("[ADMIN:WS] Failed to parse message:", e);
          }
        };

        socket.onclose = () => {
          if (isComponentMounted) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        socket.onerror = (err) => {
          console.warn("[ADMIN:WS] Socket error:", err);
          if (socket) socket.close();
        };
      } catch (err) {
        console.warn("[ADMIN:WS] Connection failed:", err);
      }
    }

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) {
        socket.close();
      }
    };
  }, [onEvent]);
}
