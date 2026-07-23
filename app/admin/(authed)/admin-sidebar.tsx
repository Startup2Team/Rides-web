"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useAuth } from "@/context/auth-context";
import { hasPermission } from "@/lib/admin-permissions";
import { getInboxStats, getTicketsStats, getLiveRidesStats } from "@/lib/api";
import { listNotifications } from "@/lib/notification-store";

// motion.create() must be called once at module scope, not inside a component.
const MotionLink = motion.create(Link);

// Expand/collapse for the "Drivers" sub-menu — the group grows open with a
// fade, then its rows stagger in one after another.
const subMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const, staggerChildren: 0.04, delayChildren: 0.05 },
  },
  exit: { height: 0, opacity: 0, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const } },
};
const subMenuItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

/** macOS-dock-style magnification: a row scales up the closer the cursor gets
 * to its vertical center, tracked via a shared mouseY MotionValue so
 * neighboring rows feel the same cursor and scale together. */
function useDockScale(mouseY: MotionValue<number>) {
  const ref = useRef<HTMLElement>(null);
  const distance = useTransform(mouseY, (val) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return Infinity;
    return val - (rect.top + rect.height / 2);
  });
  const scaleRaw = useTransform(distance, [-70, 0, 70], [1, 1.08, 1], { clamp: true });
  const scale = useSpring(scaleRaw, { mass: 0.15, stiffness: 250, damping: 18 });
  return { ref, scale };
}

/** Renders as a Link when `href` is given, otherwise a plain motion.div
 * (used for the expandable "Drivers" header row). */
function NavRow({
  href,
  mouseY,
  className,
  children,
}: {
  href?: string;
  mouseY: MotionValue<number>;
  className: string;
  children: ReactNode;
}) {
  const { ref, scale } = useDockScale(mouseY);
  const prefersReducedMotion = useReducedMotion();
  const style = prefersReducedMotion ? undefined : { scale, transformOrigin: "left center" as const };

  if (href) {
    return (
      <MotionLink href={href} ref={ref as React.Ref<HTMLAnchorElement>} style={style} className={`group ${className}`}>
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.div ref={ref as React.Ref<HTMLDivElement>} style={style} className={`group ${className}`}>
      {children}
    </motion.div>
  );
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
      className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-125"
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
  notifications: (
    <Icon>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
  profile: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Icon>
  ),
  packages: (
    <Icon>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </Icon>
  ),
  campaigns: (
    <Icon>
      <path d="M3 11l18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </Icon>
  ),
  partners: (
    <Icon>
      <rect x="3" y="3" width="18" height="12" rx="2" />
      <path d="M7 21h10" />
      <path d="M9 17v4" />
      <path d="M15 17v4" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m14 11 2-2 3 3" />
    </Icon>
  ),
  purchases: (
    <Icon>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </Icon>
  ),
  entitlements: (
    <Icon>
      <path d="M14 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
      <path d="M18 8a4 4 0 0 0-3.78 5.28" />
      <path d="M2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </Icon>
  ),
  team: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      <path d="m18 11 2 2 4-4" />
    </Icon>
  ),
  audit: (
    <Icon>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="11" y2="17" />
    </Icon>
  ),
  logout: (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
  ),
};

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  children?: { label: string; href: string }[];
  disabled?: boolean;
};

const driverCategories: { label: string; href: string }[] = [
  { label: "Moto Bikes",  href: "/admin/drivers?vehicle=moto" },
  { label: "Rifani",      href: "/admin/drivers?vehicle=rifani" },
  { label: "Cab Taxis",   href: "/admin/drivers?vehicle=cab" },
  { label: "Light Hilux", href: "/admin/drivers?vehicle=hilux" },
  { label: "Heavy Fuso",  href: "/admin/drivers?vehicle=fuso" },
];

export const groups: {
  label: string;
  items: NavItem[];
}[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: icons.dashboard },
      { label: "Notifications", href: "/admin/notifications", icon: icons.notifications },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Drivers", href: "/admin/drivers", icon: icons.drivers, children: driverCategories },
      { label: "Customers", href: "/admin/customers", icon: icons.customers },
      { label: "Live Rides", href: "/admin/live-rides", icon: icons.liveRides },
      { label: "Fare Negotiations", href: "/admin/negotiations", icon: icons.negotiations },
      { label: "Demand Heatmap", href: "/admin/heatmaps", icon: icons.heatmaps },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Finance", href: "/admin/revenue", icon: icons.revenue },
      { label: "Analytics", href: "/admin/analytics", icon: icons.analytics },
    ],
  },
  {
    label: "Trust",
    items: [
      { label: "Support", href: "/admin/support", icon: icons.support },
      { label: "Inbox", href: "/admin/inbox", icon: icons.inbox },
    ],
  },
  {
    label: "Monetization",
    items: [
      { label: "Ride Packages", href: "/admin/packages", icon: icons.packages },
      { label: "Promotions", href: "/admin/campaigns", icon: icons.campaigns },
      { label: "Partner Ads", href: "/admin/partners", icon: icons.partners },
      { label: "Purchases", href: "/admin/purchases", icon: icons.purchases },
      { label: "Ride Credits", href: "/admin/entitlements", icon: icons.entitlements },
    ],
  },
];

