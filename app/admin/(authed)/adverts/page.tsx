import { AdvertsConsole } from "./adverts-console";

export const metadata = {
  title: "Admin · Advert Banners",
  robots: { index: false, follow: false },
};

export default function AdminAdvertsPage() {
  return <AdvertsConsole />;
}
