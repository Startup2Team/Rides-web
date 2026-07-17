import {
  getNotificationCampaigns,
  createNotificationCampaign,
  deleteNotificationCampaign,
  type BackendNotificationCampaign,
} from "./api";
import { type AppNotification } from "./mock-notifications";

export type { AppNotification, NotificationAudience, NotificationStatus } from "./mock-notifications";

function mapBackendToFrontend(bc: BackendNotificationCampaign): AppNotification {
  let audience: "both" | "customers" | "drivers" = "both";
  if (bc.audience === "CUSTOMERS") audience = "customers";
  if (bc.audience === "DRIVERS") audience = "drivers";

  return {
    id: bc.id,
    title: bc.title,
    message: bc.body,
    imageUrl: null,
    actionLink: "",
    audience,
    status: bc.status.toLowerCase() as "sent" | "scheduled" | "draft",
    scheduledAt: bc.sent_at || null,
    sentAt: bc.sent_at ? new Date(bc.sent_at).getTime() : null,
    createdBy: bc.created_by || "Admin",
    createdAt: new Date(bc.created_at).getTime(),
  };
}

export async function listNotifications(): Promise<AppNotification[]> {
  try {
    const res = await getNotificationCampaigns();
    return (res?.notifications || []).map(mapBackendToFrontend);
  } catch (err) {
    console.error("Failed to list notifications:", err);
    return [];
  }
}

export async function saveNotification(
  notification: Omit<AppNotification, "id" | "createdAt" | "createdBy">
): Promise<AppNotification> {
  let audience = "ALL";
  if (notification.audience === "customers") audience = "CUSTOMERS";
  if (notification.audience === "drivers") audience = "DRIVERS";

  const res = await createNotificationCampaign({
    title: notification.title,
    body: notification.message,
    audience,
  });
  return mapBackendToFrontend(res);
}

export async function removeNotification(id: string): Promise<void> {
  await deleteNotificationCampaign(id);
}
