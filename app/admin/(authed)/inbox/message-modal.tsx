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
  receivedDate?: Date;
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

  const handleSend = () => {
    if (!reply.trim() || !message) return;
    const text = reply.trim();
    onReply(message.id, text);
    
    // Auto-open local mail client prefilled with reply
    const subject = encodeURIComponent(`Re: ${message.subject || "Contact Inquiry"}`);
    const bodyText = encodeURIComponent(text);
    const mailtoUrl = `mailto:${message.email}?subject=${subject}&body=${bodyText}`;
    window.location.href = mailtoUrl;

    setReply("");
  };

  useEffect(() => {
    if (!message) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [message, onClose]);

  if (!message) return null;

  const showArchive = message.status !== "Archived";
  const showSpam = message.status !== "Spam";
  const showUnarchive = message.status === "Archived" || message.status === "Spam";

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Instagram Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={message.name} tone="primary" size="md" />
          <div className="min-w-0">
              <span className="font-bold text-sm text-foreground truncate">{message.name}</span>
            <p className="text-[10px] text-muted-foreground truncate">{message.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden"
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Speech Bubbles Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-muted/5 flex flex-col custom-scrollbar">
        {/* Customer message on left */}
        <div className="flex items-end gap-2 max-w-[80%]">
          <div className="shadow-sm rounded-full overflow-hidden shrink-0">
            <Avatar name={message.name} tone="neutral" size="sm" />
          </div>
          <div className="space-y-1">
            <div className="bg-card text-foreground px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed border border-border shadow-sm">
              <span className="whitespace-pre-wrap">{message.body}</span>
            </div>
          </div>
        </div>

        {/* Admin/Agent replies timeline */}
        {message.replies.map((r) => {
          const isNote = r.body.startsWith("[INTERNAL NOTE]");
          const bodyText = isNote ? r.body.replace("[INTERNAL NOTE] ", "") : r.body;

          if (isNote) {
            return (
              <div key={r.id} className="flex justify-center my-2">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  <span>Internal Note: {bodyText}</span>
                  <span className="text-[9px] opacity-75">· {r.time}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={r.id} className="flex items-end gap-2 justify-end max-w-[80%] ml-auto">
              <div className="space-y-1 text-right">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-left leading-relaxed shadow-sm">
                  {bodyText}
                </div>
                <span className="text-[9px] text-muted-foreground px-2">Agent ({r.author}) · {r.time}</span>
              </div>
              <div className="shadow-sm rounded-full overflow-hidden">
                <Avatar name={r.author} tone="primary" size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Input pill Composer Footer */}
      <div className="p-4 border-t border-border bg-card">


        <div className="flex items-center gap-2">
          {/* Pill Container */}
          <div
            className="flex-1 flex items-center gap-3 rounded-full border px-4 py-2 transition-all bg-muted/10 border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
          >
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button
              type="button"
              disabled={!reply.trim()}
              onClick={handleSend}
              className="text-primary font-bold text-sm hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