// Rendered in a bottom-pinned section, separate from the scrollable nav above.
export const bottomItems: NavItem[] = [
  { label: "Profile", href: "/admin/profile", icon: icons.profile },
  { label: "Admins & Roles", href: "/admin/team", icon: icons.team },
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

export function AdminSidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
} = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, permissions, ready, logout } = useAuth();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const mouseY = useMotionValue(Infinity);

  // Avoid SSR/CSR mismatch: user comes from localStorage on the client only,
  // so first render must match the server (which has no user).
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const showUser = mounted && user;

  // Nav badge counts, keyed by href — refreshed periodically so they stay reasonably fresh.
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let cancelled = false;
    const loadCounts = () => {
      listNotifications()
        .then((list) => {
          const pending = list.filter((n) => n.status === "draft" || n.status === "scheduled").length;
          if (!cancelled) setCounts((prev) => ({ ...prev, "/admin/notifications": pending }));
        })
        .catch((err) => console.error("[sidebar] listNotifications failed:", err));

      getInboxStats()
        .then((s) => !cancelled && setCounts((prev) => ({ ...prev, "/admin/inbox": s.new })))
        .catch((err) => console.error("[sidebar] getInboxStats failed:", err));
      getTicketsStats()
        .then((s) => !cancelled && setCounts((prev) => ({ ...prev, "/admin/support": s.open })))
        .catch((err) => console.error("[sidebar] getTicketsStats failed:", err));
      getLiveRidesStats()
        .then((s) => !cancelled && setCounts((prev) => ({ ...prev, "/admin/live-rides": s.total })))
        .catch((err) => console.error("[sidebar] getLiveRidesStats failed:", err));
    };
    loadCounts();
    const interval = setInterval(loadCounts, 45000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const group of groups) {
        for (const item of group.items) {
          if (!item.children) continue;
          const childMatch = item.children.some(
            (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
          );
          const parentMatch =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          if (parentMatch || childMatch) next.add(item.href);
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
    <>
      {/* Mobile backdrop */}
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } lg:shadow-none`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 border-b border-border px-4 sm:h-20 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25 ring-1 ring-black/5">
              <Image
                src="/ridelogo-white.png"
                alt=""
                width={64}
                height={64}
                priority
                className="h-6 w-6"
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold leading-none tracking-[-0.03em] text-foreground">
                Rides<span className="text-primary">.rw</span>
              </p>
              {showUser && user.role_name ? (
                <span className="mt-1 inline-block w-fit rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-primary">
                  {user.role_name === "Super Admin" ? "Admin" : user.role_name}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
        onMouseMove={(e) => mouseY.set(e.clientY)}
        onMouseLeave={() => mouseY.set(Infinity)}
      >
        {groups.map((group) => {
          const items = ready
            ? group.items.filter((item) => {
                if (!item.children) return hasPermission(permissions, item.href);
                return item.children.some((child) => hasPermission(permissions, child.href));
              })
            : group.items;
          if (items.length === 0) return null;
          return (
          <div key={group.label} className="mb-1">
            <div className="mb-2 mt-4 flex items-center gap-2 px-2 first:mt-0">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {group.label}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <ul className="space-y-1">
              {items.map((item) => {
                const parentMatch =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                const childMatch = item.children?.some(
                  (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
                );

                if (item.children) {
                  const isOpen = expanded.has(item.href);
                  const parentExactActive = parentMatch || childMatch;
                  return (
                    <li key={item.href}>
                      <NavRow
                        mouseY={mouseY}
                        className={`flex items-center pr-1 transition-colors font-normal ${
                          parentExactActive
                            ? "rounded-full bg-primary font-normal text-white"
                            : "rounded-lg text-foreground hover:bg-primary/10"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(item.href)}
                          className="flex flex-1 items-center gap-3 px-3 py-2.5 text-base"
                        >
                          {item.icon}
                          <span className="inline-block origin-left transition-transform duration-200 ease-out group-hover:scale-110">{item.label}</span>
                        </button>
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
                      </NavRow>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.ul
                            variants={subMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mt-0.5 space-y-0.5 overflow-hidden pl-9"
                          >
                            {item.children.filter((child) => !ready || hasPermission(permissions, child.href)).map((child) => {
                              const childActive = isChildActive(
                                child.href,
                                pathname,
                                searchParams,
                              );
                              return (
                                <motion.li key={child.href} variants={subMenuItemVariants}>
                                  <NavRow
                                    href={child.href}
                                    mouseY={mouseY}
                                    className={`flex items-center px-3 py-2 text-sm transition-colors font-normal ${
                                      childActive
                                        ? "rounded-full bg-primary font-normal text-white"
                                        : "rounded-lg text-foreground hover:bg-primary/10"
                                    }`}
                                  >
                                    <span className="inline-block origin-left transition-transform duration-200 ease-out group-hover:scale-110">
                                      {child.label}
                                    </span>
                                  </NavRow>
                                </motion.li>
                              );
                            })}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </li>
                  );
                }

                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <div
                        aria-disabled
                        title="Coming soon"
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-base text-muted-foreground/60"
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
                    <NavRow
                      href={item.href}
                      mouseY={mouseY}
                      className={`flex items-center gap-3 px-3 py-2.5 text-base transition-colors font-normal ${
                        parentMatch
                          ? "rounded-full bg-primary font-normal text-white"
                          : "rounded-lg text-foreground hover:bg-primary/10"
                      }`}
                    >
                      {item.icon}
                      <span className="inline-block origin-left transition-transform duration-200 ease-out group-hover:scale-110">{item.label}</span>
                      {counts[item.href] ? (
                        <span
                          className={`ml-auto inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                            parentMatch ? "bg-white/25 text-white" : "bg-primary text-white"
                          }`}
                        >
                          {counts[item.href]! > 9 ? "9+" : counts[item.href]}
                        </span>
                      ) : null}
                    </NavRow>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <ul className="space-y-1">
          {bottomItems
            .filter((item) => !ready || hasPermission(permissions, item.href))
            .map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal transition-colors ${
                      active ? "rounded-full bg-primary text-white" : "text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          <li>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-normal text-red-600 transition-colors hover:bg-red-50"
            >
              {icons.logout}
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
    </>
  );
}
