"use client";

import QRCodeLib from "qrcode";
import { useEffect, useRef } from "react";

export function QRCode({ seed, size = 160 }: { seed: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !seed) return;
    QRCodeLib.toCanvas(canvasRef.current, seed, {
      width: size,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  }, [seed, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
