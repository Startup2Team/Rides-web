"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Sender = "bot" | "user";
type QuickReply = { label: string; flow: FlowId };
type ExternalLink = { label: string; href: string; external?: boolean };
type Message = {
  id: string;
  sender: Sender;
  body: string;
  links?: ExternalLink[];
};
type FlowId =
  | "welcome" | "driver" | "negotiation" | "locations"
  | "payments" | "complaint" | "human" | "ride-issue" | "no-match";
type Flow = {
  reply: (string | { body: string; links?: ExternalLink[] })[];
  next: QuickReply[];
};

// ── Flows ─────────────────────────────────────────────────────────────────────

const FLOWS: Record<FlowId, Flow> = {
  welcome: {
    reply: [
      "Hi 👋 I'm Rides, your assistant.",
      "What can I help you with today? Pick a topic or just type your question.",
    ],
    next: [
      { label: "Become a driver", flow: "driver" },
      { label: "How payments work", flow: "payments" },
      { label: "Negotiations", flow: "negotiation" },
      { label: "Where you operate", flow: "locations" },
      { label: "Ride issue", flow: "ride-issue" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  driver: {
    reply: [
      "Great — drivers are how Rides scales. Here's what you need:",
      "• Valid Rwandan driver licence\n• Vehicle (Moto, Cab, Hilux, or Fuso)\n• SONARWA insurance + police authorisation\n• MTN MoMo or Airtel Money for payouts",
      {
        body: "Drop your details on the contact form — we usually reply within 48h.",
        links: [
          { label: "Driver application", href: "/contact" },
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
      "Rides is the only platform in Rwanda where rider and driver agree on the fare together.",
      "1. Rider sees a suggested fare and makes an offer\n2. Driver accepts, counter-offers, or passes\n3. Up to 4 rounds — then both settle or walk away",
      {
        body: "Average uplift on first offer is ~18%. Every fare is logged.",
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
      "We're live across all of Kigali — Gasabo, Kicukiro, and Nyarugenge.",
      "Musanze is in pilot, and Huye launches Q3 2026.",
      "Want Rides in your area? Let us know 👇",
    ],
    next: [
      { label: "Become a driver", flow: "driver" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  payments: {
    reply: [
      "We accept MTN MoMo, Airtel Money, and cash on every ride.",
      "Drivers are paid out twice daily — 06:00 and 17:00 — straight to their wallet. Rides takes 12–18% commission depending on vehicle.",
      "All payments are auditable in the driver app.",
    ],
    next: [
      { label: "Negotiations", flow: "negotiation" },
      { label: "Ride issue", flow: "ride-issue" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  "ride-issue": {
    reply: [
      "Sorry to hear that. We treat ride issues as priority — average response under 12 hours.",
      {
        body: "File the details on the contact form under 'Complaint' category.",
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
      "Sorry about that. The fastest way to get help is the contact form — average reply under 12 hours.",
      {
        body: "Or reach us instantly on WhatsApp:",
        links: [
          { label: "Contact form", href: "/contact" },
          { label: "WhatsApp", href: "https://wa.me/250788000000", external: true },
        ],
      },
    ],
    next: [
      { label: "Ride issue", flow: "ride-issue" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
  human: {
    reply: [
      "Want to talk to a real person? Here's the fastest way:",
      {
        body: "WhatsApp is quickest during business hours (Mon–Sat · 08:00–20:00). Contact form is best for anything that needs a paper trail.",
        links: [
          { label: "WhatsApp", href: "https://wa.me/250788000000", external: true },
          { label: "Contact form", href: "/contact" },
          { label: "Call support", href: "tel:+250788000000", external: true },
        ],
      },
    ],
    next: [{ label: "Back to start", flow: "welcome" }],
  },
  "no-match": {
    reply: [
      "I didn't quite catch that — I'm still learning! Try a topic below, or reach a human directly:",
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
      { label: "Negotiations", flow: "negotiation" },
      { label: "Where you operate", flow: "locations" },
      { label: "Talk to a human", flow: "human" },
    ],
  },
};

// ── Keyword matcher ───────────────────────────────────────────────────────────

function matchFlow(input: string): FlowId {
  const t = input.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  if (has("driver", "drive", "apply", "join", "onboard")) return "driver";
  if (has("negotiat", "fare", "price", "haggle", "offer")) return "negotiation";
  if (has("where", "location", "area", "kigali", "musanze")) return "locations";
  if (has("pay", "momo", "airtel", "cash", "wallet", "payout")) return "payments";
  if (has("complain", "refund", "overcharge", "wrong", "bad")) return "complaint";
  if (has("ride", "trip", "issue", "problem", "dispute")) return "ride-issue";
  if (has("human", "person", "agent", "support", "call", "whatsapp")) return "human";
  return "no-match";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "rides-chatbot-history";
const makeId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function flowToMessages(flow: Flow): Message[] {
  return flow.reply.map((r) =>
    typeof r === "string"
      ? { id: makeId(), sender: "bot" as Sender, body: r }
      : { id: makeId(), sender: "bot" as Sender, body: r.body, links: r.links },
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(FLOWS.welcome.next);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore / seed history
  useEffect(() => {
    setMounted(true);
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch { /* fall through */ }
    }
    setTimeout(() => setMessages(flowToMessages(FLOWS.welcome)), 200);
  }, []);

  useEffect(() => {
    if (!mounted || messages.length === 0) return;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, mounted]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open && messages.length > 0 && messages[messages.length - 1].sender === "bot") {
      setHasNew(true);
    }
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function runFlow(flowId: FlowId) {
    const flow = FLOWS[flowId];
    setQuickReplies([]);
    setTyping(true);
    const replies = flowToMessages(flow);
    replies.forEach((msg, i) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
        if (i === replies.length - 1) {
          setTyping(false);
          setQuickReplies(flow.next);
        }
      }, 500 + i * 700);
    });
  }

  function handleQuickReply(reply: QuickReply) {
    setMessages((prev) => [...prev, { id: makeId(), sender: "user", body: reply.label }]);
    runFlow(reply.flow);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    setMessages((prev) => [...prev, { id: makeId(), sender: "user", body: value }]);
    setInput("");
    runFlow(matchFlow(value));
  }

  function resetChat() {
    setMessages(flowToMessages(FLOWS.welcome));
    setQuickReplies(FLOWS.welcome.next);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  const unread = useMemo(() => !open && hasNew, [open, hasNew]);

  return (
    <>
      {/* ── Floating bubble ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setHasNew(false); }}
        aria-label={open ? "Close chat" : "Open chat with Rides"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition-transform hover:scale-[1.05] active:scale-[0.95]"
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        {unread && (
          <span className="absolute right-1 top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 ring-2 ring-primary" />
          </span>
        )}
      </button>

      {/* ── iPhone mockup panel ─────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="Chat with Rides"
        aria-hidden={!open}
        className={`fixed bottom-24 right-5 z-50 transition-all duration-300 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Phone outer shell */}
        <div className="relative w-[17rem]">

          {/* Side buttons */}
          <span aria-hidden className="absolute left-[-3px] top-14 h-6 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-600 to-zinc-500" />
          <span aria-hidden className="absolute left-[-3px] top-24 h-9 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-600 to-zinc-500" />
          <span aria-hidden className="absolute left-[-3px] top-36 h-9 w-[3px] rounded-l-sm bg-gradient-to-r from-zinc-600 to-zinc-500" />
          <span aria-hidden className="absolute right-[-3px] top-20 h-12 w-[3px] rounded-r-sm bg-gradient-to-l from-zinc-600 to-zinc-500" />

          {/* Phone frame */}
          <div className="relative overflow-hidden rounded-[2.8rem] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 p-[4px] shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/10">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-black p-[3px]">
              <div className="relative overflow-hidden rounded-[2.3rem] bg-zinc-950" style={{ height: "36rem" }}>

                {/* Dynamic Island */}
                <div className="absolute left-1/2 top-2.5 z-30 flex h-[20px] w-[58px] -translate-x-1/2 items-center justify-between rounded-full bg-black px-[6px]">
                  <span className="h-1 w-1 rounded-full bg-zinc-800" />
                  <span className="h-[4px] w-[4px] rounded-full bg-zinc-700 ring-1 ring-inset ring-zinc-600" />
                </div>

                {/* Status bar — white text on dark */}
                <div className="absolute inset-x-0 top-[14px] z-20 grid grid-cols-[1fr_66px_1fr] items-center px-4 text-white">
                  <span className="flex items-center justify-end gap-1 pr-2 leading-none">
                    <span className="text-[10px] font-semibold tabular-nums leading-none">9:41</span>
                  </span>
                  <div />
                  <div className="flex items-center justify-start gap-1 pl-2">
                    <svg viewBox="0 0 20 12" fill="currentColor" className="h-[9px]" aria-hidden>
                      <rect x="0" y="8" width="3.6" height="4" rx="0.9" />
                      <rect x="5.5" y="5.5" width="3.6" height="6.5" rx="0.9" />
                      <rect x="11" y="2.5" width="3.6" height="9.5" rx="0.9" />
                      <rect x="16.5" y="0" width="3.6" height="12" rx="0.9" />
                    </svg>
                    <span className="text-[9px] font-bold leading-none">5G</span>
                    <span aria-hidden className="relative ml-0.5 flex items-center">
                      <span className="flex h-[10px] w-[20px] items-center justify-center rounded-[3px] bg-white px-[1.5px]">
                        <span className="text-[7px] font-bold leading-none tabular-nums text-zinc-900">92</span>
                      </span>
                      <span className="ml-[1px] h-[4px] w-[1.5px] rounded-r-[1px] bg-white/60" />
                    </span>
                  </div>
                </div>

                {/* Full screen chat layout */}
                <div className="absolute inset-0 flex flex-col pt-9">

                  {/* Chat header */}
                  <div className="flex items-center gap-2.5 border-b border-white/10 bg-zinc-900/80 px-3 py-2 backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-black text-white shadow-md shadow-primary/40">
                      R
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-white leading-none">Rides</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[9px] text-zinc-400">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </span>
                        Usually replies instantly
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetChat}
                      aria-label="Restart conversation"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </button>
                  </div>

                  {/* Messages */}
                  <div
                    ref={scrollRef}
                    className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {messages.map((m) => (
                      <ChatBubble key={m.id} message={m} onClose={() => setOpen(false)} />
                    ))}
                    {typing && <TypingBubble />}
                  </div>

                  {/* Quick replies */}
                  {quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-white/10 bg-zinc-900/60 px-3 py-2 backdrop-blur-sm">
                      {quickReplies.map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => handleQuickReply(q)}
                          className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/25"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input bar — iOS style */}
                  <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 border-t border-white/10 bg-zinc-900 px-3 py-2.5"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Message…"
                      className="h-8 flex-1 rounded-full bg-zinc-800 px-3 text-[11px] text-white placeholder-zinc-500 outline-none ring-1 ring-white/10 focus:ring-primary/60"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Send"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/40 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </form>

                  {/* Home indicator */}
                  <div className="flex justify-center bg-zinc-900 pb-2">
                    <div className="h-1 w-20 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Chat bubble ───────────────────────────────────────────────────────────────

function ChatBubble({ message, onClose }: { message: Message; onClose: () => void }) {
  const isUser = message.sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-primary text-white"
            : "rounded-bl-sm bg-zinc-800 text-zinc-100 ring-1 ring-white/5"
        }`}
      >
        {message.body && (
          <p className="whitespace-pre-wrap">{message.body}</p>
        )}
        {message.links && message.links.length > 0 && (
          <div className={`${message.body ? "mt-2" : ""} flex flex-wrap gap-1.5`}>
            {message.links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {l.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={onClose}
                  className="inline-flex items-center rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-zinc-800 px-3 py-2.5 ring-1 ring-white/5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-zinc-400"
            style={{ animation: `chatbot-typing 1.2s ease-in-out ${i * 0.15}s infinite` }}
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
