import { redirect } from "next/navigation";
import { DriversOverview } from "./drivers-overview";
import { DriversTable } from "./drivers-table";

export const metadata = {
  title: "Admin · Drivers",
  robots: { index: false, follow: false },
};

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { vehicle } = await searchParams;
  if (!vehicle) {
    redirect("/admin/drivers?vehicle=moto");
  }

  return (
    <div className="space-y-6">
      <DriversOverview />
      <DriversTable />
    </div>
  );
}
