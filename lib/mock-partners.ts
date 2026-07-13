export type Partner = {
  id: string;
  name: string;
  logoUrl: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: "active" | "inactive";
  createdAt: number;
};

export type Advert = {
  id: string;
  partnerId: string;
  imageUrl: string | null;
  headline: string;
  ctaLabel: string;
  ctaLink: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  createdAt: number;
};

export const MOCK_PARTNERS: Partner[] = [];
export const MOCK_ADVERTS: Advert[] = [];
