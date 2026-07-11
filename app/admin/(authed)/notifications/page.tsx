import { NotificationsConsole } from "./notifications-console";

export const metadata = {
  title: "Admin · Notifications",
  robots: { index: false, follow: false },
};

export default function AdminNotificationsPage() {
  return <NotificationsConsole />;
}
