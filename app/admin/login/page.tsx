import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RidesLogo } from "../../components/rides-logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

function BrandMark({
  inverse = false,
  size = "default",
}: {
  inverse?: boolean;
  size?: "default" | "large";
}) {
  if (inverse) {
    return (
      <Image
        src="/ridelogo-white.png"
        alt="Rides"
        width={224}
        height={224}
        priority
        className={`shrink-0 ${size === "large" ? "h-28 w-28" : "h-20 w-20"}`}
      />
    );
  }
  return <RidesLogo size={80} priority className="shrink-0" />;
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-surface-alt border-r border-border lg:flex">
        {/* Soft tinted background glow matching the primary branding */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 55%, rgba(0, 122, 255, 0.08), transparent 70%)",
          }}
        />

        <Image
          src="/images/drivers-fleet-africa.png"
          alt="3D illustration of Africa with Rides vehicles"
          width={520}
          height={520}
          priority
          className="relative h-auto max-h-[80vh] w-full max-w-[520px] object-contain transition-transform duration-700 hover:scale-[1.03]"
        />
      </div>

      <div className="flex items-start justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="w-full max-w-md">
          {/* Mobile brand — splash is hidden on small screens */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <BrandMark />
            <span className="text-base font-semibold tracking-[-0.02em] text-foreground">
              Rides
            </span>
          </div>

          {/* Desktop wordmark — logo R fuses with "ides" as one continuous word */}
          <div className="hidden items-end lg:flex">
            <span className="sr-only">Rides</span>
            <Image
              src="/ridelogo-primary.png"
              alt=""
              width={112}
              height={112}
              priority
              className="-mb-1.5 h-14 w-14 grayscale opacity-60 contrast-[1.1]"
              aria-hidden
            />
            <span
              aria-hidden
              className="-ml-2.5 text-[2.75rem] font-bold leading-[0.85] tracking-[-0.06em] text-muted-foreground"
            >
              ides
            </span>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
