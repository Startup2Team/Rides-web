import { clearToken, getToken } from "./auth";
import { MOCK_LIVE_RIDES, MOCK_LIVE_RIDE_DETAILS, MOCK_LIVE_RIDES_STATS } from "./mock-live-rides";
import {
  MOCK_NEGOTIATIONS,
  MOCK_NEGOTIATION_DETAILS,
  MOCK_NEGOTIATIONS_STATS,
} from "./mock-negotiations";
import type {
  Campaign as AdminCampaignView,
  CampaignAudience,
  CampaignStatus,
  Entitlement,
  EntitlementTransactionKind,
  PurchaseSnapshot,
  PurchaseStatus,
  VehicleType as MonetizationVehicleType,
} from "./packages-mock";

const NO_BACKEND = !process.env.NEXT_PUBLIC_API_BASE_URL;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string; // override token (e.g. during 2FA setup before final token is saved)
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token: tokenOverride, ...rest } = options;
  const token = tokenOverride ?? getToken();

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  };
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      // Clear the HttpOnly admin_access_token cookie via the server logout route
      // so middleware.ts does not redirect back to /admin and loop.
      await fetch("/api/admin/auth/logout?local=true", { method: "POST" }).catch(() => {});
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status})`);
  }

  if (!res.ok) {
    // Backend error shape: { error: { code, message } }
    const msg = json?.error?.message ?? json?.message ?? "Request failed";
    throw new Error(msg);
  }

  // Backend wraps all success responses in { "data": ... } — unwrap it
  return (json?.data !== undefined ? json.data : json) as T;
}

// ── Public (no auth) ──────────────────────────────────────────────────────

export type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  category?: string;
  body: string;
};

export type ContactReceipt = { id: string; status: string; created_at: string };

export async function submitContact(input: ContactSubmission): Promise<ContactReceipt> {
  const res = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message ?? "Could not send message. Please try again.";
    throw new Error(msg);
  }
  return (json?.data ?? json) as ContactReceipt;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export type LoginResult =
  | { access_token: string; two_factor_required: false }
  | { pre_auth_token: string; two_factor_required: true };

export const adminLogin = (email: string, password: string) =>
  request<LoginResult>("/admin/auth/login", { method: "POST", body: { email, password } });

export const adminVerify2FA = (preAuthToken: string, code: string) =>
  request<{ access_token: string }>("/admin/auth/2fa/verify", {
    method: "POST",
    body: { pre_auth_token: preAuthToken, code },
  });

export const adminVerifyBackup = (preAuthToken: string, backupCode: string) =>
  request<{ access_token: string }>("/admin/auth/2fa/backup", {
    method: "POST",
    body: { pre_auth_token: preAuthToken, backup_code: backupCode },
  });

export const adminLogout = () =>
  request<{ message: string }>("/admin/auth/logout", { method: "POST" });

// ── 2FA setup (needs valid access_token) ─────────────────────────────────

export const get2FASetup = (token: string) =>
  request<{ secret: string; otpauth_url: string }>("/admin/account/2fa/setup", { token });

export const enable2FA = (secret: string, code: string, token: string) =>
  request<{ two_factor_enabled: boolean; backup_codes: string[] }>("/admin/account/2fa/enable", {
    method: "POST",
    body: { secret, code },
    token,
  });

export const disable2FA = (password: string) =>
  request<{ two_factor_enabled: boolean }>("/admin/account/2fa/disable", {
    method: "POST",
    body: { password },
  });

export const resetTOTP = (currentCode: string) =>
  request<{ secret: string; qr_code_url: string; backup_codes: string[] }>("/admin/auth/totp/reset", {
    method: "POST",
    body: { code: currentCode },
  });

// ── Account ───────────────────────────────────────────────────────────────

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  photo_url?: string | null;
  photoUrl?: string | null;
  role_id: string;
  role_name: string;
  status: string;
  two_factor: boolean;
  last_active_at: string | null;
  invited_at: string;
  created_at: string;
};

export const getAccount = (token?: string) => request<AdminAccount>("/admin/account", token ? { token } : {});

export const updateAccount = (
  data: { name: string; phone?: string | null; photo_url?: string | null } | FormData
) =>
  request<void>("/admin/account", {
    method: "PUT",
    body: data instanceof FormData ? data : {
      name: data.name,
      phone: data.phone,
      photo_url: data.photo_url,
      photoUrl: data.photo_url,
    },
  });

export const changePassword = (currentPassword: string, newPassword: string) =>
  request<void>("/admin/account/password", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });

export const getSessions = () =>
  request<{ sessions: Array<{ id: string; current: boolean }> }>("/admin/account/sessions");

export const revokeSession = (sessionId: string) =>
  request<void>(`/admin/account/sessions/${sessionId}`, { method: "DELETE" });

// ── Dashboard ─────────────────────────────────────────────────────────────

export type DashboardSnapshot = {
  liveRides: number;
  onlineDrivers: number;
  openTickets: number;
  revenueInPeriod: number;
  ridesInPeriod: number;
  pendingVerifications: number;
  openIncidents: number;
};

export type AnalyticsOverview = {
  active_drivers: number;
  active_rides: number;
  total_revenue_today: number;
  total_rides_today: number;
};

export type DashboardWindow =
  | { days?: number; from?: undefined; to?: undefined }
  | { from: string; to: string; days?: undefined };

export const getDashboard = (window?: DashboardWindow) => {
  let path = "/admin/dashboard";
  if (window?.from && window.to) {
    const qs = new URLSearchParams({ from: window.from, to: window.to }).toString();
    path = `/admin/dashboard?${qs}`;
  } else if (window?.days && window.days > 0) {
    path = `/admin/dashboard?days=${window.days}`;
  }
  return request<DashboardSnapshot>(path);
};

export type RevenuePoint = { t: string; v: number };
export type RevenueSeriesSide = {
  label: string;
  points: RevenuePoint[];
  total: number;
  peak?: RevenuePoint | null;
};
export type RevenueSeries = {
  bucket: "hour" | "day";
  current: RevenueSeriesSide;
  previous: RevenueSeriesSide;
  deltaPct: number;
};

function dashboardQS(window: DashboardWindow | undefined): string {
  if (window?.from && window.to) {
    return `?${new URLSearchParams({ from: window.from, to: window.to }).toString()}`;
  }
  if (window?.days && window.days > 0) {
    return `?days=${window.days}`;
  }
  return "";
}

export const getRevenueSeries = (window?: DashboardWindow) =>
  request<RevenueSeries>(`/admin/dashboard/revenue-series${dashboardQS(window)}`);

export type RidesPoint = { t: string; completed: number; cancelled: number };
export type RidesSeriesSide = {
  label: string;
  points: RidesPoint[];
  totalCompleted: number;
  totalCancelled: number;
};
export type RidesSeries = {
  bucket: "hour" | "day";
  current: RidesSeriesSide;
  previous: RidesSeriesSide;
  deltaPct: number;
};

export const getRidesSeries = (window?: DashboardWindow) =>
  request<RidesSeries>(`/admin/dashboard/rides-series${dashboardQS(window)}`);

export type DriverStatusSnapshot = {
  online: number;
  onTrip: number;
  offline: number;
};

export const getDriverStatus = () =>
  request<DriverStatusSnapshot>("/admin/dashboard/driver-status");

export type TopDriver = {
  id: string;
  name: string;
  rides: number;
  isOnline: boolean;
  earnings: number;
};

export const getTopDrivers = (window?: DashboardWindow, limit = 4) =>
  request<TopDriver[]>(
    `/admin/dashboard/top-drivers${dashboardQS(window)}${
      dashboardQS(window) ? "&" : "?"
    }limit=${limit}`
  );

export type RecentActivity = {
  id: number;
  type: string;
  actorRole?: string;
  actorName?: string;
  rideId?: string | null;
  payload?: unknown;
  occurredAt: string;
};

export type RecentActivityQuery = {
  limit?: number;
  beforeId?: number;
  type?: string;
};

export const getRecentActivity = (q: RecentActivityQuery | number = {}) => {
  const opts: RecentActivityQuery = typeof q === "number" ? { limit: q } : q;
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.beforeId) params.set("beforeId", String(opts.beforeId));
  if (opts.type) params.set("type", opts.type);
  const qs = params.toString();
  return request<RecentActivity[]>(
    `/admin/dashboard/recent-activity${qs ? `?${qs}` : ""}`
  );
};

export type DashboardAlert = {
  id: string;
  kind: "incident" | "ticket";
  tone: "danger" | "warn" | "info";
  title: string;
  detail: string;
  severity?: string;
  rideId?: string | null;
  occurredAt: string;
};

export type LiveMapDriver = {
  id: string;
  lat: number;
  lng: number;
  isOnline: boolean;
  onTrip: boolean;
};

export type LiveMapHeatPoint = { lat: number; lng: number; weight: number };

export type LiveMap = {
  updatedAt: string;
  activeRides: number;
  onlineDrivers: number;
  hotZones: number;
  drivers: LiveMapDriver[];
  heatPoints: LiveMapHeatPoint[];
};

export const getLiveMap = () => request<LiveMap>("/admin/dashboard/live-map");

export type AlertsQuery = {
  limit?: number;
  kind?: "incident" | "ticket";
};

export const getDashboardAlerts = (q: AlertsQuery | number = {}) => {
  const opts: AlertsQuery = typeof q === "number" ? { limit: q } : q;
  const params = new URLSearchParams();
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.kind) params.set("kind", opts.kind);
  const qs = params.toString();
  return request<DashboardAlert[]>(
    `/admin/dashboard/alerts${qs ? `?${qs}` : ""}`
  );
};
export const getAnalyticsOverviewData = () => request<AnalyticsOverview>("/admin/analytics/overview");

// ── Analytics ─────────────────────────────────────────────────────────────

export type AnalyticsOverviewFull = {
  active_drivers: number;
  active_rides: number;
  total_rides_today: number;
  total_revenue_today: number;
};

export type DailyRidePoint = {
  day: string;
  total: number;
  completed: number;
  cancelled: number;
};

export type FunnelData = {
  booked: number;
  matched: number;
  confirmed: number;
  completed: number;
  cancelled: number;
};

export type VehicleMixItem = {
  transport_type: string;
  rides: number;
  revenue: number;
};

export type DriverPerf = {
  driver_id: string;
  phone: string;
  full_name: string | null;
  transport_type: string;
  total_rides: number;
  acceptance_rate: number;
  priority_tier: number;
  earnings_30d: number;
};

export type SatisfactionData = {
  completion_rate_pct: number;
  total_rides_30d: number;
  completed_rides_30d: number;
};

export const getAnalyticsOverview = () => request<AnalyticsOverviewFull>("/admin/analytics/overview");
export const getRidesDaily = (days = 30) =>
  request<DailyRidePoint[]>(`/admin/analytics/rides/daily?days=${days}`);
export const getRidesWeekly = () => request<DailyRidePoint[]>("/admin/analytics/rides/weekly");
export const getRevenueBreakdown = () =>
  request<Record<string, unknown>>("/admin/analytics/revenue/breakdown");
export const getDriverPerformance = () =>
  request<DriverPerf[]>("/admin/analytics/drivers/performance");
export const getNegotiationStats = () =>
  request<Record<string, unknown>>("/admin/analytics/negotiation/stats");

export type HeatPoint = { lat: number; lng: number; count: number };
export type HeatZone = { lat: number; lng: number; demand: number; trips: number; avg_fare: number };
export type ActivityCell = { day: number; hour: number; count: number };

export const getHeatmap = () => request<HeatPoint[]>("/admin/analytics/heatmap");
export const getHeatmapZones = () => request<HeatZone[]>("/admin/analytics/heatmap/zones");
export const getActivityHeatmap = () => request<ActivityCell[]>("/admin/analytics/activity-heatmap");
export const getCancellations = () =>
  request<Record<string, unknown>>("/admin/analytics/cancellations");
export const getFunnel = (days = 30) =>
  request<FunnelData>(`/admin/analytics/funnel?days=${days}`);
export const getVehicleMix = (days = 30) =>
  request<VehicleMixItem[]>(`/admin/analytics/vehicle-mix?days=${days}`);
export const getSatisfaction = () =>
  request<SatisfactionData>("/admin/analytics/satisfaction");

// ── Drivers ───────────────────────────────────────────────────────────────

export type Driver = {
  id: string;
  user_id?: string;
  full_name?: string | null;
  phone?: string;
  transport_type: string;
  vehicle_plate?: string;
  approval_status: string;
  is_online?: boolean;
  on_trip?: boolean;
  acceptance_rate?: number;
  total_rides?: number;
  city?: string;
  created_at: string;
  referral_count?: number;
  referred_by_driver_id?: string | null;
};

export type DriversResponse = {
  drivers: Driver[];
  total: number;
  limit: number;
  offset: number;
};

export type DriversOverview = {
  total: number;
  active?: number;
  online: number;
  on_trip: number;
  pending: number;
  suspended: number;
  total_referrals?: number;
};

export const sendDriverOTP = (phone: string) =>
  request<{ dev_otp?: string } | void>("/admin/drivers/send-otp", { method: "POST", body: { phone } });

export const verifyDriverOTP = (phone: string, otp: string) =>
  request<{ status: string }>("/admin/drivers/verify-otp", { method: "POST", body: { phone, otp } });

export const getDrivers = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<DriversResponse>(`/admin/drivers${qs ? `?${qs}` : ""}`);
};

export const getDriversOverview = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<DriversOverview>(`/admin/drivers/overview${qs ? `?${qs}` : ""}`);
};

export type DriverDetail = {
  id: string;
  full_name?: string | null;
  phone?: string;
  transport_type: string;
  vehicle_plate?: string;
  national_id_number?: string | null;
  license_number?: string;
  date_of_birth?: string | null;
  city?: string;
  address?: {
    province?: string | null;
    district?: string | null;
    sector?: string | null;
    cell?: string | null;
    village?: string | null;
  };
  momo_provider?: string | null;
  momo_pay_code?: string;
  approval_status: string;
  created_at: string;
  is_online?: boolean;
  referral_count?: number;
  /** Present when this driver was referred by another driver on the platform. */
  referred_by_driver_id?: string | null;
  license_issued_date?: string | null;
  license_expiry_date?: string | null;
  insurance_issued_date?: string | null;
  insurance_expiry_date?: string | null;
  authorization_issued_date?: string | null;
  authorization_expiry_date?: string | null;
  documents?: Array<{
    document_type: string;
    file_url: string;
    uploaded_at: string;
  }>;
  /**
   * Append-only audit trail of every prior admin review decision for this
   * driver — populated by the backend when a re-submission occurs.
   * Newest first. Optional because legacy drivers may have no recorded history.
   */
  review_history?: Array<{
    id: string;
    decided_at: string;
    decided_by: string;
    decision: "approved" | "rejected" | "more_info_requested";
    reason?: string;
    document_decisions?: Array<{
      document_type: string;
      decision: "accepted" | "rejected" | "more_info";
      comment?: string;
    }>;
  }>;
};

export const getDriver = (id: string) => request<DriverDetail>(`/admin/drivers/${id}`);

export type ReferredDriver = {
  id: string;
  full_name: string | null;
  phone?: string;
  transport_type: string;
  vehicle_plate?: string;
  approval_status: string;
  created_at: string;
};

export async function getDriverReferrals(driverId: string): Promise<ReferredDriver[]> {
  if (NO_BACKEND) {
    const { getLocalReferredDrivers } = await import("./referrals");
    return getLocalReferredDrivers(driverId);
  }
  return request<ReferredDriver[]>(`/admin/drivers/${driverId}/referrals`);
}

export const createDriver = (body: Record<string, unknown>) =>
  request<{ id: string; user_id?: string; message: string }>("/admin/drivers", {
    method: "POST",
    body,
  });

export const uploadDriverDocument = (
  driverId: string,
  documentType: string,
  fileUrl: string,
) =>
  request<void>(`/admin/drivers/${driverId}/documents`, {
    method: "POST",
    body: { document_type: documentType, file_url: fileUrl },
  });

/** Upload a file (image/PDF) via admin multipart endpoint. */
export async function uploadFile(file: File): Promise<string> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/admin/uploads/file`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message ?? "File upload failed";
    throw new Error(msg);
  }
  const data = (json?.data ?? json) as { file_url?: string };
  if (!data.file_url) throw new Error("Upload succeeded but no file URL returned");
  return data.file_url;
}

