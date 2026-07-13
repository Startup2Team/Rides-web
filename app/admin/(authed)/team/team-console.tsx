"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Card, StatCard } from "../_components";
import { InviteAdminModal } from "./invite-admin-modal";
import { SetPasswordModal } from "./set-password-modal";
import { AdminActivityModal } from "./admin-activity-modal";
import { DEFAULT_ROLES, type Role } from "./roles";
import { RoleDrawer } from "./role-drawer";
import {
  getTeam,
  getRoles,
  inviteAdmin,
  sendWelcomeEmail,
  setMemberPassword,
  suspendMember,
  reinstateMember,
  updateMemberRole,
  resendInvite,
  resetMember2FA,
  updateRolePermissions,
  getStaffAnalytics,
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
  photoUrl?: string | null;
  invitedAt?: string;
  invitedBy?: string;
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
              photoUrl: (m as TeamMember & { photo_url?: string | null }).photo_url ?? null,
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
  const [actionFor, setActionFor] = useState<Admin | null>(null);
  const [drawerRole, setDrawerRole] = useState<Role | null>(null);
  const [activityForId, setActivityForId] = useState<string | null>(null);
  const [activityBackAdmin, setActivityBackAdmin] = useState<Admin | null>(null);
  const [passwordBackAdmin, setPasswordBackAdmin] = useState<Admin | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{ adminId: string; adminName: string; fromRoleId: string; toRoleId: string } | null>(null);
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

  const liveStats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => a.status === "Active").length;
    const pending = admins.filter((a) => a.status === "Invited").length;
    const suspended = admins.filter((a) => a.status === "Suspended").length;
    const roleCount = roles.length;
    const firstName = roles[0]?.name ?? "";
    const lastName = roles[roleCount - 1]?.name ?? "";
    return [
      {
        label: "Total Admins",
        value: loading ? "—" : String(total),
        hint: `across ${roleCount} role${roleCount !== 1 ? "s" : ""}`,
        tone: "primary" as const,
      },
      {
        label: "Active",
        value: loading ? "—" : String(active),
        hint: suspended > 0 ? `${suspended} suspended` : "all in good standing",
        tone: "default" as const,
      },
      {
        label: "Roles Defined",
        value: loading ? "—" : String(roleCount),
        hint: firstName && lastName ? `${firstName} → ${lastName}` : "—",
        tone: "default" as const,
      },
      {
        label: "Pending Invites",
        value: loading ? "—" : String(pending),
        hint: pending === 0 ? "all accepted" : "awaiting acceptance",
        tone: pending > 0 ? ("warning" as const) : ("default" as const),
      },
    ];
  }, [admins, roles, loading]);

  return (
    <div className="space-y-6">
      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {liveStats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md hover:shadow-primary/5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {s.label}
            </p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${
              s.tone === "primary" ? "text-primary"
              : s.tone === "warning" ? "text-amber-600"
              : "text-foreground"
            }`}>
              {s.value}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

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
          + Add member
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
        <>
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
                        + Add first member
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
                          <div className="relative">
                            <select
                              value={a.roleId}
                              disabled={a.status === "Suspended"}
                              onChange={(e) => {
                                const toRoleId = e.target.value;
                                if (toRoleId !== a.roleId) {
                                  setConfirmRoleChange({ adminId: a.id, adminName: a.name, fromRoleId: a.roleId, toRoleId });
                                }
                              }}
                              className="h-8 rounded-lg border border-border bg-surface px-2 text-xs font-medium text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                            </select>
                          </div>
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
                          <button
                            type="button"
                            onClick={() => setActionFor(a)}
                            className="inline-flex h-7 items-center rounded-lg border border-border bg-surface px-2.5 text-[11px] font-medium text-foreground hover:border-primary/40 hover:text-primary"
                          >
                            Actions
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      ) : null}

      {tab === "roles" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => {
            const isFullAccess = r.permissions.includes("*");
            const grantedCount = isFullAccess ? 22 : r.permissions.length;
            const pct = Math.round((grantedCount / 22) * 100);
            const memberCount = counts[r.id] ?? 0;
            return (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md hover:shadow-primary/5"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold tracking-tight text-foreground">{r.name}</p>
                      {r.isSystem && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          System
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{r.description}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">
                      {isFullAccess ? "Full access" : `${grantedCount} pages`}
                    </span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5">
                    {/* Avatar stack placeholder */}
                    {memberCount > 0 ? (
                      <div className="flex -space-x-1.5">
                        {Array.from({ length: Math.min(memberCount, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary/20 text-[9px] font-bold text-primary"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <span className="text-[11px] text-muted-foreground">
                      {memberCount === 0 ? "No members" : `${memberCount} member${memberCount !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerRole(r)}
                    className="inline-flex h-7 items-center rounded-lg border border-border bg-surface px-2.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {r.isSystem ? "View" : "Edit"}
                  </button>
                </div>
              </div>
            );
          })}

          {/* New role card */}
          <button
            type="button"
            onClick={() => setToast("Custom role creation coming soon")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-4 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-current">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span className="text-xs font-medium">New role</span>
          </button>
        </div>
      ) : null}

      {/* Member action modal */}
      {actionFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={() => setActionFor(null)} aria-hidden />
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <button type="button" onClick={() => setActionFor(null)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <Avatar name={actionFor.name} url={actionFor.photoUrl} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{actionFor.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{actionFor.email}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[actionFor.status]}`}>
                {actionFor.status}
              </span>
            </div>

            {/* Role + 2FA info strip */}
            <div className="flex items-center gap-4 border-b border-border bg-surface/40 px-5 py-2.5 text-[11px] text-muted-foreground">
              <span>Role: <span className="font-semibold text-foreground">{rolesById[actionFor.roleId]?.name ?? "—"}</span></span>
              <span>2FA: <span className={`font-semibold ${actionFor.twoFactor ? "text-primary" : "text-amber-600"}`}>{actionFor.twoFactor ? "Enabled" : "Not set"}</span></span>
              <span>Last active: <span className="font-semibold text-foreground">{actionFor.lastActive}</span></span>
            </div>

            {/* Actions list */}
            <ul className="divide-y divide-border">
              <li>
                <button type="button" onClick={() => { const a = actionFor; setActionFor(null); setActivityBackAdmin(a); setActivityForId(a.id); }}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">View activity</p>
                    <p className="text-[11px] text-muted-foreground">See login history and recent actions</p>
                  </div>
                </button>
              </li>

              {actionFor.status === "Invited" ? (
                <>
                  <li>
                    <button type="button" onClick={() => { const a = actionFor; setActionFor(null); setPasswordBackAdmin(a); setPasswordFor(a); }}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Set password</p>
                        <p className="text-[11px] text-muted-foreground">Required before they can sign in</p>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={async () => { setActionFor(null); try { await resendInvite(actionFor.id); } catch { /**/ } setToast(`Invite resent to ${actionFor.email}`); }}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Resend invite</p>
                        <p className="text-[11px] text-muted-foreground">Send the invite email again</p>
                      </div>
                    </button>
                  </li>
                </>
              ) : actionFor.status === "Active" ? (
                <li>
                  <button type="button" onClick={() => { const a = actionFor; setActionFor(null); setPasswordBackAdmin(a); setPasswordFor(a); }}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Reset password</p>
                      <p className="text-[11px] text-muted-foreground">Set a new temporary password for them</p>
                    </div>
                  </button>
                </li>
              ) : null}

              {actionFor.twoFactor ? (
                <li>
                  <button type="button" onClick={async () => { const a = actionFor; setActionFor(null); try { await resetMember2FA(a.id); } catch { /**/ } updateAdmin(a.id, { twoFactor: false }); setToast(`${a.name} 2FA reset`); }}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Reset 2FA</p>
                      <p className="text-[11px] text-muted-foreground">They'll re-scan the QR code on next sign-in</p>
                    </div>
                  </button>
                </li>
              ) : null}

              {/* Divider before destructive */}
              <li className="border-t border-border">
                {actionFor.status === "Suspended" ? (
                  <button type="button" onClick={async () => { const a = actionFor; setActionFor(null); try { await reinstateMember(a.id); } catch { /**/ } updateAdmin(a.id, { status: "Active" }); setToast(`${a.name} reinstated`); }}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Reinstate</p>
                      <p className="text-[11px] text-muted-foreground">Restore their access to the platform</p>
                    </div>
                  </button>
                ) : (
                  <button type="button" onClick={async () => { const a = actionFor; setActionFor(null); try { await suspendMember(a.id); } catch { /**/ } updateAdmin(a.id, { status: "Suspended" }); setToast(`${a.name} suspended`); }}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-red-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-red-600">Suspend</p>
                      <p className="text-[11px] text-muted-foreground">Block their access immediately</p>
                    </div>
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {/* Role drawer */}
      <RoleDrawer
        role={drawerRole}
        memberCount={drawerRole ? (counts[drawerRole.id] ?? 0) : 0}
        onClose={() => setDrawerRole(null)}
        onSaved={(updated) => {
          setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setToast(`${updated.name} permissions saved`);
          setDrawerRole(null);
        }}
      />

      {/* Role change confirm popover */}
      {confirmRoleChange ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setConfirmRoleChange(null)} aria-hidden />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <p className="text-sm font-bold text-foreground">Change role?</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Change <span className="font-semibold text-foreground">{confirmRoleChange.adminName}</span> from{" "}
              <span className="font-semibold text-foreground">{rolesById[confirmRoleChange.fromRoleId]?.name}</span> to{" "}
              <span className="font-semibold text-foreground">{rolesById[confirmRoleChange.toRoleId]?.name}</span>?
              Their access changes immediately.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRoleChange(null)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { adminId, adminName, toRoleId, fromRoleId } = confirmRoleChange;
                  setConfirmRoleChange(null);
                  updateAdmin(adminId, { roleId: toRoleId });
                  try {
                    await updateMemberRole(adminId, toRoleId);
                    setToast(`${adminName} role updated to ${rolesById[toRoleId]?.name}`);
                  } catch {
                    updateAdmin(adminId, { roleId: fromRoleId });
                    setToast("Couldn't update role — try again");
                  }
                }}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
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
        onClose={() => { setActivityForId(null); setActivityBackAdmin(null); }}
        onBack={activityBackAdmin ? () => { setActivityForId(null); setActionFor(activityBackAdmin); setActivityBackAdmin(null); } : undefined}
      />

      <SetPasswordModal
        open={passwordFor !== null}
        adminName={passwordFor?.name ?? ""}
        adminEmail={passwordFor?.email ?? ""}
        onClose={() => { setPasswordFor(null); setPasswordBackAdmin(null); }}
        onBack={passwordBackAdmin ? () => { setPasswordFor(null); setActionFor(passwordBackAdmin); setPasswordBackAdmin(null); } : undefined}
        onSave={async (password) => {
          if (!passwordFor) return;
          await setMemberPassword(passwordFor.id, password);
          updateAdmin(passwordFor.id, { status: "Active", lastActive: "Just now" });
          setToast(`${passwordFor.name} can sign in — share the password securely`);
          setPasswordFor(null);
          setPasswordBackAdmin(null);
        }}
      />

      <InviteAdminModal
        open={inviteOpen}
        roles={roles}
        onClose={() => setInviteOpen(false)}
        onInvite={async ({ name, email, roleId, tempPassword }) => {
          try {
            const member = await inviteAdmin(name, email, roleId, tempPassword);
            setAdmins((prev) => [
              {
                id: member.id,
                name: member.name,
                email: member.email,
                roleId: member.role_id,
                status: "Active",
                lastActive: "Just now",
                twoFactor: false,
                photoUrl: null,
              },
              ...prev,
            ]);
            if (tempPassword) {
              const loginUrl = `${window.location.origin}/admin/login`;
              sendWelcomeEmail(member.id, tempPassword, loginUrl).catch(() => {});
            }
            setToast(`${name} added — welcome email sent`);
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
