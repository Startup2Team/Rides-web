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

export type Partner = {
  id: string;
  name: string;
  logoUrl?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: "active" | "inactive";
  createdAt: number;
};

export type Advert = {
  id: string;
  partnerId: string;
  imageUrl: string | null;
  headline: string;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  active: boolean;
  startDate?: string | null;
  endDate?: string | null;
  priority?: number | null;
  createdAt: number;
};

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
    console.error("listPartners error", err);
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
    logoUrl: partner.logoUrl ?? undefined,
    contactName: partner.contactName ?? undefined,
    contactEmail: partner.contactEmail ?? undefined,
    contactPhone: partner.contactPhone ?? undefined,
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
    console.error("listAdverts error", err);
    return [];
  }
}

export async function saveAdvert(advert: Partial<Advert>, id?: string): Promise<void> {
  const payload: Partial<ApiAdvert> = {
    partnerId: advert.partnerId,
    imageUrl: advert.imageUrl ?? undefined,
    headline: advert.headline,
    ctaLabel: advert.ctaLabel ?? undefined,
    ctaLink: advert.ctaLink ?? undefined,
    active: advert.active,
    startDate: advert.startDate ?? undefined,
    endDate: advert.endDate ?? undefined,
    priority: advert.priority ?? undefined,
  };
  await apiSaveAdvert(payload, id);
}

export async function removeAdvert(id: string): Promise<void> {
  await apiRemoveAdvert(id);
}
