"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DateSubtitle, Greeting } from "../_greeting";
import { RecentMessagesWidget } from "../recent-messages-widget";
import {
  getTicketsStats,
  getInboxStats,
  getTickets,
  type TicketsStats,
  type InboxStats,
  type Ticket,
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { MonetizationGrid } from "../monetization-widgets";

function QuickLink({
  href,
  title,
  description,
  stat,
}: {
  href: string;
  title: string;
  description: string;
  stat?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {stat ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {stat}
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      <span className="mt-4 text-xs font-semibold text-primary group-hover:underline">Open →</span>
    </Link>
  );
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 5) return "Just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatStatus(status: string): string {
  const s = status.toUpperCase();
  if (s === "OPEN") return "Open";
  if (s === "PENDING") return "Pending";
  if (s === "RESOLVED") return "Resolved";
  if (s === "CLOSED") return "Closed";
  return status;
}

function formatPriority(priority: string): string {
  const p = priority.toLowerCase();
  return p.charAt(0).toUpperCase() + p.slice(1);
}

const PRIORITY_TONE: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  LOW: "bg-muted text-muted-foreground",
};

const STATUS_TONE: Record<string, string> = {
  OPEN: "bg-primary/10 text-primary",
  PENDING: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

function priorityRank(p: string): number {
  const u = p.toUpperCase();
  if (u === "HIGH") return 0;
  if (u === "MEDIUM") return 1;
  return 2;
}

function TicketQueue({ tickets, loading }: { tickets: Ticket[]; loading: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Needs attention</h2>
        <Link href="/admin/support" className="text-xs font-medium text-primary hover:underline">
          Ticket queue
        </Link>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Open and pending tickets, highest priority first</p>
      {loading ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">No open tickets — you&apos;re caught up.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {tickets.map((t) => {
            const statusKey = t.status.toUpperCase();
            const priorityKey = t.priority.toUpperCase();
            return (
              <li key={t.id} className="py-3">
                <Link
                  href="/admin/support"
                  className="block text-xs transition-opacity hover:opacity-80"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{t.subject}</p>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        STATUS_TONE[statusKey] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {formatStatus(t.status)}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        PRIORITY_TONE[priorityKey] ?? PRIORITY_TONE.MEDIUM
                      }`}
                    >
                      {formatPriority(t.priority)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {t.from_name ?? t.from_phone ?? "Unknown"} · {t.type.replace(/_/g, " ")}
                    {t.ride_id ? ` · Ride ${t.ride_id.slice(0, 8)}` : ""}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Updated {timeAgo(t.updated_at)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SupportDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ticketStats, setTicketStats] = useState<TicketsStats | null>(null);
  const [inboxStats, setInboxStats] = useState<InboxStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getTicketsStats(),
      getInboxStats(),
      getTickets({ limit: "20", offset: "0" }),
    ])
      .then(([tix, inbox, list]) => {
        if (cancelled) return;
        setTicketStats(tix);
        setInboxStats(inbox);
        setTickets(list.tickets ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setTicketStats(null);
          setInboxStats(null);
          setTickets([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const queue = useMemo(() => {
    return tickets
      .filter((t) => {
        const s = t.status.toUpperCase();
        return s === "OPEN" || s === "PENDING";
      })
      .sort((a, b) => {
        const pr = priorityRank(a.priority) - priorityRank(b.priority);
        if (pr !== 0) return pr;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
      .slice(0, 8);
  }, [tickets]);

  const activeTickets =
    ticketStats != null ? ticketStats.open + ticketStats.pending : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Support Staff
          </p>
          <Greeting />
          <DateSubtitle />
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Customer-facing queue for {user?.name ?? "your team"}. Triage support tickets and
            contact-form messages — no fleet or revenue tools on this account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/support"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
          >
            Open tickets
          </Link>
          <Link
            href="/admin/inbox"
            className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-primary/30"
          >
            Contact inbox
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Open tickets",
            value: loading ? "…" : String(ticketStats?.open ?? "—"),
            hint: "Awaiting first response",
          },
          {
            label: "Pending",
            value: loading ? "…" : String(ticketStats?.pending ?? "—"),
            hint: "Reply sent, awaiting customer",
          },
          {
            label: "Resolved today",
            value: loading ? "…" : String(ticketStats?.resolved_today ?? "—"),
            hint: "Closed in the last 24h",
          },
          {
            label: "Inbox (new)",
            value: loading ? "…" : String(inboxStats?.new ?? "—"),
            hint: "Unread contact form messages",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {!loading && activeTickets != null && activeTickets > 0 ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">{activeTickets}</span> active ticket
          {activeTickets === 1 ? "" : "s"} in the queue — start with high-priority open items below.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLink
          href="/admin/support"
          title="Support tickets"
          description="Assign, reply, and resolve rider and driver issues linked to rides."
          stat={activeTickets != null ? `${activeTickets} active` : "Queue"}
        />
        <QuickLink
          href="/admin/inbox"
          title="Contact inbox"
          description="Messages from the public contact form — reply, archive, or mark spam."
          stat={inboxStats?.new ? `${inboxStats.new} new` : "Inbox"}
        />
      </div>

      <MonetizationGrid />

      <div className="grid gap-4 lg:grid-cols-2">
        <TicketQueue tickets={queue} loading={loading} />
        <div className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
          <h2 className="text-sm font-semibold text-foreground">Today at a glance</h2>
          <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
            <li className="flex justify-between gap-2">
              <span>Tickets resolved today</span>
              <span className="font-semibold text-foreground">
                {loading ? "…" : (ticketStats?.resolved_today ?? 0)}
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Inbox replied (7 days)</span>
              <span className="font-semibold text-foreground">
                {loading ? "…" : (inboxStats?.replied_7d ?? 0)}
              </span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Spam flagged (inbox)</span>
              <span className="font-semibold text-foreground">
                {loading ? "…" : (inboxStats?.spam ?? 0)}
              </span>
            </li>
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            Use the ticket queue for in-app rider/driver issues. Use the inbox for website contact
            submissions that are not tied to a ride.
          </p>
        </div>
      </div>

      <RecentMessagesWidget />
    </div>
  );
}