/** Upload a driver document image/PDF via admin multipart endpoint. */
export async function uploadDriverFile(file: File): Promise<string> {
  return uploadFile(file);
}

export const forceDriverOffline = (id: string) =>
  request<{ message: string }>(`/admin/drivers/${id}/force-offline`, { method: "POST" });

export const approveDriver = (id: string) =>
  request<void>(`/admin/drivers/${id}/approve`, { method: "POST" });

export const rejectDriver = (id: string, reason: string) =>
  request<void>(`/admin/drivers/${id}/reject`, { method: "POST", body: { reason } });

/**
 * Ask the driver to re-upload specific documents without rejecting the whole
 * application. Backend sends an SMS/push to the driver pointing at the items
 * that need attention, and the driver app re-opens those documents for upload.
 */
export const requestDriverMoreInfo = (
  id: string,
  reason: string,
  documents?: Array<{ document_type: string; comment?: string }>,
) =>
  request<void>(`/admin/drivers/${id}/request-more-info`, {
    method: "POST",
    body: { reason, documents },
  });

export const suspendDriver = (id: string, durationHours: number) =>
  request<void>(`/admin/drivers/${id}/suspend`, {
    method: "POST",
    body: { duration_hours: durationHours },
  });

export const reinstateDriver = (id: string) =>
  request<void>(`/admin/drivers/${id}/reinstate`, { method: "POST" });

