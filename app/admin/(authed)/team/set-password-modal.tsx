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
  onSave,
}: {
  open: boolean;
  adminName: string;
  adminEmail: string;
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState(() => generatePassword());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPassword(generatePassword());
    setError(null);
    setBusy(false);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Set sign-in password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {adminName} ({adminEmail}) cannot sign in until a password is saved.
          </p>
        </div>
        <div className="space-y-4 px-6 py-4">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Password (min 8 characters)
            </span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={() => setPassword(generatePassword())}
            className="text-xs font-medium text-primary hover:underline"
          >
            Generate new password
          </button>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-border px-4 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || password.length < 8}
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
