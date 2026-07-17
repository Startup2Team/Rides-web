/**
 * Real API integration for Partners and Adverts.
 * Connects the monetization admin dashboard to the Go backend.
 */
import {
  getPartners as apiGetPartners,
  savePartner as apiSavePartner,
  removePartner as apiRemovePartner,
  getAdverts as apiGetAdverts,
  saveAdvert as apiSaveAdvert,
  removeAdvert as apiRemoveAdvert,
  type ApiPartner,
  type ApiAdvert,
} from "./api";
import { type Partner, type Advert } from "./mock-partners";

export type { Partner, Advert } from "./mock-partners";

function mapPartner(p: ApiPartner): Partner {
  return {
    id: p.id,
    name: p.name,
    logoUrl: p.logoUrl,
    contactName: p.contactName,
    contactEmail: p.contactEmail,
    contactPhone: p.contactPhone,
    status: p.status,
    createdAt: new Date(p.createdAt).getTime(),
  };
}

function mapAdvert(a: ApiAdvert): Advert {
  return {
    id: a.id,
    partnerId: a.partnerId,
    imageUrl: a.imageUrl,
    headline: a.headline,
    ctaLabel: a.ctaLabel,
    ctaLink: a.ctaLink,
    active: a.active,
    startDate: a.startDate,
    endDate: a.endDate,
    priority: a.priority,
    createdAt: new Date(a.createdAt).getTime(),
  };
}

export async function listPartners(): Promise<Partner[]> {
  try {
    const list = await apiGetPartners();
    return (list ?? []).map(mapPartner);
  } catch (err) {
    console.error("listPartners error, fallback to empty", err);
    return [];
  }
}

export async function getPartner(id: string): Promise<Partner | null> {
  const all = await listPartners();
  return all.find((p) => p.id === id) ?? null;
}

export async function savePartner(partner: Partial<Partner>, id?: string): Promise<void> {
  const payload: Partial<ApiPartner> = {
    name: partner.name,
    logoUrl: partner.logoUrl,
    contactName: partner.contactName,
    contactEmail: partner.contactEmail,
    contactPhone: partner.contactPhone,
    status: partner.status,
  };
  await apiSavePartner(payload, id);
}

export async function removePartner(id: string): Promise<void> {
  await apiRemovePartner(id);
}

export async function listAdverts(partnerId?: string): Promise<Advert[]> {
  try {
    const list = await apiGetAdverts();
    const mapped = (list ?? []).map(mapAdvert);
    return partnerId ? mapped.filter((a) => a.partnerId === partnerId) : mapped;
  } catch (err) {
    console.error("listAdverts error, fallback to empty", err);
    return [];
  }
}

export async function saveAdvert(advert: Partial<Advert>, id?: string): Promise<void> {
  const payload: Partial<ApiAdvert> = {
    partnerId: advert.partnerId,
    imageUrl: advert.imageUrl,
    headline: advert.headline,
    ctaLabel: advert.ctaLabel,
    ctaLink: advert.ctaLink,
    active: advert.active,
    startDate: advert.startDate,
    endDate: advert.endDate,
    priority: advert.priority,
  };
  await apiSaveAdvert(payload, id);
}

export async function removeAdvert(id: string): Promise<void> {
  await apiRemoveAdvert(id);
}
