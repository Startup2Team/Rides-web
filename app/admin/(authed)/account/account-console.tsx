"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "../_components";
import { QRCode } from "./qr-code";
import {
  getAccount,
  updateAccount,
  changePassword,
  getSessions,
  revokeSession,
  disable2FA,
  get2FASetup,
  enable2FA,
  uploadFile,
  resolveBackendUrl,
  NO_BACKEND,
} from "@/lib/api";
import { getAdminUser, getToken } from "@/lib/auth";
import { useAuth } from "@/context/auth-context";

type Tab = "profile" | "security" | "sessions";

const tabs: { id: Tab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "sessions", label: "Sessions" },
];

type Session = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  current?: boolean;
};

const initialSessions: Session[] = [
  {
    id: "s1",
    device: "MacBook Pro",
    browser: "Chrome 132",
    location: "Kacyiru, Kigali",
    ip: "41.74.198.12",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "s2",
    device: "iPhone 16 Pro",
    browser: "Safari Mobile",
    location: "Remera, Kigali",
    ip: "41.74.220.55",
    lastActive: "12 minutes ago",
  },
  {
    id: "s3",
    device: "Dell Latitude",
    browser: "Edge 130",
    location: "Office · Kigali Heights",
    ip: "196.223.18.4",
    lastActive: "3 hours ago",
  },
  {
    id: "s4",
    device: "Unknown",
    browser: "Chrome 128",
    location: "Nairobi, Kenya",
    ip: "41.139.92.118",
    lastActive: "Yesterday",
  },
];

function deviceIcon(device: string) {
  if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("android"))
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <div className="relative mt-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="block h-10 w-full rounded-lg border border-border bg-surface pl-3 pr-10 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}

