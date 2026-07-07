import { AdminPageHeader } from "../_components";
import { ProfileConsole } from "./profile-console";

export const metadata = {
  title: "Admin · Profile",
  robots: { index: false, follow: false },
};

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Profile"
        subtitle="Manage platform settings and review administrative audit activity from one place."
      />

      <ProfileConsole />
    </div>
  );
}
