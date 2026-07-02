"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDriversOverview } from "@/lib/api";
import {
  isVehicleSlug,
  vehicleTypeFromSlug,
  type DriversOverviewStats,
  type VehicleSlug,
} from "@/lib/drivers";
import type { VehicleSlug as DriverFormSlug } from "@/lib/driver-registration";
import { MOCK_API_DRIVERS } from "@/lib/mock-drivers";
import { useDevMocks } from "@/lib/backend-config";
import { getLocalApiDrivers } from "@/lib/local-drivers";
import { AdminPageHeader, StatCard } from "../_components";
import { AddDriverButton } from "./add-driver-button";

type Card = { label: string; value: string; hint: string };

type CategoryView = {
  title: string;
  subtitle: string;
  eyebrow: string;
  addLabel: string;
  defaultVehicle?: VehicleSlug;
  cards: (stats: DriversOverviewStats) => [Card, Card, Card, Card];
};

const all: CategoryView = {
  eyebrow: "Operations",
  title: "Driver management",
  subtitle: "Review, verify, and manage every driver on the platform.",
  addLabel: "Add driver",
  cards: (s) => [
    { label: "Total Drivers", value: String(s.total), hint: "across all categories" },
    { label: "Online Now", value: String(s.online), hint: s.total ? `of ${s.total} registered` : "—" },
    { label: "On Trip", value: String(s.onTrip), hint: "currently moving" },
    {
      label: "Pending Verification",
      value: String(s.pending),
      hint: "awaiting review",
    },
  ],
};

const byCategory: Record<VehicleSlug, CategoryView> = {
  moto: {
    eyebrow: "Operations · Moto",
    title: "Moto Bike drivers",
    subtitle:
      "Manage Moto Bike riders providing fast, last-mile mobility across Kigali.",
    addLabel: "Add motocyclist",
    defaultVehicle: "moto",
    cards: (s) => [
      { label: "Total Moto Drivers", value: String(s.total), hint: "registered Moto riders" },
      { label: "Riding Now", value: String(s.online), hint: "online and available" },
      { label: "On Delivery", value: String(s.onTrip), hint: "trips in progress" },
      { label: "KYC Pending", value: String(s.pending), hint: "awaiting review" },
    ],
  },
  cab: {
    eyebrow: "Operations · Cab",
    title: "Cab Taxi drivers",
    subtitle:
      "Manage Cab Taxi drivers handling comfortable urban and intercity rides.",
    addLabel: "Add cab driver",
    defaultVehicle: "cab",
    cards: (s) => [
      { label: "Total Cab Drivers", value: String(s.total), hint: "registered cab drivers" },
      { label: "On Duty", value: String(s.online), hint: "ready for trips" },
      { label: "Passengers Onboard", value: String(s.onTrip), hint: "active trips" },
      { label: "KYC Pending", value: String(s.pending), hint: "awaiting review" },
    ],
  },
  hilux: {
    eyebrow: "Operations · Hilux",
    title: "Light Hilux drivers",
    subtitle:
      "Manage Light Hilux drivers handling small cargo and group transport.",
    addLabel: "Add Hilux driver",
    defaultVehicle: "hilux",
    cards: (s) => [
      { label: "Total Hilux Drivers", value: String(s.total), hint: "registered Hilux drivers" },
      { label: "Available", value: String(s.online), hint: "online and idle" },
      { label: "On Cargo Run", value: String(s.onTrip), hint: "deliveries in progress" },
      { label: "KYC Pending", value: String(s.pending), hint: "awaiting review" },
    ],
  },
  rifani: {
    eyebrow: "Operations · Rifani",
    title: "Rifani drivers",
    subtitle: "Manage Rifani three-wheel drivers providing affordable short-distance transport.",
    addLabel: "Add Rifani driver",
    defaultVehicle: "rifani",
    cards: (s) => [
      { label: "Total Rifani Drivers", value: String(s.total), hint: "registered Rifani drivers" },
      { label: "On Duty", value: String(s.online), hint: "online and available" },
      { label: "On Trip", value: String(s.onTrip), hint: "trips in progress" },
      { label: "KYC Pending", value: String(s.pending), hint: "awaiting review" },
    ],
  },
  fuso: {
    eyebrow: "Operations · Fuso",
    title: "Heavy Fuso drivers",
    subtitle: "Manage Heavy Fuso drivers moving heavy goods across Rwanda.",
    addLabel: "Add Fuso driver",
    defaultVehicle: "fuso",
    cards: (s) => [
      { label: "Total Fuso Drivers", value: String(s.total), hint: "registered Fuso drivers" },
      { label: "Available", value: String(s.online), hint: "ready to haul" },
      { label: "Hauling", value: String(s.onTrip), hint: "loads in transit" },
      { label: "KYC Pending", value: String(s.pending), hint: "awaiting review" },
    ],
  },
};