export function AccountConsole() {
  const [tab, setTab] = useState<Tab>("profile");
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshUser, roleName } = useAuth();

  // Password state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetVerifyCode, setResetVerifyCode] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [disable2faPwd, setDisable2faPwd] = useState("");
  const [confirmingDisable, setConfirmingDisable] = useState(false);
  const [setup2FAData, setSetup2FAData] = useState<{ secret: string; otpauth_url: string } | null>(null);



  // Sessions
  const [sessions, setSessions] = useState<Session[]>(NO_BACKEND ? initialSessions : []);

  const secret = setup2FAData?.secret ?? "";
  const otpAuth = setup2FAData?.otpauth_url ?? "";
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Load profile from API (and localStorage fallback before API responds)
  useEffect(() => {
    if (NO_BACKEND) {
      const stored = getAdminUser();
      if (stored) {
        setName(stored.name);
        setEmail(stored.email);
        setTwoFactorEnabled(stored.twoFactor);
      }
      setSessions(initialSessions);
      return;
    }

    getAccount()
      .then((a) => {
        setName(a.name);
        setEmail(a.email);
        setPhone(a.phone || "");
        setPhotoUrl(a.photo_url || a.photoUrl || null);
        setTwoFactorEnabled(a.two_factor);
      })
      .catch(() => null);

    getSessions()
      .then((res) => {
        if (!res?.sessions?.length) return;
        setSessions(
          res.sessions.map((s) => ({
            id: s.id,
            device: "Active session",
            browser: "",
            location: "—",
            ip: "—",
            lastActive: "Active now",
            current: s.current,
          })),
        );
      })
      .catch(() => setSessions([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSaveProfile() {
    try {
      await updateAccount({ name, phone, photo_url: photoUrl });
      setToast("Profile saved");
      await refreshUser();
    } catch {
      setToast("Failed to save profile");
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setToast("Uploading photo...");
    try {
      const url = await uploadFile(file);
      setPhotoUrl(url);
      setToast("Photo uploaded. Save changes to apply.");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null);
    if (!currentPwd) return setPwdError("Enter your current password.");
    if (newPwd.length < 10) return setPwdError("New password must be at least 10 characters.");
    if (newPwd !== confirmPwd) return setPwdError("Passwords don't match.");
    setPwdSaving(true);
    try {
      await changePassword(currentPwd, newPwd);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setToast("Password updated");
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwdSaving(false);
    }
  }

  async function handleDisable2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!disable2faPwd) return;
    try {
      await disable2FA(disable2faPwd);
      setTwoFactorEnabled(false);
      setDisable2faPwd("");
      setConfirmingDisable(false);
      setToast("Two-factor authentication disabled");
    } catch {
      setToast("Failed to disable 2FA. Check your password.");
    }
  }

  async function start2FASetup() {
    const token = getToken();
    if (!token) {
      setToast("Sign in again to set up 2FA");
      return;
    }
    try {
      const data = await get2FASetup(token);
      setSetup2FAData(data);
      setResetMode(true);
    } catch {
      setToast("Couldn't load 2FA setup. Try again.");
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (resetVerifyCode.length !== 6) return;
    const token = getToken();
    if (!token || !setup2FAData) {
      setToast("Setup data missing — restart the flow");
      return;
    }
    try {
      const res = await enable2FA(setup2FAData.secret, resetVerifyCode, token);
      setBackupCodes(res.backup_codes);
      setTwoFactorEnabled(res.two_factor_enabled);
      setResetMode(false);
      setResetVerifyCode("");
      setSetup2FAData(null);
      setShowBackup(true);
      setToast("Authenticator enabled · save the backup codes");
    } catch {
      setToast("Invalid code. Try again.");
    }
  }



  return (
    <div className="space-y-6">
      {/* Profile hero card */}
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-primary/10">
            {photoUrl ? (
              <img src={resolveBackendUrl(photoUrl) || undefined} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Change photo"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold tracking-tight text-foreground">{name || "—"}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {roleName ? (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {roleName}
              </span>
            ) : null}
            {twoFactorEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                2FA on
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                2FA off
              </span>
            )}
            {phone ? (
              <span className="text-[11px] text-muted-foreground">{phone}</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "profile" ? (
        <Card title="Profile">
          <div className="p-5">
            <div className="mt-0 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  disabled={!NO_BACKEND}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-2 block h-10 w-full rounded-lg border border-border px-3 text-sm text-foreground outline-none focus:border-primary ${
                    !NO_BACKEND ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : "bg-surface"
                  }`}
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Phone
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Role
                </span>
                <div className="mt-2 flex h-10 items-center rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground">
                  {roleName ?? "—"}
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Contact a Super Admin to change
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Save changes
              </button>
            </div>
          </div>
        </Card>
      ) : null}

      {tab === "security" ? (
        <div className="space-y-6">
          <Card title="Change password">
            <form onSubmit={handleChangePassword} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <PasswordField
                  label="Current password"
                  value={currentPwd}
                  onChange={setCurrentPwd}
                  autoComplete="current-password"
                />
                <PasswordField
                  label="New password"
                  value={newPwd}
                  onChange={setNewPwd}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirm new password"
                  value={confirmPwd}
                  onChange={setConfirmPwd}
                  autoComplete="new-password"
                />
              </div>
              {pwdError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                  {pwdError}
                </p>
              ) : null}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Update password
                </button>
              </div>
            </form>
          </Card>

          <Card title="Two-factor authentication">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Authenticator app
                    </p>
                    {twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Enabled
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-100">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {twoFactorEnabled
                      ? "Your account requires a 6-digit code from your authenticator app on each sign-in."
                      : "Two-factor is off. Re-enable to require a 6-digit code at sign-in."}
                  </p>
                </div>
                {twoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingDisable(true)}
                    className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void start2FASetup()}
                    className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-[11px] font-semibold text-primary-foreground shadow-sm shadow-primary/30"
                  >
                    Enable
                  </button>
                )}
              </div>


              {resetMode ? (
                <form onSubmit={confirmReset} className="mt-5 space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="grid gap-4 sm:grid-cols-[auto,1fr]">
                    <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-border">
                      <QRCode seed={otpAuth} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Scan with authenticator
                      </p>
                      <p className="text-xs text-foreground">
                        Open Google Authenticator, Authy, 1Password, or any
                        TOTP-compatible app. Use this setup key if you can't
                        scan:
                      </p>
                      <code className="block break-all rounded-md bg-card p-2 font-mono text-[11px] font-semibold text-foreground ring-1 ring-border">
                        {secret}
                      </code>
                    </div>
                  </div>

                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      Verify 6-digit code
                    </span>
                    <input
                      value={resetVerifyCode}
                      onChange={(e) =>
                        setResetVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      placeholder="123456"
                      className="mt-2 block h-10 w-32 rounded-lg border border-border bg-card px-3 text-center font-mono text-base font-semibold tracking-wider text-foreground outline-none focus:border-primary"
                    />
                  </label>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(false);
                        setResetVerifyCode("");
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetVerifyCode.length !== 6}
                      className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Verify & save
                    </button>
                  </div>
                </form>
              ) : null}



              {showBackup ? (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700">
                      New backup codes
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard
                            .writeText(backupCodes.join("\n"))
                            .catch(() => null);
                        }
                        setToast("Backup codes copied");
                      }}
                      className="text-[11px] font-semibold text-amber-700 hover:underline"
                    >
                      Copy all
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-700">
                    Save these somewhere safe. Each works once if you lose
                    access to your authenticator.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[11px] text-foreground">
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
                    onClick={() => setShowBackup(false)}
                    className="mt-3 text-[11px] font-semibold text-amber-700 hover:underline"
                  >
                    I've saved them, hide
                  </button>
                </div>
              ) : null}

              {confirmingDisable ? (
                <form
                  onSubmit={handleDisable2FA}
                  className="mt-5 space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-700">
                    Confirm disabling 2FA
                  </p>
                  <p className="text-xs text-red-700">
                    Your account will be protected only by your password. Enter
                    your current password to confirm.
                  </p>
                  <PasswordField
                    label="Current password"
                    value={disable2faPwd}
                    onChange={setDisable2faPwd}
                    autoComplete="current-password"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDisable(false);
                        setDisable2faPwd("");
                      }}
                      className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!disable2faPwd}
                      className="inline-flex h-9 items-center rounded-lg bg-red-600 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Disable 2FA
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "sessions" ? (
        <Card
          title={`Active sessions · ${sessions.length}`}
          action={
            sessions.some((s) => !s.current) ? (
              <button
                type="button"
                onClick={() => {
                  setSessions((prev) => prev.filter((s) => s.current));
                  setToast("Signed out of all other sessions");
                }}
                className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Sign out everywhere else
              </button>
            ) : null
          }
        >
          <ul className="divide-y divide-border">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  {deviceIcon(s.device)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {s.device}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      · {s.browser}
                    </span>
                    {s.current ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        This device
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.location} · {s.ip}
                  </p>
                </div>
                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                  {s.lastActive}
                </span>
                {!s.current ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await revokeSession(s.id);
                        setSessions((prev) => prev.filter((x) => x.id !== s.id));
                        setToast(`Session on ${s.device} signed out`);
                      } catch {
                        setToast("Couldn't sign out that session");
                      }
                    }}
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-[11px] font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    Sign out
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
