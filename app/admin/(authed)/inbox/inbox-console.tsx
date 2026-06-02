"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Card } from "../_components";
import {
  categoryStyles,
  MessageModal,
  statusStyles,
  type ContactMessage,
  type MessageCategory,
  type MessageStatus,
} from "./message-modal";
import {
  getInbox,
  archiveMessage,
  markSpam,
  deleteMessage as deleteMsg,
  replyToMessage,
  type InboxMessage as ApiMessage,
} from "@/lib/api";

function mapApiMessage(m: ApiMessage): ContactMessage {
  const statusMap: Record<string, MessageStatus> = {
    NEW: "New", REPLIED: "Replied", ARCHIVED: "Archived", SPAM: "Spam",
  };
  return {
    id: m.id,
    name: m.from_name,
    email: m.from_email,
    subject: m.subject,
    category: (m.category as MessageCategory) ?? "General",
    status: statusMap[m.status] ?? "New",
    receivedAt: new Date(m.created_at).toLocaleString(),
    body: m.body,
    replies: m.reply_body
      ? [{ id: "r1", author: "Admin", time: m.replied_at ? new Date(m.replied_at).toLocaleString() : "—", body: m.reply_body }]
      : [],
  };
}

const PAGE_SIZE = 6;

const statusTabs: { id: "all" | MessageStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "New", label: "New" },
  { id: "Replied", label: "Replied" },
  { id: "Archived", label: "Archived" },
  { id: "Spam", label: "Spam" },
];

const categoryFilters: ("all" | MessageCategory)[] = [
  "all",
  "General",
  "Driver application",
  "Partnership",
  "Press",
  "Complaint",
  "Other",
];

export function InboxConsole() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    getInbox({ limit: "100", offset: "0" })
      .then((res) => setMessages((Array.isArray(res.messages) ? res.messages : []).map(mapApiMessage)))
      .catch(() => null);
  }, []);
  const [tab, setTab] = useState<"all" | MessageStatus>("all");
  const [category, setCategory] = useState<"all" | MessageCategory>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);


  const counts: Record<"all" | MessageStatus, number> = useMemo(
    () => ({
      all: messages.length,
      New: messages.filter((m) => m.status === "New").length,
      Replied: messages.filter((m) => m.status === "Replied").length,
      Archived: messages.filter((m) => m.status === "Archived").length,
      Spam: messages.filter((m) => m.status === "Spam").length,
    }),
    [messages],
  );

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (tab !== "all" && m.status !== tab) return false;
      if (category !== "all" && m.category !== category) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [messages, tab, category, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(start, end);

  const viewing = viewingId ? messages.find((m) => m.id === viewingId) ?? null : null;

  const update = (id: string, patch: Partial<ContactMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  return (
    <div className="space-y-6">
      <Card
        title="Contact inbox"
        action={
          <input
            type="search"
            placeholder="Search messages…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="h-8 w-64 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
          />
        }
      >
        <div className="space-y-2 border-b border-border px-3 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {statusTabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id);
                    setPage(1);
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {counts[t.id]}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
            {categoryFilters.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategory(c);
                    setPage(1);
                  }}
                  className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c === "all" ? "All categories" : c}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="divide-y divide-border">
          {paginated.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">
              No messages match your filters.
            </li>
          ) : (
            paginated.map((m) => (
              <li
                key={m.id}
                onClick={() => setViewingId(m.id)}
                className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface/50"
              >
                <Avatar name={m.name} tone="neutral" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">
                      {m.id}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryStyles[m.category]}`}
                    >
                      {m.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[m.status]}`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-sm tracking-tight ${
                      m.status === "New"
                        ? "font-bold text-foreground"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {m.subject}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {m.name} · {m.email}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                    {m.body}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {m.receivedAt}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingId(m.id);
                    }}
                    className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface"
                  >
                    Open
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filtered.length === 0 ? 0 : start + 1}–{end}
            </span>{" "}
            of <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            messages
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{safePage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </Card>

      <MessageModal
        message={viewing}
        onClose={() => setViewingId(null)}
        onReply={async (id, body) => {
          try { await replyToMessage(id, body); } catch { /* ignore */ }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    status: "Replied" as const,
                    replies: [...m.replies, { id: `r${m.replies.length + 1}`, author: "Admin", time: "Just now", body }],
                  }
                : m,
            ),
          );
          setToast(`Reply sent to ${viewing?.email || viewing?.name}`);
        }}
        onArchive={async (id) => {
          try { await archiveMessage(id); } catch { /* ignore */ }
          update(id, { status: "Archived" });
          setToast(`${id} archived`);
          setViewingId(null);
        }}
        onSpam={async (id) => {
          try { await markSpam(id); } catch { /* ignore */ }
          update(id, { status: "Spam" });
          setToast(`${id} marked as spam`);
          setViewingId(null);
        }}
        onUnarchive={(id) => {
          update(id, { status: "New" });
          setToast(`${id} moved back to inbox`);
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
