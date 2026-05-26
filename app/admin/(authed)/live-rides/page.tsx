import {
  AdminPageHeader,
  Card,
  StatCard,
  StatusPill,
} from "../_components";

export const metadata = {
  title: "Admin · Live Rides",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Active Rides", value: "247", hint: "in progress now" },
  { label: "Searching Driver", value: "18", hint: "matching" },
  { label: "Negotiating", value: "12", hint: "in chat" },
  { label: "En Route", value: "67", hint: "to pickup" },
];

const rides = [
  {
    id: "#RID-4821",
    pickup: "Kimironko Market",
    destination: "Kigali Heights",
    driver: "Aiden M.",
    status: "On trip",
    tone: "success",
    eta: "8 min",
  },
  {
    id: "#RID-4820",
    pickup: "Kacyiru",
    destination: "Nyabugogo Station",
    driver: "Beni K.",
    status: "Negotiating",
    tone: "warn",
    eta: "—",
  },
  {
    id: "#RID-4819",
    pickup: "Remera",
    destination: "Kabuga",
    driver: "Claude R.",
    status: "Driver arriving",
    tone: "info",
    eta: "3 min",
  },
  {
    id: "#RID-4818",
    pickup: "Nyamirambo",
    destination: "Convention Centre",
    driver: "—",
    status: "Searching",
    tone: "neutral",
    eta: "—",
  },
  {
    id: "#RID-4817",
    pickup: "Gisozi",
    destination: "Kacyiru",
    driver: "Diane U.",
    status: "On trip",
    tone: "success",
    eta: "12 min",
  },
] as const;

export default function AdminLiveRidesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Live rides"
        subtitle="Real-time view of every in-progress trip across the network."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card title="Live map">
        <div className="relative aspect-[16/8] overflow-hidden">
          <img
            src="/maps/map.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute z-10" style={{ top: "30%", left: "20%" }}>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
            </span>
          </div>
          <div className="absolute z-10" style={{ top: "55%", left: "62%" }}>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
            </span>
          </div>
          <div className="absolute z-10" style={{ top: "70%", left: "35%" }}>
            <span className="block h-3 w-3 rounded-full bg-amber-500 ring-2 ring-card shadow-sm" />
          </div>
          <div className="absolute z-10" style={{ top: "25%", left: "70%" }}>
            <span className="block h-3 w-3 rounded-full bg-foreground ring-[3px] ring-card shadow-sm" />
          </div>
        </div>
      </Card>

      <Card
        title="Active rides"
        action={
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Updating live
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left font-semibold">Ride</th>
                <th className="px-4 py-2.5 text-left font-semibold">Pickup</th>
                <th className="px-4 py-2.5 text-left font-semibold">
                  Destination
                </th>
                <th className="px-4 py-2.5 text-left font-semibold">Driver</th>
                <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">ETA</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rides.map((r) => (
                <tr key={r.id} className="hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 text-foreground">{r.pickup}</td>
                  <td className="px-4 py-3 text-foreground">{r.destination}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.driver}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={r.status} tone={r.tone} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">
                    {r.eta}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-medium text-primary hover:underline">
                      Open
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