// ── Customers ─────────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  full_name: string | null;
  phone: string;
  email?: string | null;
  photo_url?: string | null;
  location?: string | null;
  role_state: string;
  is_suspended: boolean;
  suspension_until?: string | null;
  total_rides: number;
  total_spend?: number;
  created_at: string;
  last_seen_at?: string | null;
  notes?: string;
};

export type CustomerTrip = {
  id: string;
  status: string;
  transport_type: string;
  agreed_fare: number | null;
  pickup_address: string;
  destination_address: string;
  created_at: string;
  driver_id?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  vehicle_plate?: string | null;
};

export type CustomerDetail = Customer & {
  recent_trips: CustomerTrip[];
};

export type CustomersResponse = {
  customers: Customer[];
  total: number;
  limit: number;
  offset: number;
};

export type CustomerOverview = {
  total: number;
  active: number;
  suspended: number;
  active_this_week: number;
};

export const getCustomers = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<CustomersResponse>(`/admin/customers${qs ? `?${qs}` : ""}`);
};

export const getCustomersOverview = () =>
  request<CustomerOverview>("/admin/customers/overview");

export const getCustomer = (id: string) => request<CustomerDetail>(`/admin/customers/${id}`);

export const banCustomer = (id: string, reason: string) =>
  request<void>(`/admin/customers/${id}/ban`, { method: "PATCH", body: { reason } });

