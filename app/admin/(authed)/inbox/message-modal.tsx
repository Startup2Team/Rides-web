"use client";

import { useEffect, useState } from "react";
import { Avatar } from "../_components";

export type MessageCategory =
  | "General"
  | "Driver application"
  | "Partnership"
  | "Press"
  | "Complaint"
  | "Other";

export type MessageStatus = "New" | "Replied" | "Archived" | "Spam";

export type Reply = {
  id: string;
  author: string;
  time: string;
  body: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: MessageCategory;
  status: MessageStatus;
  receivedAt: string;
  body: string;
  replies: Reply[];
  starred?: boolean;
};

export const categoryStyles: Record<MessageCategory, string> = {
  General: "bg-muted text-muted-foreground",
  "Driver application": "bg-primary/10 text-primary",
  Partnership: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Press: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  Complaint: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
  Other: "bg-muted text-muted-foreground",
};

export const statusStyles: Record<MessageStatus, string> = {
  New: "bg-primary/15 text-primary",
  Replied: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  Archived: "bg-muted text-muted-foreground",
  Spam: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
};

export function MessageModal({
  message,
  onClose,
  onReply,
  onArchive,
  onSpam,
  onUnarchive,
}: {
  message: ContactMessage | null;
  onClose: () => void;
  onReply: (id: string, body: string) => void;
  onArchive: (id: string) => void;
  onSpam: (id: string) => void;
  onUnarchive: (id: string) => void;
}) {
  const [reply, setReply] = useState("");

  useEffect(() => {
    setReply("");
  }, [message?.id]);

  useEffect(() => {
    if (!message) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [message, onClose]);

  if (!message) return null;

  const showArchive = message.status !== "Archived";
  const showSpam = message.status !== "Spam";
  const showUnarchive = message.status === "Archived" || message.status === "Spam";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">
                {message.id}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryStyles[message.category]}`}
              >
                {message.category}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[message.status]}`}
              >
                {message.status}
              </span>
            </div>
            <p className="mt-1 text-sm font-bold text-foreground">{message.subject}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              from {message.name} · {message.email}
              {message.phone ? ` · ${message.phone}` : ""}
              {" · "}received {message.receivedAt}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div className="flex gap-3">
            <Avatar name={message.name} tone="neutral" />
            <div className="flex-1 rounded-2xl rounded-tl-sm bg-surface p-3 ring-1 ring-border">
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {message.body}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {message.receivedAt}
              </p>
            </div>
          </div>

          {message.replies.map((r) => (
            <div key={r.id} className="flex flex-row-reverse gap-3">
              <Avatar name={r.author} />
              <div className="flex-1 rounded-2xl rounded-tr-sm bg-primary p-3 text-primary-foreground">
                <p className="whitespace-pre-wrap text-sm">{r.body}</p>
                <p className="mt-2 text-[10px] opacity-80">
                  {r.author} · {r.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={!reply.trim()}
              onClick={() => {
                onReply(message.id, reply.trim());
                setReply("");
              }}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send reply
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            {showUnarchive ? (
              <button
                type="button"
                onClick={() => onUnarchive(message.id)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                Move to inbox
              </button>
            ) : null}
            {showSpam ? (
              <button
                type="button"
                onClick={() => onSpam(message.id)}
                className="inline-flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Mark as spam
              </button>
            ) : null}
            {showArchive ? (
              <button
                type="button"
                onClick={() => onArchive(message.id)}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-surface"
              >
                Archive
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
