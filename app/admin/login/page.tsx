import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RidesLogo } from "../../components/rides-logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

function BrandMark({ inverse: _inverse = false }: { inverse?: boolean }) {
  return <RidesLogo size={80} priority className="shrink-0" />;
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-primary via-primary to-[#0056B3] p-10 text-white lg:flex xl:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-black/15 blur-3xl"
        />
        <svg
          viewBox="0 0 320 320"
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -right-28 h-[26rem] w-[26rem] text-white opacity-[0.18]"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <ellipse
              key={i}
              cx="160"
              cy="160"
              rx="140"
              ry="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              transform={`rotate(${i * 7.5} 160 160)`}
            />
          ))}
        </svg>

        <Link href="/" className="relative inline-flex items-center gap-2.5">
          <BrandMark inverse />
          <span className="text-base font-semibold tracking-[-0.02em] text-white">
            Rides
          </span>
        </Link>

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="max-w-md">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              <span className="h-px w-8 bg-white/60" />
              Admin Console
            </p>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white xl:text-5xl">
              Operate Rides with confidence.
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-white/85 xl:text-lg">
              Real-time visibility into rides, drivers, and demand zones — all
              in one place.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/60">
          <span>Built for the future of mobility in Africa.</span>
          <span>© {new Date().getFullYear()} Rides</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 lg:hidden">
            <BrandMark />
            <span className="text-base font-semibold tracking-[-0.02em] text-foreground">
              Rides
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