export const suspendCustomer = (id: string, durationHours: number) =>
  request<void>(`/admin/customers/${id}/suspend`, {
    method: "POST",
    body: { duration_hours: durationHours },
  });

export const reinstateCustomer = (id: string) =>
  request<void>(`/admin/customers/${id}/reinstate`, { method: "POST" });

// ── Rides ─────────────────────────────────────────────────────────────────

export type RideParticipant = {
  id: string | null;
  phone: string | null;
  name: string | null;
};

export type RideDriverParticipant = RideParticipant & { plate: string | null };

export type Ride = {
  id: string;
  status: string;
  transport_type: string;
  customer: RideParticipant;
  driver: RideDriverParticipant;
  pickup_address: string;
  /** Not yet returned by the admin API (only the mobile API has it) — optional until the backend catches up. */
  pickup_lat?: number;
  pickup_lng?: number;
  destination_address: string;
  /** Same gap as pickup_lat/pickup_lng above. */
  dest_lat?: number;
  dest_lng?: number;
  agreed_fare: number | null;
  initial_fare: number | null;
  distance_km: number | null;
  created_at: string;
  completed_at: string | null;
};

export type NegotiationRound = {
  round: number;
  proposed_by: string;
  amount: number;
  response: string | null;
  at: string;
};

export type RideEvent = {
  type: string;
  actor_role: string;
  at: string;
};

export type RideDetail = Ride & {
  negotiation_rounds: NegotiationRound[];
  events: RideEvent[];
};

export type RidesResponse = {
  rides: Ride[];
  total: number;
};

export type LiveRidesStats = {
  total: number;
  searching: number;
  negotiating: number;
  driver_en_route: number;
  on_trip: number;
};

export const getRides = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<RidesResponse>(`/admin/rides${qs ? `?${qs}` : ""}`);
};

export const getLiveRides = async (params: Record<string, string> = {}): Promise<RidesResponse> => {
  if (NO_BACKEND) {
    return {
      rides: MOCK_LIVE_RIDES,
      total: MOCK_LIVE_RIDES.length,
    };
  }
  const qs = new URLSearchParams(params).toString();
  return request<RidesResponse>(`/admin/rides/live${qs ? `?${qs}` : ""}`);
};

export const getLiveRidesStats = async (): Promise<LiveRidesStats> => {
  if (NO_BACKEND) {
    return MOCK_LIVE_RIDES_STATS;
  }
  return request<LiveRidesStats>("/admin/rides/live/stats");
};

export const getRide = (id: string) => request<RideDetail>(`/admin/rides/${id}`);

export const getLiveRide = async (id: string): Promise<RideDetail> => {
  if (NO_BACKEND) {
    const detail = MOCK_LIVE_RIDE_DETAILS[id];
    if (detail) return detail;
    throw new Error("Mock live ride not found");
  }
  return request<RideDetail>(`/admin/rides/live/${id}`);
};

export const interveneRide = async (id: string, action: string, reason: string): Promise<void> => {
  if (NO_BACKEND) {
    console.log(`[Mock API] Intervened ride ${id} with action=${action}, reason=${reason}`);
    return;
  }
  return request<void>(`/admin/rides/live/${id}/intervene`, {
    method: "POST",
    body: { action, reason },
  });
};

// ── Negotiations ──────────────────────────────────────────────────────────

