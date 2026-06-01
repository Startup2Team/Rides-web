"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  adminLogin,
  adminVerify2FA,
  adminVerifyBackup,
  enable2FA,
  get2FASetup,
  getAccount,
} from "@/lib/api";
import { setToken, type AdminUser } from "@/lib/auth";
import QRCodeLib from "qrcode";

type Step = "credentials" | "setup" | "verify";

// ── Icons ──────────────────────────────────────────────────────────────────

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

// ── Real scannable QR code from otpauth:// URL ────────────────────────────

function QRCanvas({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !url) return;
    QRCodeLib.toCanvas(ref.current, url, {
      width: 176,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  }, [url]);

  return (
    <canvas
      ref={ref}
      width={176}
      height={176}
      className="rounded-lg"
      aria-label="QR code for authenticator app"
    />
  );
}

function OtpAuthDisplay({ secret, otpauthUrl }: { secret: string; otpauthUrl: string }) {
  const [copied, setCopied] = useState(false);

  function copySecret() {
    navigator.clipboard.writeText(secret).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface/40 p-4">
      <div className="flex gap-4">
        {/* Real scannable QR code */}
        <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-border">
          {otpauthUrl ? <QRCanvas url={otpauthUrl} /> : (
            <span className="text-xs text-muted-foreground">Loading…</span>
          )}
        </div>

        {/* Manual entry fallback */}
        <div className="flex min-w-0 flex-1 flex-col justify-center space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Can't scan? Enter manually
          </p>
          <div className="rounded-lg border border-border bg-card p-2">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Setup key</p>
            <div className="mt-1 flex items-start gap-1.5">
              <code className="flex-1 break-all font-mono text-[11px] font-semibold leading-relaxed text-foreground">
                {secret.match(/.{1,4}/g)?.join(" ") ?? secret}
              </code>
              <button
                type="button"
                onClick={copySecret}
                aria-label="Copy secret"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CopyIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            {copied ? (
              <p className="mt-1 text-[10px] font-semibold text-primary">Copied!</p>
            ) : null}
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Works with Google Authenticator, Authy, 1Password, Bitwarden, or any TOTP app.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── 6-digit code boxes ─────────────────────────────────────────────────────

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
          ref={(el) => { refs.current[i] = el; }}
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
            if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!text) return;
            e.preventDefault();
            const next = value.map((_, idx) => text[idx] ?? "");
            onChange(next);
            refs.current[Math.min(text.length, 6) - 1]?.focus();
          }}
          className="h-12 w-10 rounded-lg border border-border bg-surface text-center text-lg font-bold text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 sm:w-12"
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Credentials step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // In-flight state (held in memory, not persisted)
  const [preAuthToken, setPreAuthToken] = useState("");
  const [pendingAccessToken, setPendingAccessToken] = useState(""); // access_token while setting up 2FA

  // 2FA setup step (real data from backend)
  const [setupSecret, setSetupSecret] = useState("");
  const [setupOtpauthUrl, setSetupOtpauthUrl] = useState("");

  // Verify step
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [usingBackup, setUsingBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  const fullCode = code.join("");
  const codeReady = usingBackup
    ? backupCode.replace(/\D/g, "").length >= 10
    : fullCode.length === 6;

  // Auto-submit once 6 digits are entered. Tracks the last auto-submitted code
  // so a failed submit doesn't loop — the user can edit a digit to retry.
  const lastAutoSubmitRef = useRef("");
  useEffect(() => {
    if (loading || usingBackup || fullCode.length !== 6) return;
    if (lastAutoSubmitRef.current === fullCode) return;
    lastAutoSubmitRef.current = fullCode;
    if (step === "setup") void handleEnableAndFinish();
    else if (step === "verify") void handleVerify();
    // handlers are stable enough; depending on them would re-trigger on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullCode, step, loading, usingBackup]);

  function resetVerifyInputs() {
    setCode(["", "", "", "", "", ""]);
    setBackupCode("");
    setUsingBackup(false);
    setError(null);
    lastAutoSubmitRef.current = "";
  }

  async function finishLogin(accessToken: string) {
    try {
      // pass token directly — not in localStorage yet
      const account = await getAccount(accessToken);
      const user: AdminUser = {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role_name,
        twoFactor: account.two_factor,
      };
      setToken(accessToken, user);
      router.push("/admin");
    } catch {
      // Fallback: we still have the token, construct user from known email
      const user: AdminUser = {
        id: "",
        name: email.split("@")[0],
        email,
        role: "Admin",
        twoFactor: true,
      };
      setToken(accessToken, user);
      router.push("/admin");
    }
  }

  // Step 1: credentials
  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Enter your email.");
    if (!password.trim()) return setError("Enter your password.");

    setLoading(true);
    try {
      const result = await adminLogin(email.trim(), password.trim());

      if (!result.two_factor_required) {
        // No 2FA set up yet — force setup before granting access
        const accessToken = (result as { access_token: string }).access_token;
        setPendingAccessToken(accessToken);

        // Fetch the real 2FA setup data from backend
        const setup = await get2FASetup(accessToken);
        setSetupSecret(setup.secret);
        setSetupOtpauthUrl(setup.otpauth_url);
        setStep("setup");
      } else {
        // 2FA already set up — go to verify step
        setPreAuthToken((result as { pre_auth_token: string }).pre_auth_token);
        resetVerifyInputs();
        setStep("verify");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 (setup): enable 2FA then finish login
  async function handleEnableAndFinish(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (fullCode.length !== 6) return setError("Enter the 6-digit code from your authenticator app.");

    setLoading(true);
    try {
      await enable2FA(setupSecret, fullCode, pendingAccessToken);
      await finishLogin(pendingAccessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable 2FA. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 (verify): verify TOTP or backup code
  async function handleVerify(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!codeReady) {
      return setError(
        usingBackup
          ? "Enter a 10-digit backup code (e.g. 12345-67890)."
          : "Enter the 6-digit code from your authenticator app."
      );
    }

    setLoading(true);
    try {
      let result: { access_token: string };
      if (usingBackup) {
        result = await adminVerifyBackup(preAuthToken, backupCode.replace(/\s/g, ""));
      } else {
        result = await adminVerify2FA(preAuthToken, fullCode);
      }
      await finishLogin(result.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Check your code.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render: credentials step ─────────────────────────────────────────────

  if (step === "credentials") {
    return (
      <form onSubmit={handleCredentials} className="mt-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground">Sign in</h1>
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
            placeholder="you@rides.com"
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
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </label>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>
    );
  }

  // ── Render: 2FA setup step ───────────────────────────────────────────────

  if (step === "setup") {
    return (
      <form onSubmit={handleEnableAndFinish} className="mt-8 space-y-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Step 2 of 2 · Set up 2FA
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">
            Secure your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a second factor before continuing. Copy the setup key into your authenticator app,
            then enter the 6-digit code to confirm.
          </p>
        </div>

        <OtpAuthDisplay secret={setupSecret} otpauthUrl={setupOtpauthUrl} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Enter 6-digit code
          </p>
          <div className="mt-2">
            <CodeBoxes value={code} onChange={setCode} disabled={loading} />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!codeReady || loading}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Verifying…" : "Enable & continue"}
        </button>

        <button
          type="button"
          onClick={() => { setStep("credentials"); setError(null); }}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Back to sign in
        </button>
      </form>
    );
  }

  // ── Render: verify step ──────────────────────────────────────────────────

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
              <CodeBoxes value={code} onChange={setCode} disabled={loading} />
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
          {usingBackup ? "Use authenticator app instead" : "Use a backup code instead"}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!codeReady || loading}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Verifying…" : "Verify & continue"}
      </button>

      <button
        type="button"
        onClick={() => { setStep("credentials"); setError(null); }}
        className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        ← Back to sign in
      </button>
    </form>
  );
}
