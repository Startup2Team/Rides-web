import type { LiveDemandHeatZone } from "./api";

/** Min riders at one pickup before we alert ops. */
export const HOT_ZONE_RIDER_THRESHOLD = 3;
/** Escalate tone when a single pickup cluster is this busy. */
export const CRITICAL_ZONE_RIDER_THRESHOLD = 5;
/** City-wide waiting count that triggers a general alert. */
export const CITY_WIDE_RIDER_THRESHOLD = 10;

/** Don't repeat the same zone alert within this window. */
export const ZONE_ALERT_COOLDOWN_MS = 5 * 60 * 1000;
/** Don't repeat city-wide alerts within this window. */
export const CITY_ALERT_COOLDOWN_MS = 10 * 60 * 1000;

export type DemandAlertTone = "warn" | "danger";

export type DemandAlertCandidate = {
  id: string;
  tone: DemandAlertTone;
  title: string;
  detail: string;
  href: string;
  /** Dedup key for cooldown — zone id or "city-wide". */
  cooldownKey: string;
};

function zoneLabel(zone: LiveDemandHeatZone): string {
  const label = zone.pickupLabel.replace(/,?\s*Kigali.*$/i, "").trim();
  return label || zone.pickupLabel || "Pickup zone";
}

function zoneId(zone: LiveDemandHeatZone): string {
  return `live-${zone.lat.toFixed(3)}-${zone.lng.toFixed(3)}`;
}

/** Build alert candidates from the latest live demand snapshot. */
export function evaluateDemandAlerts(zones: LiveDemandHeatZone[]): DemandAlertCandidate[] {
  if (zones.length === 0) return [];

  const alerts: DemandAlertCandidate[] = [];
  const totalWaiting = zones.reduce((sum, z) => sum + z.waitingRiders, 0);

  const sorted = [...zones].sort((a, b) => b.waitingRiders - a.waitingRiders);

  for (const zone of sorted) {
    if (zone.waitingRiders < HOT_ZONE_RIDER_THRESHOLD) continue;

    const label = zoneLabel(zone);
    const critical = zone.waitingRiders >= CRITICAL_ZONE_RIDER_THRESHOLD;

    alerts.push({
      id: `demand-zone-${zoneId(zone)}-${zone.waitingRiders}`,
      tone: critical ? "danger" : "warn",
      title: critical ? "Critical demand spike" : "Hot pickup zone",
      detail: `${label} · ${zone.waitingRiders} rider${zone.waitingRiders === 1 ? "" : "s"} waiting`,
      href: "/admin/heatmaps",
      cooldownKey: zoneId(zone),
    });
  }

  if (totalWaiting >= CITY_WIDE_RIDER_THRESHOLD) {
    const top = sorted[0];
    alerts.push({
      id: `demand-city-${totalWaiting}`,
      tone: totalWaiting >= CITY_WIDE_RIDER_THRESHOLD + 5 ? "danger" : "warn",
      title: "High city-wide demand",
      detail: top
        ? `${totalWaiting} riders waiting · busiest: ${zoneLabel(top)}`
        : `${totalWaiting} riders waiting across Kigali`,
      href: "/admin/heatmaps",
      cooldownKey: "city-wide",
    });
  }

  return alerts;
}

export function filterAlertsByCooldown(
  candidates: DemandAlertCandidate[],
  lastFiredAt: ReadonlyMap<string, number>,
  now = Date.now(),
): DemandAlertCandidate[] {
  return candidates.filter((c) => {
    const last = lastFiredAt.get(c.cooldownKey) ?? 0;
    const cooldown =
      c.cooldownKey === "city-wide" ? CITY_ALERT_COOLDOWN_MS : ZONE_ALERT_COOLDOWN_MS;
    return now - last >= cooldown;
  });
}

export const DEMAND_ALERTS_ENABLED_KEY = "taravelis:admin:notify-demand";

export function isDemandAlertsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(DEMAND_ALERTS_ENABLED_KEY);
  return stored !== "false";
}

export function setDemandAlertsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMAND_ALERTS_ENABLED_KEY, enabled ? "true" : "false");
}
