import { AdminPageHeader } from "../_components";
import { WaitlistTable } from "./waitlist-table";

export const metadata = {
  title: "Admin · Waitlist",
  robots: { index: false, follow: false },
};

export default function AdminWaitlistPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Growth"
        title="Waitlist"
        subtitle="Everyone who signed up ahead of launch — customers and drivers, with contact details and referral source."
      />
      <WaitlistTable />
    </div>
  );
}
