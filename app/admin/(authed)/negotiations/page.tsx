import { AdminPageHeader, StatCard } from "../_components";
import { NegotiationsConsole } from "./negotiations-console";

export const metadata = {
  title: "Admin · Negotiations",
  robots: { index: false, follow: false },
};

const stats = [
  { label: "Total Today", value: "312", hint: "+22% vs yesterday" },
  { label: "Agreed", value: "247", hint: "79% success rate" },
  { label: "Failed", value: "65", hint: "21% walked away" },
  { label: "Avg Rounds", value: "3.4", hint: "per negotiation" },
];

export default function AdminNegotiationsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Fare negotiations"
        subtitle="Audit every offer, counter-offer, and outcome across the platform."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <NegotiationsConsole />
    </div>
  );
}
