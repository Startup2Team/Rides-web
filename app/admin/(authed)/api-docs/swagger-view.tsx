"use client";

import { useEffect, useRef, useState } from "react";

const CSS_URL = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
const JS_URL = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";

// Renders Swagger UI (loaded from the CDN) against the session-gated spec proxy.
export function SwaggerView() {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document.getElementById("swagger-ui-css")) {
      const link = document.createElement("link");
      link.id = "swagger-ui-css";
      link.rel = "stylesheet";
      link.href = CSS_URL;
      document.head.appendChild(link);
    }

    const init = () => {
      const SwaggerUIBundle = (window as unknown as { SwaggerUIBundle?: unknown })
        .SwaggerUIBundle as ((opts: Record<string, unknown>) => void) | undefined;
      if (!SwaggerUIBundle || !ref.current) {
        setError("Failed to load the API docs viewer.");
        return;
      }
      SwaggerUIBundle({
        url: "/api/admin/api-docs/spec",
        domNode: ref.current,
        deepLinking: true,
        docExpansion: "none",
        defaultModelsExpandDepth: 0,
      });
    };

    const existing = document.getElementById("swagger-ui-bundle") as HTMLScriptElement | null;
    if (existing) {
      init();
      return;
    }
    const script = document.createElement("script");
    script.id = "swagger-ui-bundle";
    script.src = JS_URL;
    script.crossOrigin = "anonymous";
    script.onload = init;
    script.onerror = () => setError("Could not load Swagger UI from the CDN.");
    document.body.appendChild(script);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-white p-2">
      {error ? (
        <p className="p-4 text-sm text-red-600">{error}</p>
      ) : (
        <div ref={ref} />
      )}
    </div>
  );
}
