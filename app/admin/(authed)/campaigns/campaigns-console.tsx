"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, StatCard, StatusPill } from "../_components";
import {
  getAdminCampaigns,
  createCampaign,
  getAdminPackages,
  type AdminCampaign,
  type CampaignType,
  type CampaignStatus as BackendCampaignStatus
} from "@/lib/api";
import {
  VEHICLE_LABELS,
  formatDate,
  formatRWF,
  type Campaign,
  type CampaignStatus,
  type VehicleType
} from "@/lib/packages-mock";
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

function mapBackendToFrontendCampaign(c: AdminCampaign): Campaign {
  let audience: any = "all";
  if (c.type === "FIRST_PURCHASE") {
    audience = "first-purchase";
  } else if (c.type === "VEHICLE_TYPE" || c.type === "PACKAGE") {
    audience = "vehicle-type";
  }

  let vehicleTypes: VehicleType[] | null = null;
  if (c.target_vehicle_type_code) {
    const code = c.target_vehicle_type_code.toUpperCase();
    if (code === "MOTO_BIKE") vehicleTypes = ["moto"];
    else if (code === "CAB_TAXI") vehicleTypes = ["cab"];
    else if (code === "LIGHT_HILUX") vehicleTypes = ["hilux"];
    else if (code === "HEAVY_FUSO") vehicleTypes = ["fuso"];
  }

  let packageIds: string[] | null = null;
  if (c.target_package_name) {
    packageIds = [c.target_package_name];
  } else if (c.target_package_id) {
    packageIds = [c.target_package_id];
  }

  return {
    id: c.id,
    slug: c.code,
    name: c.name,
    description: c.description || "",
    status: c.status.toLowerCase() as CampaignStatus,
    audience,
    vehicleTypes,
    packageIds,
    priceOverride: c.override_price_rwf,
    ridesOverride: c.override_rides,
    bonusRidesOverride: c.override_bonus_rides,
    startsAt: c.starts_at || "",
    endsAt: c.ends_at || "",
    createdAt: c.created_at,
    createdBy: c.created_by || "system",
  };
}

