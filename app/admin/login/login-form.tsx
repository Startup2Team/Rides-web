"use client";

import type { ApiEnvelope } from "@/lib/api-envelope";
import { OtpQrCode } from "@/lib/otp-qr-code";
import { resolvePostLoginRedirect } from "@/lib/post-login-redirect";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type CredentialsStep = "credentials";
type TotpStep = "totp_setup" | "totp_verify";
type ForgotStep = "forgot_email" | "forgot_otp" | "forgot_new_password";
type Step = CredentialsStep | TotpStep | "change_password" | ForgotStep;

type LoginPayload = {
  status?: string;
  challenge_token?: string;
  email?: string;
  full_name?: string;
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function isSessionExpiredError(message: string, code?: string) {
  const lower = message.toLowerCase();
  return (
    code === "TOKEN_EXPIRED" ||
    code === "INVALID_PRE_AUTH_TOKEN" ||
    lower.includes("expired") ||
    lower.includes("pre-auth")
  );
}

export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next")?.startsWith("/admin") ? searchParams.get("next")! : "/admin";

  const [step, setStep] = useState<Step>("credentials");
  const [busy, setBusy] = useState(false);
  const [provisioningLoading, setProvisioningLoading] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [challengeToken, setChallengeToken] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [loadProvisioningFailed, setLoadProvisioningFailed] = useState<string | null>(null);

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const provisioningFired = useRef(false);
  const lastSubmittedCode = useRef("");

  // Forgot password flow
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (step !== "totp_setup" || !challengeToken) return;
    // Prevent React StrictMode's double-invoke from firing two concurrent
    // provisioning requests (which would race to write different TOTP secrets).
    if (provisioningFired.current) return;
    provisioningFired.current = true;

    let cancelled = false;
    const run = async () => {
      setLoadProvisioningFailed(null);
      setProvisioningLoading(true);
      try {
        const r = await fetch(
          `/api/admin/auth/provisioning/${encodeURIComponent(challengeToken)}`,
          { method: "GET", cache: "no-store" },
        );
        const j = (await r.json()) as ApiEnvelope<{
          otpauth_url?: string;
          secret?: string;
        }>;
        if (cancelled) return;
        if (!r.ok || !j.data?.otpauth_url) {
          const alreadyEnabled =
            j.error?.code === "2FA_ALREADY_ENABLED" ||
            (j.error?.message ?? "").toLowerCase().includes("already enabled");

          if (alreadyEnabled && challengeToken) {
            try {
              const reconcile = await fetch("/api/admin/auth/reconcile-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ challenge_token: challengeToken }),
              });
              const rj = (await reconcile.json()) as ApiEnvelope<{
                challenge_token?: string;
              }>;
              if (!cancelled && reconcile.ok && rj.data?.challenge_token) {
                provisioningFired.current = false;
                setChallengeToken(rj.data.challenge_token);
                setOtpauthUrl("");
                setSetupSecret("");
                setLoadProvisioningFailed(null);
                setStep("totp_verify");
                setError(
                  "This account already has two-factor authentication. Enter the 6-digit code from your authenticator app.",
                );
                return;
              }
            } catch {
              /* fall through to message below */
            }
          }

          setLoadProvisioningFailed(
            alreadyEnabled
              ? "Two-factor is already enabled. Go back to sign in and enter your authenticator code."
              : (j.error?.message ?? "Could not load 2FA setup data."),
          );
          return;
        }
        setOtpauthUrl(j.data.otpauth_url);
        setSetupSecret(j.data.secret ?? "");
      } catch {
        if (!cancelled) setLoadProvisioningFailed("Network error while loading provisioning.");
      } finally {
        if (!cancelled) setProvisioningLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [step, challengeToken]);

  const fullCode = code.join("");
  const codeReady = fullCode.length === 6;

  const handleTotpComplete = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    lastSubmittedCode.current = fullCode;

    if (!challengeToken) {
      setError("Session expired — start sign-in again.");
      return;
    }

    const totpDigits = fullCode.replace(/\D/g, "");
    if (totpDigits.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    const path = step === "totp_setup" ? "/api/admin/auth/enable-totp" : "/api/admin/auth/verify-totp";

    // On setup, send the exact secret whose QR the user just scanned. Without it
    // the enable-totp route re-fetches /2fa/setup and gets a DIFFERENT secret, so
    // the code never matches ("authenticator code does not match").
    const verifyBody =
      step === "totp_setup"
        ? { challenge_token: challengeToken, totp_code: totpDigits, secret: setupSecret }
        : { challenge_token: challengeToken, totp_code: totpDigits };

    setBusy(true);
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyBody),
      });

      const j = (await r.json()) as ApiEnvelope<unknown>;

      if (!r.ok) {
        const msg = j.error?.message ?? "Verification failed.";
        if (isSessionExpiredError(msg, j.error?.code)) {
          console.error(
            "[login] pre-auth token rejected as expired/invalid — likely a backend TTL or " +
              "multi-instance session-store issue, not a frontend bug. Details:",
            { httpStatus: r.status, errorCode: j.error?.code, errorMessage: j.error?.message, step },
          );
          setError("Your sign-in session expired. Go back and sign in again.");
        } else {
          setError(msg);
        }
        return;
      }

      const dest = await resolvePostLoginRedirect(nextPath);
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Network error while verifying.");
    } finally {
      setBusy(false);
    }
  }, [challengeToken, fullCode, nextPath, router, setupSecret, step]);

  useEffect(() => {
    if (codeReady && !busy && !provisioningLoading && !loadProvisioningFailed && lastSubmittedCode.current !== fullCode) {
      lastSubmittedCode.current = fullCode;
      void handleTotpComplete();
    }
  }, [fullCode, codeReady, busy, provisioningLoading, loadProvisioningFailed, handleTotpComplete]);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const em = email.trim();
    if (!em) return setError("Enter your email to continue.");
    if (!password) return setError("Enter your password.");

    setBusy(true);
    try {
      const r = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em, password }),
      });

      const j = (await r.json()) as ApiEnvelope<LoginPayload>;

      if (!r.ok) {
        const code = j.error?.code;
        const msg = j.error?.message ?? "Could not sign in.";
        if (code === "PASSWORD_NOT_SET") {
          setError(
            msg ||
              "No password is set for this account yet. Ask a Super Admin to open Admins & Roles → your user → Set password, then try again.",
          );
          return;
        }
        setError(msg);
        return;
      }

      const status = j.data?.status;

      if (status === "password_change_required") {
        const token = j.data?.challenge_token ?? "";
        if (!token) { setError("Unexpected response from server."); return; }
        setChallengeToken(token);
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setStep("change_password");
        return;
      }

      // 2FA removed: signed straight in → go to the dashboard.
      if (status === "success") {
        const dest = await resolvePostLoginRedirect(nextPath);
        router.replace(dest);
        router.refresh();
        return;
      }

      const token = j.data?.challenge_token ?? "";

      // Dev: backend authenticated directly (2FA skipped) — go straight in.
      if (status === "success") {
        const dest = await resolvePostLoginRedirect(nextPath);
        router.replace(dest);
        router.refresh();
        return;
      }

      if (!token || (status !== "totp_required" && status !== "totp_setup_required")) {
        setError("Unexpected response from server.");
        return;
      }

      setChallengeToken(token);
      setPassword("");
      setCode(["", "", "", "", "", ""]);

      if (status === "totp_setup_required") {
        setOtpauthUrl("");
        setSetupSecret("");
        setStep("totp_setup");
      } else {
        setStep("totp_verify");
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_token: challengeToken, new_password: newPassword }),
      });
      const j = (await r.json()) as ApiEnvelope<LoginPayload>;
      if (!r.ok) { setError(j.error?.message ?? "Could not change password."); return; }
      const status = j.data?.status;
      const token = j.data?.challenge_token ?? "";
      setNewPassword("");
      setConfirmPassword("");
      if (status === "success") {
        const dest = await resolvePostLoginRedirect(nextPath);
        router.replace(dest);
        router.refresh();
        return;
      }
      if (!token || (status !== "totp_required" && status !== "totp_setup_required")) {
        setError("Unexpected response from server.");
        return;
      }
      setChallengeToken(token);
      setCode(["", "", "", "", "", ""]);
      if (status === "totp_setup_required") {
        setOtpauthUrl("");
        setSetupSecret("");
        setStep("totp_setup");
      } else {
        setStep("totp_verify");
      }
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  function resetToCredentials() {
    setStep("credentials");
    setError(null);
    setResetInfo(null);
    setChallengeToken("");
    setCode(["", "", "", "", "", ""]);
    setOtpauthUrl("");
    setSetupSecret("");
    setNewPassword("");
    setConfirmPassword("");
    setLoadProvisioningFailed(null);
    setProvisioningLoading(false);
    provisioningFired.current = false;
    lastSubmittedCode.current = "";
    setForgotEmail("");
    setForgotCode(["", "", "", "", "", ""]);
    setResetToken("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setResendCooldown(0);
  }

  async function handleForgotEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const em = forgotEmail.trim();
    if (!em) { setError("Enter your email to continue."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: em }),
      });
      const j = (await r.json()) as ApiEnvelope<{ status?: string }>;
      if (!r.ok) { setError(j.error?.message ?? "Could not send reset code."); return; }
      setForgotCode(["", "", "", "", "", ""]);
      setResendCooldown(30);
      setStep("forgot_otp");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendResetCode() {
    if (resendCooldown > 0 || busy) return;
    setError(null);
    setBusy(true);
    try {
      const r = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const j = (await r.json()) as ApiEnvelope<{ status?: string }>;
      if (!r.ok) { setError(j.error?.message ?? "Could not resend code."); return; }
      setResendCooldown(30);
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyResetOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const digits = forgotCode.join("");
    if (digits.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), otp_code: digits }),
      });
      const j = (await r.json()) as ApiEnvelope<{ reset_token?: string }>;
      if (!r.ok || !j.data?.reset_token) { setError(j.error?.message ?? "That code is incorrect or expired."); return; }
      setResetToken(j.data.reset_token);
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setStep("forgot_new_password");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (forgotNewPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (forgotNewPassword !== forgotConfirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: resetToken, new_password: forgotNewPassword }),
      });
      const j = (await r.json()) as ApiEnvelope<{ status?: string }>;
      if (!r.ok) { setError(j.error?.message ?? "Could not reset password."); return; }
      const resetEmail = forgotEmail;
      resetToCredentials();
      setEmail(resetEmail);
      setResetInfo("Password updated — sign in with your new password.");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  function copySecret() {
    if (!setupSecret) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(setupSecret.replace(/\s/g, ""));
    }
    setCopied(true);
  }

  if (step === "credentials") {
    return (
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your Rides.rw operations.
          </p>
        </div>

        {resetInfo ? (
          <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] font-semibold text-primary">
            {resetInfo}
          </p>
        ) : null}

        <label className="block pt-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</span>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MailIcon className="h-4 w-4" />
            </span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: you@example.com"
              className="block h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </label>

        <div className="pt-2">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Password
            </span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
              </span>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </label>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setForgotEmail(email);
                setStep("forgot_email");
              }}
              className="text-xs font-bold text-primary underline-offset-4 transition-colors hover:underline"
            >
              Forgot password
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Continue"}
        </button>
      </form>
    );
  }

  if (step === "change_password") {
    const newPasswordValid = newPassword.length >= 8;
    const confirmValid = newPassword === confirmPassword;
    return (
      <form onSubmit={handleChangePassword} className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground">Set your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re signing in for the first time. Choose a new password to secure your account.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">New password</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
              </span>
              <input
                autoFocus
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="block h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowNewPassword((v) => !v)} aria-label={showNewPassword ? "Hide" : "Show"}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground">
                {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Confirm password</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className={`block h-12 w-full rounded-xl border bg-surface pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:ring-2 ${
                  confirmPassword && !confirmValid
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} aria-label={showConfirmPassword ? "Hide" : "Show"}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground">
                {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && !confirmValid ? (
              <p className="mt-1 text-[11px] text-red-600">Passwords do not match.</p>
            ) : null}
          </label>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</p>
        ) : null}

        <button type="submit" disabled={!newPasswordValid || !confirmValid || busy}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Saving…" : "Set password & continue"}
        </button>

        <button type="button" onClick={() => resetToCredentials()}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
          ← Back to sign in
        </button>
      </form>
    );
  }

  if (step === "forgot_email") {
    return (
      <form onSubmit={handleForgotEmailSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reset password</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email on your account and, if it&apos;s verified, we&apos;ll send a 6-digit code to reset your
            password.
          </p>
        </div>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</span>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <MailIcon className="h-4 w-4" />
            </span>
            <input
              autoFocus
              type="email"
              autoComplete="username"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Ex: you@example.com"
              className="block h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </label>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !forgotEmail.trim()}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send reset code"}
        </button>

        <button type="button" onClick={() => resetToCredentials()}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
          ← Back to sign in
        </button>
      </form>
    );
  }

  if (step === "forgot_otp") {
    const forgotCodeReady = forgotCode.join("").length === 6;
    return (
      <form onSubmit={handleVerifyResetOtp} className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reset password</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the 6-digit code we sent to{" "}
            <span className="font-semibold text-foreground">{forgotEmail || "your email"}</span>.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Reset code</p>
          <div className="mt-3">
            <CodeBoxes value={forgotCode} onChange={setForgotCode} disabled={busy} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleResendResetCode()}
          disabled={resendCooldown > 0 || busy}
          className="text-xs font-bold text-primary underline-offset-4 transition-colors hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
        </button>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!forgotCodeReady || busy}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Verifying…" : "Verify code"}
        </button>

        <button type="button" onClick={() => resetToCredentials()}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
          ← Back to sign in
        </button>
      </form>
    );
  }

  if (step === "forgot_new_password") {
    const forgotNewValid = forgotNewPassword.length >= 8;
    const forgotConfirmValid = forgotNewPassword === forgotConfirmPassword;
    return (
      <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reset password</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Choose a new password to finish resetting your account.</p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">New password</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
              </span>
              <input
                autoFocus
                type={showForgotNewPassword ? "text" : "password"}
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="block h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowForgotNewPassword((v) => !v)} aria-label={showForgotNewPassword ? "Hide" : "Show"}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground">
                {showForgotNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Confirm password</span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                <LockIcon className="h-4 w-4" />
              </span>
              <input
                type={showForgotConfirmPassword ? "text" : "password"}
                value={forgotConfirmPassword}
                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className={`block h-12 w-full rounded-xl border bg-surface pl-10 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:ring-2 ${
                  forgotConfirmPassword && !forgotConfirmValid
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
              />
              <button type="button" onClick={() => setShowForgotConfirmPassword((v) => !v)} aria-label={showForgotConfirmPassword ? "Hide" : "Show"}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground">
                {showForgotConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {forgotConfirmPassword && !forgotConfirmValid ? (
              <p className="mt-1 text-[11px] text-red-600">Passwords do not match.</p>
            ) : null}
          </label>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</p>
        ) : null}

        <button type="submit" disabled={!forgotNewValid || !forgotConfirmValid || busy}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Saving…" : "Reset password"}
        </button>

        <button type="button" onClick={() => resetToCredentials()}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary">
          ← Back to sign in
        </button>
      </form>
    );
  }

  if (step === "totp_setup") {
    const showQr = otpauthUrl && !loadProvisioningFailed;

    return (
      <form onSubmit={handleTotpComplete} className="space-y-5">
        <div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">Secure your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan the QR code with your authenticator app, then enter the 6-digit code to confirm. This replaces any
            previous demo QR on this screen — secrets come from the live API.
          </p>
        </div>

        {loadProvisioningFailed ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {loadProvisioningFailed}
          </p>
        ) : null}

        <div className="grid gap-4 rounded-2xl border border-border bg-surface/40 p-4 sm:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[180px] w-[180px] items-center justify-center rounded-xl bg-white p-2 ring-1 ring-border">
              {provisioningLoading && !otpauthUrl ? (
                <span className="text-xs text-muted-foreground">Loading…</span>
              ) : showQr ? (
                <OtpQrCode value={otpauthUrl} />
              ) : (
                <span className="text-xs text-muted-foreground">Waiting for provisioning…</span>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Can&apos;t scan?</p>
            <div className="rounded-lg border border-border bg-card p-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Setup key (base32)</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 break-all font-mono text-[11px] font-semibold text-foreground">
                  {setupSecret || "…"}
                </code>
                <button
                  type="button"
                  onClick={() => copySecret()}
                  aria-label="Copy secret"
                  disabled={!setupSecret}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                >
                  <CopyIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              {copied ? (
                <p className="mt-1 text-[10px] font-semibold text-primary">Copied to clipboard</p>
              ) : null}
            </div>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Use Google Authenticator, Authy, 1Password, Bitwarden, or any RFC 6238 TOTP app.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Confirm 6-digit code
          </p>
          <div className="mt-2">
            <CodeBoxes value={code} onChange={setCode} disabled={busy} />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!codeReady || busy || provisioningLoading || !!loadProvisioningFailed}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Verifying…" : provisioningLoading ? "Loading setup…" : "Enable 2FA & enter dashboard"}
        </button>

        <button
          type="button"
          onClick={() => resetToCredentials()}
          className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Back to sign in
        </button>
      </form>
    );
  }

  // totp_verify
  return (
    <form onSubmit={handleTotpComplete} className="space-y-5">
      <div>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground">Two-factor authentication</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app for{" "}
          <span className="font-semibold text-foreground">{email || "your account"}</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Authenticator code
        </p>
        <div className="mt-3">
          <CodeBoxes value={code} onChange={setCode} disabled={busy} />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!codeReady || busy}
        className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold tracking-[-0.01em] text-primary-foreground transition duration-200 hover:scale-[1.01] hover:bg-foreground active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Verifying…" : "Continue"}
      </button>



      <button
        type="button"
        onClick={() => resetToCredentials()}
        className="block w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        ← Back to sign in
      </button>
    </form>
  );
}
