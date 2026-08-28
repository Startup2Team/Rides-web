import type { Metadata } from "next";
import { Suspense } from "react";
import { WaitlistForm } from "./waitlist-form";

export const metadata: Metadata = {
  title: "Join the Rides Waitlist",
  description:
    "Be first in line when Rides launches in your area as a rider or a driver.",
};

function WaitlistFallback() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-3 w-28 rounded bg-muted" />
      <div className="h-9 w-3/4 rounded bg-muted" />
      <div className="h-4 w-full max-w-md rounded bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-muted" />
        <div className="h-28 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

export default function WaitlistPage() {
  return (
    <main className="relative flex-1 overflow-x-clip">
      <section className="mx-auto max-w-2xl px-5 py-12 sm:px-6 sm:py-16 lg:py-24">
        <Suspense fallback={<WaitlistFallback />}>
          <WaitlistForm />
        </Suspense>
      </section>
    </main>
  );
}
