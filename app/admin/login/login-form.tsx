"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const SETUP_KEY = "taravelis-admin-2fa-setup";

type Step = "credentials" | "setup" | "verify";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// Deterministic 25×25 grid that looks like a QR code, seeded from `seed`.
function QRCode({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    const size = 25;
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const rand = () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
      h = (h ^ (h >>> 16)) >>> 0;
      return h / 4294967295;
    };

    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => rand() > 0.5),
    );

    // Finder patterns at three corners (7×7 with inner border).
    const drawFinder = (sx: number, sy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const onEdge = x === 0 || x === 6 || y === 0 || y === 6;
          const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[sy + y][sx + x] = onEdge || center;
        }
      }
      // Clear the 1-cell border around the finder pattern.
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          if ((x === -1 || x === 7 || y === -1 || y === 7) &&
              sx + x >= 0 && sx + x < size && sy + y >= 0 && sy + y < size) {
            grid[sy + y][sx + x] = false;
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    return grid;
  }, [seed]);

  return (
    <svg viewBox="0 0 25 25" className="h-44 w-44" shapeRendering="crispEdges" aria-hidden>
      <rect width="25" height="25" fill="white" />
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null,
        ),
      )}
    </svg>
  );
}

function generateSecret(seed: string) {
  // 32-char base32 secret, deterministic from seed.
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i);
  let out = "";
  for (let i = 0; i < 32; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    out += alphabet[h % alphabet.length];
  }
  return out.match(/.{1,4}/g)?.join(" ") ?? out;
}

function generateBackupCodes(seed: string) {
  let h = 1;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const a = (h % 100000).toString().padStart(5, "0");
    h = (h * 1664525 + 1013904223) >>> 0;
    const b = (h % 100000).toString().padStart(5, "0");
    codes.push(`${a}-${b}`);
  }
  return codes;
}

function CodeBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  return (
    <div className="flex items-center justify-between gap-1.5">
      {value.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={v}
          disabled={disabled}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            const next = [...value];
            next[i] = digit;
            onChange(next);
            if (digit && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && i > 0) {
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!text) return;
            e.preventDefault();
            const next = value.map((_, idx) => text[idx] ?? "");
            onChange(next);
            const lastIdx = Math.min(text.length, 6) - 1;
            refs.current[lastIdx]?.focus();
          }}
          className="h-12 w-10 rounded-lg border border-border bg-surface text-center text-lg font-bold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 sm:w-12"
        />
      ))}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [usingBackup, setUsingBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"secret" | "codes" | null>(null);

  const accountSeed = email || "demo@taravelis.com";
  const secret = useMemo(() => generateSecret(accountSeed), [accountSeed]);
  const otpAuth = `otpauth://totp/Taravelis:${encodeURIComponent(accountSeed)}?secret=${secret.replace(/\s/g, "")}&issuer=Taravelis`;
  const backupCodes = useMemo(() => generateBackupCodes(accountSeed), [accountSeed]);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(null), 1500);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const fullCode = code.join("");
  const codeReady = usingBackup ? backupCode.replace(/\D/g, "").length >= 10 : fullCode.length === 6;

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter your email to continue.");
    if (!password.trim()) return setError("Enter your password.");
    const setupDone =
      typeof window !== "undefined" && localStorage.getItem(SETUP_KEY) === "true";
    setStep(setupDone ? "verify" : "setup");
    setCode(["", "", "", "", "", ""]);
    setBackupCode("");
    setUsingBackup(false);
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!codeReady) {
      setError(
        usingBackup
          ? "Enter a backup code (e.g. 12345-67890)."
          : "Enter the 6-digit code from your authenticator app.",
      );
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(SETUP_KEY, "true");
    }
    router.push("/admin");
  }

  function copy(value: string, kind: "secret" | "codes") {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => null);
    }
    setCopied(kind);
  }

  function resetTo(step: Step) {
    setStep(step);
    setError(null);
    setCode(["", "", "", "", "", ""]);
    setBackupCode("");
    setUsingBackup(false);
  }

  if (step === "credentials") {
    return (
      <form onSubmit={handleCredentials} className="mt-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Please enter your credentials to continue.
        </p>

        <label className="block pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Email
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@taravelis.com"
            className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Password
            </span>
            <div className="relative mt-2">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block h-11 w-full rounded-xl border border-border bg-surface pl-3.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>
          <div className="mt-2 flex justify-end">
            <a
              href="#"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Continue
        </button>
      </form>
    );
  }

  if (step === "setup") {
    return (
      <form onSubmit={handleVerify} className="mt-8 space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Step 2 of 2 · Set up
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">
            Secure your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a second factor before continuing. Scan the QR code with your
            authenticator app, then enter the 6-digit code to confirm.
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-border bg-surface/40 p-4 sm:grid-cols-[auto,1fr]">
          <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-border">
            <QRCode seed={otpAuth} />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Can't scan?
            </p>
            <div className="rounded-lg border border-border bg-card p-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Setup key
              </p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 break-all font-mono text-[11px] font-semibold text-foreground">
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={() => copy(secret.replace(/\s/g, ""), "secret")}
                  aria-label="Copy secret"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied === "secret" ? (
                <p className="mt-1 text-[10px] font-semibold text-primary">
                  Copied to clipboard
                </p>
              ) : null}
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Works with Google Authenticator, Authy, 1Password, Bitwarden, or
              any TOTP-compatible app.
            </p>
          </div>
        </div>

        <details className="group rounded-xl border border-border bg-surface/40">
          <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold text-foreground">
            <span>Backup codes (save these somewhere safe)</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className="space-y-2 border-t border-border px-3 py-3">
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-foreground">
              {backupCodes.map((c) => (
                <code
                  key={c}
                  className="rounded-md bg-card px-2 py-1 ring-1 ring-border"
                >
                  {c}
                </code>
              ))}
            </div>
            <button
              type="button"
              onClick={() => copy(backupCodes.join("\n"), "codes")}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-[11px] font-medium text-foreground transition-colors hover:bg-surface"
            >
              <CopyIcon className="h-3 w-3" />
              {copied === "codes" ? "Copied" : "Copy all"}
            </button>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Each backup code works once if you lose access to your
              authenticator app.
            </p>
          </div>
        </details>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Enter 6-digit code
          </p>
          <div className="mt-2">
            <CodeBoxes value={code} onChange={setCode} />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!codeReady}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Verify & enter dashboard
        </button>

        <button
          type="button"
          onClick={() => resetTo("credentials")}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Back to sign in
        </button>
      </form>
    );
  }

  // step === "verify"
  return (
    <form onSubmit={handleVerify} className="mt-8 space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
          Step 2 of 2
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">
          Two-factor authentication
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {usingBackup
            ? "Enter one of your 10-digit backup codes."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 p-4">
        {usingBackup ? (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Backup code
            </span>
            <input
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              placeholder="12345-67890"
              className="mt-2 block h-12 w-full rounded-xl border border-border bg-card px-3.5 text-center font-mono text-lg tracking-wider text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Authenticator code
            </p>
            <div className="mt-3">
              <CodeBoxes value={code} onChange={setCode} />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            setUsingBackup((v) => !v);
            setError(null);
            setCode(["", "", "", "", "", ""]);
            setBackupCode("");
          }}
          className="mt-3 text-[11px] font-semibold text-primary transition-colors hover:underline"
        >
          {usingBackup
            ? "Use authenticator app instead"
            : "Use a backup code instead"}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!codeReady}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Verify & continue
      </button>

      <button
        type="button"
        onClick={() => resetTo("credentials")}
        className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        ← Back to sign in
      </button>
    </form>
  );
}
