import { RevenueConsole } from "./revenue-console";

export const metadata = {
  title: "Admin · Revenue",
  robots: { index: false, follow: false },
};

export default function AdminRevenuePage() {
  return <RevenueConsole />;
}
