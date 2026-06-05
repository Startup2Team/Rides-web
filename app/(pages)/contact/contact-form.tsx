"use client";

import { useState } from "react";
import { submitContact } from "@/lib/api";

type State = "idle" | "sending" | "success" | "error";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Derive a subject from the first sentence (or first 60 chars) of the message.
// Backend requires a subject; this keeps the UI clean while satisfying that.
function deriveSubject(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return "Contact message";
  const firstSentence = trimmed.split(/[.!?\n]/)[0]?.trim() ?? "";
  const base = firstSentence || trimmed;
  return base.length > 60 ? base.slice(0, 60) + "…" : base;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<State>("idle");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const errors: Record<"name" | "email" | "message", string | null> = {
    name: !name.trim() ? "Please enter your name." : null,
    email: !email.trim()
      ? "Please enter your email."
      : !isValidEmail(email)
        ? "Enter a valid email address."
        : null,
    message: !message.trim()
      ? "Tell us what we can help with."
      : message.trim().length < 10
        ? "Add a bit more detail (at least 10 characters)."
        : null,
  };

  const hasErrors = Object.values(errors).some(Boolean);

  function showError(field: keyof typeof errors) {
    return touched[field] && errors[field];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) return;

    setState("sending");
    setErrorMessage(null);
    try {
      const receipt = await submitContact({
        name: name.trim(),
        email: email.trim(),
        subject: deriveSubject(message),
        category: "General",
        body: message.trim(),
      });
      setSubmittedId(receipt.id);
      setState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not send message.");
      setState("error");
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setMessage("");
    setTouched({});
    setSubmittedId(null);
    setErrorMessage(null);
    setState("idle");
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-8 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mt-5 text-xl font-bold tracking-[-0.02em] text-foreground">
          Message received
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks {name.split(" ")[0]} — we&apos;ve logged your message as{" "}
          <span className="font-mono text-xs font-semibold text-foreground">
            {submittedId?.slice(0, 8)}
          </span>
          . We&apos;ll write back to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-alt"
        >
          Send another
        </button>
      </div>
    );
  }

  // Shared input class — underline-only, transparent bg, focuses by changing
  // the bottom border to primary. Errors switch to red-400.
  const inputClass = (hasError: boolean) =>
    `block w-full bg-transparent border-0 border-b px-0 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary ${
      hasError ? "border-red-300" : "border-border"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Your name
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched({ ...touched, name: true })}
          placeholder=""
          autoComplete="name"
          className={inputClass(Boolean(showError("name")))}
        />
        {showError("name") ? (
          <p className="mt-1 text-[11px] font-medium text-red-600">{errors.name}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Your email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched({ ...touched, email: true })}
          placeholder=""
          autoComplete="email"
          className={inputClass(Boolean(showError("email")))}
        />
        {showError("email") ? (
          <p className="mt-1 text-[11px] font-medium text-red-600">{errors.email}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Enter your message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched({ ...touched, message: true })}
          rows={3}
          placeholder=""
          className={`${inputClass(Boolean(showError("message")))} resize-none`}
        />
        {showError("message") ? (
          <p className="mt-1 text-[11px] font-medium text-red-600">{errors.message}</p>
        ) : null}
      </label>

      <div className="pt-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-10 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:w-auto"
        >
          {state === "sending" ? (
            <>
              <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              Sending…
            </>
          ) : (
            "Submit now"
          )}
        </button>
      </div>

      {state === "error" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
          {errorMessage ?? "Something went wrong. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