export type Negotiation = {
  id: string;
  ride_id: string;
  status: string;
  transport_type: string;
  pickup_address: string;
  destination_address: string;
  customer: { phone: string; name: string | null };
  driver: { phone: string | null; name: string | null; vehicle_type: string | null; plate: string | null };
  initial_fare: number | null;
  agreed_fare: number | null;
  uplift: number;
  rounds: number;
  created_at: string;
};

export type NegotiationsResponse = {
  negotiations: Negotiation[];
  total: number;
};

export type NegotiationsStats = {
  total_today: number;
  agreed_today: number;
  failed_today: number;
  avg_rounds: number;
};

export const getNegotiations = async (params: Record<string, string> = {}): Promise<NegotiationsResponse> => {
  if (NO_BACKEND) {
    return { negotiations: MOCK_NEGOTIATIONS, total: MOCK_NEGOTIATIONS.length };
  }
  const qs = new URLSearchParams(params).toString();
  return request<NegotiationsResponse>(`/admin/negotiations${qs ? `?${qs}` : ""}`);
};

export const getNegotiationsStats = async (): Promise<NegotiationsStats> => {
  if (NO_BACKEND) {
    return MOCK_NEGOTIATIONS_STATS;
  }
  return request<NegotiationsStats>("/admin/negotiations/stats");
};

export const getNegotiation = async (id: string): Promise<RideDetail> => {
  if (NO_BACKEND) {
    const detail = MOCK_NEGOTIATION_DETAILS[id];
    if (detail) return detail;
    throw new Error("Mock negotiation not found");
  }
  return request<RideDetail>(`/admin/negotiations/${id}`);
};

// ── Revenue ───────────────────────────────────────────────────────────────

export type RevenueOverview = {
  total_revenue: number;
  platform_revenue: number;
  driver_earnings: number;
  total_transactions: number;
  period: string;
};

export type Transaction = {
  id: string;
  transport_type: string;
  fare: number | null;
  commission: number;
  payout: number;
  status: string;
  pickup_address: string;
  destination_address: string;
  customer: { phone: string; name: string | null };
  driver: { phone: string | null; name: string | null; plate: string | null; vehicle_type: string };
  completed_at: string | null;
};

export type TransactionsResponse = {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
};

export const getRevenue = (period = "today") =>
  request<RevenueOverview>(`/admin/revenue?period=${period}`);

export const getRevenueKPIs = (period = "today") =>
  request<Record<string, unknown>>(`/admin/revenue/kpis?period=${period}`);

export const getTransactions = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<TransactionsResponse>(`/admin/revenue/transactions${qs ? `?${qs}` : ""}`);
};

export const disbursePayouts = (transactionIds: string[]) =>
  request<void>("/admin/revenue/payouts/disburse", {
    method: "POST",
    body: { transactionIds },
  });

// ── Safety / Flags ────────────────────────────────────────────────────────

export const getGpsAnomalies = () =>
  request<Record<string, unknown>>("/admin/flags/gps-anomalies");

export const getDeviceCollisions = () =>
  request<Record<string, unknown>>("/admin/flags/device-collisions");

// ── Incidents ─────────────────────────────────────────────────────────────

export type IncidentEvent = {
  id: string;
  incident_id: string;
  event_text: string;
  kind: string;
  created_at: string;
};

export type Incident = {
  id: string;
  type: string;
  severity: string;
  status: string;
  description: string | null;
  ride_id: string | null;
  reporter_user_id: string | null;
  reporter_name: string | null;
  reporter_phone: string | null;
  reporter_role: string | null;
  location_text: string | null;
  district: string | null;
  notes: string | null;
  reported_at: string;
  updated_at: string;
  timeline?: IncidentEvent[];
};

export type IncidentsResponse = {
  incidents: Incident[];
  total: number;
};

export type IncidentsStats = {
  open: number;
  acknowledged: number;
  escalated: number;
  resolved_7d: number;
};

export const getIncidentsStats = () => request<IncidentsStats>("/admin/incidents/stats");

export const getIncidents = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<IncidentsResponse>(`/admin/incidents${qs ? `?${qs}` : ""}`);
};

export const getIncident = (id: string) => request<Incident>(`/admin/incidents/${id}`);

export const createIncident = (data: { type: string; severity: string; description: string; reporter_role?: string; location_text?: string; district?: string }) =>
  request<Incident>("/admin/incidents", { method: "POST", body: data });

export const acknowledgeIncident = (id: string) =>
  request<void>(`/admin/incidents/${id}/acknowledge`, { method: "POST" });

export const escalateIncident = (id: string) =>
  request<void>(`/admin/incidents/${id}/escalate`, { method: "POST" });

export const resolveIncident = (id: string) =>
  request<void>(`/admin/incidents/${id}/resolve`, { method: "POST" });

export const addIncidentMessage = (id: string, message: string) =>
  request<void>(`/admin/incidents/${id}/message`, { method: "POST", body: { message } });

// ── Support Tickets ───────────────────────────────────────────────────────

export type TicketMessage = {
  id: string;
  ticket_id: string;
  from_role: string;
  author: string;
  body: string;
  created_at: string;
};

export type Ticket = {
  id: string;
  subject: string;
  type: string;
  priority: string;
  status: string;
  from_user_id: string | null;
  from_name: string | null;
  from_phone: string | null;
  from_role: string | null;
  ride_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
};

export type TicketsResponse = {
  tickets: Ticket[];
  total: number;
};

export type TicketsStats = {
  open: number;
  pending: number;
  resolved_today: number;
};

export const getTicketsStats = () => request<TicketsStats>("/admin/support/tickets/stats");

export const getTickets = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<TicketsResponse>(`/admin/support/tickets${qs ? `?${qs}` : ""}`);
};

