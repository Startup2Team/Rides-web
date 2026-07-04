"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, StatCard, StatusPill } from "../_components";
import {
  VEHICLE_LABELS,
  formatDate,
  formatRWF,
  type Campaign,
  type CampaignStatus,
} from "@/lib/packages-mock";
import { getAdminCampaigns } from "@/lib/api";
import { CampaignDetailDrawer } from "./campaign-detail-drawer";

const STATUS_TONE: Record<CampaignStatus, "success" | "warn" | "info" | "neutral" | "danger"> = {
  active: "success",
  scheduled: "info",
  draft: "warn",
  expired: "neutral",
  archived: "neutral",
};

type StatusFilter = "all" | CampaignStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
];

export function CampaignsConsole() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminCampaigns()
      .then(setCampaigns)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load campaigns"));
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  const openCampaign = openId
    ? campaigns.find((c) => c.id === openId) ?? null
    : null;

  /* Stats */
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const scheduledCount = campaigns.filter((c) => c.status === "scheduled").length;
  const expiringSoonCount = campaigns.filter(
    (c) =>
      c.status === "active" &&
      new Date(c.endsAt).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7,
  ).length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active campaigns" value={String(activeCount)} tone="primary" />
        <StatCard label="Scheduled" value={String(scheduledCount)} hint="Pending launch" />
        <StatCard
          label="Expiring this week"
          value={String(expiringSoonCount)}
          tone={expiringSoonCount > 0 ? "alert" : "default"}
        />
        <StatCard label="Total campaigns" value={String(campaigns.length)} />
      </div>

      {/* Filters + create */}
      <Card>
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={chipClass(statusFilter === f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled
            title="Create-campaign flow ships with backend Phase 2"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Create campaign
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Overrides</th>
                <th className="px-4 py-3">Window</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No campaigns match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setOpenId(c.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setOpenId(c.id); }}
                        className="block text-left font-semibold text-foreground hover:text-primary"
                      >
                        {c.name}
                      </button>
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <AudienceBadge campaign={c} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-foreground">
                      <OverrideSummary campaign={c} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(c.startsAt)} → {formatDate(c.endsAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={statusLabel(c.status)} tone={STATUS_TONE[c.status]} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {openCampaign ? (
        <CampaignDetailDrawer campaign={openCampaign} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}

function AudienceBadge({ campaign }: { campaign: Campaign }) {
  if (campaign.audience === "all") {
    return <span className="text-xs text-foreground">All drivers</span>;
  }
  if (campaign.audience === "first-purchase") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        First purchase
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {(campaign.vehicleTypes ?? []).map((v) => (
        <span
          key={v}
          className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"
        >
          {VEHICLE_LABELS[v]}
        </span>
      ))}
    </div>
  );
}

function OverrideSummary({ campaign }: { campaign: Campaign }) {
  const parts: string[] = [];
  if (campaign.priceOverride !== null)
    parts.push(`Price → ${formatRWF(campaign.priceOverride)}`);
  if (campaign.ridesOverride !== null)
    parts.push(`+${campaign.ridesOverride} rides`);
  if (campaign.bonusRidesOverride !== null)
    parts.push(`+${campaign.bonusRidesOverride} bonus`);
  if (parts.length === 0) return <span className="text-muted-foreground">—</span>;
  return <span className="text-xs">{parts.join(" · ")}</span>;
}

function chipClass(active: boolean) {
  return `inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-muted/70"
  }`;
}

function statusLabel(status: CampaignStatus): string {
  return {
    active: "Active",
    scheduled: "Scheduled",
    draft: "Draft",
    expired: "Expired",
    archived: "Archived",
  }[status];
}

export { STATUS_TONE as campaignStatusTone, statusLabel as campaignStatusLabel };
