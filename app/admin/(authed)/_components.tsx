import type { ReactNode } from "react";

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
    <div className="rounded-2xl border border-border bg-card">
      {title ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
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
}: {
  name: string;
  tone?: "primary" | "neutral";
  size?: "sm" | "md" | "lg";
  url?: string | null;
}) {
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 text-[10px]"
      : size === "lg"
      ? "h-20 w-20 text-2xl"
      : "h-9 w-9 text-xs";
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      />
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