export const getTicket = (id: string) => request<Ticket>(`/admin/support/tickets/${id}`);

export const replyToTicket = (id: string, message: string) =>
  request<void>(`/admin/support/tickets/${id}/reply`, { method: "POST", body: { body: message, from_role: "ADMIN", author: "Admin" } });

export const assignTicket = (id: string, adminId: string) =>
  request<void>(`/admin/support/tickets/${id}/assign`, { method: "POST", body: { admin_id: adminId } });

export const resolveTicket = (id: string) =>
  request<void>(`/admin/support/tickets/${id}/resolve`, { method: "POST" });

// ── Inbox ─────────────────────────────────────────────────────────────────

export type InboxMessage = {
  id: string;
  from_name: string;
  from_email: string;
  category: string;
  status: string;
  subject: string;
  body: string;
  reply_body: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InboxResponse = {
  messages: InboxMessage[];
  total: number;
};

export type InboxStats = {
  new: number;
  replied_7d: number;
  spam: number;
};

export const getInboxStats = () => request<InboxStats>("/admin/inbox/stats");

export const getInbox = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<InboxResponse>(`/admin/inbox${qs ? `?${qs}` : ""}`);
};

export const getMessage = (id: string) => request<InboxMessage>(`/admin/inbox/${id}`);

export const replyToMessage = (id: string, message: string) =>
  request<void>(`/admin/inbox/${id}/reply`, { method: "POST", body: { reply_body: message } });

export const archiveMessage = (id: string) =>
  request<void>(`/admin/inbox/${id}/archive`, { method: "POST" });

export const markSpam = (id: string) =>
  request<void>(`/admin/inbox/${id}/spam`, { method: "POST" });

export const deleteMessage = (id: string) =>
  request<void>(`/admin/inbox/${id}`, { method: "DELETE" });

// ── Reports ───────────────────────────────────────────────────────────────

export type BackendReport = {
  id: string;
  template: string;
  status: string;
  format: string;
  date_range: string;
  file_size: string | null;
  file_path: string | null;
  generated_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type BackendScheduled = {
  id: string;
  template: string;
  format: string;
  frequency: string;
  recipients: string[];
  is_active: boolean;
  next_run: string | null;
  created_at: string;
};

export type ReportsStats = {
  total_this_month: number;
  ready_this_week: number;
  scheduled: number;
  pending: number;
};

export const getReportsStats = () => request<ReportsStats>("/admin/reports/stats");

export const getReports = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<{ reports: BackendReport[]; total: number }>(`/admin/reports${qs ? `?${qs}` : ""}`);
};

export const getScheduledReports = () =>
  request<{ scheduled: BackendScheduled[] }>("/admin/reports/scheduled");

export const generateReport = (data: { template: string; format: string; date_range: string; created_by?: string }) =>
  request<BackendReport>("/admin/reports", { method: "POST", body: data });

export const createScheduledReport = (data: { template: string; format: string; frequency: string; recipients: string[] }) =>
  request<BackendScheduled>("/admin/reports/scheduled", { method: "POST", body: data });

export const toggleScheduledReport = (id: string) =>
  request<void>(`/admin/reports/scheduled/${id}/toggle`, { method: "POST" });

export const deleteReport = (id: string) =>
  request<void>(`/admin/reports/${id}`, { method: "DELETE" });

// ── Settings ──────────────────────────────────────────────────────────────

export type AdminSettings = {
  commission?: Record<string, unknown>;
  negotiation?: Record<string, unknown>;
  fares?: Record<string, unknown>;
  integrations?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
  regions?: unknown[];
};

export const getSettings = () => request<AdminSettings>("/admin/settings");

export const updateCommissionSettings = (data: Record<string, unknown>) =>
  request<void>("/admin/settings/commission", { method: "PUT", body: data });

export const updateNegotiationSettings = (data: Record<string, unknown>) =>
  request<void>("/admin/settings/negotiation", { method: "PUT", body: data });

export const updateFareSettings = (data: Record<string, unknown>) =>
  request<void>("/admin/settings/fares", { method: "PUT", body: data });

// ── Pricing ───────────────────────────────────────────────────────────────

export const getPricing = () => request<Record<string, unknown>>("/admin/pricing");

// ── Team ──────────────────────────────────────────────────────────────────

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role_name: string;
  status: string;
  two_factor: boolean;
  last_active_at: string | null;
  invited_at: string;
  created_at: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  permissions?: string[] | unknown;
};

export const getTeam = () =>
  request<{ admins: TeamMember[] }>("/admin/team");

export const getRoles = () =>
  request<{ roles: Role[] }>("/admin/team/roles");

export const inviteAdmin = (name: string, email: string, roleId: string, password?: string) =>
  request<TeamMember>("/admin/team/invite", {
    method: "POST",
    body: { name, email, role_id: roleId, ...(password ? { password } : {}) },
  });

/** Sets initial password for an invited admin (required before they can sign in). */
export const setMemberPassword = (memberId: string, password: string) =>
  request<void>(`/admin/team/members/${memberId}/set-password`, {
    method: "POST",
    body: { password },
  });

export const updateMemberRole = (id: string, roleId: string) =>
  request<void>(`/admin/team/members/${id}/role`, { method: "POST", body: { role_id: roleId } });

export const suspendMember = (id: string) =>
  request<void>(`/admin/team/members/${id}/suspend`, { method: "POST" });

export const reinstateMember = (id: string) =>
  request<void>(`/admin/team/members/${id}/reinstate`, { method: "POST" });

export const removeMember = (id: string) =>
  request<void>(`/admin/team/members/${id}/remove`, { method: "POST" });

