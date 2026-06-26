"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "../_components";
import { campaignStatusLabel, campaignStatusTone } from "./campaigns-console";
import {
  updateCampaign,
  deleteCampaign,
} from "@/lib/api";
import {
  VEHICLE_LABELS,
  formatDate,
  formatDateTime,
  formatRWF,
  type Campaign,
} from "@/lib/packages-mock";

export function CampaignDetailDrawer({
  campaign,
  onClose,
  onUpdate,
}: {
  campaign: Campaign;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleStatusChange(status: "ACTIVE" | "EXPIRED") {
    setSubmitting(true);
    setError(null);
    try {
      await updateCampaign(campaign.id, { status });
      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign status");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive() {
    if (!confirm("Are you sure you want to archive (soft-delete) this campaign?")) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await deleteCampaign(campaign.id);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive campaign");
    } finally {
      setSubmitting(false);
    }
  }

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
          {error ? (
            <div className="mb-6 rounded-xl bg-destructive/15 p-4 text-xs font-semibold text-destructive">
              {error}
            </div>
          ) : null}

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
                  campaign.priceOverride !== null
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
              <Pin label="Starts" value={campaign.startsAt ? formatDateTime(campaign.startsAt) : "Immediate"} />
              <span className="text-muted-foreground">→</span>
              <Pin label="Ends" value={campaign.endsAt ? formatDateTime(campaign.endsAt) : "Never"} />
            </div>
          </section>

          {/* Lifecycle actions */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold tracking-tight text-foreground">
              Lifecycle actions
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Transition status or archive this campaign configuration.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isUpcoming ? (
                <ActionButton
                  label="Activate now"
                  tone="primary"
                  disabled={submitting}
                  onClick={() => handleStatusChange("ACTIVE")}
                />
              ) : null}
              {isLive ? (
                <ActionButton
                  label="Expire campaign"
                  tone="warn"
                  disabled={submitting}
                  onClick={() => handleStatusChange("EXPIRED")}
                />
              ) : null}
              {campaign.status === "expired" || campaign.status === "draft" ? (
                <ActionButton
                  label="Archive"
                  tone="neutral"
                  disabled={submitting}
                  onClick={handleArchive}
                />
              ) : null}
              <ActionButton label="Preview in app" tone="neutral" disabled />
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
      ? "bg-primary text-primary-foreground hover:bg-primary/95"
      : tone === "warn"
      ? "bg-amber-500 text-white hover:bg-amber-600"
      : "border border-border bg-card text-foreground hover:bg-muted/50";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-xs font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
    >
      {label}
    </button>
  );
}
