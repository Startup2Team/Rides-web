import { AdminPageHeader } from "../_components";
import { AccountConsole } from "./account-console";

export const metadata = {
  title: "Admin · Account",
  robots: { index: false, follow: false },
};

export default function AdminAccountPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Your account"
        title="Account settings"
        subtitle="Manage your profile, password, two-factor authentication, and active sessions."
      />

      <AccountConsole />
    </div>
  );
}
