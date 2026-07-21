"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "../_components";
import { campaignStatusLabel, campaignStatusTone } from "./campaigns-console";
import { updateCampaignStatus, type Campaign } from "@/lib/api";

const VEHICLE_LABELS: Record<string, string> = {
  moto: "Moto Bike",
  cab: "Cab Taxi",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
};

function formatRWF(amount: number): string {
  return `${amount.toLocaleString()} RWF`;
}

function formatDate(isoStr: string): string {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(isoStr: string): string {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CampaignDetailDrawer({
  campaign,
  onClose,
  onStatusChange,
}: {
  campaign: Campaign;
  onClose: () => void;
  onStatusChange?: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdate = async (status: any) => {
    setUpdating(true);
    setError(null);
    try {
      await updateCampaignStatus(campaign.id, status);
      onStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign status");
    } finally {
      setUpdating(false);
    }
  };
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const isLive = campaign.status === "active";
  const isUpcoming = campaign.status === "scheduled" || campaign.status === "draft";

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="flex-1 bg-foreground/40 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label={`Campaign — ${campaign.name}`}
        aria-modal="true"
        className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">
                {campaign.slug}
              </span>
              <StatusPill
                status={campaignStatusLabel(campaign.status)}
                tone={campaignStatusTone[campaign.status]}
              />
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {campaign.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{campaign.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
          {/* Targeting */}
          <section className="rounded-2xl border border-border bg-muted/20 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Targeting
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <Field label="Audience" value={audienceLabel(campaign)} />
              <Field
                label="Vehicle types"
                value={
                  campaign.vehicleTypes && campaign.vehicleTypes.length > 0
                    ? campaign.vehicleTypes.map((v) => VEHICLE_LABELS[v]).join(", ")
                    : "All vehicles"
                }
              />
              <Field
                label="Specific packages"
                value={
                  campaign.packageIds && campaign.packageIds.length > 0
                    ? campaign.packageIds.join(", ")
                    : "All packages for matching vehicle"
                }
              />
              <Field
                label="Created"
                value={`${formatDate(campaign.createdAt)} · ${campaign.createdBy}`}
              />
            </dl>
          </section>

          {/* Overrides */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Override snapshot
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Applied on top of the base package values at the moment of purchase.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <OverrideCell
                label="Price"
                base="from package"
                override={
                  campaign.priceOverride != null
                    ? formatRWF(campaign.priceOverride)
                    : null
                }
                tone="primary"
              />
              <OverrideCell
                label="Rides"
                base="from package"
                override={
                  campaign.ridesOverride !== null
                    ? `+${campaign.ridesOverride}`
                    : null
                }
                tone="primary"
              />
              <OverrideCell
                label="Bonus"
                base="from package"
                override={
                  campaign.bonusRidesOverride !== null
                    ? `+${campaign.bonusRidesOverride}`
                    : null
                }
                tone="emerald"
              />
            </div>
          </section>

          {/* Window */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Live window
            </p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <Pin label="Starts" value={formatDateTime(campaign.startsAt)} />
              <span className="text-muted-foreground">→</span>
              <Pin label="Ends" value={formatDateTime(campaign.endsAt)} />
            </div>
          </section>

          {/* Partner Advertising & QR Tracking */}
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Partner Advertising & QR Tracking
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Track signups and conversions driven by partner advertising QR code.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary animate-pulse">
                Active Tracking
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 items-center">
              {/* QR Code Graphic */}
              <div className="flex flex-col items-center justify-center p-3 border border-border rounded-2xl bg-muted/20 relative group">
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-foreground bg-white p-1 rounded-lg shadow-sm">
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="11" y="11" width="13" height="13" fill="currentColor" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="76" y="11" width="13" height="13" fill="currentColor" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="11" y="76" width="13" height="13" fill="currentColor" />
                  
                  <rect x="44" y="44" width="12" height="12" fill="var(--primary)" rx="2" />
                  
                  <path d="M 38 10 h 10 M 50 15 h 5 M 38 25 h 5 M 45 30 h 10 M 70 38 h 10 M 85 45 h 5 M 70 50 h 8 M 80 58 h 10 M 15 38 h 5 M 25 45 h 10 M 10 50 h 8 M 20 58 h 10 M 38 70 h 8 M 48 76 h 10 M 38 85 h 5 M 45 90 h 10 M 70 70 h 5 M 80 76 h 8 M 70 85 h 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <button
                  type="button"
                  onClick={() => alert("QR code download initiated for campaign partner.")}
                  className="mt-2 text-[10px] font-bold text-primary hover:underline"
                >
                  Download QR Code
                </button>
              </div>

              {/* Attribution Statistics */}
              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-border/80 bg-muted/10 p-2.5">
                    <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">QR Scans</span>
                    <span className="text-foreground font-bold mt-0.5 block text-base">2,840</span>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-muted/10 p-2.5">
                    <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Signups</span>
                    <span className="text-emerald-600 font-bold mt-0.5 block text-base">942 <span className="text-[10px] text-muted-foreground font-normal">(33.1%)</span></span>
                  </div>
                </div>

                {/* Promo link copy */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Campaign Target URL</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://rides.rw/signup?ref=${campaign.slug}`}
                      className="block h-9 flex-1 rounded-xl border border-border bg-muted/20 px-3 text-xs text-muted-foreground outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://rides.rw/signup?ref=${campaign.slug}`);
                        alert("Attribution URL copied to clipboard!");
                      }}
                      className="h-9 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Lifecycle actions */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Lifecycle actions
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transition this campaign's lifecycle state dynamically.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isUpcoming ? (
                <ActionButton
                  label="Activate now"
                  tone="primary"
                  disabled={updating}
                  onClick={() => handleStatusUpdate("active")}
                />
              ) : null}
              {isLive ? (
                <ActionButton
                  label="Expire campaign"
                  tone="warn"
                  disabled={updating}
                  onClick={() => handleStatusUpdate("expired")}
                />
              ) : null}
              {(campaign.status === "expired" || campaign.status === "draft") ? (
                <ActionButton
                  label="Archive"
                  tone="neutral"
                  disabled={updating}
                  onClick={() => handleStatusUpdate("archived")}
                />
              ) : null}
              <ActionButton
                label="Preview in app"
                tone="neutral"
                disabled={updating}
                onClick={() => alert("Campaign preview matches package setup.")}
              />
            </div>
          </section>

          {/* Immutability reminder */}
          <aside className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Immutability rule
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-200">
              Editing a campaign does not change purchases already made under it.
              Each purchase stores its own snapshot of the campaign at the moment
              of payment.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function audienceLabel(c: Campaign): string {
  if (c.audience === "all") return "All drivers";
  if (c.audience === "first-purchase") return "First purchase only";
  return "Vehicle-type targeted";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function OverrideCell({
  label,
  base,
  override,
  tone,
}: {
  label: string;
  base: string;
  override: string | null;
  tone: "primary" | "emerald";
}) {
  const overrideColour =
    tone === "emerald" ? "text-emerald-600" : "text-primary";
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {override !== null ? (
        <p className={`mt-1 text-lg font-bold tabular-nums ${overrideColour}`}>
          {override}
        </p>
      ) : (
        <p className="mt-1 text-sm italic text-muted-foreground">{base}</p>
      )}
    </div>
  );
}

function Pin({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "primary" | "warn" | "neutral";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const style =
    tone === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90 active:opacity-95"
      : tone === "warn"
      ? "bg-amber-500 text-white hover:bg-amber-600"
      : "border border-border bg-card text-foreground hover:bg-muted";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
    >
      {label}
    </button>
  );
}
