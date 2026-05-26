import type { Metadata } from "next";
import Drivers from "../../components/drivers";

export const metadata: Metadata = {
  title: "Drive with Taravelis",
  description:
    "Set your fares, choose your hours, and get paid instantly to your mobile money. Join Taravelis as a driver.",
};

export default function DriversPage() {
  return (
    <main className="flex-1">
      <Drivers />
    </main>
  );
}
