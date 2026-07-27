"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "../_components";
import { campaignStatusLabel, campaignStatusTone } from "./campaigns-console";
import { updateCampaignStatus, type Campaign } from "@/lib/api";
import { QRCode } from "../account/qr-code";

const VEHICLE_LABELS: Record<string, string> = {
  moto: "Moto Bike",
  cab: "Cab Taxi",
  hilux: "Light Hilux",
  fuso: "Heavy Fuso",
  rifani: "Rifani",
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
  const [copied, setCopied] = useState(false);

  const attributionUrl = `https://rides.rw/signup?ref=${campaign.slug}`;

  // Pull the rendered QR canvas out of the DOM and save it — the button used to
  // just alert() that a download had started.
  const downloadQr = () => {
    const canvas = document.querySelector<HTMLCanvasElement>("[data-campaign-qr] canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `campaign-${campaign.slug}-qr.png`;
    link.click();
  };

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
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Not tracked
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 items-center">
              {/* QR Code Graphic */}
              <div className="flex flex-col items-center justify-center p-3 border border-border rounded-2xl bg-muted/20 relative group">
                <div data-campaign-qr>
                  <QRCode seed={attributionUrl} size={96} />
                </div>
                <button
                  type="button"
                  onClick={downloadQr}
                  className="mt-2 text-[10px] font-bold text-primary hover:underline"
                >
                  Download QR Code
                </button>
              </div>

              {/* Attribution Statistics */}
              <div className="sm:col-span-2 space-y-3">
                <div className="rounded-xl border border-border/80 bg-muted/10 p-2.5 text-xs text-muted-foreground">
                  Scan and signup attribution isn&apos;t recorded yet — the referral link
                  below is live, but no counts are collected for it.
                </div>

                {/* Promo link copy */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Campaign Target URL</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={attributionUrl}
                      className="block h-9 flex-1 rounded-xl border border-border bg-muted/20 px-3 text-xs text-muted-foreground outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(attributionUrl);
                        setCopied(true);
                      }}
                      className="h-9 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors shrink-0"
                    >
                      {copied ? "Copied" : "Copy Link"}
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
