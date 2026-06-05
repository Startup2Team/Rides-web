"use client";

import { useEffect, useState } from "react";
import type { Role } from "./roles";
import { SIDEBAR_ITEMS } from "./roles";

function generatePassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%^&*-_=+?";
  const all = upper + lower + digits + symbols;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const rest = Array.from({ length: length - required.length }, () => pick(all));
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

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
    notes: string;
    tempPassword: string;
    forceChange: boolean;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles[1]?.id ?? roles[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [forceChange, setForceChange] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setRoleId(roles[1]?.id ?? roles[0]?.id ?? "");
    setNotes("");
    setPassword(generatePassword());
    setShowPassword(false);
    setForceChange(true);
    setCopied(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
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

  const activeRole = roles.find((r) => r.id === roleId);
  const allowedPages = activeRole?.permissions.includes("*")
    ? SIDEBAR_ITEMS
    : SIDEBAR_ITEMS.filter((s) =>
        (activeRole?.permissions ?? []).includes(s.href),
      );
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 10;
  const canSubmit = name.trim().length > 1 && emailValid && roleId && passwordValid;

  function copyPassword() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(password).catch(() => null);
    }
    setCopied(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Invite admin
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Invitee will receive an email with a setup link. They get access
              the moment they accept.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Full name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aiden Mugisha"
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aiden@rides.com"
                className={`mt-2 block h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary ${
                  email && !emailValid ? "border-red-300" : "border-border"
                }`}
              />
              {email && !emailValid ? (
                <p className="mt-1 text-[10px] text-red-600">
                  Enter a valid email address
                </p>
              ) : null}
            </label>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Role
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {roles.map((r) => {
                const active = roleId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleId(r.id)}
                    className={`flex flex-col rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {r.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {r.permissions.includes("*")
                          ? "Full access"
                          : `${r.permissions.length} pages`}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Will see
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {allowedPages.map((p) => (
                <span
                  key={p.href}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-700">
              Temporary password
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700">
              Share this with the invitee out-of-band (in person, Signal, etc.).
              They'll be asked to change it on first sign-in.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-10 w-full rounded-lg border border-border bg-card pl-3 pr-10 font-mono text-sm font-semibold text-foreground outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              </div>
              <button
                type="button"
                onClick={() => {
                  setPassword(generatePassword());
                  setShowPassword(true);
                }}
                className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={copyPassword}
                className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {!passwordValid ? (
              <p className="mt-1 text-[10px] font-semibold text-red-700">
                Must be at least 10 characters.
              </p>
            ) : null}
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-amber-700">
              <input
                type="checkbox"
                checked={forceChange}
                onChange={(e) => setForceChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border accent-primary"
              />
              Force change on first sign-in (recommended)
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Notes (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Why are they being added? Visible to other admins."
              className="mt-2 block w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onInvite({
                name: name.trim(),
                email: email.trim(),
                roleId,
                notes: notes.trim(),
                tempPassword: password,
                forceChange,
              })
            }
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}
