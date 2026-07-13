import type { Customer as ApiCustomer, CustomerDetail } from "./api";

export const MOCK_CUSTOMERS: Record<string, CustomerDetail> = {};
export const MOCK_API_CUSTOMERS: ApiCustomer[] = [];

export function isMockCustomerId(id: string): boolean {
  return false;
}
