import { PackagesConsole } from "./packages-console";

export const metadata = {
  title: "Admin · Ride Packages",
  robots: { index: false, follow: false },
};

export default function AdminPackagesPage() {
  return <PackagesConsole />;
}
