"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "../_components";
import {
  MessageModal,
  type ContactMessage,
  type MessageStatus,
  type MessageCategory,
} from "./message-modal";
import {
  getInbox,
  archiveMessage,
  markSpam,
  replyToMessage,
  updateMessageStatus,
  type InboxMessage as ApiMessage,
} from "@/lib/api";

function formatRelativeTime(date?: Date): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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
    receivedDate: new Date(m.created_at),
    body: m.body,
    replies: m.reply_body
      ? [{ id: "r1", author: "Admin", time: m.replied_at ? new Date(m.replied_at).toLocaleString() : "—", body: m.reply_body }]
      : [],
  };
}





export function InboxConsole() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    getInbox({ limit: "100", offset: "0" })
      .then((res) => setMessages((Array.isArray(res.messages) ? res.messages : []).map(mapApiMessage)))
      .catch(() => null);
  }, []);
  const [tab, setTab] = useState<"all" | "unread" | "read" | "unreplied" | "replied">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [query, setQuery] = useState("");

  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Mark unread message as read on click
  useEffect(() => {
    if (!viewingId) return;
    const msg = messages.find((m) => m.id === viewingId);
    if (msg && msg.status === "New") {
      // Instantly clear the blue dot on UI
      setMessages((prev) =>
        prev.map((m) => (m.id === viewingId ? { ...m, status: "Replied" } : m))
      );
      // Persist to backend database
      updateMessageStatus(viewingId, "REPLIED").catch(() => null);
    }
  }, [viewingId, messages]);

  const counts: Record<"all" | "unread" | "read" | "unreplied" | "replied", number> = useMemo(
    () => ({
      all: messages.length,
      unread: messages.filter((m) => m.status === "New").length,
      read: messages.filter((m) => m.status !== "New").length,
      unreplied: messages.filter((m) => m.replies.length === 0).length,
      replied: messages.filter((m) => m.replies.length > 0).length,
    }),
    [messages],
  );

  const filtered = useMemo(() => {
    const list = messages.filter((m) => {
      if (tab === "unread" && m.status !== "New") return false;
      if (tab === "read" && m.status === "New") return false;
      if (tab === "unreplied" && m.replies.length > 0) return false;
      if (tab === "replied" && m.replies.length === 0) return false;
      
      if (periodFilter !== "all" && m.receivedDate) {
        const now = new Date();
        const msgTime = new Date(m.receivedDate).getTime();
        if (periodFilter === "24h") {
          const limit = now.getTime() - 24 * 60 * 60 * 1000;
          if (msgTime < limit) return false;
        } else if (periodFilter === "7d") {
          const limit = now.getTime() - 7 * 24 * 60 * 60 * 1000;
          if (msgTime < limit) return false;
        } else if (periodFilter === "30d") {
          const limit = now.getTime() - 30 * 24 * 60 * 60 * 1000;
          if (msgTime < limit) return false;
        } else if (periodFilter === "custom") {
          if (customStartDate) {
            const startLimit = new Date(customStartDate + "T00:00:00").getTime();
            if (msgTime < startLimit) return false;
          }
          if (customEndDate) {
            const endLimit = new Date(customEndDate + "T23:59:59").getTime();
            if (msgTime > endLimit) return false;
          }
        }
      }

      if (query) {
        const q = query.toLowerCase();
        return (
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phone && m.phone.toLowerCase().includes(q)) ||
          m.subject.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q)
        );
      }
      return true;
    });

    // Apply sorting
    return list.sort((a, b) => {
      const timeA = a.receivedDate ? a.receivedDate.getTime() : 0;
      const timeB = b.receivedDate ? b.receivedDate.getTime() : 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [messages, tab, sortOrder, periodFilter, query, customStartDate, customEndDate]);



  const placeholder = useMemo(() => {
    switch (tab) {
      case "unread":
        return {
          title: "Unread Messages",
          desc: "Select an unread message to read new inquiries and start helping your users.",
        };
      case "read":
        return {
          title: "Read Messages",
          desc: "Select a conversation to review inquiry history and previous user threads.",
        };
      case "unreplied":
        return {
          title: "Unreplied Messages",
          desc: "Select an unanswered inquiry to send a reply and resolve pending user requests.",
        };
      case "replied":
        return {
          title: "Replied Messages",
          desc: "Select an active thread to view replies and verify user follow-ups.",
        };
      default:
        return {
          title: "Inbox",
          desc: "Select a conversation to read, reply, and build relationships with our users.",
        };
    }
  }, [tab]);

  const viewing = viewingId ? messages.find((m) => m.id === viewingId) ?? null : null;

  const update = (id: string, patch: Partial<ContactMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  // Lock outer page scrollbars and adjust main display layout to be flex stretch
  useEffect(() => {
    const mainWrapper = document.querySelector("main")?.parentElement;
    const mainEl = document.querySelector("main");
    if (!mainWrapper || !mainEl) return;

    const originalWrapperOverflow = mainWrapper.style.overflow;
    const originalWrapperHeight = mainWrapper.style.height;
    const originalMainOverflow = mainEl.style.overflow;
    const originalMainHeight = mainEl.style.height;
    const originalMainMinHeight = mainEl.style.minHeight;
    const originalMainDisplay = mainEl.style.display;
    const originalMainFlexDir = mainEl.style.flexDirection;

    mainWrapper.style.overflow = "hidden";
    mainWrapper.style.height = "100vh";

    mainEl.style.overflow = "hidden";
    mainEl.style.height = "100%";
    mainEl.style.minHeight = "0";
    mainEl.style.display = "flex";
    mainEl.style.flexDirection = "column";

    return () => {
      mainWrapper.style.overflow = originalWrapperOverflow;
      mainWrapper.style.height = originalWrapperHeight;
      mainEl.style.overflow = originalMainOverflow;
      mainEl.style.height = originalMainHeight;
      mainEl.style.minHeight = originalMainMinHeight;
      mainEl.style.display = originalMainDisplay;
      mainEl.style.flexDirection = originalMainFlexDir;
    };
  }, []);

  const stats = useMemo(() => {
    const total = messages.length;
    const replied = messages.filter((m) => m.status === "Replied").length;
    const archived = messages.filter((m) => m.status === "Archived").length;
    const outstanding = messages.filter((m) => m.status === "New").length;
    const rate = total > 0 ? Math.round(((replied + archived) / total) * 100) : 0;
    return { total, replied, archived, outstanding, rate };
  }, [messages]);

  return (
    <div className="h-full flex flex-col flex-1 min-h-0">
      {/* Instagram-style Unified Layout Container */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden flex h-full shadow-sm flex-1 min-h-0">
        
        {/* Left Column: Chat Conversation List */}
        <div className={`${viewingId ? "hidden md:flex" : "flex"} w-full md:w-[350px] shrink-0 border-r border-border flex flex-col h-full bg-card`}>
          
          {/* Team Response Metrics Panel */}
          <div className="border-b border-border bg-surface/30 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Team Response Rate
              </span>
              <span className="text-xs font-extrabold text-primary">
                {stats.rate}%
              </span>
            </div>
            
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted flex">
              <div
                style={{ width: `${stats.total > 0 ? (stats.replied / stats.total) * 100 : 0}%` }}
                className="bg-primary transition-all duration-500"
                title={`Replied: ${stats.replied}`}
              />
              <div
                style={{ width: `${stats.total > 0 ? (stats.archived / stats.total) * 100 : 0}%` }}
                className="bg-sky-400 transition-all duration-500"
                title={`Archived: ${stats.archived}`}
              />
              <div
                style={{ width: `${stats.total > 0 ? (stats.outstanding / stats.total) * 100 : 0}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`New: ${stats.outstanding}`}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Replied ({stats.replied})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Archived ({stats.archived})</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>New ({stats.outstanding})</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="p-4 border-b border-border space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-bold text-foreground">Chats</h1>
            </div>

            {/* Query Search */}
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="search"
                placeholder="Search..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                className="w-full pl-9 pr-4 h-9 rounded-full border border-border bg-muted/10 text-xs text-foreground outline-none focus:border-primary transition-all placeholder-muted-foreground"
              />
            </div>

            {/* Filter controls row */}
            <div className="flex items-center gap-1.5">
              {/* Status filter */}
              <select
                value={tab}
                onChange={(e) => {
                  setTab(e.target.value as "all" | "unread" | "read" | "unreplied" | "replied");
                }}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[10px] font-semibold text-foreground outline-none appearance-none cursor-pointer flex-1"
              >
                <option value="all">All ({counts.all})</option>
                <option value="unread">Unread ({counts.unread})</option>
                <option value="read">Read ({counts.read})</option>
                <option value="unreplied">Unreplied ({counts.unreplied})</option>
                <option value="replied">Replied ({counts.replied})</option>
              </select>

              {/* Sort Order filter */}
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value as "newest" | "oldest");
                }}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[10px] font-semibold text-foreground outline-none appearance-none cursor-pointer flex-1"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {/* Period filter */}
              <select
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                }}
                className="pl-2 pr-6 h-8 rounded-lg border border-border bg-card text-[10px] font-semibold text-foreground outline-none appearance-none cursor-pointer flex-1"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7d</option>
                <option value="30d">Last 30d</option>
                <option value="custom">Custom...</option>
              </select>
            </div>

            {/* Custom dates if selected */}
            {periodFilter === "custom" && (
              <div className="flex items-center gap-1 pt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                  }}
                  className="h-8 px-1.5 rounded-lg border border-border bg-card text-[10px] text-foreground focus:outline-none w-full"
                />
                <span className="text-[9px] text-muted-foreground font-bold">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                  }}
                  className="h-8 px-1.5 rounded-lg border border-border bg-card text-[10px] text-foreground focus:outline-none w-full"
                />
              </div>
            )}

            {/* Clear filters trigger */}
            {(query || tab !== "all" || sortOrder !== "newest" || periodFilter !== "all" || customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setQuery("");
                  setTab("all");
                  setSortOrder("newest");
                  setPeriodFilter("all");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                className="text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/40 px-2 py-1 rounded border border-dashed border-border transition-all block w-full text-center"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* List Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground font-medium">
                No messages found
              </div>
            ) : (
              filtered.map((m) => {
                const isNew = m.status === "New";
                const isActive = m.id === viewingId;
                return (
                  <div
                    key={m.id}
                    onClick={() => setViewingId(m.id)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-4 ${
                      isActive
                        ? "border-l-primary bg-primary/[0.04]"
                        : "border-l-transparent hover:bg-muted/30"
                    }`}
                  >
                    <div className="shrink-0">
                      <div className="rounded-full overflow-hidden shadow-sm">
                        <Avatar name={m.name} tone="neutral" size="md" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${isNew ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                          {m.name}
                        </span>
                        <span className={`text-[9px] shrink-0 font-medium ${isNew ? "text-primary font-bold" : "text-muted-foreground"}`}>
                          {formatRelativeTime(m.receivedDate)}
                        </span>
                      </div>

                      <p className={`text-[11px] truncate ${isNew ? "font-semibold text-foreground/90" : "text-muted-foreground"}`}>
                        {m.subject}
                      </p>
                      
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-muted-foreground truncate opacity-85 leading-normal flex-1">
                          {m.body}
                        </p>
                        {isNew && (
                          <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 shadow-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window Pane */}
        <div className={`${viewingId ? "flex" : "hidden md:flex"} flex-1 h-full flex-col bg-muted/5`}>
          {viewingId && viewing ? (
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
                setToast("Reply sent successfully");
              }}
              onArchive={async (id) => {
                try { await archiveMessage(id); } catch { /* ignore */ }
                update(id, { status: "Archived" });
                setToast("Message archived");
                setViewingId(null);
              }}
              onSpam={async (id) => {
                try { await markSpam(id); } catch { /* ignore */ }
                update(id, { status: "Spam" });
                setToast("Marked as spam");
                setViewingId(null);
              }}
              onUnarchive={(id) => {
                update(id, { status: "New" });
                setToast("Moved back to inbox");
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{placeholder.title}</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  {placeholder.desc}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Alert popup */}
      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold text-foreground">{toast}</span>
        </div>
      ) : null}
    </div>
  );
}
