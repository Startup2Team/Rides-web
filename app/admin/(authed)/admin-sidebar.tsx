"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </Icon>
  ),
  drivers: (
    <Icon>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </Icon>
  ),
  customers: (
    <Icon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  ),
  liveRides: (
    <Icon>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14M7.76 16.24a6 6 0 0 1 0-8.49M4.93 19.07a10 10 0 0 1 0-14.14" />
    </Icon>
  ),
  negotiations: (
    <Icon>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M14 9h-3a1.5 1.5 0 1 0 0 3h2a1.5 1.5 0 1 1 0 3h-3" />
      <line x1="12" y1="7" x2="12" y2="8" />
      <line x1="12" y1="15" x2="12" y2="16" />
    </Icon>
  ),
  heatmaps: (
    <Icon>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Icon>
  ),
  revenue: (
    <Icon>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Icon>
  ),
  analytics: (
    <Icon>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </Icon>
  ),
  safety: (
    <Icon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  ),
  support: (
    <Icon>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z" />
    </Icon>
  ),
  inbox: (
    <Icon>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </Icon>
  ),
  reports: (
    <Icon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </Icon>
  ),
  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Icon>
  ),
  team: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      <path d="m18 11 2 2 4-4" />
    </Icon>
  ),
};

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  children?: { label: string; href: string }[];
  disabled?: boolean;
};

const driverCategories: { label: string; href: string }[] = [
  { label: "Moto Bikes", href: "/admin/drivers?vehicle=moto" },
  { label: "Cab Taxis", href: "/admin/drivers?vehicle=cab" },
  { label: "Light Hilux", href: "/admin/drivers?vehicle=hilux" },
  { label: "Heavy Fuso", href: "/admin/drivers?vehicle=fuso" },
];

const groups: {
  label: string;
  items: NavItem[];
}[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: icons.dashboard }],
  },
  {
    label: "Operations",
    items: [
      { label: "Drivers", href: "/admin/drivers", icon: icons.drivers, children: driverCategories },
      { label: "Customers", href: "/admin/customers", icon: icons.customers },
      { label: "Live Rides", href: "/admin/live-rides", icon: icons.liveRides },
      { label: "Negotiations", href: "/admin/negotiations", icon: icons.negotiations },
      { label: "Heatmaps", href: "/admin/heatmaps", icon: icons.heatmaps },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: icons.revenue },
      { label: "Analytics", href: "/admin/analytics", icon: icons.analytics },
      { label: "Reports", href: "/admin/reports", icon: icons.reports },
    ],
  },
  {
    label: "Trust",
    items: [
      { label: "Safety Center", href: "/admin/safety-center", icon: icons.safety },
      { label: "Support", href: "/admin/support", icon: icons.support },
      { label: "Inbox", href: "/admin/inbox", icon: icons.inbox },
    ],
  },
  {
    label: "System",
    items: [
      { label: "System Settings", href: "/admin/settings", icon: icons.settings },
      { label: "Admins & Roles", href: "/admin/team", icon: icons.team },
    ],
  },
];

function isChildActive(
  childHref: string,
  pathname: string,
  searchParams: URLSearchParams,
) {
  const [path, qs] = childHref.split("?");
  if (pathname !== path) return false;
  if (!qs) {
    // "All drivers" — active only when no vehicle filter is present
    return !searchParams.get("vehicle");
  }
  const target = new URLSearchParams(qs);
  for (const [k, v] of target.entries()) {
    if (searchParams.get(k) !== v) return false;
  }
  return true;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const group of groups) {
        for (const item of group.items) {
          if (!item.children) continue;
          const parentMatch =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          if (parentMatch) next.add(item.href);
        }
      }
      return next;
    });
  }, [pathname]);

  const toggle = (href: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-20 shrink-0 items-center gap-2.5 border-b border-border px-5">
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-[#00A040] shadow-md shadow-primary/30 ring-1 ring-inset ring-white/15">
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="h-4 w-4 text-primary-foreground"
            fill="currentColor"
          >
            <path d="M4 4.5h16v4h-6V20h-4V8.5H4z" />
            <circle cx="20" cy="20" r="2" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">
          Taravelis
        </span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {group.label}
            </p>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const parentMatch =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                if (item.children) {
                  const isOpen = expanded.has(item.href);
                  const parentExactActive =
                    parentMatch && !searchParams.get("vehicle");
                  return (
                    <li key={item.href}>
                      <div
                        className={`flex items-center rounded-lg pr-1 transition-colors ${
                          parentExactActive
                            ? "bg-primary/15 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-surface hover:text-foreground"
                        }`}
                      >
                        <Link
                          href={item.href}
                          className="flex flex-1 items-center gap-3 px-3 py-2 text-sm"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggle(item.href)}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-black/5"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                            className={`h-3.5 w-3.5 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>
                      {isOpen ? (
                        <ul className="mt-0.5 space-y-0.5 pl-9">
                          {item.children.map((child) => {
                            const childActive = isChildActive(
                              child.href,
                              pathname,
                              searchParams,
                            );
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={`flex items-center rounded-lg px-3 py-1.5 text-xs transition-colors ${
                                    childActive
                                      ? "bg-primary/10 font-semibold text-primary"
                                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                }

                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <div
                        aria-disabled
                        title="Coming soon"
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/60"
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        parentMatch
                          ? "bg-primary/15 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
