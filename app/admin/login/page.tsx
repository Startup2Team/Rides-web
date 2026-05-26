import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-lg ${
        inverse
          ? "bg-white text-primary shadow-black/20 ring-1 ring-inset ring-black/5"
          : "bg-gradient-to-br from-primary to-[#00A040] text-primary-foreground shadow-primary/30 ring-1 ring-inset ring-white/15"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M4 4.5h16v4h-6V20h-4V8.5H4z" />
        <circle cx="20" cy="20" r="2" />
      </svg>
    </span>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-primary via-primary to-[#00A040] p-10 text-white lg:flex xl:p-14">
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
            Taravelis
          </span>
        </Link>

        <div className="relative flex flex-1 flex-col justify-center">
          <div className="max-w-md">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              <span className="h-px w-8 bg-white/60" />
              Admin Console
            </p>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white xl:text-5xl">
              Operate Taravelis with confidence.
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-white/85 xl:text-lg">
              Real-time visibility into rides, drivers, and demand zones — all
              in one place.
            </p>
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/60">
          <span>Built for the future of mobility in Africa.</span>
          <span>© {new Date().getFullYear()} Taravelis</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 lg:hidden">
            <BrandMark />
            <span className="text-base font-semibold tracking-[-0.02em] text-foreground">
              Taravelis
            </span>
          </div>

          <h1 className="mt-10 text-3xl font-bold tracking-[-0.02em] text-foreground lg:mt-0">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back. Please enter your credentials to continue.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
