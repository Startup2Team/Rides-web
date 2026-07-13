/**
 * Local persistence for Partners and Adverts. No backend endpoint exists for
 * this yet, so partner/advert records (including uploaded banner images, kept
 * as data URLs) live in the browser's localStorage — same pattern as
 * report-store.ts. Seeded from mock data on first read so the page isn't
 * empty on a fresh browser.
 */
import { MOCK_PARTNERS, MOCK_ADVERTS, type Partner, type Advert } from "./mock-partners";

export type { Partner, Advert } from "./mock-partners";

const PARTNERS_KEY = "taravelis:partners";
const ADVERTS_KEY = "taravelis:adverts";

function readAll<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seed;
  } catch {
    return seed;
  }
}

function writeAll<T>(key: string, entries: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    // storage full/unavailable — non-fatal, edits just won't persist
  }
}

export function listPartners(): Partner[] {
  return readAll(PARTNERS_KEY, MOCK_PARTNERS).sort((a, b) => b.createdAt - a.createdAt);
}

export function getPartner(id: string): Partner | null {
  return readAll(PARTNERS_KEY, MOCK_PARTNERS).find((p) => p.id === id) ?? null;
}

export function savePartner(partner: Partner) {
  const all = readAll(PARTNERS_KEY, MOCK_PARTNERS).filter((p) => p.id !== partner.id);
  all.unshift(partner);
  writeAll(PARTNERS_KEY, all);
}

export function removePartner(id: string) {
  writeAll(PARTNERS_KEY, readAll(PARTNERS_KEY, MOCK_PARTNERS).filter((p) => p.id !== id));
  writeAll(ADVERTS_KEY, readAll(ADVERTS_KEY, MOCK_ADVERTS).filter((a) => a.partnerId !== id));
}

export function listAdverts(partnerId?: string): Advert[] {
  const all = readAll(ADVERTS_KEY, MOCK_ADVERTS).sort((a, b) => a.priority - b.priority || b.createdAt - a.createdAt);
  return partnerId ? all.filter((a) => a.partnerId === partnerId) : all;
}

export function saveAdvert(advert: Advert) {
  const all = readAll(ADVERTS_KEY, MOCK_ADVERTS).filter((a) => a.id !== advert.id);
  all.unshift(advert);
  writeAll(ADVERTS_KEY, all);
}

export function removeAdvert(id: string) {
  writeAll(ADVERTS_KEY, readAll(ADVERTS_KEY, MOCK_ADVERTS).filter((a) => a.id !== id));
}
