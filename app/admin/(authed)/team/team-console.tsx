"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Card, StatCard } from "../_components";
import { InviteAdminModal } from "./invite-admin-modal";
import { SetPasswordModal } from "./set-password-modal";
import { AdminActivityModal } from "./admin-activity-modal";
import { DEFAULT_ROLES, SIDEBAR_ITEMS, type Role } from "./roles";
import {
  getTeam,
  getRoles,
  inviteAdmin,
  setMemberPassword,
  suspendMember,
  reinstateMember,
  removeMember,
  updateMemberRole,
  resendInvite,
  resetMember2FA,
  updateRolePermissions,
  getStaffAnalytics,
  sendWelcomeEmail,
  type TeamMember,
  type StaffAnalytics,
} from "@/lib/api";

type AdminStatus = "Active" | "Invited" | "Suspended";

type Admin = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: AdminStatus;
  lastActive: string;
  twoFactor: boolean;
  notes?: string;
  invitedAt?: string;
};

const statusStyles: Record<AdminStatus, string> = {
  Active:
    "bg-primary/15 text-primary ring-1 ring-inset ring-primary/20",
  Invited:
    "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  Suspended:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

type Tab = "team" | "roles" | "matrix" | "analytics";

const tabs: { id: Tab; label: string }[] = [
  { id: "team", label: "Team" },
  { id: "roles", label: "Roles" },
  { id: "matrix", label: "Permissions matrix" },
  { id: "analytics", label: "Staff analytics" },
];

function RowMenu({
  open,
  onToggle,
  onClose,
  actions,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  actions: { label: string; onClick: () => void; tone?: "danger" }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Actions"
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-lg">
          <ul className="space-y-0.5">
            {actions.map((a) => (
              <li key={a.label}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    a.onClick();
                  }}
                  className={`block w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                    a.tone === "danger"
                      ? "text-red-600 hover:bg-red-50"
                      : "text-foreground hover:bg-surface"
                  }`}
                >
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function TeamConsole() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTeam = useMemo(
    () => () => {
      setLoading(true);
      setLoadError(null);
      return Promise.allSettled([
        getTeam().then((res) =>
          setAdmins(
            (res.admins ?? []).map((m: TeamMember) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              roleId: m.role_id,
              status: (m.status === "SUSPENDED"
                ? "Suspended"
                : m.status === "ACTIVE"
                  ? "Active"
                  : "Invited") as AdminStatus,
              lastActive: m.last_active_at
                ? new Date(m.last_active_at).toLocaleDateString()
                : "—",
              twoFactor: m.two_factor,
            })),
          ),
        ),
        getRoles().then((res) => {
          if (res.roles && res.roles.length > 0) {
            setRoles(
              res.roles.map((r) => ({
                id: r.id,
                name: r.name,
                description: r.description,
                permissions: [],
                isSystem: r.is_system,
              })),
            );
          }
        }),
      ]).then((results) => {
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length === results.length) {
          setLoadError("Couldn't reach the API. Showing offline view.");
        }
        setLoading(false);
      });
    },
    [],
  );

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const [tab, setTab] = useState<Tab>("team");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminStatus>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [passwordFor, setPasswordFor] = useState<Admin | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);
  const [activityForId, setActivityForId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const rolesById = useMemo(() => {
    const m: Record<string, Role> = {};
    for (const r of roles) m[r.id] = r;
    return m;
  }, [roles]);

  const counts = useMemo(() => {
    const byRole: Record<string, number> = {};
    for (const a of admins) byRole[a.roleId] = (byRole[a.roleId] ?? 0) + 1;
    return byRole;
  }, [admins]);

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (roleFilter !== "all" && a.roleId !== roleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [admins, statusFilter, roleFilter, query]);

  const updateAdmin = (id: string, patch: Partial<Admin>) => {
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const togglePermission = (roleId: string, href: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        if (r.isSystem) return r;
        const has = r.permissions.includes(href as never);
        return {
          ...r,
          permissions: has
            ? r.permissions.filter((p) => p !== href)
            : [...r.permissions, href as never],
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
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
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          + Invite admin
        </button>
      </div>

      {loadError ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void loadTeam()}
            className="rounded-md border border-amber-200 bg-white px-2 py-1 text-[11px] font-semibold text-amber-700 transition-colors hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      ) : null}

      {tab === "team" ? (
        <Card
          title={`Admin team · ${admins.length}`}
          action={
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                className="h-8 rounded-lg border border-border bg-surface px-2 text-[11px] font-medium text-foreground outline-none focus:border-primary"
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Suspended">Suspended</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 rounded-lg border border-border bg-surface px-2 text-[11px] font-medium text-foreground outline-none focus:border-primary"
              >
                <option value="all">All roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <input
                type="search"
                placeholder="Search name, email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-56 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-semibold">Admin</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                  <th className="px-4 py-2.5 text-left font-semibold">2FA</th>
                  <th className="px-4 py-2.5 text-right font-semibold">
                    Last active
                  </th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && admins.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 animate-pulse rounded-full bg-surface" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-32 animate-pulse rounded bg-surface" />
                            <div className="h-2.5 w-44 animate-pulse rounded bg-surface" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-8 w-32 animate-pulse rounded-lg bg-surface" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-5 w-16 animate-pulse rounded-full bg-surface" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-14 animate-pulse rounded bg-surface" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="ml-auto h-3 w-20 animate-pulse rounded bg-surface" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="ml-auto h-7 w-7 animate-pulse rounded-md bg-surface" />
                      </td>
                    </tr>
                  ))
                ) : admins.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center"
                    >
                      <p className="text-sm font-semibold tracking-tight text-foreground">
                        No admins yet
                      </p>
                      <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">
                        Invite your team to give them scoped access to the
                        platform.
                      </p>
                      <button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="mt-4 inline-flex h-9 items-center rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30"
                      >
                        + Invite first admin
                      </button>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No admins match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => {
                    const role = rolesById[a.roleId];
                    return (
                      <tr key={a.id} className="hover:bg-surface/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={a.name} />
                            <div className="min-w-0">
                              <div className="font-semibold tracking-tight text-foreground">
                                {a.name}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {a.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={a.roleId}
                            disabled={a.status === "Suspended"}
                            onChange={async (e) => {
                              const newRoleId = e.target.value;
                              const prevRoleId = a.roleId;
                              updateAdmin(a.id, { roleId: newRoleId });
                              try {
                                await updateMemberRole(a.id, newRoleId);
                                setToast(
                                  `${a.name} role updated to ${rolesById[newRoleId]?.name}`,
                                );
                              } catch {
                                updateAdmin(a.id, { roleId: prevRoleId });
                                setToast("Couldn't update role — try again");
                              }
                            }}
                            className="h-8 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[a.status]}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {a.twoFactor ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                                aria-hidden
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Enabled
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-700">
                              Not set
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-muted-foreground">
                          {a.lastActive}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <RowMenu
                            open={menuOpenId === a.id}
                            onToggle={() =>
                              setMenuOpenId(menuOpenId === a.id ? null : a.id)
                            }
                            onClose={() => setMenuOpenId(null)}
                            actions={[
                              {
                                label: "View activity",
                                onClick: () => setActivityForId(a.id),
                              },
                              ...(a.status === "Invited"
                                ? [
                                    {
                                      label: "Set password",
                                      onClick: () => setPasswordFor(a),
                                    },
                                    {
                                      label: "Resend invite",
                                      onClick: async () => {
                                        try {
                                          await resendInvite(a.id);
                                        } catch {
                                          /* ignore */
                                        }
                                        setToast(`Invite resent to ${a.email}`);
                                      },
                                    },
                                  ]
                                : a.status === "Active"
                                  ? [
                                      {
                                        label: "Reset password",
                                        onClick: () => setPasswordFor(a),
                                      },
                                    ]
                                  : []),
                              ...(a.twoFactor
                                ? [
                                    {
                                      label: "Reset 2FA",
                                      onClick: async () => {
                                        try {
                                          await resetMember2FA(a.id);
                                        } catch {
                                          /* ignore */
                                        }
                                        updateAdmin(a.id, { twoFactor: false });
                                        setToast(
                                          `${a.name} 2FA reset — they'll re-scan on next sign-in`,
                                        );
                                      },
                                    },
                                  ]
                                : []),
                              ...(a.status === "Suspended"
                                ? [
                                    {
                                      label: "Reinstate",
                                      onClick: async () => {
                                        try {
                                          await reinstateMember(a.id);
                                        } catch {
                                          /* ignore */
                                        }
                                        updateAdmin(a.id, { status: "Active" });
                                        setToast(`${a.name} reinstated`);
                                      },
                                    },
                                  ]
                                : [
                                    {
                                      label: "Suspend",
                                      tone: "danger" as const,
                                      onClick: async () => {
                                        try {
                                          await suspendMember(a.id);
                                        } catch {
                                          /* ignore */
                                        }
                                        updateAdmin(a.id, { status: "Suspended" });
                                        setToast(`${a.name} suspended`);
                                      },
                                    },
                                  ]),
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === "roles" ? (
        <Card title={`Roles · ${roles.length}`}>
          <ul className="divide-y divide-border">
            {roles.map((r) => {
              const sees =
                r.permissions.includes("*")
                  ? SIDEBAR_ITEMS.length
                  : r.permissions.length;
              return (
                <li key={r.id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight text-foreground">
                          {r.name}
                        </span>
                        {r.isSystem ? (
                          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            System
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {r.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-muted-foreground">
                        Sees{" "}
                        <span className="font-bold text-foreground">{sees}</span>{" "}
                        pages
                      </span>
                      <span className="text-muted-foreground">
                        ·{" "}
                        <span className="font-bold text-foreground">
                          {counts[r.id] ?? 0}
                        </span>{" "}
                        members
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.permissions.includes("*") ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Full access
                      </span>
                    ) : (
                      SIDEBAR_ITEMS.filter((s) =>
                        r.permissions.includes(s.href),
                      ).map((s) => (
                        <span
                          key={s.href}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                        >
                          {s.label}
                        </span>
                      ))
                    )}
                  </div>
                  {!r.isSystem ? (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingRoleId(editingRoleId === r.id ? null : r.id)
                        }
                        className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                      >
                        {editingRoleId === r.id ? "Cancel" : "Edit permissions"}
                      </button>
                      {editingRoleId === r.id ? (
                        <button
                          type="button"
                          disabled={savingRoleId === r.id}
                          onClick={async () => {
                            setSavingRoleId(r.id);
                            try {
                              await updateRolePermissions(
                                r.id,
                                r.permissions.filter((p) => p !== "*"),
                              );
                              setToast(`${r.name} permissions saved`);
                              setEditingRoleId(null);
                            } catch {
                              setToast(
                                "Couldn't save permissions — try again",
                              );
                            } finally {
                              setSavingRoleId(null);
                            }
                          }}
                          className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingRoleId === r.id ? "Saving…" : "Save"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {editingRoleId === r.id && !r.isSystem ? (
                    <div className="mt-3 grid gap-2 rounded-xl border border-border bg-surface/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
                      {SIDEBAR_ITEMS.map((s) => {
                        const has = r.permissions.includes(s.href);
                        return (
                          <label
                            key={s.href}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface"
                          >
                            <input
                              type="checkbox"
                              checked={has}
                              onChange={() => togglePermission(r.id, s.href)}
                              className="h-3.5 w-3.5 rounded border-border accent-primary"
                            />
                            <span className="text-xs text-foreground">
                              {s.label}
                            </span>
                            <span className="ml-auto text-[9px] text-muted-foreground">
                              {s.group}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      {tab === "matrix" ? (
        <Card title="Role permissions matrix">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="sticky left-0 z-10 bg-surface/50 px-4 py-3 text-left font-semibold backdrop-blur">
                    Page
                  </th>
                  {roles.map((r) => (
                    <th
                      key={r.id}
                      className="px-3 py-3 text-center font-semibold"
                    >
                      <div className="text-foreground">{r.name}</div>
                      <div className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-muted-foreground">
                        {r.permissions.includes("*")
                          ? "All pages"
                          : `${r.permissions.length} pages`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SIDEBAR_ITEMS.map((s, i) => (
                  <tr
                    key={s.href}
                    className={`transition-colors hover:bg-surface/40 ${
                      i % 2 === 1 ? "bg-surface/20" : ""
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-card px-4 py-3">
                      <div className="text-xs font-semibold text-foreground">
                        {s.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {s.group}
                      </div>
                    </td>
                    {roles.map((r) => {
                      const allowed =
                        r.permissions.includes("*") ||
                        r.permissions.includes(s.href);
                      return (
                        <td
                          key={r.id}
                          className="px-3 py-3 text-center"
                          title={`${r.name} · ${s.label}: ${allowed ? "Allowed" : "Blocked"}`}
                        >
                          {allowed ? (
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-inset ring-primary/20">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-3 w-3"
                                aria-hidden
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-block h-5 w-5 rounded-full bg-muted/70 ring-1 ring-inset ring-border" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === "analytics" ? (
        <StaffAnalyticsView />
      ) : null}

      <AdminActivityModal
        admin={
          activityForId
            ? (() => {
                const a = admins.find((x) => x.id === activityForId);
                return a ? { id: a.id, name: a.name, email: a.email } : null;
              })()
            : null
        }
        onClose={() => setActivityForId(null)}
      />

      <SetPasswordModal
        open={passwordFor !== null}
        adminName={passwordFor?.name ?? ""}
        adminEmail={passwordFor?.email ?? ""}
        onClose={() => setPasswordFor(null)}
        onSave={async (password) => {
          if (!passwordFor) return;
          await setMemberPassword(passwordFor.id, password);
          updateAdmin(passwordFor.id, { status: "Active", lastActive: "Just now" });
          setToast(`${passwordFor.name} can sign in — share the password securely`);
          setPasswordFor(null);
        }}
      />

      <InviteAdminModal
        open={inviteOpen}
        roles={roles}
        onClose={() => setInviteOpen(false)}
        onInvite={async ({ name, email, roleId, notes, tempPassword }) => {
          try {
            const member = await inviteAdmin(name, email, roleId, tempPassword);
            const status: AdminStatus =
              member.status === "ACTIVE" ? "Active" : "Invited";
            setAdmins((prev) => [
              {
                id: member.id,
                name: member.name,
                email: member.email,
                roleId: member.role_id,
                status,
                lastActive: status === "Active" ? "Just now" : "Pending",
                twoFactor: false,
                invitedAt: "Just now",
                notes,
              },
              ...prev,
            ]);
            if (tempPassword) {
              const loginUrl = `${window.location.origin}/admin/login`;
              sendWelcomeEmail(member.id, tempPassword, loginUrl).catch(() => {});
            }
            setToast(
              status === "Active"
                ? `${name} invited — welcome email sent with credentials`
                : `${name} invited — welcome email sent`,
            );
          } catch {
            setToast("Invite failed — check email is unique and try again");
          }
          setInviteOpen(false);
        }}
      />

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

function StaffAnalyticsView() {
  const [data, setData] = useState<StaffAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStaffAnalytics()
      .then((res) => setData(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-xs text-muted-foreground animate-pulse">Loading staff analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-xs text-muted-foreground">Failed to load staff analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Staff Members" value={String(data.total_staff)} hint="Administrators registered" />
        <StatCard label="Active Staff (30d)" value={String(data.active_admins)} hint="With recorded audit activities" />
        <StatCard label="Total Actions Logged" value={String(data.actions_count)} hint="Security audit trail count" />
      </div>

      {/* Activity Breakdown Table */}
      <Card title="Administrative Action Breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Administrator</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Actions Performed</th>
                <th className="px-4 py-3 font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.activity_breakdown.map((member) => (
                <tr key={member.admin_id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div>
                      <p>{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.role}</td>
                  <td className="px-4 py-3 text-foreground font-semibold">{member.action_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {member.last_active ? new Date(member.last_active).toLocaleString() : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
