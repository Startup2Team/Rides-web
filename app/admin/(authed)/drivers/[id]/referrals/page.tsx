import { DriverReferralsConsole } from "./driver-referrals-console";

export const metadata = {
  title: "Admin · Driver Referrals",
  robots: { index: false, follow: false },
};

export default async function DriverReferralsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DriverReferralsConsole driverId={id} />;
}
