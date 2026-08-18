"use client";

import { useState, type ReactNode } from "react";
import { resolveBackendUrl } from "@/lib/api";

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "default" | "primary" | "alert";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tracking-tight ${
          tone === "primary"
            ? "text-primary"
            : tone === "alert"
            ? "text-amber-600"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  bodyClass,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  bodyClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm shadow-black/[0.01] transition-all duration-300 hover:shadow-md hover:shadow-primary/[0.02] hover:border-border/80">
      {title ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {action ? <div className="w-full sm:w-auto">{action}</div> : null}
        </div>
      ) : null}
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

export function StatusPill({
  status,
  tone,
}: {
  status: string;
  tone: "success" | "warn" | "danger" | "neutral" | "info";
}) {
  const styles: Record<string, string> = {
    success: "bg-primary/15 text-primary",
    info: "bg-primary/15 text-primary",
    warn: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
    danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-100",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[tone]}`}
    >
      {status}
    </span>
  );
}

export function Avatar({
  name,
  tone = "primary",
  size = "md",
  url,
  clickable = true,
}: {
  name: string;
  tone?: "primary" | "neutral";
  size?: "sm" | "md" | "lg";
  url?: string | null;
  clickable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 text-[10px]"
      : size === "lg"
      ? "h-20 w-20 text-2xl"
      : "h-9 w-9 text-xs";
  const resolvedUrl = url ? resolveBackendUrl(url) : null;

  if (resolvedUrl) {
    return (
      <>
        <button
          type="button"
          onClick={(e) => {
            if (!clickable) return;
            e.stopPropagation();
            setOpen(true);
          }}
          className={`group relative shrink-0 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary ${
            clickable ? "cursor-pointer" : ""
          }`}
          title={clickable ? `Click to enlarge ${name}'s photo` : name}
        >
          <img
            src={resolvedUrl}
            alt={name}
            className={`shrink-0 rounded-full object-cover transition-transform duration-200 group-hover:scale-105 ${sizeClass}`}
          />
          {clickable && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-white">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
          )}
        </button>

        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-card p-4 shadow-2xl ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border pb-3 px-1">
                <h3 className="text-sm font-bold text-foreground">{name} — Profile Photo</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 flex items-center justify-center max-h-[75vh]">
                <img
                  src={resolvedUrl}
                  alt={name}
                  className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-md"
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${
        tone === "primary"
          ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
          : "bg-muted text-foreground/80 ring-1 ring-inset ring-border"
      }`}
    >
      {name ? name.charAt(0).toUpperCase() : ""}
    </span>
  );
}
