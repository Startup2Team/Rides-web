import type { ReportFormat } from "./new-report-modal";

export type ReportCategory =
  | "Operations"
  | "Drivers"
  | "Finance"
  | "Customers"
  | "Negotiations";

export type ReportFilterField = {
  id: string;
  label: string;
  options: { id: string; label: string }[];
  defaultValue?: string;
};

export type ExportTemplate = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  formats: ReportFormat[];
  /** Per-report optional filters shown in the generation workflow */
  filters?: ReportFilterField[];
};

export const VEHICLE_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "All vehicles" },
  { id: "MOTO_BIKE", label: "Moto Bike" },
  { id: "CAB_TAXI", label: "Cab Taxi" },
  { id: "LIGHT_HILUX", label: "Light Hilux" },
  { id: "HEAVY_FUSO", label: "Heavy Fuso" },
];

export const DRIVER_STATUS_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "All statuses" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending verification" },
  { id: "rejected", label: "Rejected" },
];

export const CUSTOMER_STATUS_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "All customers" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
];

export const NEGOTIATION_STATUS_FILTER_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "All outcomes" },
  { id: "agreed", label: "Agreed" },
  { id: "failed", label: "Failed" },
  { id: "active", label: "In progress" },
];

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "ops-daily",
    name: "Ride activity report",
    description: "Daily rides completed and cancelled for the selected period.",
    category: "Operations",
    formats: ["PDF"],
    filters: [
      {
        id: "vehicle",
        label: "Vehicle type",
        options: VEHICLE_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
  {
    id: "support-resolution",
    name: "Support case resolution report",
    description: "Audit log of solved and closed support cases, including resolving agent and reason.",
    category: "Operations",
    formats: ["PDF"],
    filters: [
      {
        id: "status",
        label: "Case status",
        options: [
          { id: "all", label: "All resolved/closed" },
          { id: "Resolved", label: "Solved" },
          { id: "Closed", label: "Closed" },
        ],
        defaultValue: "all",
      },
    ],
  },
  {
    id: "ride-completion",
    name: "Trip completion report",
    description: "Request-to-complete funnel for the selected period.",
    category: "Operations",
    formats: ["PDF"],
    filters: [
      {
        id: "vehicle",
        label: "Vehicle type",
        options: VEHICLE_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
  {
    id: "driver-performance",
    name: "Driver performance report",
    description: "Trips, acceptance rate, and earnings per driver.",
    category: "Drivers",
    formats: ["PDF"],
    filters: [
      {
        id: "vehicle",
        label: "Vehicle type",
        options: VEHICLE_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
  {
    id: "driver-registrations",
    name: "Driver registration report",
    description: "New driver sign-ups, approval status, and verification backlog.",
    category: "Drivers",
    formats: ["PDF"],
    filters: [
      {
        id: "status",
        label: "Driver status",
        options: DRIVER_STATUS_FILTER_OPTIONS,
        defaultValue: "all",
      },
      {
        id: "vehicle",
        label: "Vehicle type",
        options: VEHICLE_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
  {
    id: "revenue-breakdown",
    name: "Revenue report",
    description: "Gross revenue and ride volume by vehicle category.",
    category: "Finance",
    formats: ["PDF"],
    filters: [
      {
        id: "vehicle",
        label: "Vehicle type",
        options: VEHICLE_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
  {
    id: "customer-overview",
    name: "Customer registration report",
    description: "Registered, active, and suspended customers with recent sign-ups.",
    category: "Customers",
    formats: ["PDF"],
    filters: [
      {
        id: "status",
        label: "Customer status",
        options: CUSTOMER_STATUS_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
  {
    id: "negotiation-stats",
    name: "Negotiation report",
    description: "Round outcomes, outcomes, and fare uplift for the selected period.",
    category: "Negotiations",
    formats: ["PDF"],
    filters: [
      {
        id: "vehicle",
        label: "Vehicle type",
        options: VEHICLE_FILTER_OPTIONS,
        defaultValue: "all",
      },
      {
        id: "status",
        label: "Outcome",
        options: NEGOTIATION_STATUS_FILTER_OPTIONS,
        defaultValue: "all",
      },
    ],
  },
];

export const REPORT_CATEGORIES: { id: "all" | ReportCategory; label: string }[] = [
  { id: "all", label: "All reports" },
  { id: "Operations", label: "Operations" },
  { id: "Drivers", label: "Drivers" },
  { id: "Finance", label: "Finance" },
  { id: "Customers", label: "Customers" },
  { id: "Negotiations", label: "Negotiations" },
];

export const TRANSPORT_DISPLAY: Record<string, string> = {
  MOTO_BIKE: "Moto Bike",
  CAB_TAXI: "Cab Taxi",
  LIGHT_HILUX: "Light Hilux",
  HEAVY_FUSO: "Heavy Fuso",
};

export function buildScopeLabel(parts: { range: string; vehicle?: string }): string {
  const segs = [parts.range];
  if (parts.vehicle && parts.vehicle !== "All vehicles") segs.push(parts.vehicle);
  return segs.join(" · ");
}

export function defaultReportFilters(template: ExportTemplate): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of template.filters ?? []) {
    out[f.id] = f.defaultValue ?? f.options[0]?.id ?? "all";
  }
  return out;
}

export function filterLabel(field: ReportFilterField, value: string): string {
  return field.options.find((o) => o.id === value)?.label ?? value;
}
