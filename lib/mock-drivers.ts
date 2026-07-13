import type { Driver as ApiDriver, DriverDetail } from "./api";

export type MockDriverId = string;

export const MOCK_DRIVERS: Record<string, DriverDetail> = {};
export const MOCK_API_DRIVERS: ApiDriver[] = [];

export function isMockDriverId(id: string): boolean {
  return false;
}

export function isMockReferredId(id: string): boolean {
  return false;
}

export function getMockDriverById(id: string): DriverDetail | null {
  return null;
}

export function setMockDriverStatus(id: string, status: string): void {}

export function getAllMockDriversForReport(): DriverDetail[] {
  return [];
}

export function getMockReferredDrivers(driverId: string): any[] {
  return [];
}
