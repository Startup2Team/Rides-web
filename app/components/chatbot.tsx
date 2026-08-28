"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useSection } from "../i18n/context";
import type { Dictionary } from "../i18n/context";

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

type ChatbotDict = Dictionary["chatbot"];
type LabelKey = keyof ChatbotDict["labels"];
type LinkSpec = { labelKey: LabelKey; href: string; external?: boolean };

// ── Flow graph ────────────────────────────────────────────────────────────────
// Structure only — every user-visible string lives in the locale dictionaries.
// `links` maps a reply index to the buttons rendered under that reply.

const WHATSAPP = "https://wa.me/250788000000";

const FLOW_GRAPH: Record<
  FlowId,
  { links?: Record<number, LinkSpec[]>; next: { labelKey: LabelKey; flow: FlowId }[] }
> = {
  welcome: {
    next: [
      { labelKey: "become-driver", flow: "driver" },
      { labelKey: "how-payments-work", flow: "payments" },
      { labelKey: "negotiations", flow: "negotiation" },
      { labelKey: "where-you-operate", flow: "locations" },
      { labelKey: "ride-issue", flow: "ride-issue" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  driver: {
    links: {
      2: [
        { labelKey: "driver-application", href: "/contact" },
        { labelKey: "driver-page", href: "/drivers" },
      ],
    },
    next: [
      { labelKey: "how-payments-work", flow: "payments" },
      { labelKey: "where-you-operate", flow: "locations" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  negotiation: {
    links: { 2: [{ labelKey: "see-how-it-works", href: "/#how-it-works" }] },
    next: [
      { labelKey: "how-payments-work", flow: "payments" },
      { labelKey: "become-driver", flow: "driver" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  locations: {
    next: [
      { labelKey: "become-driver", flow: "driver" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  payments: {
    next: [
      { labelKey: "negotiations", flow: "negotiation" },
      { labelKey: "ride-issue", flow: "ride-issue" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  "ride-issue": {
    links: {
      1: [
        { labelKey: "file-a-complaint", href: "/contact" },
        { labelKey: "whatsapp-support", href: WHATSAPP, external: true },
      ],
    },
    next: [
      { labelKey: "how-payments-work", flow: "payments" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  complaint: {
    links: {
      1: [
        { labelKey: "contact-form", href: "/contact" },
        { labelKey: "whatsapp", href: WHATSAPP, external: true },
      ],
    },
    next: [
      { labelKey: "ride-issue", flow: "ride-issue" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
  human: {
    links: {
      1: [
        { labelKey: "whatsapp", href: WHATSAPP, external: true },
        { labelKey: "contact-form", href: "/contact" },
        { labelKey: "call-support", href: "tel:+250788000000", external: true },
      ],
    },
    next: [{ labelKey: "back-to-start", flow: "welcome" }],
  },
  "no-match": {
    next: [
      { labelKey: "become-driver", flow: "driver" },
      { labelKey: "how-payments-work", flow: "payments" },
      { labelKey: "negotiations", flow: "negotiation" },
      { labelKey: "where-you-operate", flow: "locations" },
      { labelKey: "talk-to-human", flow: "human" },
    ],
  },
};

// ── Keyword matcher ───────────────────────────────────────────────────────────
// Keyword lists are per-locale, so a French or Kinyarwanda question reaches the
// same flow an English one would. Order sets precedence and must stay stable.

const MATCH_ORDER: Exclude<FlowId, "welcome" | "no-match">[] = [
  "driver", "negotiation", "locations", "payments", "complaint", "ride-issue", "human",
];

function matchFlow(input: string, keywords: ChatbotDict["keywords"]): FlowId {
  const t = input.toLowerCase();
  for (const flow of MATCH_ORDER) {
    if (keywords[flow].some((w) => t.includes(w.toLowerCase()))) return flow;
  }
  return "no-match";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "rides-chatbot-history";
const makeId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function flowToMessages(flowId: FlowId, dict: ChatbotDict): Message[] {
  const graph = FLOW_GRAPH[flowId];
  return dict.flows[flowId].reply.map((body, i) => {
    const specs = graph.links?.[i];
    return {
      id: makeId(),
      sender: "bot" as Sender,
      body,
      links: specs?.map((l) => ({
        label: dict.labels[l.labelKey],
        href: l.href,
        external: l.external,
      })),
    };
  });
}

function nextReplies(flowId: FlowId, dict: ChatbotDict): QuickReply[] {
  return FLOW_GRAPH[flowId].next.map((n) => ({
    label: dict.labels[n.labelKey],
    flow: n.flow,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Chatbot() {
  const dict = useSection("chatbot");
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(() =>
    nextReplies("welcome", dict),
  );
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore / seed history
  useEffect(() => {
    setMounted(true);
    setTimeout(() => setMessages(flowToMessages("welcome", dict)), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Language switch: past turns were written in the previous language and can't
  // be retranslated, so restart the conversation in the newly selected one.
  const firstLocale = useRef(locale);
  useEffect(() => {
    if (locale === firstLocale.current) return;
    firstLocale.current = locale;
    setMessages(flowToMessages("welcome", dict));
    setQuickReplies(nextReplies("welcome", dict));
    window.sessionStorage.removeItem(STORAGE_KEY);
  }, [locale, dict]);

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
    setQuickReplies([]);
    setTyping(true);
    const replies = flowToMessages(flowId, dict);
    replies.forEach((msg, i) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
        if (i === replies.length - 1) {
          setTyping(false);
          setQuickReplies(nextReplies(flowId, dict));
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
    runFlow(matchFlow(value, dict.keywords));
  }

  function resetChat() {
    setMessages(flowToMessages("welcome", dict));
    setQuickReplies(nextReplies("welcome", dict));
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  const unread = useMemo(() => !open && hasNew, [open, hasNew]);

  return (
    <>
      {/* ── Floating bubble ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setHasNew(false); }}
        aria-label={open ? dict.closeLabel : dict.openLabel}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-[1.05] active:scale-[0.95]"
      >
        {/* Close icon */}
        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${open ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>

        {/* Open icon — logo + label */}
        <span className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${open ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}>
          <img src="/ridelogo.png" alt="" className="h-8 w-8 object-contain brightness-0 invert" aria-hidden />
          <span className="text-[10px] font-black tracking-wide text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{dict.bubbleLabel}</span>
        </span>


      </button>

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label={dict.dialogLabel}
        aria-hidden={!open}
        className={`fixed bottom-24 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-all duration-300 ease-out inset-x-4 sm:inset-x-auto sm:right-6 sm:w-80 ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        // Cap to the space actually available: the panel sits 6rem off the
        // bottom, so a fixed 32rem overflowed the top of short viewports
        // (landscape phones, short windows) with no way to scroll it back.
        style={{ height: "min(32rem, calc(100dvh - 7.5rem))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-primary px-4 py-3">
          <img src="/ridelogo.png" alt="Rides" className="h-8 w-8 shrink-0 object-contain brightness-0 invert" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none">{dict.assistantName}</p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Wallpaper */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              backgroundImage: "url('/ridelogo.png')",
              backgroundSize: "150px",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.06,
            }}
          />
          <div className="relative z-10 space-y-3">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} onClose={() => setOpen(false)} />
            ))}
            {typing && <TypingBubble />}
          </div>
        </div>



        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-border bg-card px-3 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={dict.inputPlaceholder}
            className="h-9 flex-1 rounded-xl border border-border bg-surface px-3 text-xs text-foreground outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label={dict.sendLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30 transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
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
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-primary text-white"
            : "rounded-bl-sm bg-card text-foreground ring-1 ring-border"
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
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
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
                  className="inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
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
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-card px-3 py-2.5 ring-1 ring-border">
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
