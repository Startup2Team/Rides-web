"use client";

import { useSearchParams } from "next/navigation";
import { AdminPageHeader, StatCard } from "../_components";
import { AddDriverButton } from "./add-driver-button";

type VehicleSlug = "moto" | "cab" | "hilux" | "fuso";

type Card = { label: string; value: string; hint: string };

type CategoryView = {
  title: string;
  subtitle: string;
  eyebrow: string;
  addLabel: string;
  defaultVehicle?: VehicleSlug;
  cards: [Card, Card, Card, Card];
};

const all: CategoryView = {
  eyebrow: "Operations",
  title: "Driver management",
  subtitle: "Review, verify, and manage every driver on the platform.",
  addLabel: "Add driver",
  cards: [
    { label: "Total Drivers", value: "142", hint: "across all categories" },
    { label: "Online Now", value: "89", hint: "of 142 active" },
    { label: "On Trip", value: "34", hint: "currently moving" },
    { label: "Pending Verification", value: "7", hint: "awaiting review" },
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
    cards: [
      { label: "Total Moto Drivers", value: "58", hint: "registered Moto riders" },
      { label: "Riding Now", value: "41", hint: "online and available" },
      { label: "On Delivery", value: "12", hint: "trips in progress" },
      { label: "KYC Pending", value: "3", hint: "awaiting review" },
    ],
  },
  cab: {
    eyebrow: "Operations · Cab",
    title: "Cab Taxi drivers",
    subtitle:
      "Manage Cab Taxi drivers handling comfortable urban and intercity rides.",
    addLabel: "Add cab driver",
    defaultVehicle: "cab",
    cards: [
      { label: "Total Cab Drivers", value: "47", hint: "registered cab drivers" },
      { label: "On Duty", value: "28", hint: "ready for trips" },
      { label: "Passengers Onboard", value: "14", hint: "active trips" },
      { label: "KYC Pending", value: "2", hint: "awaiting review" },
    ],
  },
  hilux: {
    eyebrow: "Operations · Hilux",
    title: "Light Hilux drivers",
    subtitle:
      "Manage Light Hilux drivers handling small cargo and group transport.",
    addLabel: "Add Hilux driver",
    defaultVehicle: "hilux",
    cards: [
      { label: "Total Hilux Drivers", value: "22", hint: "registered Hilux drivers" },
      { label: "Available", value: "12", hint: "online and idle" },
      { label: "On Cargo Run", value: "5", hint: "deliveries in progress" },
      { label: "KYC Pending", value: "1", hint: "awaiting review" },
    ],
  },
  fuso: {
    eyebrow: "Operations · Fuso",
    title: "Heavy Fuso drivers",
    subtitle: "Manage Heavy Fuso drivers moving heavy goods across Rwanda.",
    addLabel: "Add Fuso driver",
    defaultVehicle: "fuso",
    cards: [
      { label: "Total Fuso Drivers", value: "15", hint: "registered Fuso drivers" },
      { label: "Available", value: "8", hint: "ready to haul" },
      { label: "Hauling", value: "3", hint: "loads in transit" },
      { label: "KYC Pending", value: "1", hint: "awaiting review" },
    ],
  },
};

export function DriversOverview() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("vehicle") as VehicleSlug | null;
  const view = (slug && byCategory[slug]) || all;

  return (
    <>
      <AdminPageHeader
        eyebrow={view.eyebrow}
        title={view.title}
        subtitle={view.subtitle}
        action={
          <AddDriverButton
            key={view.defaultVehicle ?? "all"}
            label={view.addLabel}
            defaultVehicle={view.defaultVehicle}
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {view.cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </>
  );
}
