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
      <div className="relative hidden flex-col overflow-hidden bg-[#1d2dd4] p-12 text-white lg:flex xl:p-16">
        {/* Faint sweeping contour lines — the only decoration */}
        <svg
          viewBox="0 0 800 800"
          preserveAspectRatio="none"
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.09]"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M -100 250 Q 200 -50 500 100 T 1000 200" />
            <path d="M -100 330 Q 220 30 520 180 T 1000 280" />
            <path d="M -100 420 Q 240 110 540 270 T 1000 370" />
            <path d="M -100 520 Q 260 200 560 360 T 1000 460" />
            <path d="M -100 630 Q 280 300 580 460 T 1000 560" />
            <path d="M -100 750 Q 300 410 600 560 T 1000 660" />
          </g>
        </svg>

        {/* Top cluster — logo + headline read as one composition */}
        <div className="relative">
          <Link
            href="/"
            aria-label="Rides"
            className="inline-block"
          >
            <BrandMark inverse size="large" />
          </Link>

          <h2 className="mt-10 text-balance text-5xl font-bold leading-[1.05] tracking-[-0.025em] text-white xl:mt-12 xl:text-[4rem]">
            Welcome back
          </h2>
        </div>

        {/* Footer pinned to the bottom */}
        <p className="relative mt-auto text-sm text-white/60">
          © {new Date().getFullYear()} Rides. All rights reserved.
        </p>
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
              className="-mb-1.5 h-14 w-14"
              aria-hidden
            />
            <span
              aria-hidden
              className="-ml-2.5 text-[2.75rem] font-bold leading-[0.85] tracking-[-0.06em] text-primary"
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
