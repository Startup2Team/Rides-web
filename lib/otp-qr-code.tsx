"use client";

import { useEffect, useState } from "react";

type QRCodeFactory = (
  typeNumber: number,
  errorCorrectionLevel: "L" | "M" | "Q" | "H",
) => {
  addData(s: string): void;
  make(): void;
  createSvgTag(cellSize?: number, margin?: number): string;
};

type QrModule =
  | QRCodeFactory
  | {
      default: QRCodeFactory;
    };

function getFactory(mod: unknown): QRCodeFactory {
  if (typeof mod === "function") return mod as QRCodeFactory;
  if (
    mod &&
    typeof mod === "object" &&
    "default" in mod &&
    typeof (mod as { default: unknown }).default === "function"
  ) {
    return (mod as { default: QRCodeFactory }).default;
  }
  throw new Error("Invalid qrcode-generator module shape");
}

/**
 * Renders a TOTP provisioning URI as an SVG (no third-party image host; no react-qr-code peer issues).
 */
export function OtpQrCode({ value }: { value: string }) {
  const [svg, setSvg] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setSvg("");
      setErr(null);
      return;
    }

    let cancelled = false;
    setErr(null);

    void import("qrcode-generator")
      .then((mod) => {
        const qrcode = getFactory(mod as QrModule);
        const qr = qrcode(0, "H");
        qr.addData(value);
        qr.make();
        const markup = qr.createSvgTag(4, 4);
        if (!cancelled) setSvg(markup);
      })
      .catch(() => {
        if (!cancelled) {
          setErr("Could not render QR code.");
          setSvg("");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  if (err) {
    return <p className="text-center text-xs text-red-600">{err}</p>;
  }

  if (!svg) {
    return <span className="text-xs text-muted-foreground">Generating QR…</span>;
  }

  return (
    <div
      className="flex h-[168px] w-[168px] items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:block"
      // Safe: SVG is generated locally from the otpauth URL string only.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
