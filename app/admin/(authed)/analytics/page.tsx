import { AdminPageHeader, Card, StatCard } from "../_components";

export const metadata = {
  title: "Admin · Analytics",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Trips", value: "38,247", hint: "all time" },
  { label: "Conversion Rate", value: "82%", hint: "request → completion" },
  { label: "Avg Trip Duration", value: "14m 22s", hint: "across all rides" },
  { label: "Repeat Riders", value: "67%", hint: "took 2+ trips" },
];

const funnel = [
  { label: "Ride requested", value: "12,481", percent: 100 },
  { label: "Driver matched", value: "11,824", percent: 94 },
  { label: "Negotiation agreed", value: "10,237", percent: 82 },
  { label: "Ride completed", value: "10,213", percent: 82 },
];

const days = ["M", "T", "W", "T", "F", "S", "S"];
const rideBars = [180, 245, 268, 252, 298, 320, 285];
const maxBar = 360;

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Platform analytics"
        subtitle="Operational health and behavior trends across riders, drivers, and trips."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Rides per day · last 7 days">
          <div className="p-4">
            <div className="flex h-40 items-end justify-between gap-3">
              {rideBars.map((v, i) => (
                <div key={i} className="flex w-full flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-md ${
                      i === 5 ? "bg-primary" : "bg-primary/30"
                    }`}
                    style={{ height: `${(v / maxBar) * 100}%` }}
                  />
                  <span
                    className={`text-[10px] ${
                      i === 5
                        ? "font-bold text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {days[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Conversion funnel">
          <ul className="space-y-3 p-4">
            {funnel.map((f) => (
              <li key={f.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{f.label}</span>
                  <span className="text-muted-foreground">
                    {f.value}{" "}
                    <span className="font-bold text-foreground">
                      ({f.percent}%)
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${f.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Active hours">
          <ul className="space-y-2 p-4 text-xs">
            {[
              { hour: "06:00 – 09:00", val: "Peak morning" },
              { hour: "12:00 – 14:00", val: "Lunch surge" },
              { hour: "17:00 – 19:00", val: "Peak evening" },
              { hour: "22:00 – 00:00", val: "Late night low" },
            ].map((h) => (
              <li
                key={h.hour}
                className="flex items-center justify-between rounded-lg bg-surface px-3 py-2"
              >
                <span className="font-mono text-foreground">{h.hour}</span>
                <span className="text-muted-foreground">{h.val}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Vehicle mix">
          <ul className="space-y-2 p-4 text-xs">
            {[
              { name: "Cab Taxi", value: "62%" },
              { name: "Moto Bike", value: "21%" },
              { name: "Light Hilux", value: "11%" },
              { name: "Heavy Fuso", value: "6%" },
            ].map((v) => (
              <li key={v.name} className="flex items-center justify-between">
                <span className="text-foreground">{v.name}</span>
                <span className="font-bold text-foreground">{v.value}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Customer satisfaction">
          <div className="p-4">
            <p className="text-3xl font-bold tracking-tight text-foreground">
              4.8 <span className="text-amber-500">★</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              based on 8,412 ratings
            </p>
            <div className="mt-4 space-y-1.5 text-[11px]">
              {[
                { stars: 5, percent: 78 },
                { stars: 4, percent: 16 },
                { stars: 3, percent: 4 },
                { stars: 2, percent: 1 },
                { stars: 1, percent: 1 },
              ].map((r) => (
                <div key={r.stars} className="flex items-center gap-2">
                  <span className="w-3 text-muted-foreground">{r.stars}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">
                    {r.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
