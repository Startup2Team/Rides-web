import {
  AdminPageHeader,
  Avatar,
  Card,
  StatCard,
  StatusPill,
} from "../_components";

export const metadata = {
  title: "Admin · Drivers",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Drivers", value: "142", hint: "across all categories" },
  { label: "Online Now", value: "89", hint: "of 142 active" },
  { label: "On Trip", value: "34", hint: "currently moving" },
  { label: "Pending Verification", value: "7", hint: "awaiting review" },
];

const drivers = [
  {
    name: "Aiden Mugisha",
    vehicle: "Cab Taxi",
    plate: "RAB 123 D",
    status: "Online",
    tone: "success",
    acceptance: "94%",
    rating: "4.9",
  },
  {
    name: "Beni Karenzi",
    vehicle: "Moto Bike",
    plate: "RAA 887 K",
    status: "On trip",
    tone: "info",
    acceptance: "88%",
    rating: "4.7",
  },
  {
    name: "Claude Rwema",
    vehicle: "Light Hilux",
    plate: "RAC 552 R",
    status: "Online",
    tone: "success",
    acceptance: "91%",
    rating: "4.8",
  },
  {
    name: "Diane Uwase",
    vehicle: "Cab Taxi",
    plate: "RAB 410 U",
    status: "Offline",
    tone: "neutral",
    acceptance: "82%",
    rating: "4.6",
  },
  {
    name: "Eric Nshuti",
    vehicle: "Heavy Fuso",
    plate: "RAD 094 N",
    status: "On trip",
    tone: "info",
    acceptance: "76%",
    rating: "4.5",
  },
  {
    name: "Florence I.",
    vehicle: "Moto Bike",
    plate: "RAA 211 I",
    status: "Pending",
    tone: "warn",
    acceptance: "—",
    rating: "—",
  },
  {
    name: "Gerard B.",
    vehicle: "Cab Taxi",
    plate: "RAB 763 B",
    status: "Suspended",
    tone: "danger",
    acceptance: "61%",
    rating: "3.9",
  },
] as const;

export default function AdminDriversPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Driver management"
        subtitle="Review, verify, and manage every driver on the platform."
        action={
          <button className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30">
            + Add driver
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card
        title="All drivers"
        action={
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search drivers…"
              className="h-8 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none focus:border-primary"
            />
            <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              Filter
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-semibold">Driver</th>
                <th className="px-4 py-2.5 text-left font-semibold">Vehicle</th>
                <th className="px-4 py-2.5 text-left font-semibold">Plate</th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">
                  Acceptance
                </th>
                <th className="px-4 py-2.5 text-right font-semibold">Rating</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {drivers.map((d) => (
                <tr key={d.plate} className="hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} />
                      <span className="font-semibold tracking-tight text-foreground">
                        {d.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.vehicle}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">
                    {d.plate}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={d.status} tone={d.tone} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {d.acceptance}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {d.rating === "—" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span>
                        {d.rating}{" "}
                        <span className="text-amber-500">★</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-primary hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
