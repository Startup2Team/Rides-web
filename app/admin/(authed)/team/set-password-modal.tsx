"use client";

import { useEffect, useState } from "react";

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

export function SetPasswordModal({
  open,
  adminName,
  adminEmail,
  onClose,
  onBack,
  onSave,
}: {
  open: boolean;
  adminName: string;
  adminEmail: string;
  onClose: () => void;
  onBack?: () => void;
  onSave: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setShow(false);
    setError(null);
    setBusy(false);
  }, [open]);

  if (!open) return null;

  const valid = password.length >= 8;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          {onBack ? (
            <button type="button" onClick={onBack} aria-label="Back" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : null}
          <div className="flex-1">
            <h2 className="text-sm font-bold tracking-tight text-foreground">Set sign-in password</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{adminName} · {adminEmail}</p>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Password <span className="normal-case tracking-normal">(min 8 characters)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setPassword(generatePassword());
                  setShow(true);
                }}
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                Generate secure password
              </button>
            </div>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type a password…"
                className="block h-10 w-full rounded-lg border border-border bg-surface pl-3 pr-10 font-mono text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
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
            {password.length > 0 && !valid ? (
              <p className="mt-1.5 text-[11px] text-red-600">Must be at least 8 characters.</p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</p>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button type="button" onClick={onClose} className="h-9 rounded-lg border border-border px-4 text-xs font-medium text-foreground hover:bg-surface">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !valid}
            onClick={async () => {
              setError(null);
              setBusy(true);
              try {
                await onSave(password);
                onClose();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not set password");
              } finally {
                setBusy(false);
              }
            }}
            className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save password"}
          </button>
        </div>
      </div>
    </div>
  );
}