export const resendInvite = (id: string) =>
  request<void>(`/admin/team/members/${id}/resend-invite`, { method: "POST" });

export const resetMember2FA = (id: string) =>
  request<void>(`/admin/team/members/${id}/reset-2fa`, { method: "POST" });

export type AdminActivity = {
  id: string;
  action: string;
  detail: string;
  ip: string | null;
  created_at: string;
};

export const getMemberActivity = (id: string) =>
  request<{ activity: AdminActivity[] }>(`/admin/team/members/${id}/activity`);

export const updateRolePermissions = (roleId: string, permissions: string[]) =>
  request<void>(`/admin/team/roles/${roleId}/permissions`, {
    method: "POST",
    body: { permissions },
  });

// ── Packages ──────────────────────────────────────────────────────────────

export type Package = {
  id: string;
  name: string;
  vehicle_type_id: string;
  vehicle_type_code: string;
  ride_count: number;
  bonus_rides: number;
  validity_days: number;
  price_rwf: number;
  is_promotional: boolean;
  is_active: boolean;
  created_at: string;
};

export const getAdminPackages = () =>
  request<Package[]>("/admin/packages");

export const createPackage = (data: {
  name: string;
  vehicle_type_code: string;
  ride_count: number;
  bonus_rides: number;
  validity_days: number;
  price_rwf: number;
  is_promotional: boolean;
}) =>
  request<Package>("/admin/packages", { method: "POST", body: data });

export const updatePackage = (
  id: string,
  data: {
    name?: string;
    ride_count?: number;
    bonus_rides?: number;
    validity_days?: number;
    price_rwf?: number;
  }
) =>
  request<Package>(`/admin/packages/${id}`, { method: "PATCH", body: data });

export const togglePackage = (id: string, isActive: boolean) =>
  request<{ status: string }>(`/admin/packages/${id}/toggle`, {
    method: "POST",
    body: { is_active: isActive },
  });

export const deletePackage = (id: string) =>
  request<{ status: string }>(`/admin/packages/${id}`, { method: "DELETE" });

// ── Campaigns ─────────────────────────────────────────────────────────────
// The backend returns AdminCampaign (snake_case, type/target model). The
// monetization console renders the richer camelCase Campaign view, so we map
// backend → view here. The console is read-only, so only the GET is wired.
type BackendCampaign = {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string; // GLOBAL | VEHICLE_TYPE | PACKAGE | FIRST_PURCHASE | REFERRAL
  status: string; // DRAFT | SCHEDULED | ACTIVE | EXPIRED | ARCHIVED
  starts_at: string | null;
  ends_at: string | null;
  target_vehicle_type_code: string | null;
  target_package_id: string | null;
  override_price_rwf: number | null;
  override_rides: number | null;
  override_bonus_rides: number | null;
  created_by: string | null;
  created_at: string;
};

const VEHICLE_CODE_TO_VIEW: Record<string, MonetizationVehicleType> = {
  MOTO_BIKE: "moto",
  CAB_TAXI: "cab",
  LIGHT_HILUX: "hilux",
  HEAVY_FUSO: "fuso",
};

function mapCampaign(c: BackendCampaign): AdminCampaignView {
  const audience: CampaignAudience =
    c.type === "VEHICLE_TYPE" ? "vehicle-type" : c.type === "FIRST_PURCHASE" ? "first-purchase" : "all";
  const vt = c.target_vehicle_type_code ? VEHICLE_CODE_TO_VIEW[c.target_vehicle_type_code] : undefined;
  return {
    id: c.id,
    slug: c.code,
    name: c.name,
    description: c.description ?? "",
    status: (c.status ? c.status.toLowerCase() : "draft") as CampaignStatus,
    audience,
    vehicleTypes: vt ? [vt] : null,
    packageIds: c.target_package_id ? [c.target_package_id] : null,
    priceOverride: c.override_price_rwf ?? null,
    ridesOverride: c.override_rides ?? null,
    bonusRidesOverride: c.override_bonus_rides ?? null,
    startsAt: c.starts_at ?? c.created_at,
    endsAt: c.ends_at ?? c.created_at,
    createdAt: c.created_at,
    createdBy: c.created_by ?? "system",
  };
}

export const getAdminCampaigns = async (): Promise<AdminCampaignView[]> => {
  const list = await request<BackendCampaign[]>("/admin/campaigns");
  return (list ?? []).map(mapCampaign);
};

// ── Purchases ─────────────────────────────────────────────────────────────
// GET /admin/packages-purchases returns AdminPurchase (snake_case, joined
// driver + vehicle info). We map it to the console's PurchaseSnapshot view.
type BackendPurchase = {
  id: string;
  driver_id: string;
  driver_name: string | null;
  driver_phone: string;
  vehicle_id?: string | null;
  vehicle_type_code: string;
  vehicle_plate: string;
  package_id: string;
  package_name: string;
  package_version: number;
  campaign_id?: string | null;
  campaign_code?: string | null;
  campaign_name?: string | null;
  price_paid_rwf: number;
  rides_granted: number;
  bonus_rides_granted: number;
  status: string;
  payment_provider?: string | null;
  payment_ref: string;
  created_at: string;
  paid_at?: string | null;
};

function mapPaymentProvider(p: string | null | undefined): PurchaseSnapshot["paymentProvider"] {
  if (!p) return null;
  const s = p.toLowerCase();
  if (s.includes("mtn")) return "mtn-momo";
  if (s.includes("airtel")) return "airtel-money";
  return null;
}

