import { AdminPageHeader, Card, StatCard } from "../_components";

export const metadata = {
  title: "Admin · Heatmaps",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Active Hot Zones", value: "3", hint: "above 80% demand" },
  { label: "Peak Hour", value: "18:30", hint: "Tue avg" },
  { label: "Demand Index", value: "78/100", hint: "city-wide" },
  { label: "Underserved Areas", value: "2", hint: "driver shortage" },
];

const zones = [
  { name: "Kimironko Market", drivers: 12, demand: "92%", fare: "3,400 RWF", tone: "danger" },
  { name: "Convention Centre", drivers: 8, demand: "85%", fare: "4,800 RWF", tone: "warn" },
  { name: "Nyabugogo Station", drivers: 14, demand: "78%", fare: "2,900 RWF", tone: "warn" },
  { name: "Kigali Heights", drivers: 22, demand: "61%", fare: "4,200 RWF", tone: "success" },
  { name: "Remera", drivers: 9, demand: "54%", fare: "3,100 RWF", tone: "success" },
] as const;

const toneColor: Record<string, string> = {
  danger: "bg-red-500",
  warn: "bg-amber-500",
  success: "bg-primary",
};

export default function AdminHeatmapsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Demand heatmaps"
        subtitle="Visualize where demand is hot and where supply runs short."
        action={
          <div className="flex items-center gap-1.5">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
              Now
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              Last hour
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              Today
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card title="City demand map">
        <div className="relative aspect-[16/8] overflow-hidden">
          <img
            src="/maps/map.png"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <svg
            viewBox="0 0 400 200"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <radialGradient id="hot-red" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#ef4444" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hot-amber" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="hot-green" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00C853" stopOpacity="0.5" />
                <stop offset="60%" stopColor="#00C853" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#00C853" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="70" r="60" fill="url(#hot-red)" />
            <circle cx="320" cy="65" r="50" fill="url(#hot-amber)" />
            <circle cx="200" cy="140" r="55" fill="url(#hot-amber)" />
            <circle cx="350" cy="150" r="40" fill="url(#hot-green)" />
            <circle cx="60" cy="160" r="40" fill="url(#hot-green)" />
          </svg>
        </div>
        <div className="flex items-center justify-end gap-4 border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Healthy supply
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Rising demand
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Critical
          </span>
        </div>
      </Card>

      <Card title="Top demand zones">
        <ul className="divide-y divide-border">
          {zones.map((z) => (
            <li key={z.name} className="flex items-center gap-4 px-4 py-3">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${toneColor[z.tone]}`} />
              <span className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-foreground">
                {z.name}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {z.drivers} drivers
              </span>
              <span className="w-20 text-right text-xs text-muted-foreground">
                avg {z.fare}
              </span>
              <span className="w-12 text-right text-sm font-bold text-foreground">
                {z.demand}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
