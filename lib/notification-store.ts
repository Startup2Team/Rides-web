import {
  getNotificationCampaigns,
  createNotificationCampaign,
  deleteNotificationCampaign,
  type BackendNotificationCampaign,
} from "./api";

export type NotificationAudience =
  | "both"
  | "customers"
  | "drivers"
  | "driver_moto"
  | "driver_cab"
  | "driver_hilux"
  | "driver_fuso"
  | "driver_rifani"
  | "single_driver";

export type NotificationStatus = "sent" | "scheduled" | "draft";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  imageUrl?: string | null;
  actionLink?: string;
  audience: NotificationAudience;
  targetDriverId?: string;
  status: NotificationStatus;
  scheduledAt?: string | number | null;
  sentAt?: number | null;
  createdBy: string;
  createdAt: number;
};

function mapBackendToFrontend(bc: BackendNotificationCampaign): AppNotification {
  let audience: NotificationAudience = "both";
  const audMap: Record<string, NotificationAudience> = {
    ALL: "both",
    CUSTOMERS: "customers",
    DRIVERS: "drivers",
    DRIVER_MOTO: "driver_moto",
    DRIVER_CAB: "driver_cab",
    DRIVER_HILUX: "driver_hilux",
    DRIVER_FUSO: "driver_fuso",
    DRIVER_RIFANI: "driver_rifani",
    SINGLE_DRIVER: "single_driver",
  };
  if (audMap[bc.audience]) audience = audMap[bc.audience];

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
  const audMap: Record<NotificationAudience, string> = {
    both: "ALL",
    customers: "CUSTOMERS",
    drivers: "DRIVERS",
    driver_moto: "DRIVER_MOTO",
    driver_cab: "DRIVER_CAB",
    driver_hilux: "DRIVER_HILUX",
    driver_fuso: "DRIVER_FUSO",
    driver_rifani: "DRIVER_RIFANI",
    single_driver: "SINGLE_DRIVER",
  };

  const res = await createNotificationCampaign({
    title: notification.title,
    body: notification.message,
    audience: audMap[notification.audience] || "ALL",
    target_driver_id: notification.targetDriverId,
  });
  return mapBackendToFrontend(res);
}

export async function removeNotification(id: string): Promise<void> {
  await deleteNotificationCampaign(id);
}
