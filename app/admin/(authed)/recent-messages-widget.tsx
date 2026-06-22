"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInbox, type InboxMessage } from "@/lib/api";

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 5) return "Just now";
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-primary text-primary-foreground",
  REPLIED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  ARCHIVED: "bg-muted text-muted-foreground",
  SPAM: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
};

export function RecentMessagesWidget() {
  const [messages, setMessages] = useState<InboxMessage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getInbox({ limit: "5" })
        .then((res) => {
          if (cancelled) return;
          setMessages(res.messages ?? []);
          setError(false);
        })
        .catch(() => !cancelled && setError(true))
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    const id = setInterval(load, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Recent Messages
          </h2>
          <span className="text-[10px] font-medium text-muted-foreground">
            from /contact
          </span>
        </div>
        <Link
          href="/admin/inbox"
          className="text-[11px] font-medium text-muted-foreground hover:text-primary"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="h-2.5 w-2/3 rounded bg-muted" />
              </div>
              <div className="h-3 w-10 rounded bg-muted" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="m-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Could not load messages.
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center gap-1 text-center">
          <p className="text-xs font-semibold text-foreground">No messages yet</p>
          <p className="text-[11px] text-muted-foreground">
            Submissions from /contact will show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {messages.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/inbox?open=${m.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <span className="text-[10px] font-bold">{initials(m.from_name)}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {m.from_name || m.from_email}
                    </p>
                    {m.status === "NEW" ? (
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_TONE.NEW}`}>
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {truncate(m.subject || m.body || "—", 80)}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(m.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
