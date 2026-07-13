import type { Negotiation, NegotiationsStats, RideDetail } from "./api";

export const MOCK_NEGOTIATIONS: Negotiation[] = [];
export const MOCK_NEGOTIATION_DETAILS: Record<string, RideDetail> = {};
export const MOCK_NEGOTIATIONS_STATS: NegotiationsStats = {
  total_today: 0,
  agreed_today: 0,
  failed_today: 0,
  avg_rounds: 0,
};
