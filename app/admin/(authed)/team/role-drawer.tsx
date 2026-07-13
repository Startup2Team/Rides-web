"use client";

import { useEffect, useState } from "react";
import { SIDEBAR_ITEMS, type Role } from "./roles";
import { updateRolePermissions } from "@/lib/api";
import type { Permission } from "@/lib/admin-permissions";

const GROUPS = ["Overview", "Operations", "Insights", "Trust", "Monetization", "System"] as const;

export function RoleDrawer({
  role,
  memberCount,
  onClose,
  onSaved,
}: {
  role: Role | null;
  memberCount: number;
  onClose: () => void;
  onSaved: (updated: Role) => void;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (role) setPermissions(role.permissions as Permission[]);
  }, [role]);

  useEffect(() => {
    if (!role) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [role, onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!role) return null;

  const isFullAccess = permissions.includes("*");
  const totalPages = SIDEBAR_ITEMS.length;
  const grantedCount = isFullAccess ? totalPages : permissions.length;
  const progressPct = Math.round((grantedCount / totalPages) * 100);

  function toggle(href: Permission) {
    if (role!.isSystem) return;
    setPermissions((prev) =>
      prev.includes(href) ? prev.filter((p) => p !== href) : [...prev, href],
    );
  }

  async function handleSave() {
    if (!role || role.isSystem) return;
    setSaving(true);
    try {
      await updateRolePermissions(role.id, permissions.filter((p) => p !== "*"));
      onSaved({ ...role, permissions });
      setToast("Permissions saved");
      setTimeout(onClose, 800);
    } catch {
      setToast("Couldn't save — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-foreground">{role.name}</h2>
              {role.isSystem && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  System
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{role.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stats bar */}
        <div className="border-b border-border px-5 py-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">{memberCount}</span> member{memberCount !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">{grantedCount}</span> of {totalPages} pages
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Permission checklist */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isFullAccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">Full access</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                This role has unrestricted access to every page and action.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {GROUPS.map((group) => {
                const items = SIDEBAR_ITEMS.filter((s) => s.group === group);
                if (items.length === 0) return null;
                const allChecked = items.every((s) => permissions.includes(s.href as Permission));
                const someChecked = items.some((s) => permissions.includes(s.href as Permission));
                return (
                  <div key={group}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        {group}
                      </p>
                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => {
                            if (allChecked) {
                              const hrefs = items.map((i) => i.href as Permission);
                              setPermissions((prev) => prev.filter((p) => !hrefs.includes(p)));
                            } else {
                              const toAdd = items.map((i) => i.href as Permission);
                              setPermissions((prev) => [...new Set([...prev, ...toAdd])] as Permission[]);
                            }
                          }}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          {allChecked ? "Remove all" : someChecked ? "Add all" : "Add all"}
                        </button>
                      )}
                    </div>
                    <div className="space-y-1 rounded-xl border border-border bg-surface/40 p-2">
                      {items.map((s) => {
                        const checked = permissions.includes(s.href as Permission);
                        return (
                          <label
                            key={s.href}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors ${
                              role.isSystem
                                ? "cursor-default"
                                : "hover:bg-surface"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={role.isSystem}
                              onChange={() => toggle(s.href as Permission)}
                              className="h-3.5 w-3.5 rounded border-border accent-primary disabled:cursor-not-allowed"
                            />
                            <span className={`flex-1 text-xs ${checked ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {s.label}
                            </span>
                            {checked && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!role.isSystem && (
          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-5 py-4">
            {toast ? (
              <p className="text-[11px] font-medium text-primary">{toast}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Changes apply immediately on save.
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save permissions"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
