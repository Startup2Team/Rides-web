import { AdminPageHeader } from "../_components";
import { AccountConsole } from "../account/account-console";

export const metadata = {
  title: "Admin · Profile",
  robots: { index: false, follow: false },
};

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Account"
        title="My Profile"
        subtitle="Manage your personal info, password, two-factor authentication and active sessions."
      />
      <AccountConsole />
    </div>
  );
}
