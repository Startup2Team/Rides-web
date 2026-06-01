import { AlertsConsole } from "./alerts-console";

export const metadata = {
  title: "Admin · Alerts",
  robots: { index: false, follow: false },
};

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
          Alerts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open safety incidents and high-priority support tickets.
        </p>
      </div>
      <AlertsConsole />
    </div>
  );
}
