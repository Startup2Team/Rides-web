import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

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

      <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25 ring-1 ring-black/5">
                <Image
                  src="/ridelogo-white.png"
                  alt=""
                  width={64}
                  height={64}
                  priority
                  className="h-7 w-7"
                  aria-hidden
                />
              </span>
              <p className="text-2xl font-extrabold leading-none tracking-[-0.03em] text-foreground">
                Rides<span className="text-primary">.rw</span>
              </p>
            </div>

            <Link
              href="/"
              aria-label="Back to Rides.rw home"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-card p-8 shadow-sm shadow-black/[0.02] sm:p-10">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-[10px] text-muted-foreground/70">
            © {new Date().getFullYear()} Rides.rw
          </p>
        </div>
      </div>
    </div>
  );
}
