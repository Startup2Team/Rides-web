import { ActivityConsole } from "./activity-console";

export const metadata = {
  title: "Admin · Activity log",
  robots: { index: false, follow: false },
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
          Activity log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time stream of platform events — rides, drivers, negotiations, GPS anomalies.
        </p>
      </div>
      <ActivityConsole />
    </div>
  );
}