function mapPurchase(p: BackendPurchase): PurchaseSnapshot {
  return {
    id: p.id,
    driverId: p.driver_id,
    driverName: p.driver_name ?? "Unknown driver",
    driverPhone: p.driver_phone,
    vehicleId: p.vehicle_id ?? "",
    // The console's VehicleType enum has no tuk-tuk; unknown codes fall back to
    // "moto" so labels/filters still render (rare edge case).
    vehicleType: VEHICLE_CODE_TO_VIEW[p.vehicle_type_code] ?? "moto",
    vehiclePlate: p.vehicle_plate ?? "—",
    packageId: p.package_id,
    packageName: p.package_name,
    packageVersion: p.package_version,
    campaignId: p.campaign_id ?? null,
    campaignName: p.campaign_name ?? p.campaign_code ?? null,
    pricePaid: p.price_paid_rwf,
    ridesGranted: p.rides_granted,
    bonusRidesGranted: p.bonus_rides_granted,
    status: (p.status ? p.status.toLowerCase() : "pending") as PurchaseStatus,
    paymentProvider: mapPaymentProvider(p.payment_provider),
    paymentReference: p.payment_ref,
    createdAt: p.created_at,
    paidAt: p.paid_at ?? null,
  };
}

export const getAdminPurchases = async (): Promise<PurchaseSnapshot[]> => {
  const list = await request<BackendPurchase[]>("/admin/packages-purchases");
  return (list ?? []).map(mapPurchase);
};

// ── Entitlements ──────────────────────────────────────────────────────────
// GET /admin/entitlements → { entitlements: AdminEntitlement[] }. Mapped to the
// console's Entitlement view. The id is "driver_id:vehicle_type_id".
type BackendEntitlementTxn = {
  id: string;
  kind: string;
  rides_delta: number;
  bonus_rides_delta: number;
  rides_after: number;
  bonus_rides_after: number;
  source_ref: string;
  reason?: string | null;
  performed_by?: string | null;
  created_at: string;
};
type BackendEntitlement = {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  vehicle_type_code: string;
  vehicle_plate: string;
  rides_remaining: number;
  bonus_rides_remaining: number;
  total_granted: number;
  total_consumed: number;
  transactions: BackendEntitlementTxn[] | null;
};

function mapEntitlement(e: BackendEntitlement): Entitlement {
  return {
    id: e.id,
    driverId: e.driver_id,
    driverName: e.driver_name,
    driverPhone: e.driver_phone,
    vehicleId: "",
    vehicleType: VEHICLE_CODE_TO_VIEW[e.vehicle_type_code] ?? "moto",
    vehiclePlate: e.vehicle_plate,
    ridesRemaining: e.rides_remaining,
    bonusRidesRemaining: e.bonus_rides_remaining,
    totalGranted: e.total_granted,
    totalConsumed: e.total_consumed,
    transactions: (e.transactions ?? []).map((t) => ({
      id: t.id,
      entitlementId: e.id,
      kind: t.kind as EntitlementTransactionKind,
      ridesDelta: t.rides_delta,
      bonusRidesDelta: t.bonus_rides_delta,
      ridesAfter: t.rides_after,
      bonusRidesAfter: t.bonus_rides_after,
      sourceRef: t.source_ref,
      reason: t.reason ?? undefined,
      performedBy: t.performed_by ?? undefined,
      createdAt: t.created_at,
    })),
  };
}

export const getAdminEntitlements = async (): Promise<Entitlement[]> => {
  const res = await request<{ entitlements: BackendEntitlement[] }>("/admin/entitlements");
  return (res?.entitlements ?? []).map(mapEntitlement);
};

// Grant credits to a driver's vehicle-type entitlement. driverId + vehicleTypeId
// come from splitting the entitlement id ("driver_id:vehicle_type_id").
export const grantEntitlement = (
  driverId: string,
  vehicleTypeId: string,
  rides: number,
  bonusRides: number,
  reason: string,
) =>
  request<void>("/admin/entitlements/grant", {
    method: "POST",
    body: { driver_id: driverId, vehicle_type_id: vehicleTypeId, rides, bonus_rides: bonusRides, reason },
  });

// ── Audit Logs ────────────────────────────────────────────────────────────

export type AuditLogEntry = {
  id: number;
  admin_id?: string;
  admin_name?: string;
  admin_role?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  detail?: string;
  ip?: string;
  metadata?: Record<string, any>;
  occurred_at: string;
};

export const getAuditLogs = (params: {
  actor?: string;
  action?: string;
  target_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) => {
  const qs = new URLSearchParams();
  if (params.actor) qs.append("actor", params.actor);
  if (params.action) qs.append("action", params.action);
  if (params.target_type) qs.append("target_type", params.target_type);
  if (params.from) qs.append("from", params.from);
  if (params.to) qs.append("to", params.to);
  if (params.limit !== undefined) qs.append("limit", params.limit.toString());
  if (params.offset !== undefined) qs.append("offset", params.offset.toString());
  
  const query = qs.toString();
  return request<{ entries: AuditLogEntry[]; total: number; limit: number; offset: number }>(
    `/admin/audit${query ? `?${query}` : ""}`
  );
};

// ── Account Assist ────────────────────────────────────────────────────────

export const clearOTPLockout = (userID: string) =>
  request<void>(`/admin/customers/${userID}/clear-otp-lockout`, { method: "POST" });

export const clearGPSFlags = (profileID: string) =>
  request<void>(`/admin/drivers/${profileID}/clear-gps-flags`, { method: "POST" });

export const clearDeviceCollision = (userID: string, deviceID: string) =>
  request<void>(`/admin/users/${userID}/clear-device-collision`, {
    method: "POST",
    body: { device_id: deviceID },
  });

export const getAccountTimeline = (userID: string, limit?: number) =>
  request<any>(`/admin/users/${userID}/timeline${limit !== undefined ? `?limit=${limit}` : ""}`);
