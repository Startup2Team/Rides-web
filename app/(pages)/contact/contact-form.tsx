"use client";

import { useEffect, useState } from "react";

export type ContactCategory =
  | "General"
  | "Driver application"
  | "Partnership"
  | "Press"
  | "Complaint"
  | "Other";

const categories: { value: ContactCategory; label: string; replyHint: string }[] = [
  { value: "General", label: "General enquiry", replyHint: "Usually within 24 hours" },
  { value: "Driver application", label: "Driver application", replyHint: "Usually within 48 hours" },
  { value: "Partnership", label: "Partnership / corporate", replyHint: "Usually within 2 business days" },
  { value: "Press", label: "Press / media", replyHint: "Same business day" },
  { value: "Complaint", label: "Complaint", replyHint: "Within 12 hours · priority" },
  { value: "Other", label: "Other", replyHint: "Usually within 24 hours" },
];

const SUBMISSIONS_KEY = "rides-contact-submissions";

type State = "idle" | "sending" | "success" | "error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<ContactCategory>("General");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<State>("idle");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const errors: Record<string, string | null> = {
    name: !name.trim() ? "Please enter your name." : null,
    email: !email.trim()
      ? "Please enter your email."
      : !isValidEmail(email)
        ? "Enter a valid email address."
        : null,
    subject: !subject.trim() ? "Please add a subject line." : null,
    message:
      !message.trim() ? "Tell us what we can help with." : message.trim().length < 10 ? "Add a bit more detail (at least 10 characters)." : null,
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const replyHint = categories.find((c) => c.value === category)?.replyHint;

  useEffect(() => {
    if (state !== "success") return;
    // Allow user to read the success card; they can dismiss to send another.
  }, [state]);

  function showError(field: keyof typeof errors) {
    return touched[field] && errors[field];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    if (hasErrors) return;

    setState("sending");
    const id = `MSG-${Date.now().toString().slice(-7)}`;
    const submission = {
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      subject: subject.trim(),
      category,
      status: "New" as const,
      receivedAt: "Just now",
      body: message.trim(),
      replies: [],
    };

    try {
      if (typeof window !== "undefined") {
        const existing = window.localStorage.getItem(SUBMISSIONS_KEY);
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(submission);
        window.localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
      }
      // Brief simulated network delay so the "Sending…" state is visible.
      await new Promise((r) => setTimeout(r, 700));
      setSubmittedId(id);
      setState("success");
    } catch {
      setState("error");
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setCategory("General");
    setTouched({});
    setSubmittedId(null);
    setState("idle");
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-foreground">
          Message received
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks {name.split(" ")[0]} — we've logged your message as{" "}
          <span className="font-mono font-semibold text-foreground">
            {submittedId}
          </span>
          . The team usually replies {replyHint?.toLowerCase()}.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll write back to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Name *
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched({ ...touched, name: true })}
            placeholder="Aiden Mugisha"
            className={`mt-2 block h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              showError("name") ? "border-red-300" : "border-border"
            }`}
          />
          {showError("name") ? (
            <p className="mt-1 text-[11px] font-semibold text-red-600">
              {errors.name}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Email *
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched({ ...touched, email: true })}
            placeholder="you@example.com"
            className={`mt-2 block h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
              showError("email") ? "border-red-300" : "border-border"
            }`}
          />
          {showError("email") ? (
            <p className="mt-1 text-[11px] font-semibold text-red-600">
              {errors.email}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Phone (optional)
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+250 788 000 000"
            className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            What's it about?
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ContactCategory)}
            className="mt-2 block h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Subject *
        </span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onBlur={() => setTouched({ ...touched, subject: true })}
          placeholder="Quick summary of your message"
          className={`mt-2 block h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            showError("subject") ? "border-red-300" : "border-border"
          }`}
        />
        {showError("subject") ? (
          <p className="mt-1 text-[11px] font-semibold text-red-600">
            {errors.subject}
          </p>
        ) : null}
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Message *
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched({ ...touched, message: true })}
          rows={5}
          placeholder="Tell us a bit about what we can help with…"
          className={`mt-2 block w-full rounded-xl border bg-surface px-3.5 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            showError("message") ? "border-red-300" : "border-border"
          }`}
        />
        {showError("message") ? (
          <p className="mt-1 text-[11px] font-semibold text-red-600">
            {errors.message}
          </p>
        ) : null}
      </label>

      <div className="mt-5 flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{replyHint}</span> for{" "}
          {categories.find((c) => c.value === category)?.label.toLowerCase()}.
        </p>

        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {state === "sending" ? (
            <>
              <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
      </div>

      {state === "error" ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          Something went wrong saving your message. Please try again.
        </p>
      ) : null}
    </form>
  );
}
