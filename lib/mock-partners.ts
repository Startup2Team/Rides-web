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

export const MOCK_PARTNERS: Partner[] = [
  {
    id: "PTR-001",
    name: "Heineken Rwanda",
    logoUrl: null,
    contactName: "Jean Mugisha",
    contactEmail: "jean.mugisha@heineken.rw",
    contactPhone: "+250 788 111 222",
    status: "active",
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: "PTR-002",
    name: "Coca-Cola Beverages Rwanda",
    logoUrl: null,
    contactName: "Aline Uwase",
    contactEmail: "aline.uwase@ccba.rw",
    contactPhone: "+250 788 333 444",
    status: "active",
    createdAt: Date.now() - 12 * 86400000,
  },
];

export const MOCK_ADVERTS: Advert[] = [
  {
    id: "ADV-001",
    partnerId: "PTR-001",
    imageUrl: null,
    headline: "Browse through our catalogue",
    ctaLabel: "Explore",
    ctaLink: "https://heineken.rw/catalogue",
    active: true,
    startDate: null,
    endDate: null,
    priority: 1,
    createdAt: Date.now() - 5 * 86400000,
  },
];
