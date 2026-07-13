import { PartnersConsole } from "./partners-console";

export const metadata = {
  title: "Admin · Partners",
  robots: { index: false, follow: false },
};

export default function AdminPartnersPage() {
  return <PartnersConsole />;
}
