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

export const MOCK_NOTIFICATIONS: AppNotification[] = [];
