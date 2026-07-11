"use client";

import { useEffect, useRef, useState } from "react";
import type { Role } from "./roles";

export function InviteAdminModal({
  open,
  roles,
  onClose,
  onInvite,
}: {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onInvite: (payload: {
    name: string;
    email: string;
    roleId: string;
    tempPassword: string;
  }) => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[1]?.id ?? roles[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; }, [step]);

  const prevOpen = useRef(false);
  useEffect(() => {
    if (!open || prevOpen.current) { prevOpen.current = open; return; }
    prevOpen.current = true;
    setStep(1);
    setName("");
    setEmail("");
    setRoleId(roles[1]?.id ?? roles[0]?.id ?? "");
    setPassword("");
    setShowPassword(false);
    setCopied(false);
    setSubmitting(false);
    setSubmitError(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && stepRef.current !== 4) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      prevOpen.current = false;
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, roles, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  if (!open) return null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const step1Valid = name.trim().length > 1 && emailValid;
  const step2Valid = !!roleId;
  const step3Valid = password.length >= 8;
  const selectedRole = roles.find((r) => r.id === roleId);

  function copyPassword() {
    if (navigator?.clipboard) navigator.clipboard.writeText(password).catch(() => null);
    setCopied(true);
  }

  const steps = [
    { n: 1, label: "Identity" },
    { n: 2, label: "Role" },
    { n: 3, label: "Password" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={step === 4 ? undefined : onClose} aria-hidden />
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

        {/* Header */}
        {step !== 4 ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  aria-label="Back"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              ) : null}
              <div className="flex-1">
                <h2 className="text-sm font-bold tracking-tight text-foreground">Add member</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Step {step} of 3 — {steps[(step as number) - 1]?.label}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex border-b border-border">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className={`flex-1 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    step === s.n
                      ? "border-b-2 border-primary text-primary"
                      : step > s.n
                      ? "text-primary/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {step > s.n ? "✓ " : ""}{s.label}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* Step 1 — Identity */}
        {step === 1 ? (
          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Full name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aiden Mugisha"
                className="block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aiden@rides.rw"
                className={`block h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary ${
                  email && !emailValid ? "border-red-300" : "border-border"
                }`}
              />
              {email && !emailValid ? (
                <p className="mt-1 text-[11px] text-red-600">Enter a valid email address.</p>
              ) : null}
            </div>

          </div>
        ) : null}

        {/* Step 2 — Role */}
        {step === 2 ? (
          <div className="px-6 py-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Role
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {roles.find((r) => r.id === roleId)?.description ? (
                <p className="mt-1.5 text-[11px] text-muted-foreground">{roles.find((r) => r.id === roleId)?.description}</p>
              ) : null}
            </div>

          </div>
        ) : null}

        {/* Step 3 — Password */}
        {step === 3 ? (
          <div className="space-y-4 px-6 py-5">
<div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Temporary password <span className="normal-case tracking-normal">(min 8 characters)</span>
              </label>
              <div className="relative">
                <input
                  autoFocus
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type a password…"
                  className="block h-10 w-full rounded-lg border border-border bg-surface pl-3 pr-20 font-mono text-sm text-foreground outline-none focus:border-primary"
                />
                <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide" : "Show"}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? (
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
                  {password.length >= 8 ? (
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Copy password"
                    >
                      {copied ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
              {password.length > 0 && !step3Valid ? (
                <p className="mt-1.5 text-[11px] text-red-600">Must be at least 8 characters.</p>
              ) : null}
            </div>

          </div>
        ) : null}

        {/* Step 4 — Success */}
        {step === 4 ? (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <div className="absolute right-4 top-4">
              <button type="button" onClick={onClose} aria-label="Close" className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-base font-bold tracking-tight text-foreground">Member added!</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">Share the credentials below securely before closing.</p>

            <div className="mt-5 w-full rounded-xl border border-border bg-surface/60 p-4 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Name</span>
                  <span className="text-xs font-semibold text-foreground">{name.trim()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Email</span>
                  <span className="text-xs text-foreground">{email.trim()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Role</span>
                  <span className="text-xs text-foreground">{selectedRole?.name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Password</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs text-foreground">
                      {showPassword ? password : "•".repeat(password.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide" : "Show"}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" y1="2" x2="22" y2="22" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={copyPassword}
                      aria-label="Copy password"
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {copied ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-primary" aria-hidden>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-xl bg-primary text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30"
            >
              Done
            </button>
          </div>
        ) : null}

        {/* Footer — steps 1–3 only */}
        {step !== 4 ? (
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-4">
            <button type="button" onClick={onClose} className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground hover:bg-surface">
              Cancel
            </button>
            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 ? !step1Valid : !step2Valid}
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                disabled={!step3Valid || submitting}
                        onClick={async () => {
                  setSubmitting(true);
                  setSubmitError(null);
                  try {
                    await onInvite({ name: name.trim(), email: email.trim(), roleId, tempPassword: password });
                    setShowPassword(false);
                    setStep(4);
                  } catch {
                    setSubmitError("Failed to add member — check the email is unique and try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Adding…" : "Add member"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            )}
          {submitError ? (
              <p className="mt-2 text-center text-[11px] text-red-600">{submitError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