export function CampaignsConsole() {
  const [backendCampaigns, setBackendCampaigns] = useState<AdminCampaign[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Dialogs
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState<CampaignType>("GLOBAL");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [formVehicleTypeId, setFormVehicleTypeId] = useState("");
  const [formPackageId, setFormPackageId] = useState("");
  const [formPriceOverride, setFormPriceOverride] = useState("");
  const [formRidesOverride, setFormRidesOverride] = useState("");
  const [formBonusRidesOverride, setFormBonusRidesOverride] = useState("");
  const [formPriority, setFormPriority] = useState("0");
  const [formMaxRedemptions, setFormMaxRedemptions] = useState("");
  const [formPerDriverLimit, setFormPerDriverLimit] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load data
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [cRes, pRes] = await Promise.all([
        getAdminCampaigns(),
        getAdminPackages(),
      ]);
      setBackendCampaigns(cRes || []);
      setPackages(pRes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const campaigns = useMemo(() => {
    return backendCampaigns.map(mapBackendToFrontendCampaign);
  }, [backendCampaigns]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  const openCampaign = openId
    ? campaigns.find((c) => c.id === openId) ?? null
    : null;

  // Extract unique vehicle types from packages
  const vehicleTypesList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string }>();
    packages.forEach((pkg) => {
      if (pkg.vehicle_type_id && pkg.vehicle_type_code) {
        let name = pkg.vehicle_type_code;
        if (pkg.vehicle_type_code === "MOTO_BIKE") name = "Moto";
        else if (pkg.vehicle_type_code === "CAB_TAXI") name = "Cab";
        else if (pkg.vehicle_type_code === "HEAVY_FUSO") name = "Heavy Fuso";
        else if (pkg.vehicle_type_code === "LIGHT_HILUX") name = "Light Hilux";
        else if (pkg.vehicle_type_code === "TUK_TUK") name = "Tuk Tuk";

        map.set(pkg.vehicle_type_id, {
          id: pkg.vehicle_type_id,
          code: pkg.vehicle_type_code,
          name,
        });
      }
    });
    return Array.from(map.values());
  }, [packages]);

  // Packages filtered by selected vehicle type for form dropdown
  const filteredPackages = useMemo(() => {
    if (!formVehicleTypeId) return [];
    return packages.filter((pkg) => pkg.vehicle_type_id === formVehicleTypeId);
  }, [packages, formVehicleTypeId]);

  // Reset form
  function resetForm() {
    setFormName("");
    setFormCode("");
    setFormDesc("");
    setFormType("GLOBAL");
    setFormStartsAt("");
    setFormEndsAt("");
    setFormVehicleTypeId("");
    setFormPackageId("");
    setFormPriceOverride("");
    setFormRidesOverride("");
    setFormBonusRidesOverride("");
    setFormPriority("0");
    setFormMaxRedemptions("");
    setFormPerDriverLimit("");
    setFormError(null);
  }

  // Handle Form Submit
  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        code: formCode.toUpperCase().replace(/\s+/g, "_"),
        name: formName,
        description: formDesc,
        type: formType,
        priority: parseInt(formPriority) || 0,
      };

      if (formStartsAt) payload.starts_at = new Date(formStartsAt).toISOString();
      if (formEndsAt) payload.ends_at = new Date(formEndsAt).toISOString();

      if (formType === "VEHICLE_TYPE" || formType === "PACKAGE") {
        if (!formVehicleTypeId) throw new Error("Please select a target vehicle type");
        payload.target_vehicle_type_id = formVehicleTypeId;
      }

      if (formType === "PACKAGE") {
        if (!formPackageId) throw new Error("Please select a target package");
        payload.target_package_id = formPackageId;
      }

      if (formPriceOverride) payload.override_price_rwf = parseInt(formPriceOverride);
      if (formRidesOverride) payload.override_rides = parseInt(formRidesOverride);
      if (formBonusRidesOverride) payload.override_bonus_rides = parseInt(formBonusRidesOverride);

      if (formMaxRedemptions) payload.max_redemptions = parseInt(formMaxRedemptions);
      if (formPerDriverLimit) payload.per_driver_limit = parseInt(formPerDriverLimit);

      await createCampaign(payload);
      await loadData();
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setFormSubmitting(false);
    }
  }

  /* Stats */
  const activeCount = campaigns.filter((c) => c.status === "active").length;
  const scheduledCount = campaigns.filter((c) => c.status === "scheduled").length;
  const expiringSoonCount = campaigns.filter(
    (c) =>
      c.status === "active" &&
      c.endsAt &&
      new Date(c.endsAt).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7,
  ).length;

  if (loading && backendCampaigns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading campaigns...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl bg-destructive/15 p-4 text-xs font-semibold text-destructive">
          {error}
        </div>
      ) : null}

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
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
                      {c.startsAt ? formatDate(c.startsAt) : "Immediate"} → {c.endsAt ? formatDate(c.endsAt) : "Never"}
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

      {/* Create Dialog Modal */}
      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setCreateOpen(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <header className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Create campaign</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Configure overrides and target audiences for dynamic package calculations.</p>
            </header>

            <form onSubmit={handleCreateCampaign} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError ? (
                <div className="rounded-xl bg-destructive/15 p-4 text-xs font-semibold text-destructive">
                  {formError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. World Cup Boost"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Code / Slug</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. WORLD_CUP_BOOST"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Extra bonus rides during match windows."
                  className="w-full h-16 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      setFormType(e.target.value as CampaignType);
                      setFormVehicleTypeId("");
                      setFormPackageId("");
                    }}
                    className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="GLOBAL">Global (All drivers)</option>
                    <option value="FIRST_PURCHASE">First Purchase Only</option>
                    <option value="VEHICLE_TYPE">Vehicle-Type Targeted</option>
                    <option value="PACKAGE">Package Specific</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Priority</label>
                  <input
                    type="number"
                    required
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {(formType === "VEHICLE_TYPE" || formType === "PACKAGE") ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target Vehicle Type</label>
                    <select
                      required
                      value={formVehicleTypeId}
                      onChange={(e) => {
                        setFormVehicleTypeId(e.target.value);
                        setFormPackageId("");
                      }}
                      className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select vehicle type</option>
                      {vehicleTypesList.map((v) => (
                        <option key={v.id} value={v.id}>{v.name} ({v.code})</option>
                      ))}
                    </select>
                  </div>
                  {formType === "PACKAGE" ? (
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target Package</label>
                      <select
                        required
                        value={formPackageId}
                        onChange={(e) => setFormPackageId(e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select package</option>
                        {filteredPackages.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : <div />}
                </div>
              ) : null}

              <div className="border-t border-border pt-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Override Values (Optional)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Price override (RWF)</label>
                    <input
                      type="number"
                      value={formPriceOverride}
                      onChange={(e) => setFormPriceOverride(e.target.value)}
                      placeholder="Price in RWF"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Extra Base Rides</label>
                    <input
                      type="number"
                      value={formRidesOverride}
                      onChange={(e) => setFormRidesOverride(e.target.value)}
                      placeholder="+ rides"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Extra Bonus Rides</label>
                    <input
                      type="number"
                      value={formBonusRidesOverride}
                      onChange={(e) => setFormBonusRidesOverride(e.target.value)}
                      placeholder="+ bonus rides"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Starts At (Local Time)</label>
                  <input
                    type="datetime-local"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Ends At (Local Time)</label>
                  <input
                    type="datetime-local"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Max Redemptions (System-wide)</label>
                  <input
                    type="number"
                    value={formMaxRedemptions}
                    onChange={(e) => setFormMaxRedemptions(e.target.value)}
                    placeholder="Unlimited if empty"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Per Driver Redemption Limit</label>
                  <input
                    type="number"
                    value={formPerDriverLimit}
                    onChange={(e) => setFormPerDriverLimit(e.target.value)}
                    placeholder="Unlimited if empty"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => { setCreateOpen(false); resetForm(); }}
                  className="px-4 h-10 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-muted/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 h-10 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {openCampaign ? (
        <CampaignDetailDrawer
          campaign={openCampaign}
          onClose={() => setOpenId(null)}
          onUpdate={loadData}
        />
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
