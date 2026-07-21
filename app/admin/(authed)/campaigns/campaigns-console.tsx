"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, StatCard, StatusPill } from "../_components";
import {
  getAdminCampaigns,
  createCampaign,
  getAdminPackages,
  type Package,
  type Campaign,
  type CampaignStatus,
} from "@/lib/api";

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
import { CampaignDetailDrawer } from "./campaign-detail-drawer";

const STATUS_TONE: Record<string, "success" | "warn" | "info" | "neutral" | "danger"> = {
  active: "success",
  scheduled: "info",
  draft: "warn",
  expired: "neutral",
  archived: "neutral",
};

type StatusFilter = "all" | string;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    getAdminCampaigns()
      .then(setCampaigns)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load campaigns"));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      // 1. Status Filter
      if (statusFilter !== "all" && c.status !== statusFilter) return false;

      // 2. Audience Filter
      if (audienceFilter !== "all") {
        if (audienceFilter === "general" && c.audience !== "all") return false;
        if (audienceFilter === "first-purchase" && c.audience !== "first-purchase") return false;
        if (audienceFilter === "vehicle-type" && c.audience !== "vehicle-type") return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesDesc = c.description.toLowerCase().includes(q);
        const matchesSlug = c.slug.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSlug) return false;
      }

      return true;
    });
  }, [campaigns, statusFilter, audienceFilter, searchQuery]);

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

      {/* Campaign Growth & Impact Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attribution Chart Card */}
        <div className="lg:col-span-2">
          <Card bodyClass="p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Campaign-Attributed Revenue Growth</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Attribution share of ride package sales driven by active campaigns over the last 30 days.</p>
            </div>
            {/* Custom SVG line chart representing growth */}
            <div className="h-44 w-full relative pt-2">
              <svg viewBox="0 0 500 150" className="w-full h-full text-primary" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                
                {/* Gradient fill */}
                <path
                  d="M 0 130 Q 80 90, 160 110 T 320 50 T 420 30 T 500 20 L 500 150 L 0 150 Z"
                  fill="url(#chartGlow)"
                />
                {/* Line path */}
                <path
                  d="M 0 130 Q 80 90, 160 110 T 320 50 T 420 30 T 500 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Glow dots */}
                <circle cx="160" cy="110" r="4" fill="currentColor" />
                <circle cx="320" cy="50" r="4" fill="currentColor" />
                <circle cx="500" cy="20" r="4" fill="currentColor" />
              </svg>
              {/* Axis labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-medium px-1">
                <span>Week 1 (Launch)</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4 (Peak)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Growth Stats Breakdown */}
        <Card bodyClass="p-5 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Campaign Conversion Share</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Attributed sales performance.</p>
            </div>
            
            {/* Stacked Attributed Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-primary">Promo Attributed (65%)</span>
                <span className="text-muted-foreground">Standard (35%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                <div className="h-full bg-primary" style={{ width: "65%" }} />
                <div className="h-full bg-muted-foreground/30" style={{ width: "35%" }} />
              </div>
            </div>

            {/* Target Audience Distribution */}
            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-xs font-bold text-foreground block">Audience Conversion Boost</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-muted/30 p-2 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">New signups</span>
                  <span className="text-emerald-600 font-bold mt-1 block text-lg">+32.4%</span>
                </div>
                <div className="rounded-lg bg-muted/30 p-2 border border-border/40">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Existing active</span>
                  <span className="text-primary font-bold mt-1 block text-lg">+18.2%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 border-t border-border pt-4 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live data feeding from mock purchases ledger.
          </div>
        </Card>
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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-95"
          >
            + Create campaign
          </button>
        </div>

        {/* Search + Audience Filtering Bar */}
        <div className="flex flex-col gap-3 border-b border-border bg-muted/10 px-4 py-2.5 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description, slug..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Audience Filter Select */}
          <div className="relative shrink-0">
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="h-8 pl-3 pr-8 rounded-xl border border-border bg-card text-xs text-foreground outline-none cursor-pointer focus:border-primary appearance-none min-w-[160px]"
            >
              <option value="all">All Audiences</option>
              <option value="general">All Drivers</option>
              <option value="first-purchase">First Purchase</option>
              <option value="vehicle-type">Vehicle Targeted</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Clear Filters Link */}
          {(searchQuery || audienceFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setAudienceFilter("all");
              }}
              className="text-xs font-semibold text-primary hover:underline self-start sm:self-center"
            >
              Clear filters
            </button>
          )}
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
                    className="group border-b border-border/80 cursor-pointer transition-all duration-200 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3.5">
                      <span className="block font-semibold text-foreground group-hover:text-primary transition-colors">
                        {c.name}
                      </span>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <AudienceBadge campaign={c} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-foreground font-medium">
                      <OverrideSummary campaign={c} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">
                          {formatDate(c.startsAt)} → {formatDate(c.endsAt)}
                        </span>
                        {c.status === "active" && new Date(c.endsAt).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7 && (
                          <span className="mt-1 text-[9px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            Expiring soon
                          </span>
                        )}
                      </div>
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
        <CampaignDetailDrawer
          campaign={openCampaign}
          onClose={() => setOpenId(null)}
          onStatusChange={reload}
        />
      ) : null}
 
      {isCreateOpen && (
        <CreateCampaignModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={reload}
        />
      )}
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
  if (campaign.priceOverride != null)
    parts.push(`Price → ${formatRWF(campaign.priceOverride)}`);
  if (campaign.ridesOverride != null)
    parts.push(`+${campaign.ridesOverride} rides`);
  if (campaign.bonusRidesOverride != null)
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

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: "Active",
    scheduled: "Scheduled",
    draft: "Draft",
    expired: "Expired",
    archived: "Archived",
  };
  return map[status] ?? status;
}

function CreateCampaignModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState<"all" | "first-purchase" | "vehicle-type">("all");
  const [selectedVehicles, setSelectedVehicles] = useState<("moto" | "cab" | "hilux" | "fuso")[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [priceOverride, setPriceOverride] = useState("");
  const [ridesOverride, setRidesOverride] = useState("");
  const [bonusRidesOverride, setBonusRidesOverride] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminPackages()
      .then(setPackages)
      .catch(() => {});
  }, []);

  const toggleVehicle = (v: "moto" | "cab" | "hilux" | "fuso") => {
    setSelectedVehicles((prev) =>
      prev.includes(v) ? prev.filter((item) => item !== v) : [...prev, v]
    );
  };

  const togglePackage = (pkgId: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Campaign name is required.");
    if (!startsAt || !endsAt) return setError("Start and end dates are required.");
    if (new Date(startsAt) >= new Date(endsAt)) return setError("End date must be after start date.");
    if (audience === "vehicle-type" && selectedVehicles.length === 0) {
      return setError("Please select at least one target vehicle type.");
    }

    setSubmitting(true);
    setError(null);
    try {
      await createCampaign({
        name: name.trim(),
        description: description.trim(),
        audience,
        vehicleTypes: audience === "vehicle-type" ? selectedVehicles : null,
        packageIds: selectedPackages.length > 0 ? selectedPackages : null,
        priceOverride: priceOverride ? Number(priceOverride) : null,
        ridesOverride: ridesOverride ? Number(ridesOverride) : null,
        bonusRidesOverride: bonusRidesOverride ? Number(bonusRidesOverride) : null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div onClick={onClose} className="fixed inset-0 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out" />
      
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.34-1.39-.7-2.07-1.11M3.5 1.5h17c.55 0 1 .45 1 1v17c0 .55-.45 1-1 1h-17c-.55 0-1-.45-1-1v-17c0-.55.45-1 1-1z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.5v3M12 15.5h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Create Promotion Campaign</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Setup target audiences and discount overrides</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="create-campaign-form" onSubmit={handleSubmit} className="space-y-6 text-sm">
            {/* Group 1: General Details */}
            <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Campaign Identity</span>
              
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Campaign Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. World Cup 2026 Boost"
                    className="block w-full min-h-[42px] rounded-xl border border-border bg-card px-3.5 py-2 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Description</span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Give operations or drivers a brief detail about this offer"
                    rows={2.5}
                    className="block w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                  />
                </label>
              </div>
            </div>

            {/* Group 2: Target Audience */}
            <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Target Driver Audience</span>
              
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Audience Scope</span>
                  <div className="relative">
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as any)}
                      className="block w-full min-h-[42px] rounded-xl border border-border bg-card pl-3.5 pr-10 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Drivers (Standard Promotion)</option>
                      <option value="first-purchase">First-Time Purchases Only</option>
                      <option value="vehicle-type">Target Specific Vehicle Types</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </label>

                {audience === "vehicle-type" && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-muted-foreground block">Select Target Vehicles</span>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {(["moto", "cab", "hilux", "fuso"] as const).map((v) => {
                        const active = selectedVehicles.includes(v);
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleVehicle(v)}
                            className={`h-11 inline-flex items-center justify-center rounded-xl px-3 border text-xs transition-all ${
                              active
                                ? "bg-primary/5 border-primary text-primary font-bold shadow-sm shadow-primary/10"
                                : "border-border bg-card hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <span>{VEHICLE_LABELS[v]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group 3: Overrides & Package restrictions */}
            <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Promotion Rules & Overrides</span>
              
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Price Override</span>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs text-muted-foreground font-semibold">RWF</span>
                      <input
                        type="number"
                        min={0}
                        value={priceOverride}
                        onChange={(e) => setPriceOverride(e.target.value)}
                        placeholder="e.g. 15000"
                        className="pl-12 block h-11 w-full rounded-xl border border-border bg-card pr-3 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      />
                    </div>
                  </label>
                  
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Rides Granted</span>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        value={ridesOverride}
                        onChange={(e) => setRidesOverride(e.target.value)}
                        placeholder="+10"
                        className="block h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      />
                      <span className="absolute right-3.5 text-xs text-muted-foreground font-semibold">rides</span>
                    </div>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Bonus Rides Override</span>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        value={bonusRidesOverride}
                        onChange={(e) => setBonusRidesOverride(e.target.value)}
                        placeholder="+5"
                        className="block h-11 w-full rounded-xl border border-border bg-card px-3 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      />
                      <span className="absolute right-3.5 text-xs text-muted-foreground font-semibold">bonus</span>
                    </div>
                  </label>
                </div>

                {packages.length > 0 && (
                  <div className="space-y-2 border-t border-border/60 pt-3">
                    <span className="text-xs font-semibold text-muted-foreground block">Restrict to Specific Packages (Optional)</span>
                    <div className="grid gap-2 grid-cols-2 max-h-36 overflow-y-auto border border-border/80 rounded-xl p-2.5 bg-card">
                      {packages.map((pkg) => {
                        const active = selectedPackages.includes(pkg.id);
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => togglePackage(pkg.id)}
                            className={`h-9 px-3 rounded-lg text-left text-xs border transition-colors flex items-center justify-between ${
                              active
                                ? "bg-primary/5 border-primary font-bold text-primary"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <span>{pkg.name}</span>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group 4: Time Windows */}
            <div className="rounded-2xl border border-border/80 bg-muted/10 p-4 space-y-4">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block border-b border-border/60 pb-2">Active Timeline Window</span>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Starts At</span>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Ends At</span>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="block h-11 w-full rounded-xl border border-border bg-card px-3.5 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border bg-muted/20 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-border bg-card px-4 font-semibold text-foreground hover:bg-muted transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-campaign-form"
            disabled={submitting}
            className="h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground shadow-sm hover:opacity-90 active:opacity-95 transition-opacity disabled:opacity-50 text-xs"
          >
            {submitting ? "Saving..." : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { STATUS_TONE as campaignStatusTone, statusLabel as campaignStatusLabel };
