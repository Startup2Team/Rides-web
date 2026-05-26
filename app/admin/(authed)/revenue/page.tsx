import { AdminPageHeader, Card, StatCard } from "../_components";

export const metadata = {
  title: "Admin · Revenue",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Today", value: "4.2M RWF", hint: "+18% vs yesterday" },
  { label: "This Week", value: "24.8M RWF", hint: "+12% vs last week" },
  { label: "This Month", value: "94.6M RWF", hint: "+9% vs last month" },
  { label: "Commission", value: "11.8M RWF", hint: "month-to-date" },
];

const sources = [
  { label: "Cab Taxi", value: "62%", amount: "58.6M RWF", color: "bg-primary" },
  { label: "Moto Bike", value: "21%", amount: "19.9M RWF", color: "bg-amber-400" },
  { label: "Light Hilux", value: "11%", amount: "10.4M RWF", color: "bg-foreground/70" },
  { label: "Heavy Fuso", value: "6%", amount: "5.7M RWF", color: "bg-muted-foreground/40" },
];

const topZones = [
  { name: "Kigali Heights", revenue: "8.4M RWF", trend: "+22%" },
  { name: "Convention Centre", revenue: "6.7M RWF", trend: "+18%" },
  { name: "Kimironko Market", revenue: "5.9M RWF", trend: "+15%" },
  { name: "Nyabugogo", revenue: "4.2M RWF", trend: "+8%" },
];

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Revenue & financials"
        subtitle="Track platform earnings, commission, and payout flow."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <Card title="Revenue trend · last 30 days">
        <div className="p-4">
          <svg
            viewBox="0 0 600 180"
            preserveAspectRatio="none"
            aria-hidden
            className="h-48 w-full"
          >
            <path
              d="M0 140 Q 30 130 60 125 T 120 115 T 180 100 T 240 95 T 300 80 T 360 75 T 420 60 T 480 50 T 540 35 L 600 25 L 600 180 L 0 180 Z"
              fill="rgba(0,200,83,0.12)"
            />
            <path
              d="M0 140 Q 30 130 60 125 T 120 115 T 180 100 T 240 95 T 300 80 T 360 75 T 420 60 T 480 50 T 540 35 L 600 25"
              stroke="#00C853"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>30d ago</span>
            <span>21d</span>
            <span>14d</span>
            <span>7d</span>
            <span>Today</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue by vehicle type">
          <ul className="space-y-3 p-4">
            {sources.map((s) => (
              <li key={s.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="font-medium text-foreground">{s.label}</span>
                  </span>
                  <span className="text-muted-foreground">{s.amount}</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: s.value }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Top zones by revenue">
          <ul className="divide-y divide-border">
            {topZones.map((z) => (
              <li key={z.name} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {z.name}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-foreground">{z.revenue}</span>
                  <span className="font-bold text-primary">{z.trend}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
