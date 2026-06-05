"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Sender = "bot" | "user";

type QuickReply = {
  label: string;
  flow: FlowId;
};

type ExternalLink = {
  label: string;
  href: string;
  external?: boolean;
};

type Message = {
  id: string;
  sender: Sender;
  body: string;
  links?: ExternalLink[];
};

type FlowId =
  | "welcome"
  | "driver"
  | "negotiation"
  | "locations"
  | "payments"
  | "complaint"
  | "human"
  | "ride-issue"
  | "no-match";

type Flow = {
  reply: (string | { body: string; links?: ExternalLink[] })[];
  next: QuickReply[];
};

const FLOWS: Record<FlowId, Flow> = {
  welcome: {
    reply: [
      "Hi 👋 I'm Rides, your assistant.",
      "What can I help you with today? Pick a topic or just type your question.",
    ],
    next: [
      { label: "Become a driver", flow: "driver" },
      { label: "How payments work", flow: "payments" },
      { label: "How negotiations work", flow: "negotiation" },
      { label: "Where you operate", flow: "locations" },
      { label: "Issue with a ride", flow: "ride-issue" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  driver: {
    reply: [
      "Great — drivers are how Rides scales. Here's what you need to apply:",
      "• A valid Rwandan driver licence\n• A vehicle (Moto Bike, Cab Taxi, Light Hilux, or Heavy Fuso) with valid plates\n• SONARWA insurance + police authorisation\n• MTN MoMo or Airtel Money account for payouts",
      {
        body: "When you're ready, drop your details on the contact form and we'll route you to the driver-onboarding team — usually replies within 48h.",
        links: [
          { label: "Open driver application", href: "/contact" },
          { label: "Driver page", href: "/drivers" },
        ],
      },
    ],
    next: [
      { label: "How payments work", flow: "payments" },
      { label: "Where you operate", flow: "locations" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  negotiation: {
    reply: [
      "Rides is the only platform in Rwanda where the rider and driver agree on the fare together — no fixed pricing.",
      "It works in 3 steps:\n1. Rider sees a suggested fare and makes an offer\n2. Driver accepts, counter-offers, or passes\n3. After up to 4 rounds, both sides settle on a price — or walk away",
      {
        body: "Average uplift on the rider's first offer is about 18%. Every agreed fare is logged for audit.",
        links: [{ label: "See how it works", href: "/#how-it-works" }],
      },
    ],
    next: [
      { label: "How payments work", flow: "payments" },
      { label: "Become a driver", flow: "driver" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  locations: {
    reply: [
      "We're live across all of Kigali City — Gasabo, Kicukiro, and Nyarugenge districts.",
      "Musanze is in pilot, and Huye launches in Q3 2026.",
      "If you want Rides in your area, let us know on the contact form 👇",
    ],
    next: [
      { label: "Become a driver", flow: "driver" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  payments: {
    reply: [
      "We accept MTN MoMo, Airtel Money, and cash on every ride.",
      "Drivers are paid out twice a day — 06:00 and 17:00 — straight to their MoMo/Airtel wallet. Rides takes a small commission (12–18% depending on vehicle category).",
      "All payments are auditable in the driver app and the customer keeps a digital receipt.",
    ],
    next: [
      { label: "How negotiations work", flow: "negotiation" },
      { label: "Issue with a ride", flow: "ride-issue" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  "ride-issue": {
    reply: [
      "I'm sorry to hear that. We treat ride issues as priority — average response time is under 12 hours.",
      {
        body: "Please file the details on the contact form so support can investigate. Pick the \"Complaint\" category.",
        links: [
          { label: "File a complaint", href: "/contact" },
          { label: "WhatsApp support", href: "https://wa.me/250788000000", external: true },
        ],
      },
    ],
    next: [
      { label: "How payments work", flow: "payments" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  complaint: {
    reply: [
      "Sorry about that. The fastest way to get help is the contact form (Complaint category) — average reply under 12 hours.",
      {
        body: "Or reach us instantly on WhatsApp:",
        links: [
          { label: "File on contact form", href: "/contact" },
          { label: "WhatsApp support", href: "https://wa.me/250788000000", external: true },
        ],
      },
    ],
    next: [
      { label: "Issue with a ride", flow: "ride-issue" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  human: {
    reply: [
      "Want to talk to a real person? Here's the fastest way:",
      {
        body: "WhatsApp gets the quickest reply during business hours (Mon–Sat · 08:00–20:00). The contact form is best for anything that needs a paper trail.",
        links: [
          { label: "WhatsApp", href: "https://wa.me/250788000000", external: true },
          { label: "Contact form", href: "/contact" },
          { label: "Call support", href: "tel:+250788000000", external: true },
        ],
      },
    ],
    next: [
      { label: "Back to start", flow: "welcome" },
    ],
  },
  "no-match": {
    reply: [
      "I didn't quite catch that — I'm still learning! Try picking a topic below, or if it's urgent reach a human directly:",
      {
        body: "",
        links: [
          { label: "WhatsApp", href: "https://wa.me/250788000000", external: true },
          { label: "Contact form", href: "/contact" },
        ],
      },
    ],
    next: [
      { label: "Become a driver", flow: "driver" },
      { label: "How payments work", flow: "payments" },
      { label: "How negotiations work", flow: "negotiation" },
      { label: "Where you operate", flow: "locations" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
};

// Maps loose user input → FlowId via keyword detection.
function matchFlow(input: string): FlowId {
  const text = input.toLowerCase();
  const has = (...words: string[]) => words.some((w) => text.includes(w));

  if (has("driver", "drive", "apply", "moto rider", "join", "onboard", "kyc"))
    return "driver";
  if (has("negotiat", "fare", "price", "haggle", "bargain", "offer"))
    return "negotiation";
  if (has("where", "location", "area", "kigali", "musanze", "huye", "operate"))
    return "locations";
  if (has("pay", "momo", "mobile money", "airtel", "cash", "wallet", "commission", "payout"))
    return "payments";
  if (has("complain", "complaint", "refund", "overcharge", "wrong", "bad driver", "lost"))
    return "complaint";
  if (has("ride", "trip", "issue", "problem", "dispute"))
    return "ride-issue";
  if (has("human", "person", "agent", "support", "call", "whatsapp", "talk to"))
    return "human";

  return "no-match";
}

const STORAGE_KEY = "rides-chatbot-history";

function makeId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function flowToMessages(flow: Flow): Message[] {
  return flow.reply.map((r) =>
    typeof r === "string"
      ? { id: makeId(), sender: "bot", body: r }
      : { id: makeId(), sender: "bot", body: r.body, links: r.links },
  );
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(
    FLOWS.welcome.next,
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore history on mount.
  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch {
        /* fall through */
      }
    }
    // First time — seed welcome flow.
    setTimeout(() => {
      setMessages(flowToMessages(FLOWS.welcome));
    }, 200);
  }, []);

  // Persist history.
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    if (messages.length === 0) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, mounted]);

  // Auto-scroll on new message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  // Mark new-message indicator if bot replies while panel is closed.
  useEffect(() => {
    if (!open && messages.length > 0 && messages[messages.length - 1].sender === "bot") {
      setHasNew(true);
    }
  }, [messages, open]);

  // Close panel on Esc.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function runFlow(flowId: FlowId) {
    const flow = FLOWS[flowId];
    setQuickReplies([]);
    setTyping(true);
    const replies = flowToMessages(flow);
    // Stagger reply bubbles for realism.
    replies.forEach((msg, i) => {
      setTimeout(
        () => {
          setMessages((prev) => [...prev, msg]);
          if (i === replies.length - 1) {
            setTyping(false);
            setQuickReplies(flow.next);
          }
        },
        500 + i * 700,
      );
    });
  }

  function handleQuickReply(reply: QuickReply) {
    const userMsg: Message = {
      id: makeId(),
      sender: "user",
      body: reply.label,
    };
    setMessages((prev) => [...prev, userMsg]);
    runFlow(reply.flow);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    const userMsg: Message = { id: makeId(), sender: "user", body: value };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const flow = matchFlow(value);
    runFlow(flow);
  }

  function resetChat() {
    setMessages(flowToMessages(FLOWS.welcome));
    setQuickReplies(FLOWS.welcome.next);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  const unread = useMemo(() => !open && hasNew, [open, hasNew]);

  return (
    <>
      {/* Floating bubble */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setHasNew(false);
        }}
        aria-label={open ? "Close chat" : "Open chat with Rides"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition-transform hover:scale-[1.05] active:scale-[0.95]"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {unread ? (
          <span className="absolute right-1 top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 ring-2 ring-primary" />
          </span>
        ) : null}
      </button>

      {/* Panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="Chat with Rides"
          className="fixed bottom-24 right-5 z-50 flex h-[34rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-br from-primary to-[#0056B3] px-4 py-3 text-primary-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-base font-bold">
              R
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold tracking-tight">Rides</p>
              <p className="flex items-center gap-1.5 text-[11px] opacity-90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Usually replies instantly
              </p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              aria-label="Restart conversation"
              title="Restart conversation"
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-surface/40 px-4 py-4"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onClose={() => setOpen(false)} />
            ))}
            {typing ? <TypingBubble /> : null}
          </div>

          {quickReplies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-card px-3 py-2.5">
              {quickReplies.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuickReply(q)}
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  {q.label}
                </button>
              ))}
            </div>
          ) : null}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-border bg-card px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

function MessageBubble({
  message,
  onClose,
}: {
  message: Message;
  onClose: () => void;
}) {
  const isUser = message.sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-card text-foreground ring-1 ring-border"
        }`}
      >
        {message.body ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        ) : null}
        {message.links && message.links.length > 0 ? (
          <div className={`${message.body ? "mt-2" : ""} flex flex-wrap gap-1.5`}>
            {message.links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface"
                >
                  {l.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={onClose}
                  className="inline-flex items-center rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-surface"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-card px-3 py-2.5 ring-1 ring-border">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
            style={{
              animation: `chatbot-typing 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes chatbot-typing {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
