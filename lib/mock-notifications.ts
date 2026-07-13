export type NotificationAudience = "customers" | "drivers" | "both";
export type NotificationStatus = "draft" | "scheduled" | "sent";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  actionLink: string;
  audience: NotificationAudience;
  status: NotificationStatus;
  scheduledAt: string | null;
  sentAt: number | null;
  createdBy: string;
  createdAt: number;
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "NOT-001",
    title: "Weekend fare boost is live",
    message: "Earn 20% more on every trip this weekend across all vehicle types.",
    imageUrl: null,
    actionLink: "",
    audience: "drivers",
    status: "sent",
    scheduledAt: null,
    sentAt: Date.now() - 3 * 86400000,
    createdBy: "Admin",
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: "NOT-002",
    title: "New catalogue partners in the app",
    message: "Check out drinks and snacks from our newest partners while you ride.",
    imageUrl: null,
    actionLink: "",
    audience: "customers",
    status: "draft",
    scheduledAt: null,
    sentAt: null,
    createdBy: "Admin",
    createdAt: Date.now() - 1 * 86400000,
  },
];
