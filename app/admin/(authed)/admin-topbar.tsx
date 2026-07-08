"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useAdminNotifications } from "@/context/admin-notifications-context";
import { getDrivers, getCustomers, getRides } from "@/lib/api";

function initialsFrom(name: string | undefined, email: string | undefined): string {
  const source = (name?.trim() || email?.split("@")[0] || "").replace(/[._-]+/g, " ");
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type SearchResult = {
  id: string;
  label: string;
  sub: string;
  href: string;
  group: "Drivers" | "Customers" | "Rides";
};

async function runSearch(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return [];
  const p = { search: q, limit: "4" };
  const [driversRes, customersRes, ridesRes] = await Promise.allSettled([
    getDrivers(p),
    getCustomers(p),
    getRides(p),
  ]);

  const results: SearchResult[] = [];

  if (driversRes.status === "fulfilled") {
    for (const d of driversRes.value.drivers ?? []) {
      results.push({
        id: d.id,
        label: d.full_name ?? d.phone ?? "Driver",
        sub: `${d.transport_type.replace("_", " ")} · ${d.vehicle_plate ?? ""}`,
        href: `/admin/drivers`,
        group: "Drivers",
      });
    }
  }
  if (customersRes.status === "fulfilled") {
    for (const c of customersRes.value.customers ?? []) {
      results.push({
        id: c.id,
        label: c.full_name ?? c.phone,
        sub: `Customer · ${c.phone}`,
        href: `/admin/customers`,
        group: "Customers",
      });
    }
  }
  if (ridesRes.status === "fulfilled") {
    for (const r of ridesRes.value.rides ?? []) {
      results.push({
        id: r.id,
        label: r.pickup_address,
        sub: `→ ${r.destination_address} · ${r.status}`,
        href: `/admin/live-rides`,
        group: "Rides",
      });
    }
  }

  return results;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function AdminTopbar({ onOpenMobile }: { onOpenMobile?: () => void } = {}) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchDropRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { user, ready } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useAdminNotifications();
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account";
  const displayEmail = user?.email ?? "";
  const initials = useMemo(() => initialsFrom(user?.name, user?.email), [user?.name, user?.email]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounced global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await runSearch(searchQuery.trim());
        setSearchResults(res);
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenNotif(false);
        setOpenUser(false);
        setSearchOpen(false);
        setSearchQuery("");
        if (document.activeElement === searchRef.current) {
          searchRef.current?.blur();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(t)) setOpenNotif(false);
      if (userRef.current && !userRef.current.contains(t)) setOpenUser(false);
      if (
        searchDropRef.current && !searchDropRef.current.contains(t) &&
        searchRef.current && !searchRef.current.contains(t)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 grid h-20 shrink-0 grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-4 border-b border-border/60 bg-card/70 px-4 backdrop-blur-xl backdrop-saturate-150 lg:px-6">
      <div />

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {searchLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          ) : (
            <Icon>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Icon>
          )}
        </span>
        <input
          ref={searchRef}
          type="text"
          value={searchQuery ?? ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search drivers, customers, rides…"
          className="block h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {searchOpen && (searchResults.length > 0 || searchLoading) ? (
          <div
            ref={searchDropRef}
            className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            {(["Drivers", "Customers", "Rides"] as const).map((group) => {
              const items = searchResults.filter((r) => r.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <div className="border-b border-border bg-surface/60 px-3 py-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {group}
                    </span>
                  </div>
                  <ul>
                    {items.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={r.href}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {r.label.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">{r.label}</p>
                            <p className="truncate text-[10px] text-muted-foreground">{r.sub}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="border-t border-border bg-surface/40 px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/drivers?search=${encodeURIComponent(searchQuery)}`);
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                See all results for &ldquo;{searchQuery}&rdquo; →
              </button>
            </div>
          </div>
        ) : null}

        {searchOpen && searchResults.length === 0 && !searchLoading ? (
          <div
            ref={searchDropRef}
            className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-border bg-card px-4 py-6 text-center shadow-2xl"
          >
            <p className="text-sm text-muted-foreground">No results for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenNotif((v) => !v);
              setOpenUser(false);
            }}
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <Icon>
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </Icon>
            {unreadCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-card">
                {unreadCount}
              </span>
            ) : null}
          </button>
          {openNotif ? (
            <div className="absolute left-1/2 top-full mt-2 w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    Notifications
                  </h3>
                  {unreadCount > 0 ? (
                    <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">
                      {unreadCount} new
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-muted-foreground hover:text-primary"
                >
                  Mark all read
                </button>
              </div>
              <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        markRead(n.id);
                        setOpenNotif(false);
                      }}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface ${
                        n.unread ? "bg-primary/[0.02]" : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          n.tone === "danger"
                            ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200"
                            : n.tone === "warn"
                            ? "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200"
                            : "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
                        }`}
                      >
                        <Icon>
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </Icon>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold tracking-tight text-foreground">
                            {n.title}
                          </p>
                          {n.unread ? (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          ) : null}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {n.detail}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {n.time}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border bg-surface/50 px-4 py-2 text-center">
                <Link
                  href="/admin/safety-center"
                  onClick={() => setOpenNotif(false)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setOpenUser((v) => !v);
              setOpenNotif(false);
            }}
            className="flex h-10 items-center gap-2.5 rounded-full border border-border bg-card pl-1 pr-3 transition-colors hover:bg-surface"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-[#0056B3] text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-inset ring-white/20">
              {ready ? (
                user?.photo_url || user?.photoUrl ? (
                  <img
                    src={(user.photo_url || user.photoUrl) ?? undefined}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold tracking-tight">{initials}</span>
                )
              ) : (
                <span className="block h-3 w-3 animate-pulse rounded-full bg-white/40" aria-hidden />
              )}
            </span>
            <span className="hidden max-w-[160px] truncate text-sm font-semibold tracking-tight text-foreground sm:inline">
              {ready ? displayName : "Loading…"}
            </span>
            <Icon>
              <polyline points="6 9 12 15 18 9" />
            </Icon>
          </button>
          {openUser ? (
            <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center gap-3 border-b border-border bg-surface/40 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-[#0056B3] text-primary-foreground shadow-sm shadow-primary/30 ring-1 ring-inset ring-white/20">
                  {user?.photo_url || user?.photoUrl ? (
                    <img
                      src={(user.photo_url || user.photoUrl) ?? undefined}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold tracking-tight">{initials}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold tracking-tight text-foreground">
                    {displayName}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {displayEmail || "—"}
                  </div>
                </div>
              </div>
              <ul className="p-1.5">
                <li>
                  <Link
                    href="/admin/account"
                    onClick={() => setOpenUser(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface"
                  >
                    <span className="text-muted-foreground">
                      <Icon>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 20a7 7 0 0 1 14 0" />
                      </Icon>
                    </span>
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/settings"
                    onClick={() => setOpenUser(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface"
                  >
                    <span className="text-muted-foreground">
                      <Icon>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </Icon>
                    </span>
                    Settings
                  </Link>
                </li>
              </ul>
              <div className="border-t border-border p-1.5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <span className="text-muted-foreground">
                    <Icon>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </Icon>
                  </span>
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
