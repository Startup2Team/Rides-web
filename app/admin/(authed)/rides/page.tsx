import { AdminPageHeader } from "../_components";
import { RidesConsole } from "./rides-console";

export const metadata = {
  title: "Admin · Rides",
  robots: { index: false, follow: false },
};

export default function AdminRidesPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Rides"
        subtitle="Every completed trip on the platform — who rode, who drove, the route, how long it took, and the fare that was agreed."
      />
      <RidesConsole />
    </div>
  );
}