const emptyStats: DriversOverviewStats = {
  total: 0,
  online: 0,
  onTrip: 0,
  pending: 0,
  suspended: 0,
};

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-4">
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="mt-3 h-8 w-16 rounded bg-muted" />
      <div className="mt-2 h-3 w-32 rounded bg-muted" />
    </div>
  );
}

export function DriversOverview() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("vehicle");
  const slug = isVehicleSlug(slugParam) ? slugParam : null;
  const view = (slug && byCategory[slug]) || all;

  const [stats, setStats] = useState<DriversOverviewStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const vehicleType = slug ? vehicleTypeFromSlug(slug) : undefined;
        const params: Record<string, string> = {};
        if (vehicleType) params.vehicle_type = vehicleType;

        const res = await getDriversOverview(params);
        if (cancelled) return;
        const extras = useDevMocks
          ? [
              ...MOCK_API_DRIVERS,
              ...getLocalApiDrivers(),
            ].filter((d) => !vehicleType || d.transport_type === vehicleType)
          : [];
        const isPending = (d: { approval_status?: string }) =>
          ["PENDING_REVIEW", "PENDING"].includes(d.approval_status?.toUpperCase() ?? "");
        setStats({
          total: (res.total ?? 0) + extras.length,
          online: res.online ?? 0,
          onTrip: res.on_trip ?? 0,
          pending: (res.pending ?? 0) + extras.filter(isPending).length,
          suspended: res.suspended ?? 0,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load driver stats");
        setStats(emptyStats);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const handle = () => {
      let cancelled = false;
      void (async () => {
        try {
          const vehicleType = slug ? vehicleTypeFromSlug(slug) : undefined;
          const params: Record<string, string> = {};
          if (vehicleType) params.vehicle_type = vehicleType;
          const res = await getDriversOverview(params);
          if (cancelled) return;
          const extras = useDevMocks
            ? [...MOCK_API_DRIVERS, ...getLocalApiDrivers()].filter(
                (d) => !vehicleType || d.transport_type === vehicleType,
              )
            : [];
          const isPending = (d: { approval_status?: string }) =>
            ["PENDING_REVIEW", "PENDING"].includes(d.approval_status?.toUpperCase() ?? "");
          setStats({
            total: (res.total ?? 0) + extras.length,
            online: res.online ?? 0,
            onTrip: res.on_trip ?? 0,
            pending: (res.pending ?? 0) + extras.filter(isPending).length,
            suspended: res.suspended ?? 0,
          });
        } catch {
          /* ignore — keep previous stats */
        }
      })();
      return () => { cancelled = true; };
    };
    window.addEventListener("localDriversUpdated", handle);
    return () => window.removeEventListener("localDriversUpdated", handle);
  }, [slug]);

  const cards = view.cards(stats);

  return (
    <>
      <AdminPageHeader
        eyebrow={view.eyebrow}
        title={view.title}
        subtitle={view.subtitle}
        action={
          <AddDriverButton
            key={slug ?? "all"}
            label={view.addLabel}
            defaultVehicle={
              slug
                ? (slug as DriverFormSlug)
                : undefined
            }
          />
        }
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((c) => (
              <StatCard
                key={c.label}
                label={c.label}
                value={c.value}
                hint={c.hint}
                tone={c.label.toLowerCase().includes("pending") && stats.pending > 0 ? "alert" : "default"}
              />
            ))}
      </div>
    </>
  );
}
