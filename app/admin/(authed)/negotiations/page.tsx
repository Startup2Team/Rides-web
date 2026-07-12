import { Suspense } from "react";
import { NegotiationsConsole } from "./negotiations-console";

export const metadata = {
  title: "Admin · Negotiations",
  robots: { index: false, follow: false },
};

export default function AdminNegotiationsPage() {
  return (
    <Suspense fallback={null}>
      <NegotiationsConsole />
    </Suspense>
  );
}
