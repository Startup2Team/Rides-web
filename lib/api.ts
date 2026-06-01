import { clearToken, getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string; // override token (e.g. during 2FA setup before final token is saved)
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token: tokenOverride, ...rest } = options;
  const token = tokenOverride ?? getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    // Backend error shape: { error: { code, message } }
    const msg = json?.error?.message ?? json?.message ?? "Request failed";
    throw new Error(msg);
  }

  // Backend wraps all success responses in { "data": ... } — unwrap it
  return (json?.data !== undefined ? json.data : json) as T;
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
  role_id: string;
  role_name: string;
  status: string;
  two_factor: boolean;
  last_active_at: string | null;
  invited_at: string;
  created_at: string;
};

export const getAccount = (token?: string) => request<AdminAccount>("/admin/account", token ? { token } : {});

export const updateAccount = (name: string) =>
  request<void>("/admin/account", { method: "PUT", body: { name } });

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

export const getAnalyticsOverview = () => request<Record<string, unknown>>("/admin/analytics/overview");

export const getRidesDaily = () => request<Record<string, unknown>>("/admin/analytics/rides/daily");

export const getRidesWeekly = () => request<Record<string, unknown>>("/admin/analytics/rides/weekly");

export const getRevenueBreakdown = () =>
  request<Record<string, unknown>>("/admin/analytics/revenue/breakdown");

export const getDriverPerformance = () =>
  request<Record<string, unknown>>("/admin/analytics/drivers/performance");

export const getNegotiationStats = () =>
  request<Record<string, unknown>>("/admin/analytics/negotiation/stats");

export const getHeatmap = () => request<Record<string, unknown>>("/admin/analytics/heatmap");

export const getHeatmapZones = () =>
  request<Record<string, unknown>>("/admin/analytics/heatmap/zones");

export const getCancellations = () =>
  request<Record<string, unknown>>("/admin/analytics/cancellations");

export const getFunnel = () => request<Record<string, unknown>>("/admin/analytics/funnel");

export const getVehicleMix = () =>
  request<Record<string, unknown>>("/admin/analytics/vehicle-mix");

export const getSatisfaction = () =>
  request<Record<string, unknown>>("/admin/analytics/satisfaction");

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
};

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
  documents?: Array<{
    document_type: string;
    file_url: string;
    uploaded_at: string;
  }>;
};

export const getDriver = (id: string) => request<DriverDetail>(`/admin/drivers/${id}`);

export const createDriver = (body: Record<string, unknown>) =>
  request<{ id: string; message: string }>("/admin/drivers", { method: "POST", body });

export const forceDriverOffline = (id: string) =>
  request<{ message: string }>(`/admin/drivers/${id}/force-offline`, { method: "POST" });

export const approveDriver = (id: string) =>
  request<void>(`/admin/drivers/${id}/approve`, { method: "POST" });

export const rejectDriver = (id: string, reason: string) =>
  request<void>(`/admin/drivers/${id}/reject`, { method: "POST", body: { reason } });

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
  full_name: string;
  phone: string;
  email?: string;
  role_state: string;
  is_suspended: boolean;
  suspension_until?: string | null;
  total_rides: number;
  total_spend?: number;
  created_at: string;
  last_active_at?: string;
  notes?: string;
};

export type CustomersResponse = {
  customers: Customer[];
  total: number;
  limit: number;
  offset: number;
};

export const getCustomers = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<CustomersResponse>(`/admin/customers${qs ? `?${qs}` : ""}`);
};

export const getCustomer = (id: string) => request<Customer>(`/admin/customers/${id}`);

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

export type Ride = {
  id: string;
  status: string;
  transport_type: string;
  customer_name: string;
  driver_name?: string;
  pickup_location: string;
  dropoff_location: string;
  fare: number;
  created_at: string;
};

export type RidesResponse = {
  rides: Ride[];
  total: number;
};

export const getRides = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<RidesResponse>(`/admin/rides${qs ? `?${qs}` : ""}`);
};

export const getLiveRides = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<RidesResponse>(`/admin/rides/live${qs ? `?${qs}` : ""}`);
};

export const getRide = (id: string) => request<Ride>(`/admin/rides/${id}`);

export const interveneRide = (id: string, action: string, reason: string) =>
  request<void>(`/admin/rides/live/${id}/intervene`, {
    method: "POST",
    body: { action, reason },
  });

