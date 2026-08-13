import { AdminPageHeader } from "../_components";
import { TeamConsole } from "./team-console";

export const metadata = {
  title: "Admin · Admins & Roles",
  robots: { index: false, follow: false },
};

export default function AdminTeamPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="System"
        title="Admins & roles"
        subtitle="Invite admins, assign roles, and control which sidebar pages each role can access."
      />
      <TeamConsole />
    </div>
  );
}
