import { AdminPageHeader, StatCard } from "../_components";
import { LiveRidesConsole } from "./live-rides-console";

export const metadata = {
  title: "Admin · Live Rides",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Active Rides", value: "247", hint: "in progress now" },
  { label: "Searching", value: "18", hint: "matching drivers" },
  { label: "Negotiating", value: "12", hint: "fare in chat" },
  { label: "On Trip", value: "164", hint: "passengers onboard" },
];

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

      <LiveRidesConsole />
    </div>
  );
}