// ── Negotiations ──────────────────────────────────────────────────────────

export type Negotiation = {
  id: string;
  status: string;
  customer_name: string;
  driver_name?: string;
  initial_offer: number;
  final_price?: number;
  pickup_location: string;
  created_at: string;
};

export type NegotiationsResponse = {
  negotiations: Negotiation[];
  total: number;
};

export const getNegotiations = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<NegotiationsResponse>(`/admin/negotiations${qs ? `?${qs}` : ""}`);
};

export const getNegotiation = (id: string) => request<Negotiation>(`/admin/negotiations/${id}`);

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
  ride_id: string;
  customer_name: string;
  driver_name: string;
  amount: number;
  platform_fee: number;
  driver_payout: number;
  status: string;
  created_at: string;
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

export type Incident = {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  created_at: string;
  updated_at: string;
};

export type IncidentsResponse = {
  incidents: Incident[];
  total: number;
};

export const getIncidents = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<IncidentsResponse>(`/admin/incidents${qs ? `?${qs}` : ""}`);
};

export const getIncident = (id: string) => request<Incident>(`/admin/incidents/${id}`);

export const createIncident = (data: { title: string; description: string; severity: string }) =>
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

export type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
};

export type TicketsResponse = {
  tickets: Ticket[];
  total: number;
};

export const getTickets = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<TicketsResponse>(`/admin/support/tickets${qs ? `?${qs}` : ""}`);
};

export const getTicket = (id: string) => request<Ticket>(`/admin/support/tickets/${id}`);

export const replyToTicket = (id: string, message: string) =>
  request<void>(`/admin/support/tickets/${id}/reply`, { method: "POST", body: { message } });

export const assignTicket = (id: string, adminId: string) =>
  request<void>(`/admin/support/tickets/${id}/assign`, { method: "POST", body: { admin_id: adminId } });

export const resolveTicket = (id: string) =>
  request<void>(`/admin/support/tickets/${id}/resolve`, { method: "POST" });

// ── Inbox ─────────────────────────────────────────────────────────────────

export type InboxMessage = {
  id: string;
  subject: string;
  from: string;
  status: string;
  is_spam: boolean;
  created_at: string;
};

export type InboxResponse = {
  messages: InboxMessage[];
  total: number;
};

export const getInbox = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request<InboxResponse>(`/admin/inbox${qs ? `?${qs}` : ""}`);
};

export const getMessage = (id: string) => request<InboxMessage>(`/admin/inbox/${id}`);

export const replyToMessage = (id: string, message: string) =>
  request<void>(`/admin/inbox/${id}/reply`, { method: "POST", body: { message } });

export const archiveMessage = (id: string) =>
  request<void>(`/admin/inbox/${id}/archive`, { method: "POST" });

export const markSpam = (id: string) =>
  request<void>(`/admin/inbox/${id}/spam`, { method: "POST" });

export const deleteMessage = (id: string) =>
  request<void>(`/admin/inbox/${id}`, { method: "DELETE" });

// ── Reports ───────────────────────────────────────────────────────────────

export type Report = {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  download_url?: string;
};

export type ReportsResponse = {
  reports: Report[];
  total: number;
};

export const getReports = () => request<ReportsResponse>("/admin/reports");

export const generateReport = (data: Record<string, unknown>) =>
  request<Report>("/admin/reports", { method: "POST", body: data });

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
};

export const getTeam = () =>
  request<{ admins: TeamMember[] }>("/admin/team");

export const getRoles = () =>
  request<{ roles: Role[] }>("/admin/team/roles");

export const inviteAdmin = (name: string, email: string, roleId: string) =>
  request<TeamMember>("/admin/team/invite", { method: "POST", body: { name, email, role_id: roleId } });

export const updateMemberRole = (id: string, roleId: string) =>
  request<void>(`/admin/team/members/${id}/role`, { method: "POST", body: { role_id: roleId } });

export const suspendMember = (id: string) =>
  request<void>(`/admin/team/members/${id}/suspend`, { method: "POST" });

export const reinstateMember = (id: string) =>
  request<void>(`/admin/team/members/${id}/reinstate`, { method: "POST" });

export const removeMember = (id: string) =>
  request<void>(`/admin/team/members/${id}/remove`, { method: "POST" });
