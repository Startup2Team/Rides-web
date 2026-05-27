import { DriversOverview } from "./drivers-overview";
import { DriversTable } from "./drivers-table";

export const metadata = {
  title: "Admin · Drivers",
  robots: { index: false, follow: false },
};

export default function AdminDriversPage() {
  return (
    <div className="space-y-6">
      <DriversOverview />
      <DriversTable />
    </div>
  );
}
